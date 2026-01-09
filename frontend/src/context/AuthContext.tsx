import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    username: string;
    usd_balance: number;
    role?: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    const url = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8787/api"}/auth/me`;

                    const res = await fetch(url, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });

                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        setToken(storedToken);
                    } else {
                        // 🚨 KRİTİK DÜZELTME: Sadece 401 (Yetkisiz) ise çıkış yap
                        // Sunucu hatası (500) veya başka bir şeyse oturumu kapatma.
                        if (res.status === 401 || res.status === 403) {
                            console.warn("🔒 Token süresi dolmuş, çıkış yapılıyor.");
                            logout();
                        } else {
                            console.warn(`⚠️ Sunucu yanıt vermedi (${res.status}), ama oturum kapatılmadı.`);
                        }
                    }
                } catch (error) {
                    console.error("🔥 Bağlantı hatası:", error);
                    // İnternet koptuğunda kullanıcıyı atmayalım
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8787/api"}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Kullanıcı yenilenemedi", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}