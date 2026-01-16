import React, { useState, useEffect, useContext } from 'react';
import { Mail, Lock, Loader2, Check, X, CheckCircle, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const getLink = (path: string) => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        if (lang === 'en') return normalized;
        return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
    };

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [passChecks, setPassChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_+\-=]/;

    useEffect(() => {
        setPassChecks({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: specialCharRegex.test(password)
        });
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        toast.dismiss();

        if (password !== confirmPassword) {
            toast.error(t.auth.toastRegisterMismatch);
            setIsLoading(false);
            return;
        }

        if (!Object.values(passChecks).every(Boolean)) {
            toast.error(t.auth.toastRegisterRequirements);
            setIsLoading(false);
            return;
        }

        try {
            // DÜZELTME BURADA: (await ...) as any diyerek TypeScript hatasını çözüyoruz
            const response = (await api.register({ email, username, password })) as any;

            if (response.token && response.user) {
                login(response.token, response.user, false);
                toast.success(t.auth.toastRegisterCreated);
                navigate(getLink('/'));
            } else {
                toast.success(t.auth.toastRegisterSuccessLogin);
                navigate(getLink('/login'));
            }

        } catch (error: any) {
            console.error("Registration Error:", error);
            let errorMessage = "Registration failed. Please try again.";

            if (error.error) {
                errorMessage = error.error;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            <div className="relative z-20"><Navbar /></div>

            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', }}>
                <div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">

                    <div className="text-center mb-6">
                        {/* LOGO EKLENDİ */}
                        <img
                            src="/logo.svg"
                            alt="TerraVest"
                            className="h-16 w-auto mx-auto mb-6 drop-shadow-lg"
                        />

                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{t.auth.registerTitlePrefix} <span className="text-[#00E5FF]">{t.auth.registerTitleBrand}</span></h1>
                        <p className="text-gray-100 mb-3">{t.auth.registerSubtitle}</p>
                        <div className="text-xs text-gray-200 space-y-1">
                            <p>* {t.auth.registerBullet1}</p>
                            <p>* {t.auth.registerBullet2}</p>
                            <p>* {t.auth.registerBullet3}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder={t.auth.registerUsernamePlaceholder}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-300">{t.auth.registerUsernameHint}</p>
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="email"
                                placeholder={t.auth.registerEmailPlaceholder}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder={t.auth.registerPasswordPlaceholder}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="bg-black/20 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2">{t.auth.registerPasswordRequirementsTitle}</p>
                            <RequirementItem met={passChecks.length} text={t.auth.registerRequirementLength} />
                            <RequirementItem met={passChecks.upper} text={t.auth.registerRequirementUpper} />
                            <RequirementItem met={passChecks.lower} text={t.auth.registerRequirementLower} />
                            <RequirementItem met={passChecks.number} text={t.auth.registerRequirementNumber} />
                            <RequirementItem met={passChecks.special} text={t.auth.registerRequirementSpecial} />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder={t.auth.registerConfirmPasswordPlaceholder}
                                className={`w-full bg-black/20 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-white/10 focus:ring-[#00E5FF]'}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword && (
                                <div className="absolute right-3 top-3.5">
                                    {password === confirmPassword ? (<CheckCircle className="text-green-400 h-5 w-5" />) : (<X className="text-red-400 h-5 w-5" />)}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#00E5FF] hover:bg-[#00c4d9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A] font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" /> {t.auth.registerButtonLoading}
                                </>
                            ) : t.auth.registerButton}
                        </button>
                    </form>

                    <p className="mt-4 text-[11px] text-gray-300 text-center leading-relaxed">
                        {t.auth.registerTerms}
                        <Link to={getLink('/learn')} className="underline hover:text-white ml-1">{t.auth.registerTermsLink}</Link>
                    </p>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-300 mb-2">{t.auth.registerTrustedBy}</p>
                        <p className="text-gray-200 text-sm">
                            {t.auth.registerHaveAccount}
                            <Link to={getLink('/login')} className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors inline-block ml-1">{t.auth.registerLoginLink}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-400'}`}>
            {met ? <Check size={14} strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500" />}
            <span>{text}</span>
        </div>
    );
}