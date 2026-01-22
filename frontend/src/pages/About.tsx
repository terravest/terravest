import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Layers, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '../App';
import { content } from '../content';
import Footer from '../components/Footer';

export default function About() {
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* HERO */}
            <section className="bg-[#0F172A] py-24 px-4 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-6">{t.about.heroTitle}</h1>
                <p className="text-slate-300 max-w-3xl mx-auto text-lg">
                    {t.about.heroSubtitle}
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link to={getLink('/marketplace')} className="px-6 py-3 rounded-full bg-white text-[#0F172A] font-semibold">{t.about.heroCtaMarketplace}</Link>
                    <Link to={getLink('/register')} className="px-6 py-3 rounded-full bg-[#F7931A] text-white font-semibold">{t.about.heroCtaRegister}</Link>
                </div>
            </section>

            {/* INTRO TO TOKENIZED REAL ESTATE */}
            <section className="py-20 container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold mb-6">{t.about.introTitle}</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                    {t.about.introP1}
                </p>
                <p className="text-slate-600 leading-relaxed">
                    {t.about.introP2}
                </p>

                {/* SOFT CTA */}
                <div className="mt-10">
                    <Link to={getLink('/marketplace')} className="inline-flex items-center gap-2 font-semibold text-[#F7931A]">
                        {t.about.introCta} <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* WHAT IS ASSET TOKENIZATION */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <h2 className="text-3xl font-bold mb-6">{t.about.tokenizationTitle}</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        {t.about.tokenizationP1}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        {t.about.tokenizationP2}
                    </p>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <h2 className="text-3xl font-bold text-center mb-12">{t.about.benefitsTitle}</h2>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="bg-white p-6 rounded-2xl border">
                        <ShieldCheck className="text-[#009B9E] mb-3" />
                        <h3 className="font-bold mb-2">{t.about.benefits[0].title}</h3>
                        <p className="text-sm text-slate-600">{t.about.benefits[0].desc}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <Layers className="text-[#F7931A] mb-3" />
                        <h3 className="font-bold mb-2">{t.about.benefits[1].title}</h3>
                        <p className="text-sm text-slate-600">{t.about.benefits[1].desc}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <Globe className="text-[#00B3A4] mb-3" />
                        <h3 className="font-bold mb-2">{t.about.benefits[2].title}</h3>
                        <p className="text-sm text-slate-600">{t.about.benefits[2].desc}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <ArrowRight className="text-slate-500 mb-3" />
                        <h3 className="font-bold mb-2">{t.about.benefits[3].title}</h3>
                        <p className="text-sm text-slate-600">{t.about.benefits[3].desc}</p>
                    </div>
                </div>

                {/* MID CTA */}
                <div className="text-center mt-12">
                    <Link to={getLink('/marketplace')} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold">
                        {t.about.midCta} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* REAL ESTATE EXAMPLE */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <h2 className="text-3xl font-bold mb-6">{t.about.reTitle}</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        {t.about.reP1}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        {t.about.reP2}
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 text-center">
                <p className="text-slate-500 mb-6">{t.about.finalCtaText}</p>
                <div className="flex justify-center gap-4 mb-8">
                    <Link to={getLink('/register')} className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-full font-bold">
                        {t.about.finalCtaPrimary}
                    </Link>
                    <Link to={getLink('/marketplace')} className="inline-flex items-center gap-2 px-8 py-4 rounded-full border font-bold">
                        {t.about.finalCtaSecondary} <ArrowRight size={20} />
                    </Link>
                </div>

                {/* LEGAL / RISK DISCLOSURE (SHORT) */}
                <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    {t.about.legalDisclosure}
                </p>
            </section>
            <Footer />
        </div>
    );
}
