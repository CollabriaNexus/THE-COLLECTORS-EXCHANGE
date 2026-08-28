import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QrScans from '../QrScans';

const mockGet = vi.fn();

vi.mock('../../hooks/api/apiClient', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Area: () => null,
  Bar: () => null,
  BarChart: ({ children }) => <div>{children}</div>,
  ComposedChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: ({ children }) => <div>{children}</div>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const statsPayload = {
  totals: { total: 20, uniqueDevices: 16, totalUsers: 12 },
  timeline: [{ day: new Date().toISOString(), total: 20, uniqueDevices: 16 }],
  hourly: [{ hour: 10, total: 8, uniqueDevices: 6 }],
  locations: [{ country: 'India', countryCode: 'IN', city: 'Bengaluru', scans: 10, users: 8 }],
  devices: [{ name: 'mobile', scans: 14, users: 9 }],
  operatingSystems: [{ name: 'Android 14', scans: 11, users: 7 }],
  browsers: [{ name: 'Chrome 126', scans: 12, users: 8 }],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('QrScans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url) => {
      if (url.startsWith('/admin/qr/codes')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 'c1',
                title: 'Poster A',
                slug: 'poster-a',
                targetUrl: 'https://example.com',
                active: true,
                totalScans: 20,
              },
            ],
          },
        });
      }
      if (url.startsWith('/admin/qr/filters')) {
        return Promise.resolve({
          data: {
            countries: ['India'],
            cities: ['Bengaluru'],
            deviceTypes: ['mobile'],
            operatingSystems: ['Android 14'],
          },
        });
      }
      return Promise.resolve({ data: statsPayload });
    });
  });

  it('renders the page headline statistics', async () => {
    render(<QrScans />, { wrapper: createWrapper() });
    expect(screen.getByText('QR Scan Analytics')).toBeInTheDocument();
    expect(await screen.findByText('Total Scans')).toBeInTheDocument();
    expect(screen.getByText('Unique Device Scans')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    // Totals render as plain numbers once stats load
    const twentyNodes = await screen.findAllByText('20');
    expect(twentyNodes.length).toBeGreaterThan(0);
  });

  it('lists locations with country and city breakdowns', async () => {
    render(<QrScans />, { wrapper: createWrapper() });
    expect(await screen.findByText('Scans By Location')).toBeInTheDocument();
    const cityNodes = await screen.findAllByText('Bengaluru');
    expect(cityNodes.length).toBeGreaterThan(0);
  });

  it('shows tracked QR codes in the summary strip', async () => {
    render(<QrScans />, { wrapper: createWrapper() });
    const posterNodes = await screen.findAllByText('Poster A');
    expect(posterNodes.length).toBeGreaterThan(0);
  });
});
