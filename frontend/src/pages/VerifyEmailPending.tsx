import React, { useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function VerifyEmailPending() {
    const lang = useContext(LanguageContext);
    const t = content[lang];
    const location = useLocation();
    const [isSending, setIsSending] = useState(false);

    const email = useMemo(() => {
        const stateEmail = (location.state as any)?.email;
        return stateEmail || sessionStorage.getItem('pendingVerificationEmail') || '';
    }, [location.state]);

    const handleResend = async () => {
        if (!email) {
            toast.error(t.auth.email_verification_resend_missing);
            return;
        }

        setIsSending(true);
        try {
            await api.resendVerificationEmail({ email, lang });
            toast.success(t.auth.email_verification_sent);
        } catch (error: any) {
            toast.error(t.auth.email_verification_resend_failed);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F9F7F3]">
            <div className="relative z-20"><Navbar /></div>

            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-[#009B9E]/80 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <div className="w-full max-w-lg p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl text-center">
                    <img
                        src="/logo.svg"
                        alt="TerraVest"
                        className="h-16 w-auto mx-auto mb-6 drop-shadow-lg"
                    />
                    <h1 className="text-3xl font-bold text-white mb-3">{t.auth.email_verification_required}</h1>
                    <p className="text-gray-100 mb-6">{t.auth.email_verification_pending_body}</p>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isSending}
                        className="w-full bg-[#00E5FF] hover:bg-[#00c4d9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A] font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02]"
                    >
                        {isSending ? t.auth.email_verification_resend_loading : t.auth.email_verification_resend}
                    </button>
                </div>
            </div>
        </div>
    );
}
