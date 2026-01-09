import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // ✅ 1. SESSION CHECK (Redirect if already logged in)
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true }); // Users go to Home or Dashboard
            }
        }
    }, [user, navigate]);

    // ✅ 2. LOGIN HANDLER
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Clear any previous toasts to avoid clutter
        toast.dismiss();

        try {
            const response = await api.login({ identifier, password });

            if (response.token) {
                // Update Auth Context
                const userData = response.user || { email: '', id: 0, role: 'user', username: '' };
                login(response.token, userData);

                toast.success("Welcome back! 👋");

                // ✨ SMART REDIRECT (Based on Role)
                if (userData.role === 'admin') {
                    console.log("👑 Admin Login -> Redirecting to Panel");
                    navigate('/admin/dashboard');
                } else {
                    console.log("👤 User Login -> Redirecting to Home");
                    navigate('/');
                }
            }
        } catch (error: any) {
            console.error("Login Error:", error);

            // 🛡️ ROBUST ERROR HANDLING
            // Determine the best error message to show
            let errorMessage = "Invalid email or password."; // Default fallback

            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.error) {
                // Backend often sends { error: "Message" }
                errorMessage = error.error;
            } else if (error.message) {
                // Standard Error object
                errorMessage = error.message;
            }

            // Show the error toast
            toast.error(errorMessage);
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
                        <p className="text-gray-100">Sign in to access your portfolio</p>
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FF6B6B] hover:bg-[#E85555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (<Loader2 className="animate-spin h-5 w-5" />) : (<>Sign In <ArrowRight className="h-5 w-5" /></>)}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-200 text-sm">
                            Don't have an account?
                            <Link to="/register" className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors inline-block">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}