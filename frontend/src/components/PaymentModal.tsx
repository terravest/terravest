import { useState, useEffect } from 'react';
import { X, Copy, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

interface PaymentModalProps {
    order: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ order, onClose, onSuccess }: PaymentModalProps) {
    const [txHash, setTxHash] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    // BTC Hesaplama State'leri
    const [btcAmount, setBtcAmount] = useState<number | null>(null);
    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(true);

    // 1. ANLIK BTC FİYATINI ÇEK
    const fetchBtcPrice = async () => {
        setLoadingPrice(true);
        try {
            // Binance API'sinden BTC/USDT fiyatını çekiyoruz (Halka açık, key gerektirmez)
            const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const data = await res.json();
            const price = parseFloat(data.price);

            setBtcPrice(price);

            // Dolar Tutarını BTC'ye çevir (Virgülden sonra 8 hane - Satoshi hassasiyeti)
            // order.total_price veritabanından geliyor (USD cinsinden)
            const calculatedBtc = order.total_price / price;
            setBtcAmount(calculatedBtc);

        } catch (err) {
            console.error("Failed to fetch BTC price", err);
            setError("Could not fetch live BTC rates. Please calculate manually.");
        } finally {
            setLoadingPrice(false);
        }
    };

    // Modal açıldığında fiyatı çek
    useEffect(() => {
        fetchBtcPrice();
    }, []);

    const handleVerify = async () => {
        if (!txHash) return setError("Please enter the Transaction Hash");
        setVerifying(true);
        setError('');

        try {
            await api.verifyPayment(order.id, txHash);
            onSuccess();
        } catch (e: any) {
            setError(e.message || "Verification failed. Check your TXID.");
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-[#0F172A] p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">Complete Payment</h3>
                        <p className="text-slate-400 text-sm">Order #{order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>

                <div className="p-8 overflow-y-auto">

                    {/* AMOUNT SECTION (YENİ) */}
                    <div className="text-center mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100 relative">
                        {loadingPrice ? (
                            <div className="flex justify-center items-center gap-2 text-orange-600">
                                <Loader2 className="animate-spin" /> Calculating BTC...
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-500 text-sm uppercase font-bold tracking-wide mb-1">Total Amount to Send</p>
                                <div className="text-3xl font-extrabold text-[#F7931A] break-all">
                                    {btcAmount?.toFixed(8)} BTC
                                </div>
                                <div className="text-slate-400 text-sm mt-1 font-medium">
                                    ≈ ${order.total_price.toLocaleString()} USD
                                    <span className="mx-2">•</span>
                                    1 BTC = ${btcPrice?.toLocaleString()}
                                </div>

                                {/* Yenile Butonu */}
                                <button
                                    onClick={fetchBtcPrice}
                                    className="absolute top-4 right-4 text-orange-300 hover:text-orange-500 transition"
                                    title="Refresh Rate"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 mb-4">
                            {/* BTC Amount'u da QR koda ekleyelim ki cüzdanlar otomatik doldursun */}
                            {/* Format: bitcoin:ADDRESS?amount=AMOUNT */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:${order.payment_address}?amount=${btcAmount?.toFixed(8)}`}
                                alt="Bitcoin QR Code"
                                className="w-40 h-40"
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            Scan to pay automatically with your wallet app.
                        </p>
                    </div>

                    {/* Address Box */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deposit Address (BTC Network)</label>
                        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                            <div className="truncate text-sm font-mono text-slate-700 w-full select-all">
                                {order.payment_address}
                            </div>
                            <button
                                onClick={() => copyToClipboard(order.payment_address)}
                                className="text-[#009B9E] hover:text-[#007B7E] p-2 hover:bg-teal-50 rounded-lg transition shrink-0"
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Verification Section */}
                    <div className="border-t border-slate-100 pt-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Enter Transaction Hash (TXID):
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. 7a92f..."
                                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#009B9E] outline-none text-sm font-mono"
                                value={txHash}
                                onChange={(e) => setTxHash(e.target.value)}
                            />
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="bg-[#009B9E] hover:bg-[#008B8E] text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
                            >
                                {verifying ? <Loader2 className="animate-spin" /> : 'Verify'}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-100">
                                {error}
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}