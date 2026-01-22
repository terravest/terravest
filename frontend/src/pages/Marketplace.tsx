import { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import { api } from '../lib/api';
import { Search, SlidersHorizontal, Loader2, AlertCircle, X, Percent, ChevronDown } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';
import Footer from '../components/Footer';

export interface Property {
    id: number;
    title: string;
    description?: string;
    location: string;
    price_usd: number;
    token_price: number;
    total_tokens: number;
    available_tokens: number;
    rental_yield: string;
    image_url?: string;
    images?: { url: string }[];
    status?: string;
    risk_score?: number;
    occupancy_rate?: number;
}

const PROPERTIES_PER_PAGE = 12; // İlk yüklemede 12 property göster

export default function Marketplace() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [displayCount, setDisplayCount] = useState(PROPERTIES_PER_PAGE);

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        minYield: '',
        sortBy: 'newest'
    });

    const lang = useContext(LanguageContext);
    const t = content[lang];

    useEffect(() => {
        async function loadProperties() {
            try {
                const data = await api.getProperties();
                console.log("📡 Marketplace Loaded:", data);
                if (Array.isArray(data)) {
                    setProperties(data);
                }
            } catch (error) {
                console.error("Failed to load properties", error);
            } finally {
                setLoading(false);
            }
        }
        loadProperties();
    }, []);

    const getYieldValue = (yieldStr: string) => {
        if (!yieldStr) return 0;
        const clean = yieldStr.toString().replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    };

    // ✅ DÜZELTME 1 & 2: Filtreleme + Sold Out mantığı
    const filteredProperties = properties
        .filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));

            const priceDollars = p.price_usd / 100;
            const minPriceVal = filters.minPrice ? parseFloat(filters.minPrice) : 0;
            const maxPriceVal = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
            const matchesPrice = priceDollars >= minPriceVal && priceDollars <= maxPriceVal;

            const yieldVal = getYieldValue(p.rental_yield);
            const minYieldVal = filters.minYield ? parseFloat(filters.minYield) : 0;
            const matchesYield = yieldVal >= minYieldVal;

            return matchesSearch && matchesPrice && matchesYield;
        })
        .sort((a, b) => {
            // 🔥 Önce available token durumuna göre ayır (sold out'lar en alta)
            const aAvailable = a.available_tokens > 0 ? 1 : 0;
            const bAvailable = b.available_tokens > 0 ? 1 : 0;
            if (aAvailable !== bAvailable) return bAvailable - aAvailable;

            // Sonra seçilen sıralamaya göre
            switch (filters.sortBy) {
                case 'price_asc': return a.price_usd - b.price_usd;
                case 'price_desc': return b.price_usd - a.price_usd;
                case 'token_price_asc': return a.token_price - b.token_price;
                case 'token_price_desc': return b.token_price - a.token_price;
                case 'yield_desc': return getYieldValue(b.rental_yield) - getYieldValue(a.rental_yield);
                case 'newest':
                default: return b.id - a.id;
            }
        });

    // ✅ DÜZELTME 3: Pagination için slice
    const displayedProperties = filteredProperties.slice(0, displayCount);
    const hasMore = displayCount < filteredProperties.length;

    const clearFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', minYield: '', sortBy: 'newest' });
        setSearchTerm('');
        setDisplayCount(PROPERTIES_PER_PAGE);
    };

    const loadMore = () => {
        setDisplayCount(prev => prev + PROPERTIES_PER_PAGE);
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            {/* Header & Search */}
            <div className="bg-[#0F172A] text-white pt-12 pb-32 px-4">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#009B9E]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                        {t.marketplace.title}
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                        {t.marketplace.subtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative z-[100]">
                        <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2">
                            <div className="bg-slate-100 p-3 rounded-xl text-slate-500">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder={t.marketplace.searchPlaceholder}
                                className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-lg font-medium px-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${showFilters ? 'bg-slate-200 text-slate-700' : 'bg-[#009B9E] hover:bg-[#008B8E] text-white'}`}
                            >
                                {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
                                <span className="hidden md:inline">{showFilters ? 'Close' : t.marketplace.filters}</span>
                            </button>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/20 z-[90]"
                                    onClick={() => setShowFilters(false)}
                                />

                                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-[100] text-left">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                💰 Property Price Range (USD)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={filters.minPrice}
                                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#009B9E]"
                                                />
                                                <span className="text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#009B9E]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                📊 Min Yield %
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 8"
                                                    value={filters.minYield}
                                                    onChange={(e) => setFilters({ ...filters, minYield: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#009B9E] pl-9"
                                                />
                                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                                🔄 Sort By
                                            </label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#009B9E] appearance-none"
                                            >
                                                <option value="newest">🆕 Newest Listed</option>
                                                <optgroup label="💰 Property Price">
                                                    <option value="price_asc">💰 Property: Low to High</option>
                                                    <option value="price_desc">💰 Property: High to Low</option>
                                                </optgroup>
                                                <optgroup label="🪙 Token Price">
                                                    <option value="token_price_asc">🪙 Token: Low to High</option>
                                                    <option value="token_price_desc">🪙 Token: High to Low</option>
                                                </optgroup>
                                                <option value="yield_desc">📈 Highest Yield</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                                        <button onClick={clearFilters} className="text-slate-400 text-sm hover:text-red-500 font-medium transition-colors">
                                            Clear All Filters
                                        </button>
                                        <div className="text-slate-500 text-sm font-bold">
                                            Showing {displayedProperties.length} of {filteredProperties.length} Properties
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="container mx-auto max-w-7xl px-4 -mt-12 pb-20 relative z-0">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#009B9E]" size={40} />
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayedProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>

                        {/* ✅ Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={loadMore}
                                    className="bg-[#009B9E] hover:bg-[#008B8E] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                                >
                                    <span>Load More Properties</span>
                                    <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                                        +{Math.min(PROPERTIES_PER_PAGE, filteredProperties.length - displayCount)}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0F172A] mb-2">{t.marketplace.noResults}</h3>
                        <p className="text-slate-500 mb-6">{t.marketplace.noResultsSubtitle}</p>
                        <button onClick={clearFilters} className="text-[#009B9E] font-bold hover:underline">
                            Clear filters & search
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}