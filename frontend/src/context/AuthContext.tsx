import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// User tipi
export interface User {
    id: number;
    email: string;
    username: string;
    usd_balance: number;
    role?: string;
    created_at?: string;
}

// Context tipi
interface AuthContextType {
    user: User | null;
    token: string | null;
    // login artık rememberMe parametresini de alıyor
    login: (token: string, user: User, rememberMe: boolean) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean; // ✅ EKLENDİ: AdminRoute hatasını çözmek için
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // 1. Başlangıçta her iki depolama alanını da kontrol et
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token') || sessionStorage.getItem('token')
    );

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Token nerede varsa oradan al
            const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

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
                        // Sadece yetki hatalarında (401/403) çıkış yap
                        if (res.status === 401 || res.status === 403) {
                            console.warn("🔒 Oturum süresi doldu.");
                            // Logout işlemini manuel yapıyoruz çünkü fonksiyon scope dışı
                            localStorage.removeItem('token');
                            sessionStorage.removeItem('token');
                            setToken(null);
                            setUser(null);
                        }
                    }
                } catch (error) {
                    console.error("🔥 Bağlantı hatası (Auth):", error);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // 2. Login fonksiyonu: Remember Me seçimine göre kayıt yeri belirler
    const login = (newToken: string, newUser: User, rememberMe: boolean) => {
        if (rememberMe) {
            localStorage.setItem('token', newToken);     // Kalıcı
            sessionStorage.removeItem('token');          // Çakışmayı önle
        } else {
            sessionStorage.setItem('token', newToken);   // Geçici (Sekme kapanınca gider)
            localStorage.removeItem('token');            // Çakışmayı önle
        }

        setToken(newToken);
        setUser(newUser);
    };

    // 3. Logout: Her yerden sil
    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
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
            console.error("Kullanıcı verisi yenilenemedi", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            isLoading: loading // ✅ State dışarıya verildi
        }}>
            {/* Loading sırasında boş ekran veya spinner dönebiliriz, 
                şimdilik sadece yükleme bitince çocukları gösteriyoruz */}
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