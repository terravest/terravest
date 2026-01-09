import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, Bitcoin, MapPin, Globe, ArrowRight, Building2 } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-[#0F172A] py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Skyscrapers"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <span className="text-[#009B9E] font-bold tracking-widest uppercase text-sm mb-4 block animate-fade-in">
                        The American Dream, Democratized
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Your Gateway to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#FFD166]">
                            Bitcoin-Based Wealth
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Own a piece of the U.S. real estate market. We make investing accessible to everyone—without visas, bureaucracy, or banking barriers.
                    </p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 bg-[#F7931A] hover:bg-[#E0820A] text-white px-8 py-4 rounded-full font-bold transition shadow-lg shadow-orange-500/30">
                        Start Building Portfolio <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* --- STORY & MISSION SECTION --- */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Story */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Globe size={24} /></div>
                            <h2 className="text-3xl font-bold text-[#0F172A]">Our Story</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            TerraVest was born from a simple realization: <strong className="text-[#0F172A]">Talent is everywhere, but opportunity is not.</strong>
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            For decades, owning property in Miami or Orlando was a privilege reserved for the ultra-wealthy. For the average crypto investor, the dream of earning passive income from real world assets was blocked by complex laws and high capital requirements.
                        </p>
                        <p className="text-slate-600 leading-relaxed border-l-4 border-[#F7931A] pl-4 italic">
                            We built TerraVest to break these walls. By combining the stability of U.S. Real Estate with the power of Bitcoin, we allow you to build a global portfolio from the comfort of your home.
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="bg-[#0F172A] text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10"><Building2 size={150} /></div>

                        <h3 className="text-2xl font-bold mb-6 relative z-10">Our Mission</h3>
                        <p className="text-slate-300 text-lg leading-relaxed relative z-10 mb-8">
                            To democratize the American real estate market. We aim to empower every investor to hedge against inflation and secure their financial future through Bitcoin and real world assets.
                        </p>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-white/10 p-4 rounded-xl">
                                <span className="block text-2xl font-bold text-[#F7931A]">100%</span>
                                <span className="text-xs text-slate-400 uppercase">On-Chain</span>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl">
                                <span className="block text-2xl font-bold text-[#F7931A]">$50</span>
                                <span className="text-xs text-slate-400 uppercase">Min. Invest</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- WHY TERRAVEST (Features) --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Why Choose TerraVest?</h2>
                        <p className="text-slate-500">Security, Simplicity, and Bitcoin. The three pillars of our platform.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-[#F9F7F3] p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition duration-300">
                            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">1. U.S. Legal Protection</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Sleep soundly knowing your investment is safe. Every property is held in a U.S. LLC (Special Purpose Vehicle), giving you the security of the American legal system without the need for a Green Card.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#F9F7F3] p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition duration-300">
                            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                                <Bitcoin size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">2. Bitcoin Income</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Forget the bureaucracy. We handle property management and tenant sourcing. You simply collect your share of the rent, converted automatically to Bitcoin (BTC).
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#F9F7F3] p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition duration-300">
                            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">3. Tangible Assets</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We don't speculate. We focus on high-demand rental markets like Florida and Chicago. You are buying fractional shares of real houses with real tenants.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}