import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Loader2, Check, X, CheckCircle, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
// 1. IMPORT
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();

    // ... (State tanımları aynı kalıyor) ...
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [errorMessage, setErrorMessage] = useState<string | null>(null); // BUNU KALDIRABİLİRSİN, ARTIK TOAST VAR

    // ... (Regex ve useEffect kısımları aynı) ...
    const [passChecks, setPassChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

        // 2. Alertler ve SetError yerine Toast kullanıyoruz
        if (!username || username.length < 3) {
            toast.error("Username must be at least 3 characters long.");
            return;
        }

        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (!Object.values(passChecks).every(Boolean)) {
            toast.error("Password does not meet all requirements.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            await api.register({ email, username, password });

            // 3. BAŞARILI MESAJI
            toast.success("Account created successfully! Redirecting to login...");

            // Kullanıcı mesajı okusun diye 1.5 saniye bekletip öyle yönlendirebiliriz
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error: any) {
            // 4. HATA MESAJI
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // ... (Render kısmı aynı, sadece errorMessage gösteren div'i kaldırabilirsin çünkü artık popup çıkacak) ...
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            {/* ... Navbar ve Arka Plan kodları aynı ... */}
            <div className="relative z-20"><Navbar /></div>
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', }}><div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div></div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">

                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Join Terra<span className="text-[#00E5FF]">Vest</span></h1>
                        <p className="text-gray-100">Create your account to start investing</p>
                    </div>

                    {/* Hata mesajı divini sildim çünkü toast kullanıyoruz */}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* ... Inputlar aynı ... */}
                        <div className="relative"><User className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" /><input type="text" placeholder="Username" className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
                        <div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" /><input type="email" placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" /><input type="password" placeholder="Password" className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

                        {/* Checklist aynı */}
                        <div className="bg-black/20 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2">Password Requirements:</p>
                            <RequirementItem met={passChecks.length} text="At least 8 characters" />
                            <RequirementItem met={passChecks.upper} text="At least one uppercase letter (A-Z)" />
                            <RequirementItem met={passChecks.lower} text="At least one lowercase letter (a-z)" />
                            <RequirementItem met={passChecks.number} text="At least one number (0-9)" />
                            <RequirementItem met={passChecks.special} text="At least one special character (!@#$)" />
                        </div>

                        <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-300" /><input type="password" placeholder="Confirm Password" className={`w-full bg-black/20 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-white/10 focus:ring-[#00E5FF]'}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />{confirmPassword && (<div className="absolute right-3 top-3.5">{password === confirmPassword ? (<CheckCircle className="text-green-400 h-5 w-5" />) : (<X className="text-red-400 h-5 w-5" />)}</div>)}</div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#00E5FF] hover:bg-[#00c4d9] text-[#0F172A] font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-2">{isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}</button>
                    </form>

                    <div className="mt-6 text-center"><p className="text-gray-200 text-sm">Already have an account?<Link to="/login" className="text-[#00E5FF] hover:text-white font-semibold ml-2 transition-colors">Log In</Link></p></div>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (<div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-400'}`}>{met ? <Check size={14} strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500" />}<span>{text}</span></div>);
}