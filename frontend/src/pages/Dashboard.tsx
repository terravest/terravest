import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TrendingUp, Loader2,
    ArrowDownCircle, X, DollarSign,
    PieChart, ArrowUpRight, Calculator, Wallet
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import TransactionHistory from '../components/TransactionHistory';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import { LanguageContext } from '../App';
import { content } from '../content';
import { formatCurrency, formatNumber } from '../utils/format';

export default function Dashboard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    // --- SECURITY CHECK (REDIRECT) ---
    useEffect(() => {
        if (!user) {
            navigate(getLink('/login'));
        }
    }, [user, navigate, lang]);

    // Show loading if user data hasn't loaded yet
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

    // --- CALCULATIONS (TOTAL NET WORTH - ALL IN CENTS FIRST) ---

    // 💰 Cash Balance (Backend sends Cents)
    const cashBalanceCents = user?.usd_balance || 0;

    // Helper: Get Unit Price in Cents
    const getUnitPriceCents = (asset: any) => {
        if (!asset.price_usd || !asset.total_tokens) return 0;
        // asset.price_usd is total property value in Cents
        return Math.floor(asset.price_usd / asset.total_tokens);
    };

    // Calculate Asset Value in Cents
    const assetsValueCents = data?.assets?.reduce((acc: number, asset: any) => {
        const priceCents = asset.current_price ? (asset.current_price * 100) : getUnitPriceCents(asset);
        return acc + (asset.investedAmount * priceCents);
    }, 0) || 0;

    // Pending Rewards in Cents
    const pendingRewardsCents = data?.assets?.reduce((acc: number, asset: any) => acc + (asset.unclaimed_rewards || 0), 0) || 0;

    // Total Net Worth in Cents
    const totalNetWorthCents = cashBalanceCents + assetsValueCents + pendingRewardsCents;

    // --- WITHDRAWAL LOGIC (DOLLAR INPUT -> CENT LOGIC) ---
    const wAmountDollars = parseFloat(withdrawAmount) || 0;
    const wAmountCents = Math.round(wAmountDollars * 100);

    // Fee Calculation (Displayed in Dollars)
    const wFeeDollars = 5 + (wAmountDollars * 0.01); // $5 + 1%
    const wNetDollars = wAmountDollars > 0 ? wAmountDollars - wFeeDollars : 0;

    // Balance Check (Compare Cents to Cents)
    const isBalanceSufficient = wAmountCents <= cashBalanceCents;

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
            toast.success(t.dashboard.toastSellSuccess);
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
            // Backend handles the claim logic, returning amount in Dollars usually or updated balance
            const res = await api.claimRewards();

            // Note: Check what api.claimRewards returns. Assuming it returns object with amount_claimed.
            // If backend sends Cents, divide by 100. If Dollars, keep as is.
            // Assuming updated backend sends Cents:
            const amountClaimedDollars = res.amount_claimed ? (res.amount_claimed / 100) : 0;

            const claimMessage = t.dashboard.toastClaimSuccess.replace(
                '${amount}',
                formatCurrency(amountClaimedDollars, lang)
            );
            toast.success(claimMessage);
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

        if (wAmountDollars < 50) return toast.error(t.dashboard.toastMinWithdrawal);
        if (!isBalanceSufficient) return toast.error(t.dashboard.toastInsufficientCash);
        if (withdrawAddress.length < 10) return toast.error(t.dashboard.toastInvalidBtc);

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`${API_BASE_URL}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // 💰 Send CENTS to backend
                body: JSON.stringify({ amount: wAmountCents, btc_address: withdrawAddress })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            toast.success(t.dashboard.toastWithdrawRequest);

            // On success:
            setWithdrawModalOpen(false);
            setWithdrawAmount('');
            setWithdrawAddress('');

            // 1. Update user balance
            if (refreshUser) refreshUser();
            // 2. Force refresh Transaction History table!
            queryClient.invalidateQueries({ queryKey: ['transactions'] });

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center"><Loader2 className="animate-spin text-[#009B9E] h-12 w-12" /></div>;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans relative pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- HEADER --- */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0F172A]">{t.dashboard.title}</h1>
                    <p className="text-slate-500 mt-1">{t.dashboard.welcomeBack}, <span className="font-bold text-[#0F172A]">{user?.username || user?.email?.split('@')[0]}</span></p>
                </div>

                {/* ==================== PORTFOLIO CONTENT ==================== */}
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
                                            <span className="text-sm font-bold tracking-widest uppercase">{t.dashboard.totalNetWorth}</span>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tight mb-8">
                                            {/* Display: Cents / 100 */}
                                            {formatCurrency(totalNetWorthCents / 100, lang)}
                                        </h2>
                                    </div>
                                    {/* WITHDRAW BUTTON */}
                                    <button
                                        onClick={() => setWithdrawModalOpen(true)}
                                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 backdrop-blur-sm"
                                    >
                                        <ArrowUpRight size={16} /> {t.dashboard.withdraw}
                                    </button>
                                </div>

                                {/* Breakdown */}
                                <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t.dashboard.cashBalance}</p>
                                        <p className="text-xl font-bold">{formatCurrency(cashBalanceCents / 100, lang)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t.dashboard.assetValue}</p>
                                        <p className="text-xl font-bold text-[#00E5FF]">{formatCurrency(assetsValueCents / 100, lang)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t.dashboard.unclaimedRent}</p>
                                        <p className="text-xl font-bold text-green-400">{formatCurrency(pendingRewardsCents / 100, lang)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Rewards Action */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
                                    <span className="font-bold text-slate-700">{t.dashboard.rewards}</span>
                                </div>
                                <p className="text-3xl font-bold text-green-600 mb-1">{formatCurrency(pendingRewardsCents / 100, lang)}</p>
                                <p className="text-xs text-slate-400">{t.dashboard.rewardsSubtitle}</p>
                            </div>
                            <button
                                onClick={() => setClaimModalOpen(true)}
                                disabled={pendingRewardsCents <= 1} // <= 1 cent
                                className={`w-full py-3 rounded-xl font-bold text-sm transition mt-4
                                    ${pendingRewardsCents > 1
                                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                            >
                                {t.dashboard.claimToWallet}
                            </button>
                        </div>
                    </div>

                    {/* 2. ASSETS LIST */}
                    <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                        <PieChart className="text-[#009B9E]" /> {t.dashboard.assetsTitle}
                    </h2>

                    {data?.assets && data.assets.length > 0 ? (
                        <div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                            data-testid="portfolio-assets-list"
                        >
                            {data.assets.map((asset: any, index: number) => {
                                const unitPriceCents = getUnitPriceCents(asset);
                                const currentValueCents = asset.investedAmount * unitPriceCents;

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
                                                <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">{t.dashboard.active}</div>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">{t.dashboard.tokensOwned}</span>
                                                    <span
                                                        className="font-bold text-slate-700"
                                                        data-testid={`portfolio-token-amount-${asset.property_id}`}
                                                    >
                                                        {formatNumber(asset.investedAmount, lang, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">{t.dashboard.currentValue}</span>
                                                    <span className="font-bold text-[#0F172A]">
                                                        {formatCurrency(currentValueCents / 100, lang)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">{t.dashboard.unclaimedRent}</span>
                                                    <span className="font-bold text-green-600">
                                                        +{formatCurrency((asset.unclaimed_rewards || 0) / 100, lang, 'USD', {
                                                            minimumFractionDigits: 4,
                                                            maximumFractionDigits: 4
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedAsset(asset); setSellModalOpen(true); }} className="w-full mt-auto bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                                            <ArrowDownCircle size={18} /> {t.dashboard.sellTokens}
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
                            <p className="text-slate-500">{t.dashboard.assetsEmpty}</p>
                        </div>
                    )}

                    {/* 3. TRANSACTION HISTORY */}
                    <div className="mb-12">
                        <TransactionHistory />
                    </div>
                </div>

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
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-1">{t.dashboard.sellModalTitle}</h2>
                        <p className="text-slate-500 mb-6">{selectedAsset.propertyName}</p>

                        <form onSubmit={handleSell} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">{t.dashboard.availableTokens}</span>
                                    <span className="font-bold text-slate-800">
                                        {formatNumber(selectedAsset.investedAmount, lang)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t.dashboard.pricePerToken}</span>
                                    <span className="font-bold text-[#009B9E]">
                                        {formatCurrency(getUnitPriceCents(selectedAsset) / 100, lang)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.dashboard.amountToSell}</label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max={selectedAsset.investedAmount}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-lg font-bold outline-none focus:ring-2 focus:ring-[#009B9E]"
                                    placeholder={t.dashboard.sellAmountPlaceholder}
                                    value={sellAmount}
                                    onChange={e => setSellAmount(e.target.value)}
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-blue-700 text-xs items-start">
                                <DollarSign size={16} className="shrink-0 mt-0.5" />
                                <p>{t.dashboard.proceedsNote}</p>
                            </div>

                            <button type="submit" disabled={isProcessing} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : t.dashboard.confirmSale}
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
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">{t.dashboard.claimModalTitle}</h2>
                        <p className="text-slate-500 mb-6 text-sm">{t.dashboard.claimModalSubtitle}</p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                            <p className="text-slate-500 text-xs font-bold uppercase">{t.dashboard.totalAmount}</p>
                            <p className="text-3xl font-black text-green-600">{formatCurrency(pendingRewardsCents / 100, lang)}</p>
                        </div>

                        <button onClick={handleClaim} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                            {isProcessing ? <Loader2 className="animate-spin" /> : t.dashboard.confirmAddToBalance}
                        </button>
                    </div>
                </div>
            )}

            {/* WITHDRAW MODAL */}
            {withdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-1">{t.dashboard.withdrawModalTitle}</h2>
                        <p className="text-slate-500 mb-6">{t.dashboard.withdrawModalSubtitle}</p>

                        <form onSubmit={handleWithdraw} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-bold">{t.dashboard.availableCash}</span>
                                <span className="font-bold text-[#0F172A]">{formatCurrency(cashBalanceCents / 100, lang)}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.dashboard.amountToWithdrawLabel}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="10"
                                        min="50"
                                        max={cashBalanceCents / 100}
                                        required
                                        className={`w-full bg-white border rounded-xl p-3 text-lg font-bold outline-none focus:ring-2 transition ${!isBalanceSufficient && wAmountDollars > 0 ? 'border-red-300 focus:ring-red-200 text-red-600' : 'border-slate-200 focus:ring-[#009B9E] text-slate-900'}`}
                                        placeholder={t.dashboard.amountToWithdrawPlaceholder}
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                    />
                                    {!isBalanceSufficient && wAmountDollars > 0 && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">{t.dashboard.insufficientFunds}</p>
                                    )}
                                </div>
                            </div>

                            {/* DYNAMIC FEE CALCULATION BOX */}
                            {wAmountDollars > 0 && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>{t.dashboard.withdrawalAmountLabel}</span>
                                        <span>{formatCurrency(wAmountDollars, lang)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>{t.dashboard.processingFeeLabel}</span>
                                        <span>-{formatCurrency(wFeeDollars, lang)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#0F172A]">
                                        <span>{t.dashboard.youWillReceive}</span>
                                        <span className="flex items-center gap-1">
                                            <Calculator size={14} /> {formatCurrency(wNetDollars, lang)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.dashboard.destinationBtcAddress}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Wallet size={16} /></div>
                                    <input type="text" required className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#009B9E]" placeholder={t.dashboard.btcPlaceholder} value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing || !isBalanceSufficient} className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isProcessing ? <Loader2 className="animate-spin" /> : t.dashboard.requestWithdrawal}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}