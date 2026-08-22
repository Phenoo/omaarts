import { auth, db } from '../config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Booking, Sale, Artwork } from '../../types';
import { firebaseErrorDetails } from '@/lib/firebase/errorDetails';

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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Admin authentication required to load analytics.');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const firstOfMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  let todaySales = 0;
  let monthRevenue = 0;
  let totalRevenue = 0;
  let todayBookingsCount = 0;
  let upcomingBookingsCount = 0;
  let pendingOrdersCount = 0;
  let availableArtworksCount = 0;
  let soldArtworksCount = 0;
  let recentSales: Sale[] = [];
  const sales: Sale[] = [];

  // 1. Fetch Sales collection
  try {
    const salesCol = collection(db, 'sales');
    const salesSnap = await getDocs(salesCol);
    salesSnap.docs.forEach((d) => {
      sales.push({ id: d.id, ...d.data() } as Sale);
    });

    sales.forEach((sale) => {
      const saleAmount = Number(sale.total) || 0;
      totalRevenue += saleAmount;
      if (sale.date === todayStr) {
        todaySales += saleAmount;
      }
      if (sale.date >= firstOfMonthStr) {
        monthRevenue += saleAmount;
      }
    });
  } catch (err) {
    console.warn('[DashboardAnalytics] Non-fatal sales fetch warning:', firebaseErrorDetails(err));
  }

  // 2. Fetch Bookings collection
  try {
    const bookingsCol = collection(db, 'bookings');
    const bookingsSnap = await getDocs(bookingsCol);
    bookingsSnap.docs.forEach((d) => {
      const b = d.data() as Booking;
      if (b.date === todayStr && b.bookingStatus !== 'CANCELLED') {
        todayBookingsCount++;
      }
      if (b.date >= todayStr && b.bookingStatus !== 'CANCELLED') {
        upcomingBookingsCount++;
      }
    });
  } catch (err) {
    console.warn('[DashboardAnalytics] Non-fatal bookings fetch warning:', firebaseErrorDetails(err));
  }

  // 3. Fetch Orders (pending fulfilment count)
  try {
    const ordersCol = collection(db, 'orders');
    const ordersSnap = await getDocs(query(ordersCol, where('fulfilmentStatus', '==', 'PENDING')));
    pendingOrdersCount = ordersSnap.size;
  } catch (err) {
    console.warn('[DashboardAnalytics] Non-fatal orders fetch warning:', firebaseErrorDetails(err));
  }

  // 4. Fetch Artworks counts
  try {
    const artworksCol = collection(db, 'artworks');
    const artworksSnap = await getDocs(artworksCol);
    artworksSnap.docs.forEach((d) => {
      const art = d.data() as Artwork;
      if (art.status === 'AVAILABLE') {
        availableArtworksCount++;
      } else if (art.status === 'SOLD') {
        soldArtworksCount++;
      }
    });
  } catch (err) {
    console.warn('[DashboardAnalytics] Non-fatal artworks fetch warning:', firebaseErrorDetails(err));
  }

  // 5. Recent Sales Ledger items
  try {
    const salesCol = collection(db, 'sales');
    const recentSalesQuery = query(salesCol, orderBy('createdAt', 'desc'), limit(5));
    const recentSalesSnap = await getDocs(recentSalesQuery);
    recentSales = recentSalesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Sale));
  } catch {
    recentSales = sales.slice(0, 5);
  }

  // 6. Popular Activities calculations
  const activityCounts: Record<string, { count: number; revenue: number }> = {};
  sales.forEach((sale) => {
    if (sale.category === 'ACTIVITY') {
      const descName = (sale.description || 'Activity')
        .replace('Booking: ', '')
        .split(' - ')[0]
        .split(' (')[0];
      if (!activityCounts[descName]) {
        activityCounts[descName] = { count: 0, revenue: 0 };
      }
      activityCounts[descName].count += Number(sale.quantity) || 1;
      activityCounts[descName].revenue += Number(sale.total) || 0;
    }
  });

  const popularActivities = Object.entries(activityCounts)
    .map(([name, val]) => ({
      name,
      count: val.count,
      revenue: val.revenue,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // 7. Monthly Revenue agg
  const monthsAgg: Record<string, number> = {};
  sales.forEach((sale) => {
    if (sale.date) {
      const monthKey = sale.date.slice(0, 7); // YYYY-MM
      monthsAgg[monthKey] = (monthsAgg[monthKey] || 0) + (Number(sale.total) || 0);
    }
  });

  const monthlyRevenueData = Object.entries(monthsAgg)
    .map(([month, amount]) => {
      const [year, m] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const displayMonth = `${monthNames[parseInt(m, 10) - 1] || m} ${year}`;
      return { month: displayMonth, amount };
    })
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

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
}
