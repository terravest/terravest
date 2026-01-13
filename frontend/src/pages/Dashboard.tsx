import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // ✅ useQueryClient eklendi
import {
    TrendingUp, Loader2,
    ArrowDownCircle, X, DollarSign,
    User, Lock, Mail, LogOut, Settings, Wallet, PieChart, ArrowUpRight, AlertTriangle, Calculator
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import TransactionHistory from '../components/TransactionHistory';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // ✅ Query Client başlatıldı
    const [activeTab, setActiveTab] = useState<'portfolio' | 'settings'>('portfolio');

    // --- 🔒 GÜVENLİK KONTROLÜ (REDIRECT) ---
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Kullanıcı verisi henüz yüklenmediyse loading göster
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]"><Loader2 className="animate-spin text-[#009B9E]" size={40} /></div>;
    }

    // --- REACT QUERY ---
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['portfolio'],
        queryFn: api.getPortfolio,
        enabled: !!user
    });

    // --- MODAL STATES ---
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [claimModalOpen, setClaimModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Form States
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [sellAmount, setSellAmount] = useState<string>('');

    // Withdraw States
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);

    // Settings States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- CALCULATIONS (TOTAL NET WORTH) ---
    const cashBalance = user?.usd_balance || 0;

    const getUnitPrice = (asset: any) => {
        if (!asset.price_usd || !asset.total_tokens) return 0;
        return asset.price_usd / asset.total_tokens;
    };

    const assetsValue = data?.assets?.reduce((acc: number, asset: any) => {
        const price = asset.current_price || getUnitPrice(asset);
        return acc + (asset.investedAmount * price);
    }, 0) || 0;

    const pendingRewards = data?.assets?.reduce((acc: number, asset: any) => acc + (asset.unclaimed_rewards || 0), 0) || 0;
    const totalNetWorth = cashBalance + assetsValue + pendingRewards;

    // --- FEE HESAPLAMA MANTIĞI ---
    const wAmount = parseFloat(withdrawAmount) || 0;
    const wFee = 5 + (wAmount * 0.01); // $5 + %1
    const wNet = wAmount > 0 ? wAmount - wFee : 0;
    const isBalanceSufficient = wAmount <= cashBalance;

    // --- ACTIONS ---

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;

        setIsProcessing(true);
        try {
            await api.sellAsset({
                property_id: selectedAsset.property_id || selectedAsset.id,
                token_amount: parseFloat(sellAmount)
            });
            toast.success("Asset sold! Funds added to your USD balance.");
            setSellModalOpen(false);
            setSellAmount('');
            refetch();
            if (refreshUser) refreshUser();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClaim = async () => {
        setIsProcessing(true);
        try {
            const res = await api.claimRewards();
            toast.success(`Claimed $${res.amount_claimed.toFixed(2)} to your balance!`);
            setClaimModalOpen(false);
            refetch();
            if (refreshUser) refreshUser();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);

        if (amount < 50) return toast.error("Minimum withdrawal is $50");
        if (amount > cashBalance) return toast.error("Insufficient cash balance");
        if (withdrawAddress.length < 10) return toast.error("Invalid BTC address");

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787/api";

            const res = await fetch(`${apiUrl}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount, btc_address: withdrawAddress })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            toast.success("Withdrawal request submitted! Pending Admin Approval.");

            // ✅ BAŞARILI OLUNCA:
            setWithdrawModalOpen(false);
            setWithdrawAmount('');
            setWithdrawAddress('');

            // 1. Kullanıcı bakiyesini güncelle
            if (refreshUser) refreshUser();
            // 2. İşlem Geçmişi tablosunu yenilemeye zorla!
            queryClient.invalidateQueries({ queryKey: ['transactions'] });

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) return toast.error("Password must be at least 8 characters.");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

        setIsProcessing(true);
        try {
            await api.changePassword(newPassword);
            toast.success("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center"><Loader2 className="animate-spin text-[#009B9E] h-12 w-12" /></div>;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans relative pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- HEADER & TABS --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">My Account</h1>
                        <p className="text-slate-500 mt-1">Welcome back, <span className="font-bold text-[#0F172A]">{user?.username || user?.email?.split('@')[0]}</span></p>
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
                    <div
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        data-testid="portfolio-section"
                    >

                        {/* 1. TOTAL NET WORTH CARD */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {/* Main Net Worth */}
                            <div className="md:col-span-2 bg-[#0F172A] p-8 rounded-3xl shadow-2xl shadow-slate-300 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-64 w-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 opacity-80">
                                                <TrendingUp size={20} className="text-[#00E5FF]" />
                                                <span className="text-sm font-bold tracking-widest uppercase">Total Net Worth</span>
                                            </div>
                                            <h2 className="text-5xl font-black tracking-tight mb-8">
                                                ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </h2>
                                        </div>
                                        {/* WITHDRAW BUTTON */}
                                        <button
                                            onClick={() => setWithdrawModalOpen(true)}
                                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 backdrop-blur-sm"
                                        >
                                            <ArrowUpRight size={16} /> Withdraw
                                        </button>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Cash Balance</p>
                                            <p className="text-xl font-bold">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Asset Value</p>
                                            <p className="text-xl font-bold text-[#00E5FF]">${assetsValue.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Unclaimed Rent</p>
                                            <p className="text-xl font-bold text-green-400">${pendingRewards.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Rewards Action */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
                                        <span className="font-bold text-slate-700">Rewards</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600 mb-1">${pendingRewards.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400">Accumulated from rentals</p>
                                </div>
                                <button
                                    onClick={() => setClaimModalOpen(true)}
                                    disabled={pendingRewards <= 0.01}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition mt-4
                                    ${pendingRewards > 0.01
                                            ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                                >
                                    Claim to Wallet
                                </button>
                            </div>
                        </div>

                        {/* 2. ASSETS LIST */}
                        <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                            <PieChart className="text-[#009B9E]" /> Your Assets
                        </h2>

                        {data?.assets && data.assets.length > 0 ? (
                            <div
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                                data-testid="portfolio-assets-list"
                            >
                                {data.assets.map((asset: any, index: number) => {
                                    const unitPrice = getUnitPrice(asset);
                                    const currentValue = asset.investedAmount * unitPrice;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition group"
                                            data-testid={`portfolio-asset-card-${asset.property_id}`}
                                            data-asset-id={asset.id}
                                            data-asset-property-id={asset.property_id}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="font-bold text-[#0F172A] text-lg group-hover:text-[#009B9E] transition">{asset.propertyName}</div>
                                                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Active</div>
                                                </div>
                                                <div className="space-y-3 mb-6">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Tokens Owned</span>
                                                        <span
                                                            className="font-bold text-slate-700"
                                                            data-testid={`portfolio-token-amount-${asset.property_id}`}
                                                        >
                                                            {asset.investedAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Current Value</span>
                                                        <span className="font-bold text-[#0F172A]">${currentValue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Unclaimed Rent</span>
                                                        <span className="font-bold text-green-600">+${(asset.unclaimed_rewards || 0).toFixed(4)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => { setSelectedAsset(asset); setSellModalOpen(true); }} className="w-full mt-auto bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                                                <ArrowDownCircle size={18} /> Sell Tokens
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div
                                className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 mb-12"
                                data-testid="portfolio-empty-state"
                            >
                                <p className="text-slate-500">No active assets found. Start investing from the Marketplace!</p>
                            </div>
                        )}

                        {/* 3. TRANSACTION HISTORY */}
                        <div className="mb-12">
                            <TransactionHistory />
                        </div>
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
                                        <Mail size={18} /> {user?.email}
                                        <span className="ml-auto text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Read-Only</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600">
                                        <User size={18} /> {user?.username || 'N/A'}
                                        <span className="ml-auto text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Read-Only</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8">
                            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                                <Lock className="text-[#009B9E]" /> Change Password
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

            {/* --- MODALS --- */}

            {/* Payment Modal (Deposit) */}
            {selectedOrder && (
                <PaymentModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => { setSelectedOrder(null); refetch(); queryClient.invalidateQueries({ queryKey: ['transactions'] }); }}
                />
            )}

            {/* SELL MODAL */}
            {sellModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <button onClick={() => setSellModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Sell Tokens</h2>
                        <p className="text-slate-500 mb-6">{selectedAsset.propertyName}</p>

                        <form onSubmit={handleSell} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Available Tokens:</span><span className="font-bold text-slate-800">{selectedAsset.investedAmount}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Price per Token:</span><span className="font-bold text-[#009B9E]">${getUnitPrice(selectedAsset).toFixed(2)}</span></div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount to Sell</label>
                                <input type="number" step="1" min="1" max={selectedAsset.investedAmount} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-lg font-bold outline-none focus:ring-2 focus:ring-[#009B9E]" placeholder="0" value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-blue-700 text-xs items-start">
                                <DollarSign size={16} className="shrink-0 mt-0.5" />
                                <p>Proceeds (minus 1.5% fee) will be added to your <strong>USD Balance</strong> immediately.</p>
                            </div>

                            <button type="submit" disabled={isProcessing} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Sale'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CLAIM MODAL */}
            {claimModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative text-center">
                        <button onClick={() => setClaimModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><DollarSign size={32} /></div>
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Claim Rewards</h2>
                        <p className="text-slate-500 mb-6 text-sm">Move your accumulated rent to your wallet.</p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                            <p className="text-slate-500 text-xs font-bold uppercase">Total Amount</p>
                            <p className="text-3xl font-black text-green-600">${pendingRewards.toFixed(2)}</p>
                        </div>

                        <button onClick={handleClaim} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm & Add to Balance'}
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ WITHDRAW MODAL - GÜNCELLENDİ (FEE HESAPLAMA) */}
            {withdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Withdraw Funds</h2>
                        <p className="text-slate-500 mb-6">Transfer USD balance to your Bitcoin wallet.</p>

                        <form onSubmit={handleWithdraw} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-bold">Available Cash:</span>
                                <span className="font-bold text-[#0F172A]">${cashBalance.toFixed(2)}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount to Withdraw (USD)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="10"
                                        min="50"
                                        max={cashBalance}
                                        required
                                        className={`w-full bg-white border rounded-xl p-3 text-lg font-bold outline-none focus:ring-2 transition ${!isBalanceSufficient && wAmount > 0 ? 'border-red-300 focus:ring-red-200 text-red-600' : 'border-slate-200 focus:ring-[#009B9E] text-slate-900'}`}
                                        placeholder="Min $50"
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                    />
                                    {!isBalanceSufficient && wAmount > 0 && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">Insufficient funds</p>
                                    )}
                                </div>
                            </div>

                            {/* 💰 DYNAMIC FEE CALCULATION BOX */}
                            {wAmount > 0 && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Withdrawal Amount:</span>
                                        <span>${wAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>Processing Fee ($5 + 1%):</span>
                                        <span>-${wFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#0F172A]">
                                        <span>You will receive:</span>
                                        <span className="flex items-center gap-1"><Calculator size={14} /> ${wNet.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destination BTC Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Wallet size={16} /></div>
                                    <input type="text" required className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#009B9E]" placeholder="bc1q..." value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing || !isBalanceSufficient} className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Request Withdrawal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}