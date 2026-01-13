import Navbar from '../components/Navbar';
import { ArrowRight, Building2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        // ARKA PLAN: Sıcak Kum Rengi (#F9F7F3)
        <div className="min-h-screen bg-[#F9F7F3] text-slate-800 font-sans">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative h-[600px] flex items-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Miami Real Estate"
                        className="w-full h-full object-cover"
                    />
                    {/* GRADIENT: Okyanus Turkuazından Şeffafa */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#009B9E]/90 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-white space-y-6">
                        <h6 className="text-[#F9F7F3] font-bold tracking-widest uppercase opacity-90">Ownership Reinvented</h6>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight drop-shadow-md">
                            Fractional and frictionless <br /> real estate investing.
                        </h1>
                        <p className="text-lg text-slate-100 max-w-lg font-medium">
                            For the first time, investors around the globe can buy into the Miami real estate market through fully-compliant, fractional, tokenized ownership.
                        </p>
                        <div className="flex gap-4 pt-4">
                            {/* BUTON: Canlı Mercan Rengi */}
                            <Link to="/login" className="bg-[#FF6B6B] hover:bg-[#E85555] text-white px-8 py-4 rounded-full font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-1">
                                Get Started <ArrowRight size={20} />
                            </Link>
                            <Link to="/marketplace" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 py-4 rounded-full font-bold transition backdrop-blur-sm">
                                View Properties
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STATS BAR */}
            {/* ARKA PLAN: Okyanus Turkuazı */}
            <section className="bg-[#009B9E] text-white py-12 border-t border-white/10 shadow-xl relative z-20 -mt-2 mx-4 rounded-xl">
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
                    <div className="p-4">
                        <h3 className="text-4xl font-bold text-white mb-2">65K+</h3>
                        <p className="text-white/80 uppercase tracking-wide text-sm font-semibold">Registered Investors</p>
                    </div>
                    <div className="p-4">
                        <h3 className="text-4xl font-bold text-white mb-2">$29M+</h3>
                        <p className="text-white/80 uppercase tracking-wide text-sm font-semibold">Income Distributed</p>
                    </div>
                    <div className="p-4">
                        <h3 className="text-4xl font-bold text-white mb-2">10-12%</h3>
                        <p className="text-white/80 uppercase tracking-wide text-sm font-semibold">Average Annual Return</p>
                    </div>
                </div>
            </section>

            {/* 3. FEATURED PROPERTIES (Preview) */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Latest Investment Opportunities</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Diversify your portfolio with premium Miami real estate assets. Start earning monthly rental income today.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <PropertyCard
                            image="https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            title="The Elser Hotel & Residences"
                            location="Downtown Miami, FL"
                            roi="9.2%"
                            price="$1,200,000"
                        />
                        <PropertyCard
                            image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            title="Aston Martin Residences"
                            location="Biscayne Blvd, Miami"
                            roi="11.5%"
                            price="$4,500,000"
                        />
                        <PropertyCard
                            image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            title="Cora Wynwood Lofts"
                            location="Wynwood Arts District"
                            roi="10.8%"
                            price="$850,000"
                        />
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/marketplace" className="text-[#009B9E] font-bold hover:text-[#007b7d] hover:underline text-lg transition-colors">
                            View All Properties &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. INFO / FEATURES */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-6">Real estate made simple.</h2>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                {/* İKON ARKA PLANI: Turkuaz */}
                                <div className="bg-[#009B9E] p-3 rounded-lg h-fit text-white shadow-lg shadow-teal-200">
                                    <Building2 />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-2 text-[#0F172A]">Fractional Ownership</h4>
                                    <p className="text-slate-600">Buy shares of a property starting from just $50. No need for a mortgage or banks.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-[#009B9E] p-3 rounded-lg h-fit text-white shadow-lg shadow-teal-200">
                                    <TrendingUp />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-2 text-[#0F172A]">Monthly Rental Income</h4>
                                    <p className="text-slate-600">Receive your share of the rent every month, directly to your digital wallet.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-[#009B9E] p-3 rounded-lg h-fit text-white shadow-lg shadow-teal-200">
                                    <Users />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-2 text-[#0F172A]">Hassle-Free Management</h4>
                                    <p className="text-slate-600">We handle the tenants, maintenance, and legal work. You just collect the rent.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <img src="https://realt.co/wp-content/uploads/2019/04/hero-block-stacking.png" alt="Tokenization" className="w-full drop-shadow-2xl" />
                    </div>
                </div>
            </section>
        </div>
    );
}

// Property Card Component
function PropertyCard({ image, title, location, roi, price }: any) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 border border-slate-100 group">
            <div className="relative h-64 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-4 right-4 bg-[#0F172A] text-white px-3 py-1 rounded-md text-sm font-bold shadow-md">
                    {roi} Expected Yield
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-[#0F172A] mb-1 group-hover:text-[#009B9E] transition-colors">{title}</h3>
                <p className="text-slate-500 text-sm mb-4">{location}</p>
                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                        <span className="text-xs text-slate-400 block uppercase font-semibold">Asset Value</span>
                        <span className="font-bold text-[#009B9E]">{price}</span>
                    </div>
                    <button className="text-[#FF6B6B] font-bold text-sm hover:text-[#E85555] hover:underline uppercase tracking-wide">View Details</button>
                </div>
            </div>
        </div>
    );
}