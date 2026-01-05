import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // Link eklendi
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Navbar'ı ekleyelim ki menü görünsün

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Context'teki login fonksiyonunu kullanıyoruz

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form Data State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            // --- LOGIN LOGIC ---
            // API'ye istek atıyoruz
            const response = await api.login({ email, password });

            // Eğer backend token dönerse giriş başarılıdır
            if (response.token) {
                // AuthContext'i güncelliyoruz
                login(response.token, response.user || { email, id: 0, role: 'user' });
                // Dashboard'a yönlendiriyoruz
                navigate('/dashboard');
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            {/* Navbar'ı en üste koyuyoruz */}
            <div className="relative z-20">
                <Navbar />
            </div>

            {/* Background Image (Miami Theme) - Navbar'ın altında kalsın diye z-0 */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div>
            </div>

            {/* Login Card Container - Ekranın ortasına hizalar */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                            Terra<span className="text-[#00E5FF]">Vest</span>
                        </h1>
                        <p className="text-gray-100">
                            Sign in to access your portfolio
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-white text-sm">
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Input */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FF6B6B] hover:bg-[#E85555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link (DÜZELTİLEN KISIM) */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-200 text-sm">
                            Don't have an account?
                            {/* Artık state değiştirmek yerine /register sayfasına yönlendiriyor */}
                            <Link
                                to="/register"
                                className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors inline-block"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}