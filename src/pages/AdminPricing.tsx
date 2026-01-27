import React, { useState, useEffect } from 'react';
import { DollarSign, Globe, Layers, RefreshCw, Save, Eye, AlertCircle, Plus, Edit, Trash2, Tag } from 'lucide-react';
import adminAPI from '@/lib/adminAPI';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

interface Product {
    _id: string;
    name: string;
    base_price_usd: number;
    description: string;
    product_type: string;
    active: boolean;
}

interface Country {
    _id: string;
    country_name: string;
    currency: string;
    tier: string;
    price_multiplier: number;
    tax_rate: number;
    tax_name: string;
    active: boolean;
}

interface Tier {
    _id: string;
    name: string;
    multiplier: number;
    discount_percent?: number;
}

interface PricingPreview {
    product_key: string;
    product_name: string;
    base_price_usd: number;
    tier: string;
    tier_discount_percent: number;
    local_price_before_tax: number;
    tax_rate: number;
    tax_amount: number;
    final_price: number;
    currency: string;
    country_name: string;
    is_override?: boolean;
}

interface Override {
    _id: string;
    product_key: string;
    country_code: string;
    price: number;
    reason: string;
    active: boolean;
}

type TabType = 'products' | 'countries' | 'tiers' | 'overrides' | 'preview';

export default function AdminPricingPage() {
    const [selectedTab, setSelectedTab] = useState<TabType>('products');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [preview, setPreview] = useState<Record<string, PricingPreview>>({});
    const [overrides, setOverrides] = useState<Override[]>([]);

    // Edit state
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editingCountry, setEditingCountry] = useState<string | null>(null);
    const [editingTier, setEditingTier] = useState<string | null>(null);
    const [previewCountry, setPreviewCountry] = useState('US');

    // Form state
    const [productForm, setProductForm] = useState<Partial<Product>>({});
    const [countryForm, setCountryForm] = useState<Partial<Country>>({});
    const [tierForm, setTierForm] = useState<number>(1.0);
    const [showAddCountry, setShowAddCountry] = useState(false);
    const [newCountryForm, setNewCountryForm] = useState({
        country_code: '',
        country_name: '',
        currency: 'USD',
        tier: 'tier_1',
        price_multiplier: 1.0,
        tax_rate: 0.0,
        tax_name: 'Tax',
    });
    const [showAddOverride, setShowAddOverride] = useState(false);
    const [newOverrideForm, setNewOverrideForm] = useState({
        product_key: '',
        country_code: '',
        price: 0,
        reason: '',
    });

    useEffect(() => {
        fetchData();
    }, [selectedTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (selectedTab === 'products') {
                const res = await adminAPI.getPricingProducts();
                setProducts(res.data);
            } else if (selectedTab === 'countries') {
                const res = await adminAPI.getPricingCountries();
                setCountries(res.data);
            } else if (selectedTab === 'tiers') {
                const res = await adminAPI.getPricingTiers();
                setTiers(res.data);
            } else if (selectedTab === 'overrides') {
                const [overridesRes, productsRes, countriesRes] = await Promise.all([
                    adminAPI.getPricingOverrides(),
                    adminAPI.getPricingProducts(),
                    adminAPI.getPricingCountries(),
                ]);
                setOverrides(overridesRes.data);
                setProducts(productsRes.data);
                setCountries(countriesRes.data);
            } else if (selectedTab === 'preview') {
                const [previewRes, countriesRes] = await Promise.all([
                    adminAPI.previewPricing(previewCountry),
                    adminAPI.getPricingCountries(),
                ]);
                setPreview(previewRes.data);
                setCountries(countriesRes.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (productKey: string) => {
        try {
            await adminAPI.updatePricingProduct(productKey, productForm);
            toast.success('Product updated');
            setEditingProduct(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Update failed');
        }
    };

    const handleUpdateCountry = async (countryCode: string) => {
        try {
            await adminAPI.updatePricingCountry(countryCode, countryForm);
            toast.success('Country updated');
            setEditingCountry(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Update failed');
        }
    };

    const handleAddCountry = async () => {
        try {
            await adminAPI.addPricingCountry(newCountryForm);
            toast.success('Country added');
            setShowAddCountry(false);
            setNewCountryForm({
                country_code: '',
                country_name: '',
                currency: 'USD',
                tier: 'tier_1',
                price_multiplier: 1.0,
                tax_rate: 0.0,
                tax_name: 'Tax',
            });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Add failed');
        }
    };

    const handleUpdateTier = async (tierId: string) => {
        try {
            await adminAPI.updatePricingTier(tierId, tierForm);
            toast.success('Tier updated');
            setEditingTier(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Update failed');
        }
    };

    const handleInvalidateCache = async () => {
        try {
            await adminAPI.invalidatePricingCache();
            toast.success('Cache invalidated');
        } catch (err: any) {
            toast.error('Failed to invalidate cache');
        }
    };

    const handleAddOverride = async () => {
        try {
            await adminAPI.setPricingOverride(newOverrideForm);
            toast.success('Price override set');
            setShowAddOverride(false);
            setNewOverrideForm({ product_key: '', country_code: '', price: 0, reason: '' });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to set override');
        }
    };

    const handleDeleteOverride = async (productKey: string, countryCode: string) => {
        try {
            await adminAPI.deletePricingOverride(productKey, countryCode);
            toast.success('Override removed');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to delete override');
        }
    };

    const handlePreviewCountryChange = async (code: string) => {
        setPreviewCountry(code);
        setLoading(true);
        try {
            const res = await adminAPI.previewPricing(code);
            setPreview(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = (currency: string) => {
        const symbols: Record<string, string> = {
            USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'AED',
        };
        return symbols[currency] || currency;
    };

    const getTierColor = (tier: string) => {
        const colors: Record<string, string> = {
            tier_1: 'bg-green-100 text-green-800',
            tier_2: 'bg-blue-100 text-blue-800',
            tier_3: 'bg-yellow-100 text-yellow-800',
            tier_4: 'bg-red-100 text-red-800',
        };
        return colors[tier] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
                        <p className="text-gray-600 mt-1">Configure products, country pricing, and tier discounts</p>
                    </div>
                    <button
                        onClick={handleInvalidateCache}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Clear Cache
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    {[
                        { id: 'products', label: 'Products', icon: DollarSign },
                        { id: 'countries', label: 'Countries', icon: Globe },
                        { id: 'tiers', label: 'Tiers', icon: Layers },
                        { id: 'overrides', label: 'Fixed Prices', icon: Tag },
                        { id: 'preview', label: 'Preview', icon: Eye },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Products Tab */}
                        {selectedTab === 'products' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product._id}
                                        className={`bg-white rounded-lg border p-6 ${product.active ? 'border-gray-200' : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        {editingProduct === product._id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.name || ''}
                                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (USD)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={productForm.base_price_usd || 0}
                                                        onChange={(e) => setProductForm({ ...productForm, base_price_usd: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateProduct(product._id)}
                                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                                    >
                                                        <Save className="w-4 h-4 inline mr-1" /> Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingProduct(null)}
                                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                        <p className="text-sm text-gray-500">{product._id}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(product._id);
                                                            setProductForm(product);
                                                        }}
                                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                                    ${product.base_price_usd.toFixed(2)}
                                                </div>
                                                <p className="text-sm text-gray-600">{product.description || 'No description'}</p>
                                                <div className="mt-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.product_type === 'subscription'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.product_type}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Countries Tab */}
                        {selectedTab === 'countries' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={() => setShowAddCountry(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Country
                                    </button>
                                </div>

                                {showAddCountry && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                        <h3 className="font-semibold text-blue-900 mb-4">Add New Country</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Code (2 letters)</label>
                                                <input
                                                    type="text"
                                                    maxLength={2}
                                                    value={newCountryForm.country_code}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, country_code: e.target.value.toUpperCase() })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="JP"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={newCountryForm.country_name}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, country_name: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="Japan"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                                <input
                                                    type="text"
                                                    maxLength={3}
                                                    value={newCountryForm.currency}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, currency: e.target.value.toUpperCase() })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="JPY"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                                                <select
                                                    value={newCountryForm.tier}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, tier: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                >
                                                    <option value="tier_1">Tier 1 (Full Price)</option>
                                                    <option value="tier_2">Tier 2 (30% off)</option>
                                                    <option value="tier_3">Tier 3 (50% off)</option>
                                                    <option value="tier_4">Tier 4 (70% off)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Multiplier</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newCountryForm.price_multiplier}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, price_multiplier: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="1"
                                                    value={newCountryForm.tax_rate}
                                                    onChange={(e) => setNewCountryForm({ ...newCountryForm, tax_rate: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="0.18"
                                                />
                                            </div>
                                            <div className="col-span-2 flex gap-2 items-end">
                                                <button
                                                    onClick={handleAddCountry}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Add Country
                                                </button>
                                                <button
                                                    onClick={() => setShowAddCountry(false)}
                                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Country</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Currency</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tier</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplier</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tax</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {countries.map((country, idx) => (
                                                <tr key={country._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    {editingCountry === country._id ? (
                                                        <>
                                                            <td className="px-6 py-3">
                                                                <span className="font-medium">{country._id}</span> - {country.country_name}
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <input
                                                                    type="text"
                                                                    maxLength={3}
                                                                    value={countryForm.currency || ''}
                                                                    onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value.toUpperCase() })}
                                                                    className="w-20 px-2 py-1 border rounded"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <select
                                                                    value={countryForm.tier || ''}
                                                                    onChange={(e) => setCountryForm({ ...countryForm, tier: e.target.value })}
                                                                    className="px-2 py-1 border rounded"
                                                                >
                                                                    <option value="tier_1">Tier 1</option>
                                                                    <option value="tier_2">Tier 2</option>
                                                                    <option value="tier_3">Tier 3</option>
                                                                    <option value="tier_4">Tier 4</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={countryForm.price_multiplier || 0}
                                                                    onChange={(e) => setCountryForm({ ...countryForm, price_multiplier: parseFloat(e.target.value) })}
                                                                    className="w-24 px-2 py-1 border rounded"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={countryForm.tax_rate || 0}
                                                                    onChange={(e) => setCountryForm({ ...countryForm, tax_rate: parseFloat(e.target.value) })}
                                                                    className="w-20 px-2 py-1 border rounded"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleUpdateCountry(country._id)}
                                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingCountry(null)}
                                                                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-3">
                                                                <span className="font-medium">{country._id}</span>
                                                                <span className="text-gray-500 ml-2">{country.country_name}</span>
                                                            </td>
                                                            <td className="px-6 py-3 font-mono">{country.currency}</td>
                                                            <td className="px-6 py-3">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(country.tier)}`}>
                                                                    {country.tier.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 font-mono">{country.price_multiplier}x</td>
                                                            <td className="px-6 py-3">
                                                                {(country.tax_rate * 100).toFixed(0)}% ({country.tax_name})
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCountry(country._id);
                                                                        setCountryForm(country);
                                                                    }}
                                                                    className="p-2 hover:bg-gray-100 rounded"
                                                                >
                                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tiers Tab */}
                        {selectedTab === 'tiers' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {tiers.map((tier) => (
                                    <div
                                        key={tier._id}
                                        className={`bg-white rounded-lg border-2 p-6 ${getTierColor(tier._id)} border-current`}
                                    >
                                        {editingTier === tier._id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier (0-1)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="1"
                                                        value={tierForm}
                                                        onChange={(e) => setTierForm(parseFloat(e.target.value))}
                                                        className="w-full px-3 py-2 border rounded-lg bg-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {((1 - tierForm) * 100).toFixed(0)}% discount
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateTier(tier._id)}
                                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTier(null)}
                                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-semibold capitalize">{tier._id.replace('_', ' ')}</h3>
                                                    <button
                                                        onClick={() => {
                                                            setEditingTier(tier._id);
                                                            setTierForm(tier.multiplier);
                                                        }}
                                                        className="p-2 hover:bg-white/50 rounded-lg"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="text-4xl font-bold mb-2">{tier.multiplier}x</div>
                                                <p className="text-sm opacity-75">{tier.name}</p>
                                                <div className="mt-4 text-lg font-semibold">
                                                    {tier.discount_percent || Math.round((1 - tier.multiplier) * 100)}% off
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Preview Tab */}
                        {selectedTab === 'preview' && (
                            <div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Country</label>
                                    <select
                                        value={previewCountry}
                                        onChange={(e) => handlePreviewCountryChange(e.target.value)}
                                        className="px-4 py-2 border rounded-lg min-w-48"
                                    >
                                        {countries.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c._id} - {c.country_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Base (USD)</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Before Tax</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tax</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Final Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(preview).map((item, idx) => (
                                                <tr key={item.product_key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">{item.product_name}</div>
                                                        <div className="text-sm text-gray-500">{item.product_key}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">${item.base_price_usd}</td>
                                                    <td className="px-6 py-4">
                                                        {item.is_override ? (
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">Fixed Price</span>
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(item.tier)}`}>
                                                                {item.tier_discount_percent}% off
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">
                                                        {getCurrencySymbol(item.currency)}{item.local_price_before_tax.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        +{getCurrencySymbol(item.currency)}{item.tax_amount.toFixed(2)} ({(item.tax_rate * 100).toFixed(0)}%)
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xl font-bold text-blue-600">
                                                            {getCurrencySymbol(item.currency)}{item.final_price.toFixed(2)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Overrides Tab - Fixed Prices */}
                        {selectedTab === 'overrides' && (
                            <div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-blue-800">
                                        <strong>Fixed Prices</strong> override the automatic tier/multiplier calculation.
                                        Set a specific price for any product in any country.
                                    </p>
                                </div>

                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={() => setShowAddOverride(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Set Fixed Price
                                    </button>
                                </div>

                                {showAddOverride && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Set Fixed Price</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                                                <select
                                                    value={newOverrideForm.product_key}
                                                    onChange={(e) => setNewOverrideForm({ ...newOverrideForm, product_key: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map((p) => (
                                                        <option key={p._id} value={p._id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                <select
                                                    value={newOverrideForm.country_code}
                                                    onChange={(e) => setNewOverrideForm({ ...newOverrideForm, country_code: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                >
                                                    <option value="">Select country</option>
                                                    {countries.map((c) => (
                                                        <option key={c._id} value={c._id}>{c._id} - {c.country_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (before tax)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={newOverrideForm.price}
                                                    onChange={(e) => setNewOverrideForm({ ...newOverrideForm, price: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="99.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                                                <input
                                                    type="text"
                                                    value={newOverrideForm.reason}
                                                    onChange={(e) => setNewOverrideForm({ ...newOverrideForm, reason: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="Special promo"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={handleAddOverride}
                                                disabled={!newOverrideForm.product_key || !newOverrideForm.country_code || !newOverrideForm.price}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Set Price
                                            </button>
                                            <button
                                                onClick={() => setShowAddOverride(false)}
                                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {overrides.length === 0 ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                                        No fixed prices set. All pricing uses automatic tier/multiplier calculation.
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Country</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fixed Price</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {overrides.map((override, idx) => {
                                                    const product = products.find(p => p._id === override.product_key);
                                                    const country = countries.find(c => c._id === override.country_code);
                                                    return (
                                                        <tr key={override._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium">{product?.name || override.product_key}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-medium">{override.country_code}</span>
                                                                <span className="text-gray-500 ml-2">{country?.country_name}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-xl font-bold text-purple-600">
                                                                    {getCurrencySymbol(country?.currency || 'USD')}{override.price.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500">
                                                                {override.reason || '-'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => handleDeleteOverride(override.product_key, override.country_code)}
                                                                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                                                                    title="Remove override"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
