'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getDashboardStats, DashboardStats } from '@/lib/firebase/services/analytics';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Coins, Calendar, ShoppingBag, Palette, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard analytics:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] flex flex-col gap-4 items-center animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Aggregating sales intelligence...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 border border-red-100 rounded-2xl bg-white text-center flex flex-col items-center gap-4 max-w-md mx-auto my-12">
        <TrendingUp className="text-red-500" size={32} />
        <h3 className="font-serif text-xl">Analytics Connection Failed</h3>
        <p className="font-sans text-sm text-[var(--text-muted)]">Could not fetch booking and revenue logs from database.</p>
        <button
          onClick={fetchStats}
          className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          Retry Stats
        </button>
      </div>
    );
  }

  // Draw custom SVG Bar Chart
  const renderMonthlyChart = () => {
    const data = stats.monthlyRevenueData;
    if (data.length === 0) {
      return (
        <div className="h-60 border border-dashed border-[var(--border-soft)] rounded-xl flex items-center justify-center bg-gray-50/50">
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">No monthly sales data found</span>
        </div>
      );
    }

    const maxVal = Math.max(...data.map(d => d.amount), 10000);
    const chartHeight = 180;
    const chartWidth = 500;
    const paddingLeft = 40;
    const paddingRight = 10;
    const paddingTop = 20;
    const paddingBottom = 30;

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    const colWidth = graphWidth / data.length;
    const barWidth = colWidth * 0.55;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[400px] h-auto overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = paddingTop + graphHeight * (1 - p);
            const val = maxVal * p;
            return (
              <g key={idx} className="opacity-45">
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="var(--border-soft)" strokeDasharray="3,3" strokeWidth={0.5} />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[8px] font-mono fill-[var(--text-muted)] font-semibold">
                  ₦{val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bar data */}
          {data.map((d, idx) => {
            const colX = paddingLeft + idx * colWidth;
            const barX = colX + (colWidth - barWidth) / 2;
            const pct = d.amount / maxVal;
            const barHeight = graphHeight * pct;
            const barY = paddingTop + graphHeight - barHeight;

            return (
              <g key={idx} className="group">
                {/* Bar hover background */}
                <rect x={colX} y={paddingTop} width={colWidth} height={graphHeight} fill="var(--surface-soft)" className="opacity-0 hover:opacity-10 transition-opacity duration-300" />
                
                {/* Visual bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  fill="url(#purpleGrad)"
                  className="transition-all hover:fill-[var(--accent-orange)] duration-300"
                />

                {/* Amount tooltip on top */}
                <text
                  x={barX + barWidth / 2}
                  y={barY - 5}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-[var(--accent-orange)] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ₦{d.amount.toLocaleString()}
                </text>

                {/* X axis labels */}
                <text x={colX + colWidth / 2} y={chartHeight - 10} textAnchor="middle" className="text-[9px] font-mono fill-[var(--text-muted)] font-semibold">
                  {d.month}
                </text>
              </g>
            );
          })}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Welcome header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] font-semibold">Overview</h1>
        <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Real-time studio health, reservations, and sales insights.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[var(--accent-purple)] flex items-center justify-center flex-shrink-0">
            <Coins size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Today&apos;s Revenue</span>
            <span className="block text-lg font-mono font-bold text-[var(--foreground)] mt-0.5">₦{stats.todaySales.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--accent-orange)] flex items-center justify-center flex-shrink-0">
            <Coins size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">This Month</span>
            <span className="block text-lg font-mono font-bold text-[var(--foreground)] mt-0.5">₦{stats.monthRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Active Bookings</span>
            <span className="block text-lg font-mono font-bold text-[var(--foreground)] mt-0.5">{stats.upcomingBookingsCount}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Fulfillment Orders</span>
            <span className="block text-lg font-mono font-bold text-[var(--foreground)] mt-0.5">{stats.pendingOrdersCount}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Popular activities block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Monthly revenue chart */}
        <div className="lg:col-span-2 bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-4">
            <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">Revenue Trends</h3>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Past 6 Months</span>
          </div>
          {renderMonthlyChart()}
        </div>

        {/* Right Column: Popular activities */}
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-4">
            <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">Top Activities</h3>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">By Seats Booked</span>
          </div>
          
          {stats.popularActivities.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">No activity sales logged</div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.popularActivities.map((act, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded bg-[var(--surface-soft)] text-[var(--accent-purple)] text-[10px] font-mono font-semibold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold truncate text-[var(--foreground)]">{act.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono text-xs">
                    <span className="block text-[var(--foreground)] font-bold">{act.count} booked</span>
                    <span className="block text-[var(--text-muted)] text-[10px] mt-0.5">₦{act.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent sales ledger ledger section */}
      <div className="bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-4">
          <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">Recent Activity</h3>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Last 5 Sales</span>
        </div>

        {stats.recentSales.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">No sales recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="pb-3 font-semibold">Invoice/Ref</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-xs font-semibold">{sale.invoiceNumber}</td>
                    <td className="py-3 pr-2 text-xs truncate max-w-[200px]" title={sale.description}>{sale.description}</td>
                    <td className="py-3 text-xs">{sale.customer?.name || 'Walk-in'}</td>
                    <td className="py-3 font-mono text-xs font-semibold">₦{sale.total.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold
                        ${sale.type === 'ONLINE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                      `}>
                        {sale.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-[var(--text-muted)] font-semibold">{sale.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
export const dynamic = 'force-dynamic';
