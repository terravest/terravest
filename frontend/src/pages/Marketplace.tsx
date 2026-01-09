import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { Loader2, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import BuyModal from '../components/BuyModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Marketplace() {
    const { user, refreshUser } = useAuth(); // refreshUser'ı buradan çektik
    const navigate = useNavigate();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    // Mülkleri çeken fonksiyonu dışarı aldık ki tekrar çağırabilelim
    const fetchProperties = async () => {
        try {
            // setLoading(true); // Yükleniyor dönmesin, sessizce güncellesin
            const data = await api.getProperties();
            setProperties(data || []);
        } catch (err: any) {
            console.error("Marketplace Error:", err);
            setError(err.message || "Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleBuyClick = (property: any) => {
        if (!user) {
            toast.error("Please login to invest");
            navigate('/login');
            return;
        }
        setSelectedProperty(property);
        setIsBuyModalOpen(true);
    };

    const getTokenPrice = (property: any) => {
        if (property.price_per_token) return property.price_per_token;
        if (property.price && property.total_tokens) return property.price / property.total_tokens;
        return 0;
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <span className="text-[#009B9E] font-bold tracking-widest text-xs uppercase bg-[#009B9E]/10 px-3 py-1 rounded-full">
                        Live Opportunities
                    </span>
                    <h1 className="text-4xl font-extrabold text-[#0F172A] mt-3 mb-4">
                        Curated U.S. Properties
                    </h1>
                </div>

                {loading && (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#009B9E]" size={48} /></div>
                )}

                {error && (
                    <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle className="mx-auto mb-2" /> {error}
                    </div>
                )}

                {!loading && !error && properties.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <div key={property.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col h-full group">

                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute top-4 right-4 z-10 bg-[#009B9E] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                        {property.rental_yield}% Yield
                                    </div>
                                    <img
                                        src={property.image_url}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                    />
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-[#0F172A] mb-1 line-clamp-1">{property.title}</h3>
                                    <div className="flex items-center text-slate-500 text-sm mb-6">
                                        <MapPin size={16} className="mr-1 shrink-0" /> {property.location}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 bg-[#F9F7F3] p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Token Price</p>
                                            <p className="text-lg font-black text-[#0F172A]">
                                                ${getTokenPrice(property).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Available</p>
                                            <p className="text-lg font-black text-[#009B9E]">
                                                {property.available_tokens?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs font-bold mb-2 text-slate-500">
                                            <span>Sales Progress</span>
                                            <span>{Math.round(((property.total_tokens - property.available_tokens) / property.total_tokens) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-[#0F172A] h-2 rounded-full"
                                                style={{ width: `${((property.total_tokens - property.available_tokens) / property.total_tokens) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleBuyClick(property)}
                                        className="w-full mt-auto py-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                    >
                                        Buy Tokens <TrendingUp size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isBuyModalOpen && selectedProperty && (
                <BuyModal
                    property={selectedProperty}
                    onClose={() => setIsBuyModalOpen(false)}
                    onSuccess={async () => {
                        // 👇 KRİTİK GÜNCELLEME: Sayfayı yenileme, verileri güncelle
                        setIsBuyModalOpen(false);
                        toast.success("Investment successful!");

                        await refreshUser();     // 1. Bakiyeyi güncelle (Navbar)
                        await fetchProperties(); // 2. Kalan token sayısını güncelle (Liste)
                    }}
                />
            )}
        </div>
    );
}