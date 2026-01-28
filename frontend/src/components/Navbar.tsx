import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    LogOut,
    ShieldCheck,
    Menu,
    Plus,
    X,
    ShoppingBag,
    BookOpen,
    Info,
    RefreshCw,
    ChevronDown,
    Settings,
    LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import DepositModal from './DepositModal';
import { LanguageContext } from '../App';
import { content, type LangType } from '../content';
import { formatCurrency } from '../utils/format';

export default function Navbar() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [accountOpen, setAccountOpen] = useState(false);

    const isAdmin = user && ((user as any).role === 'admin' || (user as any).is_admin === 1);

    useEffect(() => {
        // User check log
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate(getLink('/'));
    };

    const handleManualRefresh = async () => {
        if (!refreshUser) return;
        setIsRefreshing(true);
        await refreshUser();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleLanguageChange = (selectedLang: LangType) => {
        localStorage.setItem('app_lang', selectedLang);
    };

    const navLinkClass = "flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#009B9E] transition";

    const prefixedLangs: LangType[] = ['pt-br', 'es', 'fr'];
    const languageOptions: Array<{ code: LangType; label: string }> = [
        { code: 'en', label: 'EN' },
        { code: 'pt-br', label: 'PT' },
        { code: 'es', label: 'ES' },
        { code: 'fr', label: 'FR' },
    ];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    const stripLangPrefix = (pathname: string) => {
        for (const prefix of prefixedLangs) {
            if (pathname === `/${prefix}`) return '/';
            if (pathname.startsWith(`/${prefix}/`)) {
                return pathname.replace(`/${prefix}`, '');
            }
        }
        return pathname;
    };

    const getLangSwitchLink = (targetLang: LangType) => {
        const basePath = stripLangPrefix(location.pathname);
        const suffix = `${basePath}${location.search}${location.hash}`;
        if (targetLang === 'en') return suffix || '/';
        return `/${targetLang}${suffix || '/'}`;
    };

    // 💰 BAKİYE HESAPLAMA (Cent -> Dolar)
    const displayBalance = user && (user as any).usd_balance ? (user as any).usd_balance / 100 : 0;

    return (
        <>
            {/* z-[100] ayarı korundu */}
            <nav className="bg-[#0F172A] text-white py-4 border-b border-white/10 sticky top-0 z-[100] backdrop-blur-md bg-opacity-95 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                    {/* LOGO */}
                    <Link to={getLink('/')} className="text-2xl font-black tracking-tight flex items-center gap-2 group shrink-0">
                        <img
                            src="/logo.svg"
                            alt="TerraVest Logo"
                            className="h-10 w-auto group-hover:scale-105 transition-transform duration-200"
                        />
                        <span>Terra<span className="text-[#009B9E]">Vest</span></span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex items-center gap-8">

                        <Link to={getLink('/marketplace')} className={navLinkClass}>
                            <ShoppingBag size={16} /> {t.navbar.marketplace}
                        </Link>

                        <Link to={getLink('/about')} className={navLinkClass}>
                            <Info size={16} /> {t.navbar.about}
                        </Link>

                        <Link to={getLink('/learn')} className={navLinkClass}>
                            <BookOpen size={16} /> {t.navbar.learn}
                        </Link>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            {languageOptions.map((option, index) => (
                                <span key={option.code} className="flex items-center gap-2">
                                    <Link
                                        to={getLangSwitchLink(option.code)}
                                        onClick={() => handleLanguageChange(option.code)}
                                        className={`hover:text-white transition ${lang === option.code ? 'text-white' : ''}`}
                                    >
                                        {option.label}
                                    </Link>
                                    {index < languageOptions.length - 1 && <span className="text-slate-600">|</span>}
                                </span>
                            ))}
                        </div>

                        {/* 🔥 MY ACCOUNT DROPDOWN */}
                        {user && (
                            <div
                                className="relative py-2"
                                onMouseEnter={() => setAccountOpen(true)}
                                onMouseLeave={() => setAccountOpen(false)}
                            >
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition border ${accountOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-300 hover:text-white'}`}>
                                    <User size={18} className={accountOpen ? "text-[#009B9E]" : ""} />
                                    {t.navbar.account}
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`absolute right-0 top-full pt-2 w-56 z-50 transform transition-all duration-200 origin-top-right ${accountOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>

                                    <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            <div className="px-4 py-3 border-b border-slate-700 mb-1">
                                                <p className="text-xs text-slate-400 uppercase font-bold">{t.navbar.signedInAs}</p>
                                                <p className="text-sm font-bold text-white truncate">{user.email || (user as any).username}</p>
                                            </div>

                                            <Link to={getLink('/dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-[#009B9E] rounded-lg transition-colors">
                                                <LayoutDashboard size={16} /> {t.navbar.dashboard}
                                            </Link>

                                            {/* Admin Panel Linki */}
                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin/dashboard"  // 👈 BURAYI DÜZELTİYORUZ (Eskiden properties idi)
                                                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={16} /> Admin Panel
                                                </Link>
                                            )}

                                            <Link to={getLink('/settings')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-[#009B9E] rounded-lg transition-colors">
                                                <Settings size={16} /> {t.navbar.settings}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEPARATOR */}
                        {user && <div className="h-6 w-px bg-white/10 mx-2"></div>}

                        {/* 💰 BALANCE & ACTIONS */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div
                                        className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:border-[#009B9E]/50 transition cursor-default"
                                        data-testid="header-balance"
                                    >
                                        <div className="flex flex-col items-end leading-none">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{t.navbar.balance}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-[#009B9E] tracking-wide">
                                                    {formatCurrency(displayBalance, lang)}
                                                </span>
                                                <button
                                                    onClick={handleManualRefresh}
                                                    className={`text-slate-500 hover:text-white transition ${isRefreshing ? 'animate-spin' : ''}`}
                                                    title={t.navbar.refreshBalance}
                                                >
                                                    <RefreshCw size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsDepositOpen(true)}
                                            className="bg-[#009B9E] hover:bg-[#00888a] text-white p-1.5 rounded-full transition shadow-lg shadow-[#009B9E]/20"
                                            title={t.navbar.deposit}
                                            data-testid="deposit-button"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title={t.navbar.logout}>
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link to={getLink('/login')} className="text-sm font-bold hover:text-[#009B9E] transition">{t.navbar.login}</Link>
                                <Link to={getLink('/register')} className="bg-white text-[#0F172A] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition shadow-lg shadow-white/10">
                                    {t.navbar.register}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-[#0F172A] border-t border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl z-50 min-h-screen">
                        <Link to={getLink('/marketplace')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <ShoppingBag size={20} className="text-[#009B9E]" /> {t.navbar.marketplace}
                        </Link>

                        <Link to={getLink('/about')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <Info size={20} className="text-[#009B9E]" /> {t.navbar.about}
                        </Link>
                        <Link to={getLink('/learn')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <BookOpen size={20} className="text-[#009B9E]" /> {t.navbar.learn}
                        </Link>

                        {user ? (
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                <div className="space-y-2">
                                    <Link to={getLink('/dashboard')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl font-bold text-slate-200">
                                        <LayoutDashboard size={18} /> {t.navbar.dashboard}
                                    </Link>

                                    <Link to={getLink('/settings')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl font-bold text-slate-200">
                                        <Settings size={18} /> {t.navbar.settings}
                                    </Link>
                                </div>

                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">{t.navbar.walletBalance}</p>
                                        <p className="text-2xl font-bold text-[#009B9E]">
                                            {formatCurrency(displayBalance, lang)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setIsDepositOpen(true); setMobileMenuOpen(false); }}
                                        className="bg-[#009B9E] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-[#009B9E]/20"
                                        data-testid="deposit-button"
                                    >
                                        + {t.navbar.deposit}
                                    </button>
                                </div>

                                {isAdmin && (
                                    <Link to={getLink('/admin/properties')} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-purple-500/10 text-purple-400 w-full py-3 rounded-xl font-bold border border-purple-500/20">
                                        <ShieldCheck size={18} /> {t.navbar.adminPanel}
                                    </Link>
                                )}

                                <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-400 w-full py-3 font-bold hover:bg-red-400/10 rounded-xl transition">
                                    <LogOut size={18} /> {t.navbar.logout}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Link to={getLink('/login')} onClick={() => setMobileMenuOpen(false)} className="border border-white/20 text-white py-3 rounded-xl font-bold text-center hover:bg-white/5">{t.navbar.login}</Link>
                                <Link to={getLink('/register')} onClick={() => setMobileMenuOpen(false)} className="bg-[#009B9E] text-white py-3 rounded-xl font-bold text-center hover:bg-[#00888a]">{t.navbar.register}</Link>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-400 pt-4 border-t border-white/10">
                            {languageOptions.map((option) => (
                                <Link
                                    key={option.code}
                                    to={getLangSwitchLink(option.code)}
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLanguageChange(option.code);
                                    }}
                                    className={`hover:text-white transition ${lang === option.code ? 'text-white' : ''}`}
                                >
                                    {option.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {isDepositOpen && (
                <DepositModal
                    onClose={() => setIsDepositOpen(false)}
                    onSuccess={() => {
                        if (refreshUser) refreshUser();
                        setIsDepositOpen(false);
                    }}
                />
            )}
        </>
    );
}