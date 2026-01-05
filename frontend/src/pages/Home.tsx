import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { ArrowRight, Building2, Coins, Search, TrendingUp } from 'lucide-react';

export default function Home() {
    const [featuredProps, setFeaturedProps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeatured() {
            try {
                const data = await api.getProperties();
                // Backend'den gelen veriyi diziye çevir
                const list = Array.isArray(data) ? data : (data.results || []);

                // Veritabanındaki ilk 3 mülkü al
                setFeaturedProps(list.slice(0, 3));
            } catch (error) {
                console.error("Failed to load properties", error);
            } finally {
                setLoading(false);
            }
        }
        loadFeatured();
    }, []);

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-[#0F172A] text-white py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <img src="https://images.unsplash.com/photo-1560518883-3d13c477763e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover object-center scale-105" alt="Real Estate Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center lg:text-left">
                    <div className="lg:w-2/3">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#009B9E]/20 text-[#009B9E] text-sm font-bold mb-4 uppercase tracking-wider">
                            Future of Investing
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Invest in <span className="text-[#009B9E]">Real Estate</span> from just $50.
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 max-w-xl">
                            Own fractional shares of high-yield rental properties. Collect passive income via blockchain technology.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/register" className="bg-[#009B9E] hover:bg-[#008B8E] text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2">
                                Start Investing Now <ArrowRight size={20} />
                            </Link>
                            <Link to="/marketplace" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition backdrop-blur-sm flex items-center justify-center gap-2">
                                Browse Properties <Building2 size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">How TerraVest Works</h2>
                        <p className="text-slate-500 text-lg">Simple steps to start earning passive income.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                            <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600"><Search size={36} /></div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">1. Browse</h3>
                            <p className="text-slate-500">Find vetted rental properties.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                            <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600"><Coins size={36} /></div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">2. Buy Tokens</h3>
                            <p className="text-slate-500">Invest starting from $50.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                            <div className="bg-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600"><TrendingUp size={36} /></div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">3. Earn Rent</h3>
                            <p className="text-slate-500">Collect monthly passive income.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURED PROPERTIES --- */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Latest Opportunities</h2>
                            <p className="text-slate-500">Real properties from our marketplace.</p>
                        </div>
                        {/* BURASI HATA VERİYORDU - DÜZELTİLDİ: Sadece /marketplace'e gider, prop ID istemez */}
                        <Link to="/marketplace" className="text-[#009B9E] font-bold flex items-center gap-1 hover:underline">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12"><div className="animate-spin inline-block w-8 h-8 border-4 border-[#009B9E] border-t-transparent rounded-full"></div></div>
                    ) : featuredProps.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {featuredProps.map(prop => (
                                // BURASI 'prop' KULLANABİLİR, ÇÜNKÜ .map() İÇİNDE
                                <Link to={`/properties/${prop.id}`} key={prop.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition duration-300 block">
                                    <div className="h-64 overflow-hidden relative bg-gray-200">
                                        <img
                                            src={prop.image_url || `https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&sig=${prop.id}`}
                                            alt={prop.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        />
                                        <div className="absolute top-4 right-4 bg-[#0F172A] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
                                            {prop.monthly_yield ? `$${prop.monthly_yield}/mo Rent` : 'High Yield'}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-[#0F172A] mb-1 group-hover:text-[#009B9E] transition">{prop.title}</h3>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-1">{prop.description}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <div>
                                                <span className="text-xs text-slate-400 block uppercase font-bold">ASSET VALUE</span>
                                                <span className="text-lg font-bold text-[#009B9E]">${prop.price_usd?.toLocaleString()}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 group-hover:text-[#009B9E] transition uppercase tracking-wide">VIEW DETAILS</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400 mb-4">No active properties found.</p>
                            <Link to="/admin" className="text-[#009B9E] font-bold underline">Go to Admin to Add Properties</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-20 bg-[#009B9E] text-center text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to build wealth?</h2>
                    <Link to="/register" className="bg-white text-[#009B9E] px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition">Create Free Account</Link>
                </div>
            </section>
        </div>
    );
}