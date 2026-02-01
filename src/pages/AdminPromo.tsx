import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Gift, MessageCircle, Calendar, Users, AlertCircle, Copy, CheckCircle, Trash2 } from 'lucide-react';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';

interface PromoCode {
    _id: string;
    code: string;
    description: string;
    reward_type: 'subscription' | 'bonus_messages';
    reward_config: {
        plan_type?: string;
        duration_days?: number;
        bonus_messages?: number;
        bonus_hourly?: number | null;  // null = unlimited hourly
        bonus_charts?: number | null;  // null = no bonus, -1 = unlimited
        bonus_duration_days?: number;
    };
    max_uses: number | null;
    max_uses_per_user: number;
    current_uses: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string;
    target_plans: string[] | null;
    created_by: string;
    created_at: string;
}

interface Redemption {
    user_email: string;
    code: string;
    redeemed_at: string;
    reward_type: string;
    reward: any;
}

const PLAN_OPTIONS = [
    { value: 'weekly_pass', label: 'Weekly Pass (7 days)' },
    { value: 'monthly_subscription', label: 'Monthly Subscription (30 days)' },
    { value: 'quarterly_subscription', label: 'Quarterly Subscription (90 days)' },
    { value: 'yearly_subscription', label: 'Yearly Subscription (365 days)' },
];

export default function AdminPromoPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [selectedTab, setSelectedTab] = useState<'codes' | 'create' | 'redemptions'>('codes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [editingCode, setEditingCode] = useState<string | null>(null); // Track code being edited

    // Create form state
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        reward_type: 'bonus_messages' as 'subscription' | 'bonus_messages',
        plan_type: 'weekly_pass',
        duration_days: 7,
        bonus_messages: 50,
        bonus_hourly: '' as string | number,  // empty = null (unlimited), number = add to base
        bonus_charts: '' as string | number,  // empty = no bonus, -1 = unlimited
        bonus_duration_days: 7,
        max_uses: '' as string | number,
        max_uses_per_user: 1,
        valid_days: 30,
        target_free_only: false,
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPromoCodes();
    }, [includeInactive]);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminAPI.getPromoCodes(includeInactive);
            const data = res.data as any;
            setPromoCodes(data?.codes || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load promo codes');
        } finally {
            setLoading(false);
        }
    };

    const fetchRedemptions = async () => {
        try {
            const res = await adminAPI.getPromoRedemptions(undefined, 100);
            const data = res.data as any;
            setRedemptions(data?.redemptions || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load redemptions');
        }
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingCode(promo.code);

        // Calculate remaining valid days
        const validUntil = new Date(promo.valid_until);
        const now = new Date();
        const diffTime = Math.max(0, validUntil.getTime() - now.getTime());
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setFormData({
            code: promo.code,
            description: promo.description || '',
            reward_type: promo.reward_type,
            plan_type: promo.reward_config.plan_type || 'weekly_pass',
            duration_days: promo.reward_config.duration_days || 7,
            bonus_messages: promo.reward_config.bonus_messages || 50,
            bonus_hourly: promo.reward_config.bonus_hourly ?? '',
            bonus_charts: promo.reward_config.bonus_charts ?? '',
            bonus_duration_days: promo.reward_config.bonus_duration_days || 7,
            max_uses: promo.max_uses ?? '',
            max_uses_per_user: promo.max_uses_per_user || 1,
            valid_days: daysLeft,
            target_free_only: promo.target_plans?.includes('free') || false,
        });

        setSelectedTab('create');
        window.scrollTo(0, 0);
    };

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            setError('Promo code is required');
            return;
        }

        try {
            setCreating(true);
            setError(null);

            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + formData.valid_days);

            // Construct payload for Create
            const payload: any = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                reward_type: formData.reward_type,
                max_uses: formData.max_uses === '' ? null : Number(formData.max_uses),
                max_uses_per_user: formData.max_uses_per_user,
                valid_until: validUntil.toISOString(),
                target_plans: formData.target_free_only ? ['free'] : null,
            };

            if (formData.reward_type === 'subscription') {
                payload.subscription_config = {
                    plan_type: formData.plan_type,
                    duration_days: formData.duration_days || undefined,
                };
            } else {
                payload.bonus_messages_config = {
                    bonus_messages: formData.bonus_messages,
                    bonus_hourly: formData.bonus_hourly === '' ? null : Number(formData.bonus_hourly),
                    bonus_charts: formData.bonus_charts === '' ? null : Number(formData.bonus_charts),
                    bonus_duration_days: formData.bonus_duration_days,
                };
            }

            if (editingCode) {
                // UPDATE existing code
                const updatePayload: any = {
                    description: formData.description,
                    max_uses: formData.max_uses === '' ? null : Number(formData.max_uses),
                    max_uses_per_user: formData.max_uses_per_user,
                    valid_until: validUntil.toISOString(),
                    target_plans: formData.target_free_only ? ['free'] : null,
                };

                // Add reward config updates
                if (formData.reward_type === 'bonus_messages') {
                    updatePayload.bonus_messages = formData.bonus_messages;
                    updatePayload.bonus_hourly = formData.bonus_hourly === '' ? null : Number(formData.bonus_hourly);
                    updatePayload.bonus_charts = formData.bonus_charts === '' ? null : Number(formData.bonus_charts);
                    updatePayload.bonus_duration_days = formData.bonus_duration_days;
                }
                // Note: Subscription plan type/duration currently not updatable via this endpoint seamlessly without backend changes, 
                // but typically description/uses/validity are what people edit.

                await adminAPI.updatePromoCode(editingCode, updatePayload);
                setSuccess(`Promo code "${editingCode}" updated successfully!`);
            } else {
                // CREATE new code
                await adminAPI.createPromoCode(payload);
                setSuccess(`Promo code "${formData.code.toUpperCase()}" created successfully!`);
            }

            setFormData({
                code: '',
                description: '',
                reward_type: 'bonus_messages',
                plan_type: 'weekly_pass',
                duration_days: 7,
                bonus_messages: 50,
                bonus_hourly: '',
                bonus_charts: '',
                bonus_duration_days: 7,
                max_uses: '',
                max_uses_per_user: 1,
                valid_days: 30,
                target_free_only: false,
            });
            setEditingCode(null);

            // Refresh codes list
            await fetchPromoCodes();
            setTimeout(() => setSuccess(null), 5000);
            if (editingCode) setSelectedTab('codes');

        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to save promo code');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivate = async (code: string) => {
        if (!confirm(`Are you sure you want to deactivate "${code}"?`)) return;

        try {
            await adminAPI.deactivatePromoCode(code);
            setSuccess(`Promo code "${code}" deactivated`);
            await fetchPromoCodes();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to deactivate');
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const prefix = 'ASTRO';
        let result = prefix;
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code: result });
    };

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Ticket className="w-8 h-8 text-purple-600" />
                            Promo Codes
                        </h1>
                        <p className="text-gray-600 mt-1">Create and manage promotional codes for users</p>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    {[
                        { id: 'codes', label: 'Active Codes', icon: Ticket },
                        { id: 'create', label: editingCode ? 'Edit Code' : 'Create New', icon: editingCode ? CheckCircle : Plus },
                        { id: 'redemptions', label: 'Redemptions', icon: Users },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'create' && !editingCode) {
                                        // Reset form if clicking create new
                                        setEditingCode(null);
                                        setFormData({
                                            code: '',
                                            description: '',
                                            reward_type: 'bonus_messages',
                                            plan_type: 'weekly_pass',
                                            duration_days: 7,
                                            bonus_messages: 50,
                                            bonus_hourly: '',
                                            bonus_charts: '',
                                            bonus_duration_days: 7,
                                            max_uses: '',
                                            max_uses_per_user: 1,
                                            valid_days: 30,
                                            target_free_only: false,
                                        });
                                    }
                                    setSelectedTab(tab.id as any);
                                    if (tab.id === 'redemptions') fetchRedemptions();
                                }}
                                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Codes Tab */}
                {selectedTab === 'codes' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={includeInactive}
                                    onChange={(e) => setIncludeInactive(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                Show inactive codes
                            </label>
                            <span className="text-sm text-gray-500">{promoCodes.length} codes</span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : promoCodes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No promo codes yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {promoCodes.map((promo) => (
                                    <PromoCodeCard
                                        key={promo._id}
                                        promo={promo}
                                        onCopy={copyToClipboard}
                                        onEdit={handleEdit}
                                        onDeactivate={handleDeactivate}
                                        copied={copiedCode === promo.code}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create/Edit Tab */}
                {selectedTab === 'create' && (
                    <div className="max-w-2xl">
                        <form onSubmit={handleCreatePromo} className="space-y-6 bg-white rounded-lg p-6 border border-gray-200">
                            {/* Code Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Promo Code *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="ASTRO50"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                                        maxLength={20}
                                        disabled={!!editingCode} // Cannot change code when editing
                                    />
                                    {!editingCode && (
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            Generate
                                        </button>
                                    )}
                                </div>
                                {editingCode && <p className="text-xs text-gray-500 mt-1">Code cannot be changed once created. Deactivate and create new if needed.</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="50 bonus messages for 7 days"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {!editingCode && (
                                /* Reward Type - only editable on create */
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reward Type *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, reward_type: 'bonus_messages' })}
                                            className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.reward_type === 'bonus_messages'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                                            <p className="font-medium">Bonus Messages</p>
                                            <p className="text-sm text-gray-500">Extra messages per day</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, reward_type: 'subscription' })}
                                            className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.reward_type === 'subscription'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Gift className="w-6 h-6 text-purple-600 mb-2" />
                                            <p className="font-medium">Free Subscription</p>
                                            <p className="text-sm text-gray-500">Grant a paid plan</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reward Config */}
                            {formData.reward_type === 'bonus_messages' ? (
                                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bonus Messages/Day
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.bonus_messages}
                                                onChange={(e) => setFormData({ ...formData, bonus_messages: parseInt(e.target.value) || 0 })}
                                                min={1}
                                                max={500}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hourly Limit Override
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.bonus_hourly}
                                                onChange={(e) => setFormData({ ...formData, bonus_hourly: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                                                min={0}
                                                max={200}
                                                placeholder="Empty = unlimited"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration (days)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.bonus_duration_days}
                                                onChange={(e) => setFormData({ ...formData, bonus_duration_days: parseInt(e.target.value) || 7 })}
                                                min={1}
                                                max={365}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bonus Charts
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.bonus_charts}
                                                onChange={(e) => setFormData({ ...formData, bonus_charts: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                min={-1}
                                                max={100}
                                                placeholder="Empty = none, -1 = unlimited"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Leave "Hourly Limit Override" empty to remove the hourly limit. Leave "Bonus Charts" empty for no chart bonus, or enter -1 for unlimited charts.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subscription Plan
                                    </label>
                                    <select
                                        value={formData.plan_type}
                                        onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={!!editingCode}
                                    >
                                        {PLAN_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {editingCode && <p className="text-xs text-gray-500 mt-1">Plan type cannot be changed. Deactivate and create new.</p>}
                                </div>
                            )}

                            {/* Usage Limits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Uses (empty = unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        placeholder="100"
                                        min={1}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Uses Per User
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_uses_per_user}
                                        onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
                                        min={1}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Validity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valid for (days from now)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.valid_days}
                                        onChange={(e) => setFormData({ ...formData, valid_days: parseInt(e.target.value) || 30 })}
                                        min={1}
                                        max={365}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    {editingCode && <p className="text-xs text-gray-500 mt-1">This will extend validity from today.</p>}
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.target_free_only}
                                            onChange={(e) => setFormData({ ...formData, target_free_only: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        Only for free tier users
                                    </label>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                {editingCode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCode(null);
                                            setFormData({
                                                code: '',
                                                description: '',
                                                reward_type: 'bonus_messages',
                                                plan_type: 'weekly_pass',
                                                duration_days: 7,
                                                bonus_messages: 50,
                                                bonus_hourly: '',
                                                bonus_charts: '',
                                                bonus_duration_days: 7,
                                                max_uses: '',
                                                max_uses_per_user: 1,
                                                valid_days: 30,
                                                target_free_only: false,
                                            });
                                            setSelectedTab('codes');
                                        }}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={creating || !formData.code.trim()}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            {editingCode ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingCode ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                            {editingCode ? 'Update Promo Code' : 'Create Promo Code'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Redemptions Tab */}
                {selectedTab === 'redemptions' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reward</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redemptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                No redemptions yet
                                            </td>
                                        </tr>
                                    ) : (
                                        redemptions.map((r, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                    {r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-900">{r.user_email}</td>
                                                <td className="px-6 py-3">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-mono text-sm">
                                                        {r.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-700">
                                                    {r.reward_type === 'subscription' ? (
                                                        <span className="text-green-700">🎁 {r.reward?.plan_type?.replace('_', ' ')}</span>
                                                    ) : (
                                                        <span className="text-blue-700">💬 +{r.reward?.bonus_messages} msgs/day</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// Promo Code Card Component
function PromoCodeCard({
    promo,
    onCopy,
    onEdit,
    onDeactivate,
    copied,
}: {
    promo: PromoCode;
    onCopy: (code: string) => void;
    onEdit: (promo: PromoCode) => void;
    onDeactivate: (code: string) => void;
    copied: boolean;
}) {
    const isExpired = new Date(promo.valid_until) < new Date();
    const usagePercent = promo.max_uses ? (promo.current_uses / promo.max_uses) * 100 : 0;

    return (
        <div className={`bg-white rounded-lg p-6 border ${promo.is_active && !isExpired ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-75'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${promo.reward_type === 'subscription' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {promo.reward_type === 'subscription' ? (
                            <Gift className="w-6 h-6 text-green-600" />
                        ) : (
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold font-mono text-gray-900">{promo.code}</span>
                            <button
                                onClick={() => onCopy(promo.code)}
                                className="p-1 rounded hover:bg-gray-100"
                                title="Copy code"
                            >
                                {copied ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            {!promo.is_active && (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">Inactive</span>
                            )}
                            {isExpired && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">Expired</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{promo.description || 'No description'}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {promo.is_active && !isExpired && (
                        <>
                            <button
                                onClick={() => onEdit(promo)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            </button>
                            <button
                                onClick={() => onDeactivate(promo.code)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                title="Deactivate"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Reward</p>
                    <p className="font-medium text-gray-900">
                        {promo.reward_type === 'subscription'
                            ? promo.reward_config.plan_type?.replace('_', ' ')
                            : (
                                <>
                                    +{promo.reward_config.bonus_messages}/day
                                    {promo.reward_config.bonus_hourly !== undefined && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({promo.reward_config.bonus_hourly === null ? '∞' : promo.reward_config.bonus_hourly}/hr)
                                        </span>
                                    )}
                                    {promo.reward_config.bonus_charts !== undefined && promo.reward_config.bonus_charts !== null && (
                                        <span className="text-xs text-purple-600 ml-1 block">
                                            +{promo.reward_config.bonus_charts === -1 ? '∞' : promo.reward_config.bonus_charts} charts
                                        </span>
                                    )}
                                </>
                            )}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500">Uses</p>
                    <p className="font-medium text-gray-900">
                        {promo.current_uses} / {promo.max_uses || '∞'}
                    </p>
                    {promo.max_uses && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                                className="bg-purple-600 h-1 rounded-full"
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-gray-500">Per User</p>
                    <p className="font-medium text-gray-900">{promo.max_uses_per_user}x</p>
                </div>
                <div>
                    <p className="text-gray-500">Expires</p>
                    <p className="font-medium text-gray-900">
                        {new Date(promo.valid_until).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
