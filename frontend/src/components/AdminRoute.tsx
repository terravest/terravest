import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    const { user, loading } = useAuth(); // AuthContext'ten gelen veriler

    // 1. Durum: Kullanıcı bilgisi henüz yükleniyorsa bekle
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        );
    }

    // 2. Durum: Kullanıcı YOKSA veya Rolü ADMIN DEĞİLSE -> Login'e at
    // (Not: user.role kontrolünü kaldırdım, şimdilik sadece giriş yapmış olması yeterli olsun diyorsan '&& user.role !== 'admin'' kısmını silebilirsin)
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    // 3. Durum: Her şey yolunda, sayfayı göster
    return <Outlet />;
}