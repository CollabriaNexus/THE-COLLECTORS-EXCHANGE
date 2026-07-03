import React, { useState } from 'react';
import SEO from '../components/SEO';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart,
  CreditCard,
  Package,
  Store,
  Loader2,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useVendorProfile,
  useVendorAnalyticsOverview,
  useVendorAnalyticsInterest,
  useVendorSalesGraph,
  useVendorTopProducts,
  useVendorPayouts,
} from '../hooks/api/useVendor';

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '10d', label: '10 Days' },
  { value: '15d', label: '15 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function StatCard({ title, value, icon: Icon, color, prefix, loading, error, onRetry }) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-100 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
              {title}
            </p>
            <p className="text-xs sm:text-sm text-red-500">Failed to load</p>
          </div>
          <button onClick={onRetry} className="text-red-400 hover:text-red-600 p-2">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 mt-1" />
          ) : (
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-heritage-charcoal">
              {`${prefix || ''}${value ?? 0}`}
            </p>
          )}
        </div>
        <div
          className={`${color} p-2 sm:p-3 rounded-full ${loading ? 'animate-pulse opacity-50' : ''}`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, maxValue, color, loading }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="text-[11px] sm:text-sm text-gray-600 w-20 sm:w-32 font-medium truncate">
        {label}
      </span>
      <div className="flex-grow bg-gray-100 rounded-full h-4 sm:h-6 overflow-hidden">
        {loading ? (
          <Skeleton className="h-full w-full rounded-full" />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        )}
      </div>
      <span className="text-xs sm:text-sm font-bold text-heritage-charcoal w-16 sm:w-24 text-right">
        {loading ? <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 ml-auto" /> : value}
      </span>
    </div>
  );
}

function PeriodSelector({ value, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentLabel = PERIODS.find((p) => p.value === value)?.label || 'Select Period';

  return (
    <div>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <Calendar size={16} className="text-gray-400" />
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
              value === p.value
                ? 'bg-heritage-charcoal text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Mobile */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium"
        >
          <Calendar size={16} />
          {currentLabel}
        </button>
        {mobileOpen && (
          <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded shadow-lg z-50 w-48">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  onChange(p.value);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${value === p.value ? 'font-bold text-luxury-gold' : 'text-gray-700'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg border border-gray-100 p-4 rounded">
        <p className="text-sm font-bold text-heritage-charcoal mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{' '}
            {entry.name === 'Sales' ? `₹${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function VendorDashboard() {
  const [period, setPeriod] = useState('30d');
  const [payoutFilter, setPayoutFilter] = useState('');
  const [payoutPage, setPayoutPage] = useState(1);

  const { data: profile, isLoading: profileLoading } = useVendorProfile();
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useVendorAnalyticsOverview(period);
  const { data: interest, isLoading: interestLoading } = useVendorAnalyticsInterest(period);
  const { data: salesGraph, isLoading: salesGraphLoading } = useVendorSalesGraph(period);
  const { data: topProducts, isLoading: topProductsLoading } = useVendorTopProducts(period);
  const { data: payoutsData, isLoading: payoutsLoading } = useVendorPayouts({
    status: payoutFilter || undefined,
    page: payoutPage,
  });

  const isLoading = overviewLoading || interestLoading || salesGraphLoading || topProductsLoading;

  return (
    <div className="min-h-screen bg-secondary-bg">
      <SEO
        title="Vendor Dashboard"
        description="Manage your listings, sales, and analytics on The Collectors Exchange vendor dashboard."
        canonical="/vendor-dashboard"
        noindex
      />

      <div className="container mx-auto py-6 px-3 sm:py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif mb-2">Vendor Dashboard</h1>
            <p className="text-gray-500 font-light">
              {profileLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : profile ? (
                `Welcome back, ${profile.companyName || 'Vendor'}`
              ) : (
                'Analytics & Insights for your store'
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>

        {overviewError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 sm:w-5 sm:h-5" />
            <p className="text-xs sm:text-sm text-red-700 flex-grow">
              Failed to load analytics. The backend may be unavailable.
            </p>
            <button
              onClick={() => refetchOverview()}
              className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Order Count"
            value={overview?.orderCount}
            icon={ShoppingBag}
            color="bg-blue-500"
            loading={isLoading}
            error={overviewError}
            onRetry={refetchOverview}
          />
          <StatCard
            title="Items Sold"
            value={overview?.saleCount}
            icon={Package}
            color="bg-green-500"
            loading={isLoading}
            error={overviewError}
            onRetry={refetchOverview}
          />
          <StatCard
            title="Total Revenue"
            value={overview?.totalRevenue?.toLocaleString()}
            icon={TrendingUp}
            color="bg-purple-500"
            prefix="₹"
            loading={isLoading}
            error={overviewError}
            onRetry={refetchOverview}
          />
          <StatCard
            title="Pending Payout"
            value={overview?.pendingPayout?.toLocaleString()}
            icon={DollarSign}
            color="bg-amber-500"
            prefix="₹"
            loading={isLoading}
            error={overviewError}
            onRetry={refetchOverview}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Sales Graph */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-serif font-bold text-heritage-charcoal mb-1">
              Sales Trend
            </h3>
            <p className="text-xs text-gray-500 mb-6">Daily revenue over the selected period</p>
            {salesGraphLoading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <Loader2 className="animate-spin text-luxury-gold" size={24} />
              </div>
            ) : salesGraph && salesGraph.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesGraph}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) => {
                      const parts = d.split('-');
                      return `${parts[2]}/${parts[1]}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#D4AF37' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
                <p className="font-serif text-sm sm:text-lg">No sales data yet for this period</p>
              </div>
            )}
          </div>

          {/* Customer Interest Funnel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-serif font-bold text-heritage-charcoal mb-1">
              Customer Interest
            </h3>
            <p className="text-xs text-gray-500 mb-6">From discovery to purchase</p>
            <div className="space-y-3 sm:space-y-6">
              <FunnelBar
                label="Product Views"
                value={interest?.totalViews || 0}
                maxValue={interest?.totalViews || 1}
                color="bg-blue-400"
                loading={interestLoading}
              />
              <FunnelBar
                label="Added to Cart"
                value={interest?.cartAdds || 0}
                maxValue={interest?.totalViews || 1}
                color="bg-amber-400"
                loading={interestLoading}
              />
              <FunnelBar
                label="Checkout Starts"
                value={interest?.checkoutStarts || 0}
                maxValue={interest?.totalViews || 1}
                color="bg-green-400"
                loading={interestLoading}
              />
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                {interestLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Conversion Rate</span>
                      <span className="font-bold text-heritage-charcoal">
                        {interest?.totalViews > 0
                          ? `${((interest.checkoutStarts / interest.totalViews) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mt-1 sm:mt-2">
                      <span className="text-gray-500">Unique Viewers</span>
                      <span className="font-bold text-heritage-charcoal">
                        {interest?.uniqueViewers || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-serif font-bold text-heritage-charcoal mb-1">
              Top Products
            </h3>
            <p className="text-xs text-gray-500 mb-6">Best sellers in this period</p>
            {topProductsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded"
                  >
                    <Skeleton className="w-4 sm:w-6 h-4" />
                    <Skeleton className="w-8 sm:w-10 h-8 sm:h-10 rounded" />
                    <div className="flex-grow">
                      <Skeleton className="h-3 sm:h-4 w-20 sm:w-32" />
                      <Skeleton className="h-2 sm:h-3 w-14 sm:w-20 mt-1" />
                    </div>
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                  </div>
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded"
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 w-4 sm:w-6">
                      {i + 1}
                    </span>
                    <img
                      src={
                        product.image ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3C/svg%3E"
                      }
                      alt={product.title}
                      width="40"
                      height="40"
                      loading="lazy"
                      className="w-8 sm:w-10 h-8 sm:h-10 object-cover rounded bg-gray-200 shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-heritage-charcoal truncate">
                        {product.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {product.quantitySold} sold
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-heritage-charcoal">
                        ₹{product.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 sm:h-48 text-gray-400">
                <p className="font-serif text-sm sm:text-lg">No products sold yet</p>
              </div>
            )}
          </div>

          {/* Payout Dashboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-serif font-bold text-heritage-charcoal">
                Payouts
              </h3>
              <CreditCard size={20} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-4">Your payout history</p>

            <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
              {['', 'PENDING', 'PAID', 'FAILED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPayoutFilter(s === payoutFilter ? '' : s);
                    setPayoutPage(1);
                  }}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded transition-colors ${payoutFilter === s ? 'bg-heritage-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {payoutsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                      <Skeleton className="h-2 sm:h-3 w-20 sm:w-32 mt-1" />
                    </div>
                    <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : payoutsData?.payouts && payoutsData.payouts.length > 0 ? (
              <>
                <div className="space-y-2 sm:space-y-3">
                  {payoutsData.payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded"
                    >
                      <div className="min-w-0 mr-2">
                        <p className="text-xs sm:text-sm font-medium text-heritage-charcoal">
                          ₹{payout.amount?.toLocaleString()}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {new Date(payout.periodStart).toLocaleDateString()} —{' '}
                          {new Date(payout.periodEnd).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full ${
                          payout.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : payout.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-700'
                              : payout.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  ))}
                </div>
                {payoutsData.pagination?.pages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <button
                      disabled={payoutPage <= 1}
                      onClick={() => setPayoutPage((p) => p - 1)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded ${payoutPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Previous
                    </button>
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      Page {payoutsData.pagination.page} of {payoutsData.pagination.pages}
                    </span>
                    <button
                      disabled={payoutPage >= payoutsData.pagination.pages}
                      onClick={() => setPayoutPage((p) => p + 1)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded ${payoutPage >= payoutsData.pagination.pages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-24 sm:h-32 text-gray-400">
                <p className="font-serif text-sm sm:text-lg">No payouts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
