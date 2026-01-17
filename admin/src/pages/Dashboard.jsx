import React from 'react';
import { Users, FileText, Package, TrendingUp } from 'lucide-react';

function Dashboard() {
    // Placeholder stats - will be populated from API later
    const stats = [
        {
            title: 'Total Users',
            value: '0',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Pending KYC',
            value: '0',
            icon: FileText,
            color: 'bg-yellow-500',
        },
        {
            title: 'Total Products',
            value: '0',
            icon: Package,
            color: 'bg-green-500',
        },
        {
            title: 'Orders',
            value: '0',
            icon: TrendingUp,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
                    Dashboard Overview
                </h2>
                <p className="text-gray-600 mt-2">
                    Monitor and manage your platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-white rounded-lg shadow-heritage p-6 hover:shadow-heritage-hover transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-heritage-charcoal mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-full`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Welcome Message */}
            <div className="mt-8 bg-white rounded-lg shadow-heritage p-8">
                <h3 className="text-xl font-serif font-bold text-heritage-charcoal mb-4">
                    Welcome to the Admin Dashboard
                </h3>
                <p className="text-gray-600 leading-relaxed">
                    This dashboard provides you with complete control over The Collectors Exchange platform.
                    Navigate through the menu to manage KYC requests, users, products, and orders.
                    All features are integrated with the backend and database for real-time management.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
