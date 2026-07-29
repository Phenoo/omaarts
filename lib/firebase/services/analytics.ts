import { db } from '../config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Booking, Order, Sale, Artwork } from '../../types';

export interface DashboardStats {
  todaySales: number;
  monthRevenue: number;
  totalRevenue: number;
  todayBookingsCount: number;
  upcomingBookingsCount: number;
  pendingOrdersCount: number;
  availableArtworksCount: number;
  soldArtworksCount: number;
  recentSales: Sale[];
  popularActivities: { name: string; count: number; revenue: number }[];
  monthlyRevenueData: { month: string; amount: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const firstOfMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

    // 1. Fetch Sales collection
    const salesCol = collection(db, 'sales');
    const salesSnap = await getDocs(salesCol);
    const sales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Sale));

    let todaySales = 0;
    let monthRevenue = 0;
    let totalRevenue = 0;

    sales.forEach(sale => {
      totalRevenue += sale.total;
      if (sale.date === todayStr) {
        todaySales += sale.total;
      }
      if (sale.date >= firstOfMonthStr) {
        monthRevenue += sale.total;
      }
    });

    // 2. Fetch Bookings collection
    const bookingsCol = collection(db, 'bookings');
    const bookingsSnap = await getDocs(bookingsCol);
    const bookings = bookingsSnap.docs.map(d => d.data() as Booking);

    let todayBookingsCount = 0;
    let upcomingBookingsCount = 0;

    bookings.forEach(b => {
      if (b.date === todayStr && b.bookingStatus !== 'CANCELLED') {
        todayBookingsCount++;
      }
      if (b.date >= todayStr && b.bookingStatus !== 'CANCELLED') {
        upcomingBookingsCount++;
      }
    });

    // 3. Fetch Orders (pending fulfilment count)
    const ordersCol = collection(db, 'orders');
    const ordersSnap = await getDocs(query(ordersCol, where('fulfilmentStatus', '==', 'PENDING')));
    const pendingOrdersCount = ordersSnap.size;

    // 4. Fetch Artworks counts
    const artworksCol = collection(db, 'artworks');
    const artworksSnap = await getDocs(artworksCol);
    const artworks = artworksSnap.docs.map(d => d.data() as Artwork);
    
    let availableArtworksCount = 0;
    let soldArtworksCount = 0;

    artworks.forEach(art => {
      if (art.status === 'AVAILABLE') {
        availableArtworksCount++;
      } else if (art.status === 'SOLD') {
        soldArtworksCount++;
      }
    });

    // 5. Recent Sales Ledger items
    const recentSalesQuery = query(salesCol, orderBy('createdAt', 'desc'), limit(5));
    const recentSalesSnap = await getDocs(recentSalesQuery);
    const recentSales = recentSalesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Sale));

    // 6. Popular Activities calculations
    const activityCounts: Record<string, { count: number; revenue: number }> = {};
    sales.forEach(sale => {
      if (sale.category === 'ACTIVITY') {
        // Parse activity name from description
        const descName = sale.description.replace('Booking: ', '').split(' - ')[0].split(' (')[0];
        if (!activityCounts[descName]) {
          activityCounts[descName] = { count: 0, revenue: 0 };
        }
        activityCounts[descName].count += sale.quantity;
        activityCounts[descName].revenue += sale.total;
      }
    });

    const popularActivities = Object.entries(activityCounts).map(([name, val]) => ({
      name,
      count: val.count,
      revenue: val.revenue
    })).sort((a, b) => b.count - a.count).slice(0, 4);

    // 7. Monthly Revenue agg
    const monthsAgg: Record<string, number> = {};
    sales.forEach(sale => {
      const monthKey = sale.date.slice(0, 7); // YYYY-MM
      monthsAgg[monthKey] = (monthsAgg[monthKey] || 0) + sale.total;
    });

    const monthlyRevenueData = Object.entries(monthsAgg).map(([month, amount]) => {
      const [year, m] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const displayMonth = `${monthNames[parseInt(m, 10) - 1]} ${year}`;
      return { month: displayMonth, amount };
    }).sort((a, b) => a.month.localeCompare(b.month)).slice(-6); // last 6 months

    return {
      todaySales,
      monthRevenue,
      totalRevenue,
      todayBookingsCount,
      upcomingBookingsCount,
      pendingOrdersCount,
      availableArtworksCount,
      soldArtworksCount,
      recentSales,
      popularActivities,
      monthlyRevenueData,
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    throw error;
  }
}
