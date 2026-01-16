import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, Building2, TrendingUp, ShieldCheck, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContext } from 'react';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Home() {
    const { user } = useAuth();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans pb-20">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-[#0F172A] py-24 overflow-hidden border-b border-white/5">
                {/* Background Effect */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt={t.home.heroBackgroundAlt}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#009B9E]/10 border border-[#009B9E]/20 text-[#009B9E] font-bold text-xs tracking-widest uppercase mb-6">
                        {t.home.heroBadge}
                    </span>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
                        {t.home.heroTitleLine1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009B9E] to-[#2DD4BF]">
                            {t.home.heroTitleHighlight}
                        </span> {t.home.heroTitleLine2}
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t.home.heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={getLink('/marketplace')}
                            className="w-full sm:w-auto bg-[#009B9E] hover:bg-[#00888a] text-white px-8 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-[#009B9E]/25 flex items-center justify-center gap-2"
                        >
                            {t.home.heroCtaPrimary} <ArrowRight size={20} />
                        </Link>
                        {!user && (
                            <Link
                                to={getLink('/register')}
                                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition backdrop-blur-sm"
                            >
                                {t.home.heroCtaSecondary}
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="bg-[#0F172A] border-b border-white/10 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <p className="text-3xl font-black text-white mb-1">$12M+</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Property Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white mb-1">2.5K+</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Investors</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white mb-1">8.5%</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg. Yield</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white mb-1">100%</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">On-Chain</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Why TerraVest?</h2>
                        <p className="text-slate-500 text-lg">
                            We've removed the barriers to entry. No banks, no paperwork, no hidden fees. Just pure ownership.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#F9F7F3] p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition">
                            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <Wallet size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">Monthly Rent Visibility</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Rental income accrues daily based on your tokens and becomes visible in your dashboard at the beginning of each month.
                            </p>
                        </div>

                        <div className="bg-[#F9F7F3] p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition">
                            <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">U.S. Legal Structure</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Each property is held by a dedicated U.S. LLC. Tokens represent indirect ownership rights, protected by U.S. property law.
                            </p>
                        </div>

                        <div className="bg-[#F9F7F3] p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition">
                            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                <TrendingUp size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-3">Secondary Market Liquidity</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Tokens can be sold on supported secondary markets, giving you flexibility without waiting months for a property sale.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#0F172A] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                            <Building2 size={400} />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Ready to build your portfolio?
                            </h2>
                            <p className="text-slate-400 mb-8 text-lg">
                                Start earning daily rental income with monthly clarity.
                            </p>
                            <Link
                                to="/marketplace"
                                className="inline-flex items-center gap-2 bg-[#009B9E] hover:bg-[#00888a] text-white px-8 py-4 rounded-full font-bold text-lg transition"
                            >
                                Start Investing Now <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
