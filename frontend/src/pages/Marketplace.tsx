import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Yönlendirme için Link eklendi
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { Building2, Search, Loader2 } from 'lucide-react';

export default function Marketplace() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getProperties();

                // 1. Veriyi güvenli şekilde al
                const list = Array.isArray(data) ? data : (data.results || []);

                // 2. Konsola yazdır (Kontrol amaçlı)
                console.log("Marketplace Verileri:", list);

                // 3. Listeyi ayarla
                setProperties(list);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredProps = properties.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A]">Marketplace</h1>
                        <p className="text-slate-500 mt-1">Discover high-yield rental properties.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009B9E] transition"
                            placeholder="Search properties..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#009B9E]" /></div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProps.map(prop => (
                            <div key={prop.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition duration-300 group flex flex-col h-full">

                                {/* RESİM ALANI - Tıklayınca Detaya Gider */}
                                <Link to={`/properties/${prop.id}`} className="h-64 overflow-hidden relative bg-slate-200 block">
                                    <img
                                        src={prop.image_url || `https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&sig=${prop.id}`}
                                        alt={prop.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-[#0F172A] flex items-center gap-1 shadow-sm">
                                        <Building2 size={12} /> Real Estate
                                    </div>
                                    {/* Stok Durumu */}
                                    <div className="absolute bottom-4 right-4 bg-[#0F172A]/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                        {prop.available_tokens} Tokens Left
                                    </div>
                                </Link>

                                {/* İÇERİK */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <Link to={`/properties/${prop.id}`}>
                                        <h3 className="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#009B9E] transition">{prop.title}</h3>
                                    </Link>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{prop.description}</p>

                                    {/* Detaylar */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <span className="text-xs text-slate-400 block uppercase font-bold">Asset Price</span>
                                            <span className="text-lg font-bold text-[#0F172A]">${prop.price_usd?.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <span className="text-xs text-green-600 block uppercase font-bold">Monthly Yield</span>
                                            <span className="text-lg font-bold text-green-700">${prop.monthly_yield || 0}</span>
                                        </div>
                                    </div>

                                    {/* BUTON - Tıklayınca Detaya Gider */}
                                    <Link
                                        to={`/properties/${prop.id}`}
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
                                    >
                                        View Details & Invest
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {filteredProps.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                                No properties found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}