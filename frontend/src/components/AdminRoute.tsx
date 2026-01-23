import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}