import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0F172A] text-slate-400 py-12 px-4 border-t border-slate-800 mt-auto">
            <div className="container mx-auto max-w-6xl text-center">
                {/* Yasal Uyarı Metni */}
                <p className="text-sm md:text-base mb-8 max-w-4xl mx-auto leading-relaxed opacity-80">
                    This website is provided for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or investment products. Past performance is not indicative of future results.
                </p>

                {/* Linkler */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 text-sm font-semibold tracking-wide">
                    <Link to="/privacy-policy" className="hover:text-[#009B9E] transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/terms-of-service" className="hover:text-[#009B9E] transition-colors">
                        Terms of Service
                    </Link>
                    <Link to="/disclaimer" className="hover:text-[#009B9E] transition-colors">
                        Disclaimer
                    </Link>
                    <Link to="/contact" className="hover:text-[#009B9E] transition-colors">
                        Contact
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