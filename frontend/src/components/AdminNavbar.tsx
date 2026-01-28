import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Wallet, Users, ArrowLeft } from 'lucide-react';

export default function AdminNavbar() {
    const location = useLocation();

    // Hangi sekmenin aktif olduğunu belirleyen yardımcı fonksiyon
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4">

                {/* Üst Bar: Geri Dön ve Başlık */}
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm">
                            <ArrowLeft size={16} /> Exit Admin
                        </Link>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <span className="text-white font-bold tracking-wide">TERRAVEST ADMIN</span>
                    </div>
                </div>

                {/* Alt Bar: Sekmeler (Tabs) */}
                <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">

                    {/* 1. DASHBOARD */}
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${isActive('/admin/dashboard') || isActive('/admin')
                                ? 'border-[#009B9E] text-[#009B9E]'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                    >
                        <LayoutDashboard size={18} /> Overview
                    </Link>

                    {/* 2. USERS (YENİ EKLENEN KISIM) */}
                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${isActive('/admin/users')
                                ? 'border-[#009B9E] text-[#009B9E]'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                    >
                        <Users size={18} /> Users
                    </Link>

                    {/* 3. PROPERTIES */}
                    <Link
                        to="/admin/properties"
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${isActive('/admin/properties')
                                ? 'border-[#009B9E] text-[#009B9E]'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                    >
                        <Building2 size={18} /> Properties
                    </Link>

                    {/* 4. WITHDRAWALS */}
                    <Link
                        to="/admin/withdrawals"
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${isActive('/admin/withdrawals')
                                ? 'border-[#009B9E] text-[#009B9E]'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                    >
                        <Wallet size={18} /> Withdrawals
                    </Link>

                </div>
            </div>
        </div>
    );
}