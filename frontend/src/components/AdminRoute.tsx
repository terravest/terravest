import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    // DÜZELTME: AuthContext'ten 'loading' yerine 'isLoading' çekiyoruz
    const { user, isLoading } = useAuth();

    // 1. Durum: Kullanıcı bilgisi henüz yükleniyorsa bekle
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        );
    }

    // 2. Durum: Kullanıcı YOKSA veya Rolü ADMIN DEĞİLSE -> Login'e at
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    // 3. Durum: Her şey yolunda, alt rotaları (Outlet) göster
    return <Outlet />;
}