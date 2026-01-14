import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import PropertyGallery from '../components/PropertyGallery';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Loader2, ArrowLeft, MapPin, AlertCircle, TrendingUp } from 'lucide-react';

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [prop, setProp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buyAmount, setBuyAmount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                if (id) {
                    // Backend'deki güncellediğimiz endpoint (resimleri array olarak döner)
                    const property = await api.getProperty(id);
                    setProp(property);
                } else {
                    // ID yoksa listeye dön
                    navigate('/marketplace');
                }
            } catch (e) {
                console.error("Failed to load property:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, navigate]);

    const handleBuy = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!prop) return;

        setIsSubmitting(true);
        try {
            await api.createOrder({
                propertyId: prop.id,
                tokenAmount: buyAmount,
            });

            alert("Order Request Created! Please go to Dashboard to complete payment.");
            navigate('/dashboard');

        } catch (e: any) {
            alert(e.message || "Order failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
            <Loader2 className="animate-spin text-[#009B9E] h-12 w-12" />
        </div>
    );

    if (!prop) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F3] gap-4">
            <div className="text-xl font-bold text-slate-700">Property not found.</div>
            <Link to="/marketplace" className="text-[#009B9E] hover:underline">Back to Marketplace</Link>
        </div>
    );

    const tokenPrice = prop.price_usd / prop.total_tokens;

    // --- RESİM HAZIRLIĞI ---
    // Backend'den 'images' array'i geliyorsa onu kullan, yoksa 'image_url'i tek elemanlı array yap.
    const images = prop.images && prop.images.length > 0
        ? prop.images
        : (prop.image_url ? [{ id: null, url: prop.image_url, isMain: true, displayOrder: 0 }] : []);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <Link to="/marketplace" className="text-slate-500 hover:text-[#009B9E] flex items-center gap-2 mb-3 text-sm font-bold transition-colors w-fit">
                        <ArrowLeft size={16} /> Back to Market
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#009B9E] text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                    Tokenized Asset
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <MapPin size={14} />
                                    <span className="text-xs font-bold uppercase">{prop.location || 'United States'}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">{prop.title}</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400 text-xs font-bold uppercase">Est. Yield</span>
                            <span className="text-xl font-bold text-[#009B9E] flex items-center gap-1">
                                <TrendingUp size={18} />{' '}
                                {prop.rental_yield ? (
                                    prop.rental_yield.includes('%')
                                        ? prop.rental_yield
                                        : `${prop.rental_yield}%`
                                ) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">

                {/* --- SOL KOLON (GALERİ & DETAYLAR) --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* GALERİ COMPONENTİ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <PropertyGallery images={images} propertyTitle={prop.title} />
                    </div>

                    {/* FİNANSAL ÖZET ŞERİDİ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-50">
                        <div className="pl-2">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Asset Value</span>
                            <span className="text-lg md:text-xl font-bold text-[#0F172A]">${prop.price_usd.toLocaleString()}</span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Token Price</span>
                            <span className="text-lg md:text-xl font-bold text-[#009B9E]">${tokenPrice.toFixed(2)}</span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Tokens</span>
                            <span className="text-lg md:text-xl font-bold text-[#0F172A]">{prop.total_tokens.toLocaleString()}</span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Available</span>
                            <span className={`text-lg md:text-xl font-bold ${prop.available_tokens > 0 ? 'text-[#0F172A]' : 'text-red-500'}`}>
                                {prop.available_tokens.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* AÇIKLAMA VE MADDELER */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                            <FileText className="text-[#009B9E]" /> Investment Summary
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base whitespace-pre-line">
                            {prop.description}
                        </p>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-[#0F172A] mb-4 text-sm uppercase tracking-wide">Property Highlights</h4>
                            <ul className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> Fully Managed Property</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> Monthly Rent Payouts</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> High Appreciation Potential</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> Legal Ownership via LLC</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- SAĞ KOLON (YATIRIM KARTI - STICKY) --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-28">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#0F172A]">Invest in this Asset</h3>
                            <p className="text-slate-500 text-xs mt-1">Instant ownership via TerraVest Tokens</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Token Price</span>
                                <span className="font-bold text-[#0F172A]">${tokenPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Available</span>
                                <span className="font-bold text-[#0F172A]">{prop.available_tokens}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Amount (Tokens)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max={prop.available_tokens}
                                        value={buyAmount}
                                        onChange={(e) => {
                                            const val = Math.min(Math.max(1, Number(e.target.value)), prop.available_tokens);
                                            setBuyAmount(val);
                                        }}
                                        className="w-full border border-slate-200 rounded-xl p-3 font-bold text-lg text-[#0F172A] focus:ring-2 focus:ring-[#009B9E] outline-none transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Tokens</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-t border-slate-50 mt-2">
                                <span className="font-bold text-slate-500 text-sm">Total:</span>
                                <span className="text-2xl font-bold text-[#009B9E]">${(buyAmount * tokenPrice).toFixed(2)}</span>
                            </div>

                            {!isAuthenticated && (
                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex gap-2 items-start text-xs text-orange-800 mb-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>You must be logged in to invest.</span>
                                </div>
                            )}

                            <button
                                onClick={handleBuy}
                                disabled={isSubmitting || prop.available_tokens === 0}
                                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center gap-2 ${isSubmitting || prop.available_tokens === 0
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                    : 'bg-[#009B9E] hover:bg-[#008B8E] text-white shadow-teal-500/20 hover:-translate-y-0.5'
                                    }`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (isAuthenticated ? 'Confirm Investment' : 'Login to Invest')}
                            </button>

                            <div className="text-center">
                                <span className="text-[10px] text-slate-400">Secure transaction via TerraVest</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}