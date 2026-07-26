import React, { useState } from 'react';
import {
  Users,
  FileText,
  Package,
  TrendingUp,
  Warehouse,
  ShoppingBag,
  CheckCircle2,
  IndianRupee,
  BadgeDollarSign,
  HandCoins,
  MessageSquare,
  Crown,
  Star,
  Store,
  Trophy,
} from 'lucide-react';
import { useAdminStats, useAdminAnalytics } from '../hooks/api/useUsers';
import { useVendorRankings } from '../hooks/api/useVendors';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#D4AF37', '#1C1C1C', '#3D3028', '#8B7355', '#C9A962', '#4A3F35'];
const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const rankBadgeClass = (idx) => {
  if (idx === 0) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (idx === 1) return 'bg-gray-100 text-gray-700 border-gray-300';
  if (idx === 2) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-white text-gray-600 border-gray-200';
};

const rankTrophy = (idx) => {
  if (idx === 0) return <Trophy size={18} className="text-yellow-600" />;
  if (idx === 1) return <Trophy size={18} className="text-gray-500" />;
  if (idx === 2) return <Trophy size={18} className="text-orange-600" />;
  return null;
};

function Dashboard() {
  const { data: statsData, isLoading } = useAdminStats();
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalytics();

  const [vendorSort, setVendorSort] = useState('listings');
  const { data: vendorData, isLoading: vendorsLoading } = useVendorRankings(vendorSort);

  const originalStats = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : (statsData?.totalUsers ?? 0).toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending KYC',
      value: isLoading ? '...' : (statsData?.pendingKyc ?? 0).toString(),
      icon: FileText,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Products',
      value: isLoading ? '...' : (statsData?.totalProducts ?? 0).toString(),
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Orders',
      value: isLoading ? '...' : (statsData?.totalOrders ?? 0).toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const inventoryStats = [
    {
      title: 'Total Inventory',
      value: isLoading ? '...' : (statsData?.totalInventoryCount ?? 0).toString(),
      icon: Warehouse,
      color: 'bg-heritage-charcoal',
      hint: 'All products',
    },
    {
      title: 'Sold',
      value: isLoading ? '...' : (statsData?.totalSoldInventoryCount ?? 0).toString(),
      icon: ShoppingBag,
      color: 'bg-luxury-gold',
      hint: 'Status = Sold',
    },
    {
      title: 'Available',
      value: isLoading ? '...' : (statsData?.totalAvailableInventoryCount ?? 0).toString(),
      icon: CheckCircle2,
      color: 'bg-emerald-600',
      hint: 'Approved + Pending + In_Review',
    },
  ];

  const revenueStats = [
    {
      title: 'Total Inventory Value',
      value: isLoading ? '...' : INR.format(statsData?.totalInventoryRevenue ?? 0),
      icon: IndianRupee,
      color: 'bg-heritage-charcoal',
      hint: 'Sum of all list prices',
    },
    {
      title: 'Sold Revenue',
      value: isLoading ? '...' : INR.format(statsData?.totalSoldRevenue ?? 0),
      icon: BadgeDollarSign,
      color: 'bg-luxury-gold',
      hint: 'Paid orders + offline sales',
    },
    {
      title: 'Available Value',
      value: isLoading ? '...' : INR.format(statsData?.totalAvailableRevenue ?? 0),
      icon: HandCoins,
      color: 'bg-emerald-600',
      hint: 'Inventory value minus sold list price',
    },
  ];

  const extraStatCards = [
    {
      title: 'Unread Messages',
      value: isLoading ? '...' : (statsData?.unreadContactMessages ?? 0).toString(),
      icon: MessageSquare,
      color: 'bg-rose-500',
      hint: 'Contact form submissions',
      linkTo: '/contact-messages',
    },
  ];

  const revenueChart =
    analyticsData?.revenueData?.map((r) => ({
      date: new Date(r.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: Number(r.revenue),
    })) || [];
  const userGrowthChart =
    analyticsData?.userGrowth?.map((u) => ({
      date: new Date(u.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      users: Number(u.count),
    })) || [];
  const ordersByStatus =
    analyticsData?.ordersByStatus?.map((o) => ({
      name: o.status,
      value: Number(o.count),
    })) || [];
  const productsByCategory =
    analyticsData?.productsByCategory?.map((p) => ({
      name: p.category,
      value: Number(p.count),
    })) || [];

  const sortTabs = [
    { key: 'listings', label: 'Listings', Icon: Package },
    { key: 'revenue', label: 'Revenue', Icon: IndianRupee },
    { key: 'sold', label: 'Sold', Icon: ShoppingBag },
    { key: 'avgRating', label: 'Rating', Icon: Star },
    { key: 'reviewCount', label: 'Reviews', Icon: MessageSquare },
  ];

  const vendorRows = vendorData?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Monitor and manage your platform</p>
      </div>

      {/* ============== ORIGINAL STATS ============== */}
      <h3 className="text-sm uppercase tracking-[0.2em] text-luxury-gold font-bold mb-3">
        Platform Snapshot
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {originalStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-heritage-charcoal mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============== H1: INVENTORY COUNTS ============== */}
      <h3 className="text-sm uppercase tracking-[0.2em] text-luxury-gold font-bold mb-3">
        Inventory Counts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {inventoryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.hint}</p>
                  <p className="text-3xl font-bold text-heritage-charcoal mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============== H2: REVENUE ============== */}
      <h3 className="text-sm uppercase tracking-[0.2em] text-luxury-gold font-bold mb-3">
        Revenue Totals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {revenueStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.hint}</p>
                  <p className="text-3xl font-bold text-heritage-charcoal mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============== M5.7: EXTRA STATS ============== */}
      {extraStatCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {extraStatCards.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    {stat.hint && <p className="text-xs text-gray-400 mt-1">{stat.hint}</p>}
                    <p className="text-3xl font-bold text-heritage-charcoal mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
            if (stat.linkTo) {
              return (
                <a key={stat.title} href={stat.linkTo} className="block">
                  {content}
                </a>
              );
            }
            return <div key={stat.title}>{content}</div>;
          })}
        </div>
      )}

      {/* ============== EXISTING CHARTS ============== */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">
            Revenue (Last 30 Days)
          </h3>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : revenueChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueChart}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">
            New Users (Last 30 Days)
          </h3>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : userGrowthChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No user data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userGrowthChart}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#1C1C1C" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">
            Orders by Status
          </h3>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : ordersByStatus.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {ordersByStatus.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-heritage p-6">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">
            Products by Category
          </h3>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : productsByCategory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No products yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productsByCategory} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#D4AF37" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============== H3: VENDOR LEADERBOARD ============== */}
      <div className="mt-12">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-luxury-gold font-bold flex items-center gap-2">
              <Crown size={16} /> Vendor Leaderboard
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Rank KYC-approved vendors by performance metrics
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-heritage p-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
            {sortTabs.map(({ key, label, Icon }) => {
              const active = vendorSort === key;
              return (
                <button
                  key={key}
                  onClick={() => setVendorSort(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-bold transition-colors ${
                    active
                      ? 'bg-luxury-gold text-white shadow'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              );
            })}
          </div>

          {vendorsLoading ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              Loading vendor rankings...
            </div>
          ) : vendorRows.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              No KYC-approved vendors yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <th className="py-2 px-2 w-10">#</th>
                    <th className="py-2 px-2">Vendor</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2 text-right">Listings</th>
                    <th className="py-2 px-2 text-right">Sold</th>
                    <th className="py-2 px-2 text-right">Revenue</th>
                    <th className="py-2 px-2 text-right">Rating</th>
                    <th className="py-2 px-2 text-right">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorRows.map((row, idx) => (
                    <tr
                      key={row.vendor.vendorId}
                      className={`border-b border-gray-50 ${
                        idx < 3 ? 'bg-gradient-to-r from-transparent to-white' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${rankBadgeClass(
                            idx,
                          )}`}
                        >
                          {rankTrophy(idx)}
                          <span>{idx + 1}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-heritage-dark text-luxury-gold flex items-center justify-center font-serif font-bold">
                            {row.vendor.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase() || 'V'}
                          </div>
                          <div>
                            <div className="font-medium text-heritage-charcoal">
                              {row.vendor.name}
                            </div>
                            <div className="text-xs text-gray-500">{row.vendor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.vendor.vendorType === 'BULK'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {row.vendor.vendorType === 'BULK'
                            ? `Bulk Lister ${(<Store size={10} className="inline ml-1" />)}`
                            : 'Normal'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-heritage-charcoal">
                        {row.listingsCount}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-gray-700">
                        {row.productsSold}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-luxury-gold tabular-nums">
                        {INR.format(row.totalRevenue)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {row.avgRating > 0 ? row.avgRating.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600">{row.reviewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
