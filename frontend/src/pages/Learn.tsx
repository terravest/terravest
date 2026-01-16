import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Search,
    FileKey,
    Zap,
    Bitcoin,
    HelpCircle,
    BookOpen,
    ArrowRight,
    Clock,
    Percent,
    ShieldCheck,
    Globe,
    Wallet,
    Layers,
    RefreshCcw,
    Lock,
    Calendar
} from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Learn() {
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    const whatIsIcons = [<Layers size={28} />, <Globe size={28} />, <Bitcoin size={28} />];
    const stepIcons = [<Search size={32} />, <FileKey size={32} />, <Clock size={32} />, <Calendar size={32} />];
    const walletIcons = [<Wallet size={26} />, <RefreshCcw size={26} />, <Lock size={26} />];

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* HERO */}
            <section className="bg-[#0F172A] py-24 px-4 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-6">
                    {t.learn.heroTitle}
                </h1>
                <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                    {t.learn.heroSubtitle}
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link to={getLink('/marketplace')} className="px-6 py-3 rounded-full bg-white text-[#0F172A] font-semibold">{t.learn.heroCtaMarketplace}</Link>
                    <Link to={getLink('/register')} className="px-6 py-3 rounded-full bg-[#F7931A] text-white font-semibold">{t.learn.heroCtaRegister}</Link>
                </div>
            </section>

            {/* WHAT IS TERRAVEST */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold">{t.learn.whatIsTitle}</h2>
                    <Link to={getLink('/about')} className="text-sm font-semibold text-[#F7931A] hover:underline">{t.learn.whatIsLink}</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {t.learn.whatIsItems.map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-[#F7931A] mb-4">{whatIsIcons[i]}</div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-slate-600 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHO CAN INVEST */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">{t.learn.whoCanInvestTitle}</h2>
                        <Link to={getLink('/register')} className="text-sm font-semibold text-[#F7931A] hover:underline">{t.learn.whoCanInvestLink}</Link>
                    </div>
                    <ul className="space-y-4 text-slate-600">
                        {t.learn.whoCanInvestItems.map((item, i) => (
                            <li key={i} className="flex gap-3">
                                <ShieldCheck className="text-[#009B9E]" size={18} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* PROCESS */}
            <section className="py-20 container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">{t.learn.processTitle}</h2>
                <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">
                    {t.learn.processSubtitle}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {t.learn.processSteps.map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-[#F7931A] mb-4">{stepIcons[index]}</div>
                            <h3 className="font-bold mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-600">{step.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link to={getLink('/marketplace')} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold">
                        {t.learn.processCta} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* WALLET */}
            <section className="bg-[#0F172A] py-20 px-4">
                <div className="container mx-auto max-w-5xl text-white">
                    <h2 className="text-3xl font-bold mb-10">{t.learn.walletTitle}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {t.learn.walletItems.map((w, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="text-[#00E5FF] mb-3">{walletIcons[i]}</div>
                                <h3 className="font-bold mb-2">{w.title}</h3>
                                <p className="text-sm text-gray-300">{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEES */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-5xl px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">{t.learn.feesTitle}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {t.learn.fees.map((fee, i) => (
                            <div key={i} className="bg-[#F9F7F3] p-8 rounded-2xl text-center border">
                                <div className="text-3xl font-black text-[#009B9E] mb-2">{fee.rate}</div>
                                <h3 className="font-bold mb-2">{fee.title}</h3>
                                <p className="text-sm text-slate-600">{fee.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GLOSSARY */}
            <section className="py-20 bg-[#F9F7F3]">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="text-[#F7931A]" />
                        <h2 className="text-3xl font-bold">{t.learn.glossaryTitle}</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {t.learn.glossary.map((g, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border">
                                <h4 className="font-bold mb-2">{g.term}</h4>
                                <p className="text-sm text-slate-600">{g.def}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LEGAL & RISK DISCLOSURE */}
            <section className="bg-white py-16 px-4 border-t">
                <div className="container mx-auto max-w-4xl text-center">
                    <h3 className="text-xl font-bold mb-4">{t.learn.legalTitle}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {t.learn.legalDesc}
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 text-center">
                <p className="text-slate-500 mb-6">{t.learn.finalCtaText}</p>
                <div className="flex justify-center gap-4">
                    <Link to={getLink('/marketplace')} className="inline-flex items-center gap-2 px-8 py-4 rounded-full border font-bold">
                        {t.learn.finalCtaMarketplace} <ArrowRight size={20} />
                    </Link>
                    <Link to={getLink('/register')} className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-full font-bold">
                        {t.learn.finalCtaRegister}
                    </Link>
                </div>
            </section>
        </div>
    );
}
