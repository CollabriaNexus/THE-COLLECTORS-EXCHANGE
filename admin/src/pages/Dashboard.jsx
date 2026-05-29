import React from 'react';
import { Users, FileText, Package, TrendingUp } from 'lucide-react';
import { useAdminStats, useAdminAnalytics } from '../hooks/api/useUsers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#D4AF37', '#1C1C1C', '#3D3028', '#8B7355', '#C9A962', '#4A3F35'];

function Dashboard() {
    const { data: statsData, isLoading } = useAdminStats();
    const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalytics();

    const stats = [
        { title: 'Total Users', value: isLoading ? '...' : (statsData?.totalUsers ?? 0).toString(), icon: Users, color: 'bg-blue-500' },
        { title: 'Pending KYC', value: isLoading ? '...' : (statsData?.pendingKyc ?? 0).toString(), icon: FileText, color: 'bg-yellow-500' },
        { title: 'Total Products', value: isLoading ? '...' : (statsData?.totalProducts ?? 0).toString(), icon: Package, color: 'bg-green-500' },
        { title: 'Orders', value: isLoading ? '...' : (statsData?.totalOrders ?? 0).toString(), icon: TrendingUp, color: 'bg-purple-500' },
    ];

    const revenueChart = analyticsData?.revenueData?.map(r => ({ date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), revenue: Number(r.revenue) })) || [];
    const userGrowthChart = analyticsData?.userGrowth?.map(u => ({ date: new Date(u.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), users: Number(u.count) })) || [];
    const ordersByStatus = analyticsData?.ordersByStatus?.map(o => ({ name: o.status, value: Number(o.count) })) || [];
    const productsByCategory = analyticsData?.productsByCategory?.map(p => ({ name: p.category, value: Number(p.count) })) || [];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Dashboard Overview</h2>
                <p className="text-gray-600 mt-2">Monitor and manage your platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow">
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

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-heritage p-6">
                    <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">Revenue (Last 30 Days)</h3>
                    {analyticsLoading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div> : revenueChart.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">No revenue data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenueChart}>
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-heritage p-6">
                    <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">New Users (Last 30 Days)</h3>
                    {analyticsLoading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div> : userGrowthChart.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">No user data yet</div>
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
                    <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">Orders by Status</h3>
                    {analyticsLoading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div> : ordersByStatus.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">No orders yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {ordersByStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-heritage p-6">
                    <h3 className="text-lg font-serif font-bold text-heritage-charcoal mb-4">Products by Category</h3>
                    {analyticsLoading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div> : productsByCategory.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">No products yet</div>
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
        </div>
    );
}

export default Dashboard;
