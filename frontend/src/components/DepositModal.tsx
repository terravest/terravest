import { useState, useEffect } from 'react';
import { X, Bitcoin, Loader2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import PaymentModal from './PaymentModal';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query'; // 1. Import

interface DepositModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function DepositModal({ onClose, onSuccess }: DepositModalProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);

    // 2. QueryClient Tanımlandı
    const queryClient = useQueryClient();

    // 1. Anlık BTC Fiyatını Çek (Binance API)
    const fetchBtcPrice = async () => {
        try {
            const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const data = await res.json();
            if (data && data.price) {
                setBtcPrice(parseFloat(data.price));
            }
        } catch (error) {
            console.error("Failed to fetch BTC price");
        }
    };

    useEffect(() => {
        fetchBtcPrice();
        const interval = setInterval(fetchBtcPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    // Tahmini BTC Hesaplama
    const usdAmount = parseFloat(amount) || 0;
    const estimatedBtc = btcPrice ? (usdAmount / btcPrice).toFixed(8) : "---";

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🔍 DEBUG: Kullanıcıyı kontrol et
        console.log("👤 Mevcut Kullanıcı:", user);

        if (!usdAmount || usdAmount < 10) {
            return toast.error("Minimum deposit is $10");
        }

        // 🛡️ GÜVENLİK KONTROLÜ
        if (!user || !user.id) {
            console.error("❌ HATA: Kullanıcı ID bulunamadı!", user);
            toast.error("Oturum bilgisi okunamadı. Lütfen sayfayı yenileyip tekrar giriş yapın.");
            return;
        }

        setIsLoading(true);
        try {
            console.log(`📡 İstek gönderiliyor... Tutar: ${usdAmount}`);

            // 🔐 Auth token'dan userId alınacak, body'den göndermeye gerek yok
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:8787/api/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    amount: usdAmount
                })
            });

            const data = await res.json();
            console.log("✅ Backend Yanıtı:", data);

            if (data.success && data.data) {
                setOrderData(data.data);

                // ✅ 3. SİHİRLİ DOKUNUŞ: Tabloyu anında yenile!
                // Bu satır sayesinde "Pending" işlemi tabloda hemen görünür.
                queryClient.invalidateQueries({ queryKey: ['transactions'] });

                toast.success("Deposit address generated!");
            } else {
                throw new Error(data.error || "Sunucudan beklenen yanıt gelmedi.");
            }

        } catch (error: any) {
            console.error("Deposit Error:", error);
            toast.error(error.message || "Failed to create order. Is backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    // Eğer sipariş oluştuysa Ödeme Ekranına geç
    if (orderData) {
        return <PaymentModal order={orderData} onClose={onClose} onSuccess={onSuccess} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="bg-[#F7931A]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F7931A]">
                        <Bitcoin size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Deposit Funds</h2>
                    <p className="text-slate-500 mt-1">Add USD to your wallet via Bitcoin.</p>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Amount to Deposit (USD)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-xl">$</span>
                            <input
                                type="number"
                                min="10"
                                step="1"
                                placeholder="100"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-slate-900 font-bold text-xl focus:ring-2 focus:ring-[#009B9E] outline-none transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        {/* Tahmini BTC Gösterimi */}
                        {btcPrice && usdAmount > 0 ? (
                            <div className="flex items-center justify-between gap-2 mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={14} className="text-slate-400" />
                                    <span>Est. Payment:</span>
                                </div>
                                <span className="font-mono font-bold text-[#F7931A] text-base">≈ {estimatedBtc} BTC</span>
                            </div>
                        ) : (
                            <div className="mt-3 h-[46px]"></div>
                        )}

                        <div className="flex items-start gap-2 mt-4 bg-blue-50 p-3 rounded-lg">
                            <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Minimum deposit amount is <strong>$10.00</strong>. Your balance will be updated automatically after 1 network confirmation.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !amount || parseFloat(amount) < 10}
                        className="w-full bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                        data-testid="deposit-submit-button"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Generating Address...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}