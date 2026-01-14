import { useState } from 'react';
import { X, Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface BuyModalProps {
    property: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BuyModal({ property, onClose, onSuccess }: BuyModalProps) {
    const { user, refreshUser } = useAuth(); // Required to update balance
    const queryClient = useQueryClient(); // To invalidate portfolio cache
    const [amount, setAmount] = useState('1');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- CALCULATIONS ---
    const tokenAmount = parseInt(amount) || 0;
    const rawPrice = tokenAmount * property.price_per_token; // Pure Property Cost
    const fee = rawPrice * 0.015; // 1.5% Transaction Fee (Must match backend)
    const totalCost = rawPrice + fee; // Total Amount

    // --- BALANCE CHECK ---
    const currentBalance = user?.usd_balance || 0;
    const isInsufficientFunds = currentBalance < totalCost;
    const remainingBalance = currentBalance - totalCost;

    const handleBuy = async () => {
        if (isInsufficientFunds) {
            toast.error("Insufficient balance. Please deposit funds first.");
            return;
        }

        setIsProcessing(true);
        try {
            // Backend API call
            await api.buyToken({ propertyId: property.id, tokenAmount: tokenAmount });

            toast.success("Purchase successful! Property added to your portfolio.");

            // Refresh user balance
            if (refreshUser) refreshUser();

            // CRITICAL: Invalidate portfolio query cache to force refetch on dashboard
            // This ensures the newly purchased asset appears in the portfolio UI
            // Without this, React Query may serve stale cached data (5min staleTime)
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });

            onSuccess(); // Close modal and refresh list
        } catch (error: any) {
            toast.error(error.message || "Purchase failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
            data-testid="modal-backdrop"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10"
                data-testid="buy-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirm Purchase</h2>
                <p className="text-slate-500 mb-6 line-clamp-1">{property.title}</p>

                {/* --- CALCULATION CARD --- */}
                <div className="bg-slate-50 p-5 rounded-xl space-y-3 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium text-sm">Amount</span>
                        <div className="flex items-center">
                            <input
                                type="number"
                                min="1"
                                max={property.available_tokens}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-16 text-right border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-900 focus:ring-2 focus:ring-[#009B9E] outline-none text-sm"
                            />
                            <span className="ml-2 text-xs text-slate-400 font-bold">TOKENS</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 my-2" />

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Property Price</span>
                        <span className="font-medium text-slate-700">${rawPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* COMMISSION DISPLAY */}
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-slate-500">
                            <span>Trading Fee</span>
                            <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">1.5%</span>
                        </div>
                        <span className="font-medium text-slate-600">+ ${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-slate-900 font-bold">Total Pay</span>
                        <span className="text-xl font-extrabold text-[#0F172A]">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* --- BALANCE STATUS --- */}
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${isInsufficientFunds ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    {isInsufficientFunds ? <AlertTriangle size={24} className="shrink-0" /> : <Wallet size={24} className="shrink-0" />}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold uppercase opacity-80">Wallet Balance</p>
                            <p className="font-bold">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        {isInsufficientFunds ? (
                            <p className="text-xs font-medium">You need <span className="font-bold">${(totalCost - currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> more.</p>
                        ) : (
                            <p className="text-xs font-medium">Remaining: <span className="font-bold">${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleBuy}
                    disabled={isProcessing || isInsufficientFunds}
                    className={`w-full font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg
                        ${isInsufficientFunds
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-[#009B9E] hover:bg-[#00888a] text-white hover:shadow-xl hover:-translate-y-0.5'
                        }`}
                    data-testid="buy-confirm-button"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin" /> Processing...</>
                    ) : (
                        isInsufficientFunds ? 'Insufficient Balance' : 'Confirm Purchase'
                    )}
                </button>
            </div>
        </div>
    );
}