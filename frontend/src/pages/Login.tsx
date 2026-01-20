import React, { useState, useEffect, useContext } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [identifierType, setIdentifierType] = useState<'email' | 'username'>('email');
    const [password, setPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate(getLink('/admin/dashboard'), { replace: true });
            } else {
                navigate(getLink('/'), { replace: true });
            }
        }
    }, [user, navigate, lang]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowResend(false);

        if (!turnstileToken) {
            toast.error(t.auth.loginBotError);
            return;
        }

        setIsLoading(true);
        toast.dismiss();

        try {
            const response = (await api.login({
                identifier,
                identifierType,
                password,
                turnstileToken,
                rememberMe,
                lang
            })) as any;

            if (response.token) {
                const userData = response.user || { email: '', id: 0, role: 'user', username: '' };
                login(response.token, userData, rememberMe);
                toast.success(t.auth.loginWelcome);

                if (userData.role === 'admin') {
                    navigate(getLink('/admin/dashboard'));
                } else {
                    navigate(getLink('/'));
                }
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = t.auth.loginFailed;
            const errorCode = error?.error || error?.message;

            if (errorCode === 'EMAIL_NOT_VERIFIED') {
                errorMessage = t.auth.email_not_verified_error;
                setShowResend(true);
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setTurnstileToken('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!identifier || !identifier.includes('@')) {
            toast.error(t.auth.email_verification_resend_missing);
            return;
        }
        setIsResending(true);
        try {
            await api.resendVerificationEmail({ email: identifier, lang });
            toast.success(t.auth.email_verification_sent);
        } catch (error) {
            toast.error(t.auth.email_verification_resend_failed);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            <div className="relative z-20"><Navbar /></div>

            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', }}>
                <div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">

                    <div className="text-center mb-8">
                        {/* LOGO EKLENDİ */}
                        <img
                            src="/logo.svg"
                            alt="TerraVest"
                            className="h-16 w-auto mx-auto mb-6 drop-shadow-lg"
                        />

                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                            {t.auth.loginTitlePrefix}
                            <span className="text-[#00E5FF]">{t.auth.loginTitleBrand}</span>
                        </h1>
                        <p className="text-gray-100">{t.auth.loginSubtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder={t.auth.loginIdentifierPlaceholder}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={identifier}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setIdentifier(value);
                                    setIdentifierType(value.includes('@') ? 'email' : 'username');
                                }}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder={t.auth.loginPasswordPlaceholder}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-200 cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-[#00E5FF] focus:ring-[#00E5FF] bg-black/20"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                {t.auth.rememberMe}
                            </label>
                            <Link to="#" className="text-[#00E5FF] hover:text-white transition-colors">{t.auth.forgotPassword}</Link>
                        </div>

                        <div className="flex justify-center min-h-[65px]">
                            <Turnstile
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "YOUR_SITE_KEY_HERE"}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onError={() => toast.error(t.auth.loginSecurityError)}
                                options={{
                                    theme: 'light',
                                    size: 'normal',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !turnstileToken}
                            className="w-full bg-[#FF6B6B] hover:bg-[#E85555] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (<Loader2 className="animate-spin h-5 w-5" />) : (<>{t.auth.loginButton} <ArrowRight className="h-5 w-5" /></>)}
                        </button>

                        {showResend && (
                            <div className="mt-4 rounded-lg border border-white/20 bg-black/20 p-4 text-sm text-gray-200">
                                <p className="mb-3">{t.auth.email_verification_required}</p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="w-full bg-[#00E5FF] hover:bg-[#00c4d9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A] font-bold py-2 rounded-lg shadow-lg"
                                >
                                    {isResending ? t.auth.email_verification_resend_loading : t.auth.email_verification_resend}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-200 text-sm">
                            {t.auth.loginNoAccount}
                            <Link to={getLink('/register')} className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors inline-block">{t.auth.loginRegisterLink}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}