import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate eklendi
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext'; // Auth kontrolü için eklendi
import { FileText, CheckCircle, Loader2, ArrowLeft, MapPin, AlertCircle } from 'lucide-react';

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Kullanıcı giriş yapmış mı?

    const [prop, setProp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buyAmount, setBuyAmount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getProperties();
                const list = Array.isArray(data) ? data : (data.results || []);
                const found = list.find((p: any) => p.id === Number(id));
                setProp(found);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleBuy = async () => {
        // 1. GİRİŞ KONTROLÜ (YENİ)
        if (!isAuthenticated) {
            // Hata vermek yerine Login sayfasına gönderiyoruz
            // state: { from: ... } ile login sonrası geri dönmesi sağlanabilir (ileride)
            navigate('/login');
            return;
        }

        if (!prop) return;

        setIsSubmitting(true);
        try {
            // API isteği gönderilirken 'amount' değil 'token_amount' bekliyor backend
            await api.createOrder({
                property_id: prop.id,
                token_amount: buyAmount, // Backend bu ismi bekliyor
                payment_address: "manual-btc-transfer" // Backend bunu zaten eziyor ama tip hatası vermesin diye koyduk
            });

            // Başarılı olursa Dashboard'a yönlendir (Ödeme yapmak için)
            alert("Order Request Created! Please go to Dashboard to complete payment.");
            navigate('/dashboard');

        } catch (e: any) {
            alert(e.message || "Order failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#009B9E] h-12 w-12" /></div>;
    if (!prop) return <div className="text-center py-20">Property not found.</div>;

    const tokenPrice = prop.price_usd / prop.total_tokens;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            {/* HERO IMAGE */}
            <div className="relative h-[50vh] bg-slate-900">
                <img
                    src={prop.image_url || `https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&sig=${prop.id}`}
                    className="w-full h-full object-cover opacity-60"
                    alt={prop.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto">
                    <Link to="/marketplace" className="text-white/80 hover:text-white flex items-center gap-2 mb-4 text-sm font-bold"><ArrowLeft size={16} /> Back to Market</Link>
                    <span className="bg-[#009B9E] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-2 inline-block">Tokenized Asset</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{prop.title}</h1>
                    <div className="flex items-center gap-2 text-white/80">
                        <MapPin size={18} />
                        <span>Miami, FL (USA)</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10 grid lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Asset Value</span>
                            <span className="text-xl font-bold text-[#0F172A]">${prop.price_usd.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Token Price</span>
                            <span className="text-xl font-bold text-[#009B9E]">${tokenPrice.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Est. Yield</span>
                            <span className="text-xl font-bold text-green-600">10.5%</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Tokens Left</span>
                            <span className="text-xl font-bold text-[#0F172A]">{prop.available_tokens}</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2"><FileText className="text-[#009B9E]" /> Investment Summary</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">{prop.description}</p>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-[#0F172A] mb-3">Property Highlights</h4>
                            <ul className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Fully Managed Property</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Monthly Rent Payouts (BTC)</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> High Appreciation Potential</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Secure LLC Structure</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: BUY CARD */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-24">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#0F172A]">Invest in this Asset</h3>
                            <p className="text-slate-500 text-sm">Instant ownership via Bitcoin</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Token Price</span>
                                <span className="font-bold text-[#0F172A]">${tokenPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Available</span>
                                <span className="font-bold text-[#0F172A]">{prop.available_tokens}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Amount (Tokens)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={prop.available_tokens}
                                    value={buyAmount}
                                    onChange={(e) => setBuyAmount(Number(e.target.value))}
                                    className="w-full border border-slate-200 rounded-xl p-3 font-bold text-lg focus:ring-2 focus:ring-[#009B9E] outline-none"
                                />
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="font-bold text-slate-500">Total Investment:</span>
                                <span className="text-2xl font-bold text-[#009B9E]">${(buyAmount * tokenPrice).toFixed(2)}</span>
                            </div>

                            {!isAuthenticated && (
                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex gap-2 items-start text-xs text-orange-800 mb-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>You must be logged in to make an investment.</span>
                                </div>
                            )}

                            <button
                                onClick={handleBuy}
                                disabled={isSubmitting}
                                className="w-full bg-[#009B9E] hover:bg-[#008B8E] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-teal-500/20 flex justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (isAuthenticated ? 'Confirm Investment' : 'Login to Invest')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}