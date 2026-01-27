import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Users, CreditCard, Zap, Activity, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';

interface DashboardOverview {
  period: { days: number; start_date: string; end_date: string };
  users: { total: number; new: number; active: number; active_percentage: number };
  usage: { queries: number; charts: number; sessions: number; avg_queries_per_user: number };
  revenue: { total: number; orders: number; avg_order_value: number; active_subscriptions: number };
  system: { errors: number; avg_ai_response_ms: number; total_tokens_used: number };
}

interface ChartData {
  users: { date: string; count: number }[];
  queries: { date: string; count: number }[];
  revenue: { date: string; revenue: number; orders: number }[];
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, chartsRes] = await Promise.all([
        adminAPI.getDashboardOverview(days),
        adminAPI.getDashboardCharts(Math.max(days, 30)),
      ]);

      setOverview(overviewRes.data);
      setChartData(chartsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Real-time platform metrics and KPIs</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              📊 Advanced Analytics
            </button>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <KPICard
                  title="Total Users"
                  value={overview.users.total.toLocaleString()}
                  change={`+${overview.users.new} new`}
                  icon={Users}
                  color="blue"
                />
                <KPICard
                  title="Active Users"
                  value={overview.users.active.toLocaleString()}
                  change={`${overview.users.active_percentage}% active`}
                  icon={Activity}
                  color="green"
                />
                <KPICard
                  title="Total Queries"
                  value={overview.usage.queries.toLocaleString()}
                  change={`Avg: ${overview.usage.avg_queries_per_user.toFixed(1)}/user`}
                  icon={TrendingUp}
                  color="blue"
                />
                <KPICard
                  title="Revenue"
                  value={`$${overview.revenue.total.toLocaleString()}`}
                  change={`${overview.revenue.orders} orders`}
                  icon={CreditCard}
                  color="emerald"
                />
                <KPICard
                  title="Active Subs"
                  value={overview.revenue.active_subscriptions.toString()}
                  change="Active plans"
                  icon={Zap}
                  color="yellow"
                />
              </div>
            )}

            {/* Charts */}
            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="New Users" data={chartData.users}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Daily Queries" data={chartData.queries}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.queries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Daily Revenue" data={chartData.revenue} span={true}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Revenue ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* System Health */}
            {overview && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HealthMetric label="Errors (Last Hour)" value={overview.system.errors.toString()} status={overview.system.errors > 10 ? 'warning' : 'healthy'} />
                  <HealthMetric label="Avg AI Response" value={`${overview.system.avg_ai_response_ms.toFixed(0)}ms`} status={overview.system.avg_ai_response_ms > 2000 ? 'warning' : 'healthy'} />
                  <HealthMetric label="Tokens Used" value={`${(overview.system.total_tokens_used / 1000).toFixed(1)}k`} status="healthy" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'emerald' | 'yellow';
}

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    emerald: 'text-emerald-500',
    yellow: 'text-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{change}</p>
        </div>
        <Icon className={`w-12 h-12 ${colorClasses[color]}`} />
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: any[];
  span?: boolean;
  children: React.ReactNode;
}

function ChartCard({ title, data, span = false, children }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-lg p-6 border border-gray-200 ${span ? 'lg:col-span-2' : ''}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {data && data.length > 0 ? children : <p className="text-gray-500 text-center py-8">No data available</p>}
    </div>
  );
}

interface HealthMetricProps {
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
}

function HealthMetric({ label, value, status }: HealthMetricProps) {
  const statusColors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-2xl font-bold ${statusColors[status]} mt-2`}>{value}</p>
    </div>
  );
}
