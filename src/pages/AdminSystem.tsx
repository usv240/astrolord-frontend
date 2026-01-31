import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Activity, HardDrive, Zap } from 'lucide-react';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';
import { createLogger } from '@/utils/logger';

const log = createLogger('AdminSystem');

interface SystemHealth {
  status: string;
  cpu_percent: number;
  memory: {
    percent: number;
    used_gb: number;
    total_gb: number;
  };
  disk: {
    percent: number;
    used_gb: number;
    total_gb: number;
  };
  uptime_days: number;
  timestamp: string;
}

interface ErrorLog {
  id?: string;
  timestamp: string;
  event_type: string;
  error_type: string;
  error_message: string;
  endpoint: string;
  method: string;
  status_code: number;
  severity: string;
  user_id: string;
  request_id?: string;
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
}

interface PerformanceData {
  period_days: number;
  ai_performance: {
    avg_response_ms: number;
    min_response_ms: number;
    max_response_ms: number;
    total_requests: number;
    avg_tokens_per_request: number;
  };
  latency_percentiles: {
    p50: number;
    p75: number;
    p95: number;
    p99: number;
  };
  throughput: {
    daily: Array<{ date: string; requests: number }>;
    avg_daily: number;
  };
}

interface DatabaseStats {
  collections: Record<string, {
    document_count: number;
    size_bytes: number;
    size_mb: number;
    avg_doc_size_bytes: number;
    indexes: number;
    error?: string;
  }>;
  total_size_mb: number;
  timestamp: string;
}

type TabType = 'health' | 'errors' | 'performance' | 'database';
const validTabs: TabType[] = ['health', 'errors', 'performance', 'database'];

export default function AdminSystemPage() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Derive selectedTab from URL param, default to 'health'
  const selectedTab: TabType = validTabs.includes(tab as TabType) ? (tab as TabType) : 'health';

  // Redirect to /admin/system/health if no tab specified or invalid tab
  useEffect(() => {
    if (!tab || !validTabs.includes(tab as TabType)) {
      navigate('/admin/system/health', { replace: true });
    }
  }, [tab, navigate]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Handle tab change via URL navigation
  const handleTabChange = (newTab: TabType) => {
    navigate(`/admin/system/${newTab}`);
  };

  useEffect(() => {
    fetchHealthData();
    if (selectedTab === 'errors') fetchErrorLogs();
    if (selectedTab === 'performance') fetchPerformanceMetrics();
    if (selectedTab === 'database') fetchDatabaseStats();
  }, [selectedTab]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (selectedTab === 'health') fetchHealthData();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedTab]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getSystemHealth();
      setSystemHealth(res.data);
    } catch (err: any) {
      log.error('System health error', { error: err.message });
      setError(err.message || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getErrorLogs(24); // Last 24 hours
      setErrorLogs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPerformanceMetrics();
      setPerformanceData(res.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDatabaseStats();
      setDatabaseStats(res.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load database stats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: any) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMemoryColor = (percent: number) => {
    if (percent < 60) return 'fill-green-500';
    if (percent < 80) return 'fill-yellow-500';
    return 'fill-red-500';
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600 mt-1">Monitor system performance and health</p>
          </div>
          {selectedTab === 'health' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
            </label>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {validTabs.map((currentTab) => (
            <button
              key={currentTab}
              onClick={() => handleTabChange(currentTab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === currentTab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Health Tab */}
            {selectedTab === 'health' && systemHealth && (
              <div className="space-y-6">
                {/* Status Card */}
                <div className={`rounded-lg p-8 border ${getStatusColor(systemHealth?.status)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold opacity-75">System Status</p>
                      <p className="text-4xl font-bold mt-2 capitalize">{systemHealth?.status || 'Unknown'}</p>
                      <p className="text-sm opacity-75 mt-2">
                        Last updated: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <Activity className="w-16 h-16 opacity-20" />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CPU */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-600">CPU Usage</p>
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{(systemHealth?.cpu_percent ?? 0).toFixed(1)}%</p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${(systemHealth?.cpu_percent ?? 0) > 80 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${systemHealth?.cpu_percent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-600">Memory Usage</p>
                      <HardDrive className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{(systemHealth?.memory?.percent ?? 0).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(systemHealth?.memory?.used_gb ?? 0).toFixed(1)} / {(systemHealth?.memory?.total_gb ?? 0).toFixed(1)} GB
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${(systemHealth?.memory?.percent ?? 0) > 80
                          ? 'bg-red-500'
                          : (systemHealth?.memory?.percent ?? 0) > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                        style={{ width: `${systemHealth?.memory?.percent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Disk */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-600">Disk Usage</p>
                      <HardDrive className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{(systemHealth?.disk?.percent ?? 0).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(systemHealth?.disk?.used_gb ?? 0).toFixed(1)} / {(systemHealth?.disk?.total_gb ?? 0).toFixed(1)} GB
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${(systemHealth?.disk?.percent ?? 0) > 80
                          ? 'bg-red-500'
                          : (systemHealth?.disk?.percent ?? 0) > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                        style={{ width: `${systemHealth?.disk?.percent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Uptime */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-2">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth?.uptime_days ?? 0} days</p>
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {selectedTab === 'errors' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Severity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Endpoint</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorLogs.map((log, idx) => (
                        <tr key={log.request_id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {log.error_type || log.event_type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mr-2">{log.method || 'GET'}</span>
                            <span className="font-mono text-xs">{log.endpoint}</span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-red-600">{log.status_code || '-'}</td>
                          <td className="px-6 py-3 text-sm text-gray-600 max-w-xs truncate">{log.error_message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {selectedTab === 'performance' && performanceData && (
              <div className="space-y-6">
                {/* AI Performance */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance (Last {performanceData.period_days} days)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Avg Response</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{performanceData.ai_performance?.avg_response_ms || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{(performanceData.ai_performance?.total_requests || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Min Response</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{performanceData.ai_performance?.min_response_ms || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Max Response</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{performanceData.ai_performance?.max_response_ms || 0} ms</p>
                    </div>
                  </div>
                </div>

                {/* Latency Percentiles */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency Percentiles</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">P50</p>
                      <p className="text-2xl font-bold text-green-600">{performanceData.latency_percentiles?.p50 || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">P75</p>
                      <p className="text-2xl font-bold text-blue-600">{performanceData.latency_percentiles?.p75 || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">P95</p>
                      <p className="text-2xl font-bold text-yellow-600">{performanceData.latency_percentiles?.p95 || 0} ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">P99</p>
                      <p className="text-2xl font-bold text-red-600">{performanceData.latency_percentiles?.p99 || 0} ms</p>
                    </div>
                  </div>
                </div>

                {/* Throughput */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Throughput</h3>
                  <p className="text-sm text-gray-600">Average Daily Requests: <span className="font-bold text-gray-900">{performanceData.throughput?.avg_daily || 0}</span></p>
                  {performanceData.throughput?.daily && performanceData.throughput.daily.length > 0 && (
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={performanceData.throughput.daily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="requests" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Database Tab */}
            {selectedTab === 'database' && databaseStats && (
              <div className="space-y-4">
                {/* Total Size */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Total Database Size: <span className="font-bold">{databaseStats.total_size_mb || 0} MB</span></p>
                </div>

                {/* Collections */}
                {databaseStats.collections && Object.entries(databaseStats.collections).map(([name, stat]) => (
                  <div key={name} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    </div>
                    {stat.error ? (
                      <p className="text-red-600 text-sm">{stat.error}</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium uppercase">Documents</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{(stat.document_count || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium uppercase">Size</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{(stat.size_mb || 0).toFixed(2)} MB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium uppercase">Avg Doc Size</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{((stat.avg_doc_size_bytes || 0) / 1024).toFixed(2)} KB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium uppercase">Indexes</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.indexes || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
