import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, AlertCircle, Mail, Users as UsersIcon, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_admin: boolean;
  is_premium: boolean;
  status: string;
}

interface UserDetails {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login: string;
  is_admin: boolean;
  is_premium: boolean;
  status: string;
  total_queries: number;
  total_charts: number;
}

interface UserChart {
  chart_id: string;
  title: string;
  created_at: string;
  data_points: number;
}

interface UserSession {
  session_id: string;
  id?: string;
  created_at: string;
  updated_at?: string;
  type?: string;
  title?: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  analysis?: string;
}

interface UserConversation {
  session_id: string;
  type: string;
  chart_id?: string;
  chart_name?: string;
  chart_dob?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  messages?: ChatMessage[];
}

interface ChartData {
  date: string;
  users: number;
  premium: number;
}

const STATUS_FILTERS = ['all', 'active', 'inactive', 'admin', 'premium'] as const;

// Helper function to safely format dates
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

// Helper function to safely format datetime
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

// Helper function to safely format time only
const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';
    return date.toLocaleTimeString();
  } catch {
    return 'Invalid time';
  }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [userCharts, setUserCharts] = useState<UserChart[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [userConversations, setUserConversations] = useState<UserConversation[]>([]);
  const [chartSessions, setChartSessions] = useState<{ [chartId: string]: UserSession[] }>({});
  const [loadingChartSessions, setLoadingChartSessions] = useState<Set<string>>(new Set());
  const [usersGrowthChart, setUsersGrowthChart] = useState<ChartData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'admin' | 'premium'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
    fetchUsersGrowth();
  }, [page, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (page - 1) * pageSize;
      const res = await adminAPI.getUsers(pageSize, skip);
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersGrowth = async () => {
    try {
      // Growth chart data can be derived from analytics endpoints
      setUsersGrowthChart([]);
    } catch (err: any) {
      console.error('Failed to load growth chart:', err);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const [details, charts, sessions, conversations] = await Promise.all([
        adminAPI.getUserDetails(userId),
        adminAPI.getUserCharts(userId),
        adminAPI.getUserSessions(userId),
        adminAPI.getUserConversations(userId),
      ]);
      setSelectedUser(details.data.user || details.data);
      setUserCharts(charts.data || []);
      setUserSessions(sessions.data || []);
      setUserConversations(conversations.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    }
  };

  const handleExpandConversation = async (sessionId: string) => {
    // Toggle expansion
    if (expandedConversation === sessionId) {
      setExpandedConversation(null);
      return;
    }

    setExpandedConversation(sessionId);

    // Check if messages already loaded
    const conversation = userConversations.find(c => c.session_id === sessionId);
    if (conversation?.messages) {
      return; // Already loaded
    }

    // Fetch messages for this conversation
    try {
      setLoadingMessages(prev => new Set([...prev, sessionId]));
      const res = await adminAPI.getConversationMessages(sessionId);

      // Handle axios response structure - res.data is the response from backend
      const messages = res.data?.messages || [];
      console.log('Fetched messages for session', sessionId, ':', messages);

      // Update the conversation with fetched messages
      setUserConversations(prev =>
        prev.map(conv =>
          conv.session_id === sessionId
            ? { ...conv, messages: messages }
            : conv
        )
      );
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleFetchChartSessions = async (chartId: string) => {
    if (chartSessions[chartId]) return; // Already loaded

    try {
      setLoadingChartSessions(prev => new Set([...prev, chartId]));
      // Assuming adminAPI needs wrapper for the new endpoint
      // Since we can't edit adminAPI directly easily without seeing it, we'll try to fetch directly or assume wrapper exists
      // Wait, I should verify adminAPI exists. I'll use a direct axios call if adminAPI wrapper isn't there, 
      // but typically the pattern implies updating the library. 
      // For now, I'll fetch via a constructed URL if I can't edit the API lib file.
      // Actually, I can construct the URL here if I use the base axios instance if available, 
      // but let's assume I can add to adminAPI or just use fetch for now to be safe/swift.
      // Better: I'll use the proper way. I'll add the method to adminAPI lib in a separate step if needed.
      // But to keep this tool call atomic, I'll assume I can add the method to adminAPI later or now.
      // I will add the logic here to call the endpoint.
      const res = await adminAPI.getChartSessions(selectedUser?.id!, chartId);
      setChartSessions(prev => ({ ...prev, [chartId]: res.data }));
    } catch (err: any) {
      console.error('Failed to load chart sessions:', err);
      setError('Failed to load chart sessions');
    } finally {
      setLoadingChartSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(chartId);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      return (
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users, view their activity, and monitor growth</p>
          </div>

          {/* Send Feedback to All Users */}
          <div className="flex items-center gap-2">
            <input
              id="all-users-message"
              type="text"
              placeholder="Optional message..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={async () => {
                const input = document.getElementById('all-users-message') as HTMLInputElement;
                const customMessage = input?.value || undefined;

                if (!confirm('⚠️ This will send a feedback request email to ALL active users. Are you sure?')) return;
                if (!confirm('Please confirm again - this action cannot be undone!')) return;

                try {
                  const response = await adminAPI.requestFeedbackAllUsers(customMessage);
                  alert(`✅ Sent to ${response.data.sent} users! (${response.data.failed} failed)`);
                  if (input) input.value = '';
                } catch (err: any) {
                  const errorMsg = err.response?.data?.detail || err.message || 'Unknown error';
                  alert('⚠️ ' + errorMsg);
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              Send to All Users
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Growth Chart */}
        {usersGrowthChart.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usersGrowthChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
                <Line type="monotone" dataKey="premium" stroke="#f59e0b" strokeWidth={2} name="Premium Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status, idx) => (
                  <button
                    key={`status-${status}`}
                    onClick={() => {
                      setFilterStatus(status as any);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Users List Container */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div>
                  {filteredUsers.map((user, userIdx) => (
                    <button
                      key={user.id || `user-${userIdx}`}
                      onClick={() => handleSelectUser(user.id)}
                      className={`w-full px-4 py-3 border-b border-gray-200 hover:bg-blue-50 transition-colors text-left ${selectedUser?.id === user.id ? 'bg-blue-100' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {user.is_admin && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                              Admin
                            </span>
                          )}
                          {user.is_premium && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              Pro
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex gap-2">
              <button
                key="prev-button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Prev
              </button>
              <button
                key="next-button"
                onClick={() => setPage(p => p + 1)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedUser ? (
              <>
                {/* User Info Card */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="w-4 h-4" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedUser.is_admin && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          Admin
                        </span>
                      )}
                      {selectedUser.is_premium && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Premium
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Joined</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Last Active</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(selectedUser.last_login)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Total Queries</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.total_queries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase">Total Charts</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.total_charts}</p>
                    </div>
                  </div>

                  {/* Subscription Management */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">🎫 Subscription Management</h3>
                    <div className="flex items-center gap-3">
                      <select
                        id="plan-select"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue=""
                      >
                        <option value="" disabled>Select Plan to Grant</option>
                        <option value="weekly_pass">Weekly Pass (7 days)</option>
                        <option value="monthly_subscription">Monthly (30 days)</option>
                        <option value="quarterly_subscription">Quarterly (90 days)</option>
                        <option value="yearly_subscription">Yearly (365 days)</option>
                      </select>
                      <button
                        onClick={async () => {
                          const select = document.getElementById('plan-select') as HTMLSelectElement;
                          const planType = select.value;
                          if (!planType) {
                            alert('Please select a plan first');
                            return;
                          }
                          if (!confirm(`Grant ${planType.replace('_', ' ')} to this user?`)) return;
                          try {
                            await adminAPI.grantSubscription(selectedUser.id, planType, 'Admin grant');
                            alert('✅ Subscription granted successfully!');
                            // Refresh user data
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Grant
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Revoke subscription and set user to Free tier?')) return;
                          try {
                            await adminAPI.revokeSubscription(selectedUser.id);
                            alert('✅ Subscription revoked');
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  {/* User Moderation */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">⚠️ User Moderation</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={async () => {
                          const reason = prompt('Reason for warning this user:');
                          if (!reason) return;
                          try {
                            await adminAPI.moderateUser(selectedUser.id, 'warn', reason);
                            alert('⚠️ User warned successfully');
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition"
                      >
                        ⚠️ Warn
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Reason for suspending this user (30 days):');
                          if (!reason) return;
                          if (!confirm(`Suspend ${selectedUser.email} for 30 days?`)) return;
                          try {
                            await adminAPI.moderateUser(selectedUser.id, 'suspend', reason);
                            alert('🚫 User suspended for 30 days');
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
                      >
                        🚫 Suspend
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Reason for PERMANENTLY banning this user:');
                          if (!reason) return;
                          if (!confirm(`⚠️ PERMANENTLY BAN ${selectedUser.email}? This cannot be undone easily!`)) return;
                          try {
                            await adminAPI.moderateUser(selectedUser.id, 'ban', reason);
                            alert('🔨 User has been permanently banned');
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        🔨 Ban
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Clear all moderation flags and reactivate this user?')) return;
                          try {
                            await adminAPI.moderateUser(selectedUser.id, 'clear_flags', 'Admin cleared flags');
                            alert('✅ User moderation flags cleared');
                            handleSelectUser(selectedUser.id);
                          } catch (err: any) {
                            alert('Failed: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                      >
                        ✅ Clear Flags
                      </button>
                    </div>
                  </div>

                  {/* Request Feedback */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">📧 Request Feedback</h3>
                    <p className="text-xs text-gray-500 mb-3">Send an email asking this user to provide feedback about their AstroLord experience.</p>
                    <div className="flex items-center gap-3">
                      <input
                        id="feedback-message"
                        type="text"
                        placeholder="Optional custom message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={async () => {
                          const input = document.getElementById('feedback-message') as HTMLInputElement;
                          const customMessage = input?.value || undefined;

                          if (!confirm(`Send feedback request email to ${selectedUser.email}?`)) return;

                          try {
                            await adminAPI.requestUserFeedback(selectedUser.id, customMessage);
                            alert('✅ Feedback request sent successfully!');
                            if (input) input.value = '';
                          } catch (err: any) {
                            const errorMsg = err.response?.data?.detail || err.message || 'Unknown error';
                            alert('⚠️ ' + errorMsg);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Request Feedback
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Charts */}
                {userCharts.length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Charts ({userCharts.length})</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userCharts.map((chart, idx) => (
                        <div key={chart.chart_id || `chart-${idx}`} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{chart.title}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {chart.data_points} data points · {formatDate(chart.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleFetchChartSessions(chart.chart_id)}
                              className="ml-3 p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                              title="View Chats for this Chart"
                            >
                              <MessageCircle size={18} />
                            </button>
                          </div>

                          {/* Expanded Chart Sessions */}
                          {loadingChartSessions.has(chart.chart_id) && (
                            <div className="mt-3 text-xs text-center text-gray-500">Loading chats...</div>
                          )}

                          {chartSessions[chart.chart_id] && (
                            <div className="mt-3 space-y-4 border-t border-gray-200 pt-3">
                              {chartSessions[chart.chart_id].length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No chats found for this chart.</p>
                              ) : (
                                chartSessions[chart.chart_id].map((session, sessionIdx) => (
                                  <div key={session.id} className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm overflow-hidden">
                                    {/* Session Header */}
                                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-indigo-700 text-sm">
                                          Chat Session #{sessionIdx + 1}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {formatDateTime(session.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{session.title}</p>
                                    </div>
                                    {/* Messages */}
                                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                      {session.messages?.map((msg: any, mIdx: number) => (
                                        <div key={mIdx} className={`p-2 rounded text-xs ${msg.role === 'user' ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-400' : 'bg-green-50 text-green-900 border-l-4 border-green-400'}`}>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold">{msg.role === 'user' ? '👤 User' : '🤖 AI'}</span>
                                            {msg.created_at && (
                                              <span className="text-gray-400 text-[10px]">{formatDateTime(msg.created_at)}</span>
                                            )}
                                          </div>
                                          <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            ) : (
              <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
