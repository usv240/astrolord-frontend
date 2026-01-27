import React, { useState, useEffect } from 'react';
import { AlertCircle, Flag, Ban, AlertTriangle } from 'lucide-react';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';

interface FeedbackItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
  moderation_status: string;
  moderation_notes: string;
}

interface FlaggedQuery {
  id: string;
  user_id: string;
  user_name: string;
  query: string;
  flagged_reason: string;
  flagged_at: string;
  status: string;
}

interface SuspiciousUser {
  user_id: string;
  email: string;
  name: string;
  reason: string;
  suspicious_score: number;
  activities: number;
  last_activity: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_id: string;
  target_type: string;
  details: string;
}

export default function AdminModerationPage() {
  const [selectedTab, setSelectedTab] = useState<'feedback' | 'queries' | 'users' | 'audit'>('feedback');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [flaggedQueries, setFlaggedQueries] = useState<FlaggedQuery[]>([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedTab === 'feedback') {
        const res = await adminAPI.getFeedbackForReview();
        const data = res.data || res;
        // Backend returns {total, items, page, pages} structure
        setFeedbackItems(data?.items || (Array.isArray(data) ? data : []));
      } else if (selectedTab === 'queries') {
        const res = await adminAPI.getFlaggedQueries();
        setFlaggedQueries(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } else if (selectedTab === 'users') {
        const res = await adminAPI.getSuspiciousUsers();
        setSuspiciousUsers(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } else if (selectedTab === 'audit') {
        try {
          const res = await adminAPI.getModerationAuditLog();
          setAuditLogs(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
        } catch (auditErr: any) {
          if (auditErr.response?.status === 403) {
            setError('You do not have permission to view audit logs. (Requires SUPER_ADMIN role)');
          } else {
            throw auditErr;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateFeedback = async (feedbackId: string, action: 'approve' | 'reject') => {
    try {
      await adminAPI.moderateFeedback(feedbackId, action, moderationNotes);
      setSelectedFeedback(null);
      setModerationNotes('');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to moderate feedback');
    }
  };

  const handleUserAction = async (userId: string, action: 'warn' | 'suspend' | 'ban') => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await adminAPI.moderateUser(userId, action, `User moderation: ${action}`);
      await fetchData();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">Manage feedback, flagged queries, and suspicious users</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['feedback', 'queries', 'users', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            {/* Feedback Tab */}
            {selectedTab === 'feedback' && (
              <div className="space-y-4">
                {feedbackItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.user_name}</h3>
                        <p className="text-sm text-gray-600">{item.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`text-lg ${i <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${item.moderation_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : item.moderation_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {item.moderation_status || 'pending'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{item.comment}</p>

                    <div className="text-xs text-gray-500 mb-4">
                      {new Date(item.created_at).toLocaleString()}
                    </div>

                    {item.moderation_status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-xs text-green-700">
                          <span className="font-semibold">Approved:</span> {item.moderation_notes}
                        </p>
                      </div>
                    )}
                    {item.moderation_status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-xs text-red-700">
                          <span className="font-semibold">Rejected:</span> {item.moderation_notes}
                        </p>
                      </div>
                    )}

                    {!item.moderation_status && (
                      <>
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Review & Moderate
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Flagged Queries Tab */}
            {selectedTab === 'queries' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Query</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedQueries.map((query) => (
                        <tr key={query.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{query.user_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 max-w-xs truncate">{query.query}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-1 rounded w-fit">
                              <Flag className="w-4 h-4" />
                              {query.flagged_reason}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {new Date(query.flagged_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${query.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                                }`}
                            >
                              {query.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Suspicious Users Tab */}
            {selectedTab === 'users' && (
              <div className="space-y-4">
                {suspiciousUsers.map((user) => (
                  <div key={user.user_id} className="bg-white rounded-lg p-6 border border-red-200 bg-red-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{user.suspicious_score}</p>
                        <p className="text-xs text-gray-600">Suspicious Score</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{user.reason}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Activities</p>
                        <p className="text-lg font-bold text-gray-900">{user.activities}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Last Active</p>
                        <p className="text-sm text-gray-900">{new Date(user.last_activity).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUserAction(user.user_id, 'warn')}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleUserAction(user.user_id, 'suspend')}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleUserAction(user.user_id, 'ban')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <Ban className="w-4 h-4 inline mr-1" />
                        Ban
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Log Tab */}
            {selectedTab === 'audit' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Admin</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Target</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{log.admin_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {log.target_type}: {log.target_id}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 max-w-sm truncate">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Moderation Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moderate Feedback</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">User</label>
                  <p className="text-gray-900">{selectedFeedback.user_name}</p>
                  <p className="text-sm text-gray-600">{selectedFeedback.user_email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                  <p className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`text-2xl ${i <= selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback</label>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedFeedback.comment}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Moderation Notes</label>
                <textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about your moderation decision..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModerateFeedback(selectedFeedback.id, 'reject')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleModerateFeedback(selectedFeedback.id, 'approve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
