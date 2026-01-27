import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';

interface Transaction {
  id: string;
  order_id: string;
  payment_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  currency: string;
  status: string;
  plan_name: string;
  created_at: string;
}

interface Subscription {
  user_id: string;
  email: string;
  name: string;
  plan_name: string;
  status: string;
  valid_from: string;
  valid_until: string;
  daily_message_limit: number;
  days_remaining: number;
  is_expired: boolean;
}

export default function AdminPaymentsPage() {
  const [paymentOverview, setPaymentOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview');
  const [transactionStatus, setTransactionStatus] = useState<string | undefined>();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [extendingSubId, setExtendingSubId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, revenueRes] = await Promise.all([
        adminAPI.getPaymentOverview(days),
        adminAPI.getRevenueChart(days),
      ]);

      setPaymentOverview(overviewRes.data);
      setRevenueChart(Array.isArray(revenueRes.data) ? revenueRes.data : Array.isArray(revenueRes) ? revenueRes : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await adminAPI.getTransactions(transactionStatus);
      setTransactions(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await adminAPI.getSubscriptions(subscriptionStatus);
      setSubscriptions(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    }
  };

  const handleExtendSubscription = async (userId: string, days: number = 30) => {
    try {
      setExtendingSubId(userId);
      await adminAPI.extendSubscription(userId, days);
      // Refresh subscriptions
      await fetchSubscriptions();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to extend subscription');
    } finally {
      setExtendingSubId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Subscriptions</h1>
            <p className="text-gray-600 mt-1">Manage payments, subscriptions, and revenue</p>
          </div>
          <div className="flex gap-2">
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
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['overview', 'transactions', 'subscriptions'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab as any);
                if (tab === 'transactions') fetchTransactions();
                if (tab === 'subscriptions') fetchSubscriptions();
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading && selectedTab === 'overview' ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {selectedTab === 'overview' && paymentOverview && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <PaymentCard
                    title="Total Revenue"
                    value={`$${paymentOverview.revenue?.total.toLocaleString() || 0}`}
                    subtitle={`${paymentOverview.revenue?.orders || 0} orders`}
                  />
                  <PaymentCard
                    title="MRR"
                    value={`$${paymentOverview.mrr?.toLocaleString() || 0}`}
                    subtitle="Monthly recurring"
                  />
                  <PaymentCard
                    title="ARR"
                    value={`$${paymentOverview.arr?.toLocaleString() || 0}`}
                    subtitle="Annual recurring"
                  />
                  <PaymentCard
                    title="Active Subscriptions"
                    value={paymentOverview.total_active_subs?.toString() || '0'}
                    subtitle="Active plans"
                  />
                </div>

                {/* Revenue Chart */}
                {revenueChart && revenueChart.length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={revenueChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid ($)" />
                        <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending ($)" />
                        <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed ($)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Payment Stats */}
                {paymentOverview.payment_stats && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {paymentOverview.payment_stats.map((stat: any) => (
                        <div key={stat.status} className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 capitalize">{stat.status}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</p>
                          <p className="text-sm text-gray-500 mt-1">${stat.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {selectedTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  {['paid', 'failed', 'pending'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setTransactionStatus(transactionStatus === status ? undefined : status);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        transactionStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{tx.user_name}</p>
                                <p className="text-gray-500">{tx.user_email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                              ${tx.amount.toFixed(2)} {tx.currency}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">{tx.plan_name}</td>
                            <td className="px-6 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  tx.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : tx.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {selectedTab === 'subscriptions' && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  {['active', 'expiring_soon', 'expired'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSubscriptionStatus(subscriptionStatus === status ? undefined : status);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        subscriptionStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Days Left</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Limit</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub) => (
                          <tr key={sub.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{sub.name}</p>
                                <p className="text-gray-500 text-xs">{sub.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">{sub.plan_name}</td>
                            <td className="px-6 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  sub.is_expired
                                    ? 'bg-red-100 text-red-800'
                                    : sub.days_remaining < 7
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {sub.is_expired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">{sub.days_remaining}</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{sub.daily_message_limit}/day</td>
                            <td className="px-6 py-3 text-sm">
                              <button
                                onClick={() => handleExtendSubscription(sub.user_id)}
                                disabled={extendingSubId === sub.user_id}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                {extendingSubId === sub.user_id ? 'Extending...' : 'Extend 30d'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function PaymentCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}
