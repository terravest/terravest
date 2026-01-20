import { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import { api } from '../lib/api';
import { Search, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';

interface Property {
    id: number;
    title: string;
    location: string;
    price_usd: number; // Stored in Cents
    total_tokens: number;
    available_tokens: number;
    rental_yield: string;
    image_url?: string;
    images?: { url: string }[];
}

export default function Marketplace() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const lang = useContext(LanguageContext);
    const t = content[lang];

    useEffect(() => {
        async function loadProperties() {
            try {
                const data = await api.getProperties();
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

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* Header & Search */}
            <div className="bg-[#0F172A] text-white pt-12 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#009B9E]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                        {t.marketplace.title}
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                        {t.marketplace.subtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white p-2 rounded-2xl shadow-xl max-w-2xl mx-auto flex items-center gap-2">
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
                        <button className="bg-[#009B9E] hover:bg-[#008B8E] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                            <SlidersHorizontal size={18} />
                            <span className="hidden md:inline">{t.marketplace.filters}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="container mx-auto max-w-7xl px-4 -mt-12 pb-20 relative z-20">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#009B9E]" size={40} />
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0F172A] mb-2">{t.marketplace.noResults}</h3>
                        <p className="text-slate-500">{t.marketplace.noResultsSubtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
}