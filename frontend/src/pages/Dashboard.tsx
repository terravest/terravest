import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
    Wallet, TrendingUp, Loader2, Clock,
    ArrowDownCircle, Coins, X, DollarSign, CheckCircle,
    User, Lock, Mail, LogOut, Shield, Settings, PieChart
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Dashboard() {
    const { user, logout } = useAuth(); // Kullanıcı bilgilerini Context'ten al
    const [activeTab, setActiveTab] = useState<'portfolio' | 'settings'>('portfolio');

    // --- DATA STATES ---
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- MODAL STATES ---
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [claimModalOpen, setClaimModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Sell & Claim Form States
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [sellAmount, setSellAmount] = useState<string>('');
    const [btcAddress, setBtcAddress] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Settings States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fetchData = async () => {
        try {
            const result = await api.getPortfolio();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- ACTIONS ---
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) return alert("Password must be at least 8 characters.");
        if (newPassword !== confirmPassword) return alert("Passwords do not match.");

        setIsProcessing(true);
        try {
            await api.changePassword(newPassword);
            alert("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (Eski sell mantığı aynı)
        if (!selectedAsset) return;
        if (btcAddress.length < 10) return alert("Invalid BTC address");
        setIsProcessing(true);
        try {
            await api.sellAsset({
                property_id: selectedAsset.property_id || selectedAsset.id,
                token_amount: parseFloat(sellAmount),
                btc_address: btcAddress
            });
            alert("Sell request created!");
            setSellModalOpen(false);
            fetchData();
        } catch (error: any) { alert("Error: " + error.message); }
        finally { setIsProcessing(false); }
    };

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (Eski claim mantığı aynı)
        if (btcAddress.length < 10) return alert("Invalid BTC address");
        setIsProcessing(true);
        try {
            await api.claimRewards(btcAddress);
            alert("Claim request sent!");
            setClaimModalOpen(false);
            fetchData();
        } catch (error: any) { alert("Error: " + error.message); }
        finally { setIsProcessing(false); }
    };

    const getUnitPrice = (asset: any) => {
        if (!asset.price_usd || !asset.total_tokens) return 0;
        return asset.price_usd / asset.total_tokens;
    };

    if (loading) return <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center"><Loader2 className="animate-spin text-[#009B9E] h-12 w-12" /></div>;

    const pendingOrdersCount = data?.orders?.filter((o: any) => o.status === 'pending').length || 0;
    const totalAssetValue = data?.assets?.reduce((acc: number, asset: any) => acc + (asset.investedAmount * getUnitPrice(asset)), 0) || 0;
    const unclaimedRewards = data?.summary?.unclaimedRewards || 0;
    const totalNetWorth = totalAssetValue + unclaimedRewards;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans relative pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {/* --- HEADER & TABS --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">My Account</h1>
                        <p className="text-slate-500 mt-1">Welcome back, <span className="font-bold text-[#0F172A]">{user?.email?.split('@')[0]}</span></p>
                    </div>

                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'portfolio' ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                            <PieChart size={18} /> Portfolio
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'settings' ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                            <Settings size={18} /> Settings
                        </button>
                    </div>
                </div>

                {/* ==================== PORTFOLIO TAB ==================== */}
                {activeTab === 'portfolio' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. STATS CARDS */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {/* Net Worth */}
                            <div className="bg-[#009B9E] p-6 rounded-2xl shadow-lg shadow-teal-200/50 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white/20 p-3 rounded-xl text-white"><TrendingUp size={24} /></div>
                                    <span className="text-white/80 font-medium">Total Net Worth</span>
                                </div>
                                <h2 className="text-4xl font-bold">${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                <p className="text-xs text-white/70 mt-2 flex justify-between">
                                    <span>Assets: ${totalAssetValue.toLocaleString()}</span>
                                    <span>+ Cash: ${unclaimedRewards.toFixed(2)}</span>
                                </p>
                            </div>

                            {/* Unclaimed Rent */}
                            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-lg shadow-green-200 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white/20 p-3 rounded-xl text-white"><DollarSign size={24} /></div>
                                    <span className="text-white/90 font-medium">Unclaimed Rent</span>
                                </div>
                                <h2 className="text-4xl font-bold">${unclaimedRewards.toFixed(2)}</h2>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-white/80">Accumulated dividends</p>
                                    <button
                                        onClick={() => { setBtcAddress(''); setClaimModalOpen(true); }}
                                        disabled={unclaimedRewards <= 0}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${unclaimedRewards > 0 ? "bg-white text-green-600 hover:bg-green-50" : "bg-white/20 text-white/50 cursor-not-allowed"}`}
                                    >
                                        Claim Now
                                    </button>
                                </div>
                            </div>

                            {/* Pending Actions */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-orange-100 p-3 rounded-xl text-orange-500"><Clock size={24} /></div>
                                    <span className="text-slate-500 font-medium">Pending Actions</span>
                                </div>
                                <h2 className="text-3xl font-bold text-[#0F172A]">{pendingOrdersCount}</h2>
                                <p className="text-xs text-slate-400 mt-2">Orders waiting for confirmation</p>
                            </div>
                        </div>

                        {/* 2. ORDER HISTORY */}
                        {data?.orders && data.orders.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold text-[#0F172A] mb-4">Order History</h2>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                                <tr><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Value</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status & Action</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {data.orders.map((order: any) => (
                                                    <tr key={order.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-medium">{order.propertyName || `Property #${order.property_id}`}</td>
                                                        <td className="px-6 py-4">${order.total_price?.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-slate-500">{new Date(order.order_date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            {order.status === 'pending' ? (
                                                                <button
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-slate-200 transition flex items-center gap-2"
                                                                >
                                                                    Pay Now <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                                </button>
                                                            ) : (
                                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex w-fit items-center gap-1">
                                                                    <CheckCircle size={12} /> Approved
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. ASSETS LIST */}
                        <h2 className="text-xl font-bold text-[#0F172A] mb-6">Your Assets</h2>
                        {data?.assets && data.assets.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.assets.map((asset: any, index: number) => {
                                    const unitPrice = getUnitPrice(asset);
                                    const currentValue = asset.investedAmount * unitPrice;
                                    return (
                                        <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="font-bold text-[#0F172A] text-lg">{asset.propertyName}</div>
                                                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Active</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div>
                                                        <span className="text-xs text-slate-400 block uppercase">Tokens</span>
                                                        <span className="text-xl font-bold text-[#0F172A]">{asset.investedAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400 block uppercase">Value</span>
                                                        <span className="text-xl font-bold text-[#009B9E]">${currentValue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => { setSelectedAsset(asset); setSellModalOpen(true); }} className="w-full mt-auto border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                                                <ArrowDownCircle size={18} /> Sell & Withdraw
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No active assets found. Start investing!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== SETTINGS TAB ==================== */}
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">

                        {/* Profile Info Card */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8">
                            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                                <User className="text-[#009B9E]" /> Profile Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600">
                                        <Mail size={18} />
                                        {user?.email}
                                        <span className="ml-auto text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Read-Only</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account ID</label>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 font-mono text-sm">
                                        <Shield size={18} />
                                        TRV-{user?.id ? user.id.toString().padStart(6, '0') : '000000'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8">
                            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                                <Lock className="text-[#009B9E]" /> Security
                            </h2>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#009B9E] outline-none"
                                        placeholder="Min. 8 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#009B9E] outline-none"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                                </button>
                            </form>
                        </div>

                        {/* Logout Zone */}
                        <div className="text-center pt-8 border-t border-slate-200">
                            <button
                                onClick={logout}
                                className="text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 mx-auto"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS (Eski modallar burada kalıyor) --- */}
            {selectedOrder && (
                <PaymentModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => { setSelectedOrder(null); alert("Payment Verified! Order Approved."); fetchData(); }}
                />
            )}
            {/* Sell Modal ve Claim Modal kodları burada aynen kalmalı... (Yer kazanmak için tekrar yazmıyorum, üstteki kodda var) */}
            {sellModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
                        <button onClick={() => setSellModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Coins size={32} /></div>
                            <h2 className="text-2xl font-bold text-[#0F172A]">Sell Tokens</h2>
                            <p className="text-slate-500 mt-1">Withdraw from <span className="font-bold text-slate-900">{selectedAsset.propertyName}</span></p>
                        </div>
                        <form onSubmit={handleSell} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Available:</span><span className="font-bold text-slate-800">{selectedAsset.investedAmount}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Unit Price:</span><span className="font-bold text-[#009B9E]">${getUnitPrice(selectedAsset).toFixed(2)}</span></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tokens to Sell</label>
                                <input type="number" step="0.01" max={selectedAsset.investedAmount} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-lg font-bold" placeholder="0.00" value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
                            </div>
                            {sellAmount && !isNaN(parseFloat(sellAmount)) && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Total Payout:</span>
                                    <span className="text-xl font-bold text-green-600">${(parseFloat(sellAmount) * getUnitPrice(selectedAsset)).toFixed(2)}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Withdraw to BTC Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Wallet size={16} /></div>
                                    <input type="text" required className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono" placeholder="bc1q..." value={btcAddress} onChange={e => setBtcAddress(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Sale'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {claimModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
                        <button onClick={() => setClaimModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <div className="text-center mb-6">
                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600"><DollarSign size={32} /></div>
                            <h2 className="text-2xl font-bold text-[#0F172A]">Claim Rewards</h2>
                            <p className="text-slate-500 mt-1">Withdraw your accumulated rent dividends.</p>
                        </div>
                        <form onSubmit={handleClaim} className="space-y-5">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                <span className="block text-sm text-emerald-600 mb-1 font-bold">Total Claimable Amount</span>
                                <span className="text-3xl font-bold text-emerald-700">${unclaimedRewards.toFixed(2)}</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Withdraw to BTC Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Wallet size={16} /></div>
                                    <input type="text" required className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono" placeholder="bc1q..." value={btcAddress} onChange={e => setBtcAddress(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Claim'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}