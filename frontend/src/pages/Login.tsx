import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile'; // 1. Turnstile import edildi

export default function Login() {
    const navigate = useNavigate();
    // login function now takes 3rd parameter (rememberMe)
    const { login, user } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // 2. New States
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [rememberMe, setRememberMe] = useState(false);

    // ✅ 1. SESSION CHECK
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [user, navigate]);

    // ✅ 2. LOGIN HANDLER
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Bot check (Don't proceed if token is missing)
        if (!turnstileToken) {
            toast.error("Please confirm you are not a robot🤖");
            return;
        }

        setIsLoading(true);
        toast.dismiss();

        try {
            // Send token and rememberMe info to API
            // Note: If api.login function type definition isn't updated, TS may warn,
            // but it works on JS side. It's good to update api.ts.
            const response = await api.login({
                identifier,
                password,
                turnstileToken,
                rememberMe
            } as any); // "as any" geçici çözüm, api.ts güncellenmeli

            if (response.token) {
                const userData = response.user || { email: '', id: 0, role: 'user', username: '' };

                // Inform AuthContext about "Remember Me" preference
                login(response.token, userData, rememberMe);

                toast.success("Welcome back! 👋");

                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = "Unsuccessful Login";

            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);

            // Resetting Turnstile on error may be a good practice
            // (Manual reset may be needed if library doesn't do it automatically)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            {/* Navbar */}
            <div className="relative z-20"><Navbar /></div>

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', }}>
                <div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div>
            </div>

            {/* Form Container */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Terra<span className="text-[#00E5FF]">Vest</span></h1>
                        <p className="text-gray-100">Login to access your portfolio</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Email or Username"
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>

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

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-200 cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-[#00E5FF] focus:ring-[#00E5FF] bg-black/20"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember Me
                            </label>
                            <Link to="#" className="text-[#00E5FF] hover:text-white transition-colors">Forgot Password</Link>
                        </div>

                        {/* Cloudflare Turnstile Widget */}
                        <div className="flex justify-center min-h-[65px]">
                            <Turnstile
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "YOUR_SITE_KEY_HERE"}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onError={() => toast.error("Security verification failed to load.")}
                                options={{
                                    theme: 'light',
                                    size: 'normal', // veya 'compact'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            // Disable button if token is missing (Force user)
                            disabled={isLoading || !turnstileToken}
                            className="w-full bg-[#FF6B6B] hover:bg-[#E85555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (<Loader2 className="animate-spin h-5 w-5" />) : (<>Login <ArrowRight className="h-5 w-5" /></>)}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-200 text-sm">
                            Don't have an account?
                            <Link to="/register" className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors inline-block">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}