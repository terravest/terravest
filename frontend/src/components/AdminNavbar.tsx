import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

export default function AdminNavbar() {
    const location = useLocation();
    const { logout } = useAuth();

    // Aktif sayfa kontrolü
    const isActive = (path: string) => {
        if (path === '/admin' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard' || location.pathname === '/admin/deposits')) {
            return true;
        }
        return location.pathname === path;
    };

    const getLinkClass = (path: string) => isActive(path)
        ? "bg-slate-700 text-white shadow-sm"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800";

    return (
        <nav className="bg-[#0F172A] text-white py-4 px-6 mb-6 mx-4 mt-4 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
                <span className="text-[#009B9E]">TerraVest</span> Admin
            </div>

            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg">
                <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium text-sm ${getLinkClass('/admin')}`}
                >
                    <LayoutDashboard size={16} /> Overview
                </Link>
                <Link
                    to="/admin/withdrawals"
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium text-sm ${getLinkClass('/admin/withdrawals')}`}
                >
                    <ArrowUpRight size={16} /> Withdrawals
                </Link>
                <Link
                    to="/admin/users"
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${location.pathname === '/admin/users'
                            ? 'bg-[#009B9E] text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <User size={16} /> Users
                </Link>
            </div>

            <button
                onClick={logout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg transition"
            >
                <LogOut size={16} /> Exit
            </button>
        </nav>
    );
}