import React, { useMemo, useState } from 'react';
import {
  QrCode as QrCodeIcon,
  Copy,
  Check,
  Plus,
  Trash2,
  Pencil,
  X,
  Globe,
  Smartphone,
  Users,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Filter,
  Loader2,
  Link2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  useQrCodes,
  useQrStats,
  useQrFilterValues,
  useCreateQrCode,
  useUpdateQrCode,
  useDeleteQrCode,
} from '../hooks/api/useQr';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const COLORS = ['#D4AF37', '#1C1C1C', '#8B7355', '#C9A962', '#3D3028', '#B0B0B0'];
const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
];

const startOfDayUTC = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const toISODate = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const fmtDay = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    timeZone: 'UTC',
  });

const hourLabel = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  const suffix = hour < 12 ? 'AM' : 'PM';
  return `${hour % 12} ${suffix}`;
};

const pctChange = (current, previous) => {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  if (current > 0) return null;
  return 0;
};

function DeltaBadge({ current, previous }) {
  const delta = pctChange(current, previous);
  if (delta === 0) {
    return <span className="ml-2 text-xs font-medium text-gray-400">±0%</span>;
  }
  if (delta === null) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
        <TrendingUp size={12} /> New
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`ml-2 inline-flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-600' : 'text-red-500'}`}
    >
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}
      {delta}%
    </span>
  );
}

function StatCard({ title, hint, icon: Icon, color, current, previous }) {
  return (
    <div className="bg-white rounded-lg shadow-heritage p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-xs text-gray-400 mt-1">{hint}</p>
          <p className="text-4xl font-bold text-heritage-charcoal mt-2">
            {typeof current === 'number' ? current.toLocaleString('en-IN') : '—'}
          </p>
          {previous !== undefined && (
            <p className="mt-1">
              <DeltaBadge current={current || 0} previous={previous || 0} />
              <span className="ml-1 text-xs text-gray-400">vs previous period</span>
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, height = 260 }) {
  return (
    <div className="bg-white rounded-lg shadow-heritage p-6 border border-gray-100">
      <h3 className="text-base font-serif font-bold text-heritage-charcoal">{title}</h3>
      {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

const EmptyChart = ({ message }) => (
  <div className="h-full flex items-center justify-center text-sm text-gray-400">{message}</div>
);

function CodeManager({ codes, onClose }) {
  const createMutation = useCreateQrCode();
  const updateMutation = useUpdateQrCode();
  const deleteMutation = useDeleteQrCode();
  const [form, setForm] = useState({ title: '', targetUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [copiedSlug, setCopiedSlug] = useState(null);

  const copyEndpoint = async (slug) => {
    const url = `${API_BASE}/qr/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.targetUrl.trim()) return;
    await createMutation.mutateAsync(form);
    setForm({ title: '', targetUrl: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateMutation.mutateAsync({ id: editingId, ...draft });
    setEditingId(null);
    setDraft({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-serif font-bold text-heritage-charcoal">Manage QR Codes</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">
            Each code gets a tracking endpoint. Paste the endpoint URL into any QR generator — every
            scan is recorded and the visitor is redirected instantly.
          </p>
          <form onSubmit={submitCreate} className="flex flex-col md:flex-row gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="QR title (e.g. Mumbai Expo Poster)"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-luxury-gold"
            />
            <input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="Redirect destination (https://…)"
              className="flex-[2] border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-luxury-gold"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center justify-center gap-2 bg-heritage-charcoal text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-md hover:bg-luxury-gold transition-all duration-300 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Create
            </button>
          </form>
          {createMutation.isError && (
            <p className="text-xs text-red-500 mt-2">{String(createMutation.error?.message)}</p>
          )}
        </div>

        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto">
          {codes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No QR codes yet — create your first one above.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2 px-2">Tracking Endpoint</th>
                  <th className="py-2 px-2 text-right">Scans</th>
                  <th className="py-2 px-2 text-center">Active</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => {
                  const editing = editingId === code.id;
                  return (
                    <tr key={code.id} className="border-b border-gray-50 align-middle">
                      <td className="py-3 px-2">
                        {editing ? (
                          <input
                            value={draft.title ?? ''}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-luxury-gold"
                          />
                        ) : (
                          <>
                            <div className="font-medium text-heritage-charcoal">{code.title}</div>
                            <div className="text-xs text-gray-400">/{code.slug}</div>
                          </>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {editing ? (
                          <input
                            value={draft.targetUrl ?? ''}
                            onChange={(e) => setDraft({ ...draft, targetUrl: e.target.value })}
                            placeholder="Redirect URL"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-luxury-gold"
                          />
                        ) : (
                          <button
                            onClick={() => copyEndpoint(code.slug)}
                            title={`${API_BASE}/qr/${code.slug}`}
                            className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 max-w-[240px]"
                          >
                            {copiedSlug === code.slug ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                            <span className="truncate">
                              {copiedSlug === code.slug ? 'Copied!' : `${API_BASE}/qr/${code.slug}`}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-bold tabular-nums text-heritage-charcoal">
                        {code.totalScans}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: code.id, active: !code.active })
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            code.active ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                          aria-label={`Toggle ${code.title}`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                              code.active ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-1">
                          {editing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                disabled={updateMutation.isPending}
                                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                                title="Save"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                                title="Cancel"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(code.id);
                                  setDraft({ title: code.title, targetUrl: code.targetUrl });
                                }}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete "${code.title}" and all its scan history?`,
                                    )
                                  ) {
                                    deleteMutation.mutate(code.id);
                                  }
                                }}
                                className="p-1.5 rounded hover:bg-red-50 text-red-500"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function QrScans() {
  const { data: codes = [] } = useQrCodes();
  const { data: filterValues } = useQrFilterValues();

  const [selectedCodeId, setSelectedCodeId] = useState('');
  const [preset, setPreset] = useState('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [compare, setCompare] = useState(true);
  const [filters, setFilters] = useState({ country: '', city: '', deviceType: '', os: '' });
  const [hourlyMode, setHourlyMode] = useState('total');
  const [showManager, setShowManager] = useState(false);

  const range = useMemo(() => {
    let fromDate;
    let toDate;
    if (preset === 'custom' && customFrom && customTo) {
      fromDate = startOfDayUTC(new Date(`${customFrom}T00:00:00Z`));
      toDate = startOfDayUTC(new Date(`${customTo}T00:00:00Z`));
    } else {
      const presetDef = PRESETS.find((p) => p.key === preset) || PRESETS[0];
      toDate = startOfDayUTC(new Date());
      fromDate = addDays(toDate, -(presetDef.days - 1));
    }
    const durationMs = toDate.getTime() - fromDate.getTime() + DAY_MS;
    return {
      from: fromDate,
      to: toDate,
      fromISO: fromDate.toISOString(),
      // include the whole end day
      toISO: new Date(toDate.getTime() + DAY_MS - 1).toISOString(),
      durationMs,
      prevFrom: new Date(fromDate.getTime() - durationMs),
      prevTo: new Date(fromDate.getTime() - 1),
      label: `${fmtDay(fromDate)} – ${fmtDay(toDate)}`,
      prevLabel: `${fmtDay(new Date(fromDate.getTime() - durationMs))} – ${fmtDay(new Date(fromDate.getTime() - 1))}`,
    };
  }, [preset, customFrom, customTo]);

  const baseParams = useMemo(
    () => ({
      codeId: selectedCodeId || undefined,
      from: range.fromISO,
      to: range.toISO,
      country: filters.country || undefined,
      city: filters.city || undefined,
      deviceType: filters.deviceType || undefined,
      os: filters.os || undefined,
    }),
    [selectedCodeId, range.fromISO, range.toISO, filters],
  );

  const prevParams = useMemo(
    () => ({
      ...baseParams,
      from: range.prevFrom.toISOString(),
      to: range.prevTo.toISOString(),
    }),
    [baseParams, range.prevFrom, range.prevTo],
  );

  const { data: stats, isLoading } = useQrStats(baseParams);
  const { data: prevStats } = useQrStats(prevParams, { enabled: compare });

  const totals = stats?.totals ?? {};
  const prevTotals = compare ? (prevStats?.totals ?? {}) : undefined;

  const timelineData = useMemo(() => {
    if (!stats) return [];
    const byKey = new Map(stats.timeline.map((row) => [toISODate(new Date(row.day)), row]));
    const out = [];
    let cursor = range.from;
    while (cursor <= range.to) {
      const key = toISODate(cursor);
      const row = byKey.get(key);
      out.push({
        date: fmtDay(key),
        total: Number(row?.total ?? 0),
        unique: Number(row?.uniqueDevices ?? 0),
      });
      cursor = addDays(cursor, 1);
    }
    return out;
  }, [stats, range]);

  const hourlyData = useMemo(() => {
    const byHour = new Map((stats?.hourly || []).map((row) => [Number(row.hour), row]));
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: hourLabel(hour),
      value: Number(byHour.get(hour)?.[hourlyMode === 'total' ? 'total' : 'uniqueDevices'] ?? 0),
    }));
  }, [stats, hourlyMode]);

  const locations = useMemo(() => stats?.locations || [], [stats]);
  const countryCount = useMemo(() => new Set(locations.map((l) => l.country)).size, [locations]);
  const cityCount = useMemo(() => new Set(locations.map((l) => l.city)).size, [locations]);
  const maxLocationScans = Math.max(1, ...locations.map((l) => Number(l.scans)));

  const devicePie =
    (stats?.devices || []).map((d) => ({
      name: d.name,
      value: Number(d.scans),
      users: Number(d.users),
    })) || [];

  const clearFilters = () => {
    setSelectedCodeId('');
    setFilters({ country: '', city: '', deviceType: '', os: '' });
    setPreset('7d');
    setCustomFrom('');
    setCustomTo('');
  };

  const hasActiveFilters =
    selectedCodeId || filters.country || filters.city || filters.deviceType || filters.os;

  const periodHint = compare ? `${range.label} · compared with ${range.prevLabel}` : range.label;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">
            QR Scan Analytics
          </h2>
          <p className="text-gray-600 mt-2">
            Track poster scans, visitors and geography in near real time
          </p>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="inline-flex items-center gap-2 bg-heritage-charcoal text-white text-sm font-bold uppercase tracking-widest px-4 py-2.5 rounded-md hover:bg-luxury-gold transition-all duration-300"
        >
          <QrCodeIcon size={16} /> Manage Codes
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-heritage p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
              QR Code
            </label>
            <select
              value={selectedCodeId}
              onChange={(e) => setSelectedCodeId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[180px] focus:outline-none focus:border-luxury-gold"
            >
              <option value="">All Codes</option>
              {codes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
              Period
            </label>
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`px-3 py-2 text-xs font-bold transition-colors ${
                    preset === p.key
                      ? 'bg-heritage-charcoal text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setPreset('custom')}
                className={`px-3 py-2 text-xs font-bold transition-colors ${
                  preset === 'custom'
                    ? 'bg-heritage-charcoal text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {preset === 'custom' && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-luxury-gold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </>
          )}

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="accent-luxury-gold"
            />
            Compare with previous period
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-heritage-charcoal pb-2 transition-colors"
            >
              <Filter size={12} /> Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-gray-50">
          {[
            { key: 'country', label: 'Country', options: filterValues?.countries },
            { key: 'city', label: 'City', options: filterValues?.cities },
            { key: 'deviceType', label: 'Device', options: filterValues?.deviceTypes },
            { key: 'os', label: 'OS', options: filterValues?.operatingSystems },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                {label}
              </label>
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px] focus:outline-none focus:border-luxury-gold"
              >
                <option value="">All</option>
                {(options || []).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Scans"
          hint="Every scan, even repeat devices"
          icon={MousePointerClick}
          color="bg-heritage-charcoal"
          current={Number(totals.total ?? 0)}
          previous={prevTotals ? Number(prevTotals.total ?? 0) : undefined}
        />
        <StatCard
          title="Unique Device Scans"
          hint="Distinct devices that scanned"
          icon={Smartphone}
          color="bg-luxury-gold"
          current={Number(totals.uniqueDevices ?? 0)}
          previous={prevTotals ? Number(prevTotals.uniqueDevices ?? 0) : undefined}
        />
        <StatCard
          title="Total Users"
          hint="Distinct visitors (cookie based)"
          icon={Users}
          color="bg-emerald-600"
          current={Number(totals.totalUsers ?? 0)}
          previous={prevTotals ? Number(prevTotals.totalUsers ?? 0) : undefined}
        />
      </div>

      {isLoading && !stats ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading scan statistics…
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">{periodHint} · times shown in IST</p>

          {/* Charts */}
          <div className="space-y-6">
            <ChartCard
              title="Scans Over Time"
              subtitle="Total scans vs unique devices per day"
              height={280}
            >
              {timelineData.length === 0 ? (
                <EmptyChart message="No scans in this period yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timelineData}>
                    <defs>
                      <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Scans"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fill="url(#goldFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="unique"
                      name="Unique Devices"
                      stroke="#1C1C1C"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Scans By Daytime"
                subtitle="Distribution across hours of the day (IST)"
              >
                <div className="flex justify-end gap-1 mb-2">
                  {[
                    { key: 'total', label: 'Total Scans' },
                    { key: 'unique', label: 'Unique Devices' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setHourlyMode(key)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                        hourlyMode === key
                          ? 'bg-luxury-gold text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {Number(totals.total ?? 0) === 0 ? (
                  <EmptyChart message="No scans in this period yet" />
                ) : (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        name={hourlyMode === 'total' ? 'Total Scans' : 'Unique Devices'}
                        fill="#D4AF37"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Devices" subtitle="Types of devices used to scan">
                {devicePie.length === 0 ? (
                  <EmptyChart message="No scans in this period yet" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devicePie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={75}
                        innerRadius={40}
                        paddingAngle={2}
                      >
                        {devicePie.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  title: 'Operating Systems',
                  subtitle: 'Devices by OS',
                  rows: stats?.operatingSystems || [],
                },
                { title: 'Browsers', subtitle: 'Devices by browser', rows: stats?.browsers || [] },
              ].map(({ title, subtitle, rows }) => {
                const data = rows
                  .map((r) => ({ name: r.name, scans: Number(r.scans) }))
                  .slice(0, 8);
                return (
                  <ChartCard key={title} title={title} subtitle={subtitle}>
                    {data.length === 0 ? (
                      <EmptyChart message="No scans in this period yet" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="scans"
                            name="Scans"
                            fill="#1C1C1C"
                            radius={[0, 2, 2, 0]}
                            barSize={16}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </ChartCard>
                );
              })}
            </div>

            {/* Locations */}
            <div className="bg-white rounded-lg shadow-heritage p-6 border border-gray-100">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-serif font-bold text-heritage-charcoal">
                  Scans By Location
                </h3>
                <p className="text-xs text-gray-500">
                  Countries:{' '}
                  <span className="font-bold text-heritage-charcoal">{countryCount}</span> · Cities:{' '}
                  <span className="font-bold text-heritage-charcoal">{cityCount}</span> ·
                  approximate location from IP
                </p>
              </div>
              {locations.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                  No location data in this period yet
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                        <th className="py-2 px-2">Country</th>
                        <th className="py-2 px-2">City</th>
                        <th className="py-2 px-2 text-right">Scans</th>
                        <th className="py-2 px-2 text-right">Users</th>
                        <th className="py-2 px-2 w-48">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((row) => (
                        <tr key={`${row.country}-${row.city}`} className="border-b border-gray-50">
                          <td className="py-2.5 px-2 font-medium text-heritage-charcoal">
                            <span className="inline-flex items-center gap-2">
                              <Globe size={13} className="text-gray-400" />
                              {row.country}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-gray-600">{row.city}</td>
                          <td className="py-2.5 px-2 text-right font-bold tabular-nums text-heritage-charcoal">
                            {Number(row.scans).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-2 text-right tabular-nums text-gray-600">
                            {Number(row.users).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-luxury-gold rounded-full"
                                style={{
                                  width: `${(Number(row.scans) / maxLocationScans) * 100}%`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Codes summary strip */}
      {codes.length > 0 && !showManager && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.slice(0, 6).map((code) => (
            <div
              key={code.id}
              className="bg-white rounded-lg shadow-heritage p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-heritage-charcoal truncate">{code.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Link2 size={11} /> /{code.slug}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-xl font-bold text-heritage-charcoal tabular-nums">
                    {code.totalScans}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">scans</p>
                </div>
              </div>
              {!code.active && (
                <p className="mt-2 text-[10px] uppercase tracking-widest font-bold text-red-500">
                  Inactive
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showManager && <CodeManager codes={codes} onClose={() => setShowManager(false)} />}
    </div>
  );
}

export default QrScans;
