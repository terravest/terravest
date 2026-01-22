import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    return (
        <footer className="bg-[#0F172A] text-slate-400 py-12 px-4 border-t border-slate-800 mt-auto">
            <div className="container mx-auto max-w-6xl text-center">
                <p className="text-sm md:text-base mb-8 max-w-4xl mx-auto leading-relaxed opacity-80">
                    {t.footer.disclaimerText}
                </p>

                <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 text-sm font-semibold tracking-wide">
                    <Link to={getLink('/privacy-policy')} className="hover:text-[#009B9E] transition-colors">
                        {t.footer.privacy}
                    </Link>
                    <Link to={getLink('/terms-of-service')} className="hover:text-[#009B9E] transition-colors">
                        {t.footer.terms}
                    </Link>
                    <Link to={getLink('/disclaimer')} className="hover:text-[#009B9E] transition-colors">
                        {t.footer.disclaimer}
                    </Link>
                    <Link to={getLink('/contact')} className="hover:text-[#009B9E] transition-colors">
                        {t.footer.contact}
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-xs text-slate-500 font-medium">
                    &copy; {currentYear} TerraVest
                </div>
            </div>
        </footer>
    );
}