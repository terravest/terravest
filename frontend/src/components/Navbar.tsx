import { Link, useNavigate } from 'react-router-dom';
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
    LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DepositModal from './DepositModal';

export default function Navbar() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Dropdown durumu
    const [accountOpen, setAccountOpen] = useState(false);

    // Admin Kontrolü (Role veya ID'ye göre)
    const isAdmin = user && ((user as any).role === 'admin' || (user as any).is_admin === 1);

    useEffect(() => {
        // User check log
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleManualRefresh = async () => {
        if (!refreshUser) return;
        setIsRefreshing(true);
        await refreshUser();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const navLinkClass = "flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#009B9E] transition";

    return (
        <>
            <nav className="bg-[#0F172A] text-white py-4 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                    {/* LOGO */}
                    <Link to="/" className="text-2xl font-black tracking-tight flex items-center gap-2 group shrink-0">
                        <div className="bg-[#009B9E] text-white p-1 rounded-lg group-hover:scale-110 transition">TV</div>
                        <span>Terra<span className="text-[#009B9E]">Vest</span></span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex items-center gap-8">

                        <Link to="/marketplace" className={navLinkClass}>
                            <ShoppingBag size={16} /> Marketplace
                        </Link>

                        <Link to="/about" className={navLinkClass}>
                            <Info size={16} /> About
                        </Link>

                        <Link to="/learn" className={navLinkClass}>
                            <BookOpen size={16} /> Learn
                        </Link>

                        {/* 🔥 MY ACCOUNT DROPDOWN */}
                        {user && (
                            <div
                                className="relative py-2"
                                onMouseEnter={() => setAccountOpen(true)}
                                onMouseLeave={() => setAccountOpen(false)}
                            >
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition border ${accountOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-300 hover:text-white'}`}>
                                    <User size={18} className={accountOpen ? "text-[#009B9E]" : ""} />
                                    My Account
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`absolute right-0 top-full pt-2 w-56 z-50 transform transition-all duration-200 origin-top-right ${accountOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>

                                    <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            <div className="px-4 py-3 border-b border-slate-700 mb-1">
                                                <p className="text-xs text-slate-400 uppercase font-bold">Signed in as</p>
                                                <p className="text-sm font-bold text-white truncate">{user.email || (user as any).username}</p>
                                            </div>

                                            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-[#009B9E] rounded-lg transition-colors">
                                                <LayoutDashboard size={16} /> Dashboard
                                            </Link>

                                            {/* --- ADMIN LINK (SADECE ADMINLERE) --- */}
                                            {isAdmin && (
                                                <Link to="/admin/properties" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 rounded-lg transition-colors">
                                                    <ShieldCheck size={16} /> Admin Panel
                                                </Link>
                                            )}

                                            <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-[#009B9E] rounded-lg transition-colors">
                                                <Settings size={16} /> Settings
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
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Balance</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-[#009B9E] tracking-wide">
                                                    ${(user as any).usd_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                                                </span>
                                                <button
                                                    onClick={handleManualRefresh}
                                                    className={`text-slate-500 hover:text-white transition ${isRefreshing ? 'animate-spin' : ''}`}
                                                    title="Refresh Balance"
                                                >
                                                    <RefreshCw size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsDepositOpen(true)}
                                            className="bg-[#009B9E] hover:bg-[#00888a] text-white p-1.5 rounded-full transition shadow-lg shadow-[#009B9E]/20"
                                            title="Deposit Funds"
                                            data-testid="deposit-button"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Log Out">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link to="/login" className="text-sm font-bold hover:text-[#009B9E] transition">Log In</Link>
                                <Link to="/register" className="bg-white text-[#0F172A] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition shadow-lg shadow-white/10">
                                    Get Started
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
                        <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <ShoppingBag size={20} className="text-[#009B9E]" /> Marketplace
                        </Link>

                        <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <Info size={20} className="text-[#009B9E]" /> About Us
                        </Link>
                        <Link to="/learn" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 text-slate-200 font-bold">
                            <BookOpen size={20} className="text-[#009B9E]" /> Learn
                        </Link>

                        {user ? (
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                <div className="space-y-2">
                                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl font-bold text-slate-200">
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>

                                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl font-bold text-slate-200">
                                        <Settings size={18} /> Settings
                                    </Link>
                                </div>

                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Wallet Balance</p>
                                        <p className="text-2xl font-bold text-[#009B9E]">
                                            ${(user as any).usd_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setIsDepositOpen(true); setMobileMenuOpen(false); }}
                                        className="bg-[#009B9E] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-[#009B9E]/20"
                                        data-testid="deposit-button"
                                    >
                                        + Deposit
                                    </button>
                                </div>

                                {isAdmin && (
                                    <Link to="/admin/properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-purple-500/10 text-purple-400 w-full py-3 rounded-xl font-bold border border-purple-500/20">
                                        <ShieldCheck size={18} /> Admin Panel
                                    </Link>
                                )}

                                <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-400 w-full py-3 font-bold hover:bg-red-400/10 rounded-xl transition">
                                    <LogOut size={18} /> Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="border border-white/20 text-white py-3 rounded-xl font-bold text-center hover:bg-white/5">Log In</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-[#009B9E] text-white py-3 rounded-xl font-bold text-center hover:bg-[#00888a]">Get Started</Link>
                            </div>
                        )}
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