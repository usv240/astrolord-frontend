import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { createLogger } from '@/utils/logger';

const log = createLogger('AdminDashboard');

interface QueryLog {
  timestamp: string;
  user_id: string;
  message: string;
  intent: string;
  focus: string;
  chart_id: string;
}

interface FeedbackLog {
  timestamp: string;
  user_id: string;
  score: number;
  comment: string;
  message_id: string;
  session_id: string;
  ai_response?: string;
  user_query?: string;
}

interface SystemStats {
  total_requests: number;
  cache_hit_rate: number;
  avg_latency: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  error_rate: number;
  // Enhanced metrics
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  rate_limit_hits: number;
  hourly_limit_hits: number;
  daily_limit_hits: number;
  avg_tokens_per_request: number;
  token_efficiency: number;
  active_keys: number;
  healthy_keys: number;
  failed_keys: number;
}

interface DailyTokenData {
  date: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  message_count: number;
  avg_tokens_per_message: number;
  token_efficiency: number;
}

interface TokenTrends {
  period_days: number;
  start_date: string;
  end_date: string;
  daily_breakdown: DailyTokenData[];
  summary: {
    total_tokens: number;
    total_messages: number;
    avg_tokens_per_message: number;
    avg_daily_tokens: number;
    trend: string;
    trend_percentage: number;
  };
  projections: {
    projected_30day_tokens: number;
    estimated_monthly_cost_usd: number;
    estimated_monthly_messages: number;
  };
}

interface PerformanceAnalytics {
  period_hours: number;
  summary: {
    total_operations: number;
    total_slow_operations: number;
    total_errors: number;
    avg_latency_ms: number;
    slow_rate: number;
    error_rate: number;
  };
  endpoint_stats: {
    [key: string]: {
      count: number;
      avg_ms: number;
      p50_ms: number;
      p95_ms: number;
      p99_ms: number;
      min_ms: number;
      max_ms: number;
      slow_count: number;
      error_count: number;
      slow_rate: number;
    };
  };
  slow_operations: Array<{
    operation_name: string;
    timestamp: string;
    duration_ms: number;
    user_id: string;
    error: boolean;
  }>;
  degradation_alerts: Array<{
    operation_name: string;
    degradation_detected: boolean;
    recent_avg_ms: number;
    baseline_avg_ms: number;
    degradation_percentage: number;
    recent_sample_size: number;
    baseline_sample_size: number;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface UserDetails {
  user: User;
  charts: any[];
  sessions: any[];
}

interface GeneralFeedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  email?: string;
  user_id?: string;
  created_at: string;
}

interface LiveStats {
  timestamp: string;
  active_sessions: number;
  requests_per_minute: number;
  errors_per_minute: number;
  error_rate: number;
  recent_requests_5min: number;
  recent_errors_5min: number;
  avg_latency_5min: number;
  api_keys: {
    active_keys: number;
    healthy_keys: number;
  };
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'queries' | 'feedback' | 'users' | 'general_feedback'>('users');
  const [queries, setQueries] = useState<QueryLog[]>([]);
  const [feedback, setFeedback] = useState<FeedbackLog[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState<GeneralFeedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tokenTrends, setTokenTrends] = useState<TokenTrends | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalytics | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackLog | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Real-time stats polling
  useEffect(() => {
    if (activeTab !== 'stats') return;

    const fetchLiveStats = async () => {
      try {
        const res = await adminAPI.getLiveStats();
        setLiveStats(res.data);
      } catch (error) {
        log.error('Failed to fetch live stats', { error: String(error) });
      }
    };

    // Initial fetch
    fetchLiveStats();

    // Poll every 5 seconds
    const interval = setInterval(fetchLiveStats, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Reset selected chart when user dialog closes
  useEffect(() => {
    if (!selectedUser) {
      setSelectedChartId(null);
    }
  }, [selectedUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const res = await adminAPI.getStats();
        setStats(res.data);
        // Also load token trends when viewing stats
        const trendsRes = await adminAPI.getTokenTrends(30);
        setTokenTrends(trendsRes.data);
        // Load performance analytics
        const perfRes = await adminAPI.getPerformanceAnalytics(24);
        setPerformanceData(perfRes.data);
      } else if (activeTab === 'queries') {
        const res = await adminAPI.getQueries();
        setQueries(res.data);
      } else if (activeTab === 'feedback') {
        const res = await adminAPI.getFeedback();
        setFeedback(res.data);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data);
      } else if (activeTab === 'general_feedback') {
        const res = await adminAPI.getGeneralFeedback();
        setGeneralFeedback(res.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges.",
          variant: "destructive"
        });
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: "Failed to load admin data.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch User Basic Info
      const res = await adminAPI.getUserDetails(userId);
      // Initialize with empty arrays to show dialog immediately
      const userDetails = { ...res.data, charts: [], sessions: [] };
      setSelectedUser(userDetails);
      
      // 2. Fetch Charts (Async)
      adminAPI.getUserCharts(userId).then(resCharts => {
        setSelectedUser(prev => prev ? { ...prev, charts: resCharts.data } : null);
      }).catch(err => log.error('Failed to load charts', { error: String(err) }));

      // 3. Fetch Sessions (Async)
      adminAPI.getUserSessions(userId).then(resSessions => {
        setSelectedUser(prev => prev ? { ...prev, sessions: resSessions.data } : null);
      }).catch(err => log.error('Failed to load sessions', { error: String(err) }));

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/analytics')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          📊 Advanced Analytics
        </button>
      </div>
      
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          System Stats
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'queries' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('queries')}
        >
          User Queries
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'feedback' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Chat Feedback
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'general_feedback' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('general_feedback')}
        >
          General Feedback
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading...</div>}

      {!loading && activeTab === 'stats' && stats && (
        <div>
          {/* Live Stats Banner */}
          {liveStats && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Live System Status
                </h2>
                <span className="text-sm opacity-90">
                  Updated {new Date(liveStats.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Active Sessions</p>
                  <p className="text-3xl font-bold">{liveStats.active_sessions}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Requests/Min</p>
                  <p className="text-3xl font-bold">{liveStats.requests_per_minute}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Errors/Min</p>
                  <p className="text-3xl font-bold">{liveStats.errors_per_minute}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Error Rate</p>
                  <p className="text-3xl font-bold">{liveStats.error_rate.toFixed(1)}%</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Avg Latency</p>
                  <p className="text-3xl font-bold">{liveStats.avg_latency_5min.toFixed(0)}ms</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">API Keys</p>
                  <p className="text-3xl font-bold">
                    {liveStats.api_keys.healthy_keys}/{liveStats.api_keys.active_keys}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Requests</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_requests}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Avg Latency</h3>
              <p className="text-3xl font-bold text-green-600">{stats.avg_latency.toFixed(0)} ms</p>
              <p className="text-xs text-gray-500 mt-1">Mean response time</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Input Tokens</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.prompt_tokens.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Sent to AI</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Output Tokens</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.completion_tokens.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Received from AI</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Cache Hit Rate</h3>
              <p className="text-3xl font-bold text-teal-600">{(stats.cache_hit_rate * 100).toFixed(1)}%</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Error Rate</h3>
              <p className="text-3xl font-bold text-red-600">{(stats.error_rate * 100).toFixed(2)}%</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <h2 className="text-xl font-bold mb-4">📈 Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">P50 Latency</h3>
              <p className="text-3xl font-bold text-blue-500">{stats.p50_latency_ms.toFixed(0)} ms</p>
              <p className="text-xs text-gray-500 mt-1">50th percentile</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">P95 Latency</h3>
              <p className="text-3xl font-bold text-orange-500">{stats.p95_latency_ms.toFixed(0)} ms</p>
              <p className="text-xs text-gray-500 mt-1">95th percentile</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">P99 Latency</h3>
              <p className="text-3xl font-bold text-red-500">{stats.p99_latency_ms.toFixed(0)} ms</p>
              <p className="text-xs text-gray-500 mt-1">99th percentile</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Avg Tokens/Req</h3>
              <p className="text-3xl font-bold text-indigo-500">{stats.avg_tokens_per_request.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">Efficiency: {(stats.token_efficiency * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Rate Limiting & Key Health */}
          <h2 className="text-xl font-bold mb-4">🔒 Rate Limits & API Keys</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Rate Limit Hits</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.rate_limit_hits}</p>
              <p className="text-xs text-gray-500 mt-1">Total (hourly + daily)</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Hourly Limits</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.hourly_limit_hits}</p>
              <p className="text-xs text-gray-500 mt-1">Users throttled</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">API Keys Health</h3>
              <p className="text-3xl font-bold text-green-600">{stats.healthy_keys}/{stats.active_keys}</p>
              <p className="text-xs text-gray-500 mt-1">Healthy keys</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Failed Keys</h3>
              <p className="text-3xl font-bold text-red-600">{stats.failed_keys}</p>
              <p className="text-xs text-gray-500 mt-1">In recovery mode</p>
            </div>
          </div>

          {/* Token Usage Trends */}
          {tokenTrends && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8">📊 Token Usage Trends ({tokenTrends.period_days} days)</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Tokens</h3>
                  <p className="text-3xl font-bold text-blue-600">{tokenTrends.summary.total_tokens.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{tokenTrends.summary.total_messages.toLocaleString()} messages</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Daily Average</h3>
                  <p className="text-3xl font-bold text-purple-600">{tokenTrends.summary.avg_daily_tokens.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{tokenTrends.summary.avg_tokens_per_message.toFixed(0)} tokens/msg</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Trend</h3>
                  <p className={`text-3xl font-bold ${
                    tokenTrends.summary.trend === 'increasing' ? 'text-orange-600' : 
                    tokenTrends.summary.trend === 'decreasing' ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {tokenTrends.summary.trend === 'increasing' ? '📈' : 
                     tokenTrends.summary.trend === 'decreasing' ? '📉' : '➡️'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tokenTrends.summary.trend === 'insufficient_data' ? 'Need more data' : 
                     `${tokenTrends.summary.trend} ${tokenTrends.summary.trend_percentage.toFixed(1)}%`}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">30-Day Projection</h3>
                  <p className="text-3xl font-bold text-indigo-600">${tokenTrends.projections.estimated_monthly_cost_usd.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{tokenTrends.projections.projected_30day_tokens.toLocaleString()} tokens</p>
                </div>
              </div>

              {/* Token Usage Trend Chart */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Token Usage Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tokenTrends.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="prompt_tokens" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      name="Prompt Tokens"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completion_tokens" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      name="Completion Tokens"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Message Volume Chart */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Daily Message Volume</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={tokenTrends.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="message_count" fill="#8b5cf6" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Breakdown Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden border mb-6">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold">Daily Token Breakdown</h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tokens</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg/Msg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tokenTrends.daily_breakdown.slice().reverse().map((day, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.message_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.total_tokens.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{day.prompt_tokens.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{day.completion_tokens.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.avg_tokens_per_message.toFixed(0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">{(day.token_efficiency * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Performance Monitoring */}
          {performanceData && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8">⚡ Performance Monitoring (Last {performanceData.period_hours}h)</h2>
              
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Operations</h3>
                  <p className="text-3xl font-bold text-blue-600">{performanceData.summary.total_operations.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Tracked requests</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Avg Latency</h3>
                  <p className="text-3xl font-bold text-green-600">{performanceData.summary.avg_latency_ms.toFixed(0)} ms</p>
                  <p className="text-xs text-gray-500 mt-1">Across all endpoints</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Slow Operations</h3>
                  <p className={`text-3xl font-bold ${performanceData.summary.slow_rate > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                    {performanceData.summary.total_slow_operations}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{performanceData.summary.slow_rate.toFixed(1)}% rate (&gt;1000ms)</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Errors</h3>
                  <p className={`text-3xl font-bold ${performanceData.summary.error_rate > 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {performanceData.summary.total_errors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{performanceData.summary.error_rate.toFixed(1)}% error rate</p>
                </div>
              </div>

              {/* Degradation Alerts */}
              {performanceData.degradation_alerts.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Performance Degradation Detected</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          {performanceData.degradation_alerts.map((alert, idx) => (
                            <li key={idx}>
                              <strong>{alert.operation_name}</strong>: {alert.degradation_percentage.toFixed(1)}% slower 
                              (baseline: {alert.baseline_avg_ms.toFixed(0)}ms → recent: {alert.recent_avg_ms.toFixed(0)}ms)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Latency Distribution Chart */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Latency Distribution by Endpoint</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(performanceData.endpoint_stats).map(([name, stats]) => ({
                    name: name.replace(/_/g, ' '),
                    'P50': stats.p50_ms,
                    'P95': stats.p95_ms,
                    'P99': stats.p99_ms,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="P50" fill="#3b82f6" name="P50 (Median)" />
                    <Bar dataKey="P95" fill="#f59e0b" name="P95" />
                    <Bar dataKey="P99" fill="#ef4444" name="P99 (Worst)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Endpoint Statistics Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden border mb-6">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold">Endpoint Statistics</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P50</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P95</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P99</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slow Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(performanceData.endpoint_stats)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .map(([operation, stats]) => (
                        <tr key={operation} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{operation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stats.count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{stats.avg_ms.toFixed(0)} ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stats.p50_ms.toFixed(0)} ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{stats.p95_ms.toFixed(0)} ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{stats.p99_ms.toFixed(0)} ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              stats.slow_rate > 10 ? 'bg-red-100 text-red-800' :
                              stats.slow_rate > 5 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {stats.slow_rate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{stats.error_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slowest Operations */}
              {performanceData.slow_operations.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden border mb-6">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold">Slowest Operations (Last {performanceData.period_hours}h)</h3>
                  </div>
                  <div className="overflow-x-auto max-h-80">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {performanceData.slow_operations.map((op, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(op.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{op.operation_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-bold ${
                                op.duration_ms > 3000 ? 'text-red-600' : 'text-orange-600'
                              }`}>
                                {op.duration_ms.toFixed(0)} ms
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{op.user_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {op.error ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Error</span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!loading && activeTab === 'queries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((q, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(q.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {q.intent}
                    </span>
                    {q.focus && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {q.focus}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={q.message}>
                    {q.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'feedback' && (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((f, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(f.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {f.score === 1 ? (
                      <span className="text-green-600 font-bold">👍 Like</span>
                    ) : (
                      <span className="text-red-600 font-bold">👎 Dislike</span>
                    )}
                  </td>
                  <td 
                    className="px-6 py-4 text-sm text-gray-500 max-w-md cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedFeedback(f)}
                  >
                    <div className="flex flex-col gap-1">
                      {f.user_query && (
                        <div className="text-xs bg-blue-50 p-1 rounded border border-blue-100 truncate">
                          <span className="font-semibold text-blue-700">Q:</span> {f.user_query}
                        </div>
                      )}
                      {f.ai_response && (
                        <div className="text-xs bg-gray-50 p-1 rounded border border-gray-100 truncate">
                          <span className="font-semibold text-gray-700">A:</span> {f.ai_response}
                        </div>
                      )}
                      {!f.user_query && !f.ai_response && (
                        <span className="text-xs text-gray-400 italic">Click to view details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {f.comment || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Session ID: {selectedFeedback?.session_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">User Query</h4>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm whitespace-pre-wrap font-mono">
                {selectedFeedback?.user_query || "N/A"}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">AI Response</h4>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm whitespace-pre-wrap font-mono">
                {selectedFeedback?.ai_response || "N/A"}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">User Comment</h4>
              <div className="p-3 rounded-md border border-gray-200 text-sm bg-white">
                {selectedFeedback?.comment || "No comment provided"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 pt-4 border-t">
              <div>
                <span className="font-semibold">User:</span> {selectedFeedback?.user_id}
              </div>
              <div>
                <span className="font-semibold">Time:</span> {selectedFeedback && new Date(selectedFeedback.timestamp).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Score:</span> {selectedFeedback?.score === 1 ? "👍 Like" : "👎 Dislike"}
              </div>
              <div>
                <span className="font-semibold">Message ID:</span> {selectedFeedback?.message_id}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!loading && activeTab === 'general_feedback' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User/Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generalFeedback.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(f.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold">
                    {'★'.repeat(f.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {f.email || f.user_id || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {f.comment || '-'}
                  </td>
                </tr>
              ))}
              {generalFeedback.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No feedback found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer" onClick={() => handleUserClick(u.id)}>
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.is_active ? 'Active' : 'Inactive'} {u.is_admin ? '(Admin)' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleUserClick(u.id)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details: {selectedUser?.user.email}</DialogTitle>
            <DialogDescription>
              ID: {selectedUser?.user.id} | Joined: {selectedUser?.user.created_at ? new Date(selectedUser.user.created_at).toLocaleDateString() : '-'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Charts ({selectedUser?.charts.length})</h3>
              <p className="text-sm text-gray-500 mb-4">Click a chart to view its related chat sessions.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUser?.charts.map((chart: any) => (
                  <div 
                    key={chart.id} 
                    className={`border p-3 rounded cursor-pointer transition-colors ${selectedChartId === chart.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => setSelectedChartId(chart.id === selectedChartId ? null : chart.id)}
                  >
                    <p className="font-medium">{chart.name || 'Unnamed Chart'}</p>
                    <p className="text-sm text-gray-600">DOB: {chart.dob || 'Unknown'} {chart.time}</p>
                    <p className="text-sm text-gray-600">Loc: {chart.location?.city || 'Unknown'}</p>
                  </div>
                ))}
                {selectedUser?.charts.length === 0 && <p className="text-gray-500 italic">No charts found.</p>}
              </div>
            </div>

            {selectedChartId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-semibold mb-2">
                  Chat Sessions for Selected Chart 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({selectedUser?.sessions.filter((s: any) => String(s.context?.chart_id) === String(selectedChartId) || String(s.chart_id) === String(selectedChartId)).length})
                  </span>
                </h3>
                <div className="space-y-3">
                  {selectedUser?.sessions
                    .filter((s: any) => String(s.context?.chart_id) === String(selectedChartId) || String(s.chart_id) === String(selectedChartId))
                    .map((session: any) => (
                    <div key={session.id} className="border p-3 rounded bg-gray-50">
                      <p className="font-medium text-sm">Session ID: {session.id}</p>
                      <p className="text-xs text-gray-500">Updated: {new Date(session.updated_at).toLocaleString()}</p>
                      <div className="mt-2 max-h-60 overflow-y-auto text-sm space-y-2">
                        {session.messages?.map((msg: any, idx: number) => (
                          <div key={idx} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-200'}`}>
                            <div className={`font-semibold text-xs mb-1 ${msg.role === 'user' ? 'text-blue-700' : 'text-gray-700'}`}>
                              {msg.role === 'user' ? 'User' : 'AI'}
                            </div>
                            <div className="whitespace-pre-wrap text-gray-800">
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedUser?.sessions.filter((s: any) => String(s.context?.chart_id) === String(selectedChartId) || String(s.chart_id) === String(selectedChartId)).length === 0 && (
                    <p className="text-gray-500 italic">No chat sessions found for this chart.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
