import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { API_BASE_URL } from '../config/api';

interface PaymentModalProps {
    order: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ order, onClose, onSuccess }: PaymentModalProps) {
    // Get data from backend into variable (Not using state so old data doesn't persist)
    // Backend may say "address" or "payment_address", try both.
    const finalAddress = order?.address || order?.payment_address;
    const finalAmount = order?.amount || order?.amount_usd;
    const depositId = order?.id || order?.depositId;

    const [status, setStatus] = useState(order.status || 'pending');
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    // 🛑 SECURITY: Show error if address is missing (Don't display wrong data on screen)
    if (!finalAddress) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80">
                <div className="bg-white p-6 rounded-lg text-center">
                    <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
                    <p className="font-bold">Address Failed to Load</p>
                    <p className="text-sm text-slate-500 mb-4">Please refresh the page and try again.</p>
                    <button onClick={onClose} className="bg-slate-200 px-4 py-2 rounded">Close</button>
                </div>
            </div>
        );
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(finalAddress);
        toast.success("Address Copied!");
    };

    // POLLING: Durum Kontrolü
    useEffect(() => {
        if (status === 'completed') return;

        const checkStatus = async () => {
            try {
                if (!depositId) return;
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/deposit/${depositId}`, {
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const data = await res.json();

                if (data.success && data.data.status === 'completed') {
                    setStatus('completed');
                    toast.success("Ödeme Onaylandı! 🚀");
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                    }, 3000);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [depositId, status]);

    // Timer
    useEffect(() => {
        if (status === 'completed') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- SUCCESS SCREEN ---
    if (status === 'completed') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Received!</h2>
                    <p className="text-slate-500">Your balance has been updated.</p>
                </div>
            </div>
        );
    }

    // --- PAYMENT SCREEN ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-orange-500" size={20} />
                        <span className="font-bold text-slate-700">Awaiting Payment</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Timer */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-slate-500 mb-1">Expires in</p>
                        <p className="text-3xl font-mono font-bold text-slate-800">{formatTime(timeLeft)}</p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
                            {/* NOTE: Using variable directly from prop, not state */}
                            <QRCode value={finalAddress} size={180} />
                        </div>
                    </div>

                    {/* Address Box */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bitcoin Address</label>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-orange-200 transition-colors">
                                <p className="font-mono text-sm text-slate-700 truncate select-all">
                                    {finalAddress}
                                </p>
                                <button onClick={copyToClipboard} className="text-slate-400 hover:text-orange-500 ml-auto">
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount</label>
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                <span className="font-bold text-slate-900">${finalAmount} USD</span>
                                <span className="text-xs text-slate-500">(Auto-converted to BTC)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                    <a
                        href={`https://mempool.space/address/${finalAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1 font-medium"
                    >
                        View on Blockchain Explorer <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
}