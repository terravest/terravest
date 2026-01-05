import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext yolunu kontrol et
import { User, LogOut, ShieldCheck, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-[#0F172A] text-white py-4 px-6 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            <div className="container mx-auto flex justify-between items-center">

                {/* LOGO */}
                <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    Terra<span className="text-[#009B9E]">Vest</span>
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/marketplace" className="text-sm font-medium hover:text-[#009B9E] transition">Marketplace</Link>
                    <Link to="/about" className="text-sm font-medium hover:text-[#009B9E] transition">About Us</Link>
                    <Link to="/learn" className="text-sm font-medium hover:text-[#009B9E] transition">Learn</Link>

                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            {/* Admin Link (Sadece Admin Görür) */}
                            {(user as any).role === 'admin' && (
                                <Link to="/admin" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 uppercase tracking-wide">
                                    <ShieldCheck size={14} /> Admin
                                </Link>
                            )}

                            {/* DÜZELTİLEN MY ACCOUNT BUTONU */}
                            <Link
                                to="/dashboard"
                                className="bg-[#009B9E] hover:bg-[#008B8E] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-teal-900/20 group"
                            >
                                <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition">
                                    <User size={16} />
                                </div>
                                <span>My Account</span>
                            </Link>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 transition p-2 hover:bg-white/5 rounded-lg"
                                title="Log Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <Link to="/login" className="text-sm font-bold hover:text-[#009B9E] transition">Log In</Link>
                            <Link to="/register" className="bg-white text-[#0F172A] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-lg shadow-white/10">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Menu size={24} />
                </button>
            </div>

            {/* MOBILE MENU (Basit Versiyon) */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#0F172A] border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link to="/marketplace" className="block py-2 hover:text-[#009B9E]">Marketplace</Link>
                    <Link to="/about" className="block py-2 hover:text-[#009B9E]">About Us</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block py-2 font-bold text-[#009B9E]">My Account</Link>
                            <button onClick={handleLogout} className="block py-2 text-red-400 text-left w-full">Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block py-2">Log In</Link>
                            <Link to="/register" className="block py-2 font-bold text-[#009B9E]">Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}