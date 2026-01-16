import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import PropertyGallery from '../components/PropertyGallery';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Loader2, ArrowLeft, MapPin, AlertCircle, TrendingUp } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    const [prop, setProp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buyAmount, setBuyAmount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                if (id) {
                    // Updated endpoint in backend (returns images as array)
                    const property = await api.getProperty(id);
                    setProp(property);
                } else {
                    // If no ID, return to list
                    navigate(getLink('/marketplace'));
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
            navigate(getLink('/login'));
            return;
        }

        if (!prop) return;

        setIsSubmitting(true);
        try {
            await api.createOrder({
                propertyId: prop.id,
                tokenAmount: buyAmount,
            });

            alert(t.propertyDetails.orderCreated);
            navigate(getLink('/dashboard'));

        } catch (e: any) {
            alert(e.message || t.propertyDetails.orderFailed);
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
            <div className="text-xl font-bold text-slate-700">{t.propertyDetails.notFound}</div>
            <Link to={getLink('/marketplace')} className="text-[#009B9E] hover:underline">{t.propertyDetails.backToMarketplace}</Link>
        </div>
    );

    const tokenPrice = prop.price_usd / prop.total_tokens;
    const yieldLabel = (() => {
        if (prop.rental_yield === null || prop.rental_yield === undefined) return t.propertyDetails.notAvailable;
        if (typeof prop.rental_yield === 'number') {
            const normalized = prop.rental_yield > 1 ? prop.rental_yield / 100 : prop.rental_yield;
            return formatPercent(normalized, lang);
        }
        if (typeof prop.rental_yield === 'string') {
            return prop.rental_yield.includes('%') ? prop.rental_yield : `${prop.rental_yield}%`;
        }
        return t.propertyDetails.notAvailable;
    })();

    // --- IMAGE PREPARATION ---
    // If 'images' array comes from backend, use it, otherwise make 'image_url' a single-element array.
    const images = prop.images && prop.images.length > 0
        ? prop.images
        : (prop.image_url ? [{ id: null, url: prop.image_url, isMain: true, displayOrder: 0 }] : []);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <Link to={getLink('/marketplace')} className="text-slate-500 hover:text-[#009B9E] flex items-center gap-2 mb-3 text-sm font-bold transition-colors w-fit">
                        <ArrowLeft size={16} /> {t.propertyDetails.backToMarket}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#009B9E] text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                    {t.propertyDetails.tokenizedAsset}
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <MapPin size={14} />
                                    <span className="text-xs font-bold uppercase">{prop.location || t.propertyDetails.locationFallback}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">{prop.title}</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                            <span className="text-slate-400 text-xs font-bold uppercase">{t.propertyDetails.estYield}</span>
                            <span className="text-xl font-bold text-[#009B9E] flex items-center gap-1">
                                <TrendingUp size={18} />{' '}
                                {yieldLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN (GALLERY & DETAILS) --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* GALLERY COMPONENT */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <PropertyGallery images={images} propertyTitle={prop.title} />
                    </div>

                    {/* FINANCIAL SUMMARY BAR */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-50">
                        <div className="pl-2">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t.propertyDetails.assetValue}</span>
                            <span className="text-lg md:text-xl font-bold text-[#0F172A]">
                                {formatCurrency(prop.price_usd, lang)}
                            </span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t.propertyDetails.tokenPrice}</span>
                            <span className="text-lg md:text-xl font-bold text-[#009B9E]">
                                {formatCurrency(tokenPrice, lang)}
                            </span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t.propertyDetails.totalTokens}</span>
                            <span className="text-lg md:text-xl font-bold text-[#0F172A]">
                                {formatNumber(prop.total_tokens, lang)}
                            </span>
                        </div>
                        <div className="pl-6">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{t.propertyDetails.available}</span>
                            <span className={`text-lg md:text-xl font-bold ${prop.available_tokens > 0 ? 'text-[#0F172A]' : 'text-red-500'}`}>
                                {formatNumber(prop.available_tokens, lang)}
                            </span>
                        </div>
                    </div>

                    {/* DESCRIPTION AND ITEMS */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                            <FileText className="text-[#009B9E]" /> {t.propertyDetails.investmentSummary}
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base whitespace-pre-line">
                            {prop.description}
                        </p>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-[#0F172A] mb-4 text-sm uppercase tracking-wide">{t.propertyDetails.propertyHighlights}</h4>
                            <ul className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> {t.propertyDetails.highlight1}</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> {t.propertyDetails.highlight2}</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> {t.propertyDetails.highlight3}</li>
                                <li className="flex gap-2.5 items-start"><CheckCircle size={18} className="text-[#009B9E] shrink-0 mt-0.5" /> {t.propertyDetails.highlight4}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN (INVESTMENT CARD - STICKY) --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-28">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#0F172A]">{t.propertyDetails.investTitle}</h3>
                            <p className="text-slate-500 text-xs mt-1">{t.propertyDetails.investSubtitle}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">{t.propertyDetails.tokenPrice}</span>
                                <span className="font-bold text-[#0F172A]">{formatCurrency(tokenPrice, lang)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">{t.propertyDetails.available}</span>
                                <span className="font-bold text-[#0F172A]">{formatNumber(prop.available_tokens, lang)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{t.propertyDetails.amountTokens}</label>
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
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{t.propertyDetails.tokensLabel}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-t border-slate-50 mt-2">
                                <span className="font-bold text-slate-500 text-sm">{t.propertyDetails.total}</span>
                                <span className="text-2xl font-bold text-[#009B9E]">
                                    {formatCurrency(buyAmount * tokenPrice, lang)}
                                </span>
                            </div>

                            {!isAuthenticated && (
                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex gap-2 items-start text-xs text-orange-800 mb-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{t.propertyDetails.loginToInvest}</span>
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
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (isAuthenticated ? t.propertyDetails.confirmInvestment : t.propertyDetails.loginToInvestButton)}
                            </button>

                            <div className="text-center">
                                <span className="text-[10px] text-slate-400">{t.propertyDetails.secureTransaction}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}