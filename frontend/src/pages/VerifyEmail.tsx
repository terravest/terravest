import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { LanguageContext } from '../App';
import { content } from '../content';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
    const lang = useContext(LanguageContext);
    const t = content[lang];
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<Status>('loading');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }

        let isMounted = true;
        const verify = async () => {
            try {
                await api.verifyEmail({ token, lang });
                sessionStorage.removeItem('pendingVerificationEmail');
                if (isMounted) setStatus('success');
            } catch (error) {
                if (isMounted) setStatus('error');
            }
        };

        verify();
        return () => {
            isMounted = false;
        };
    }, [searchParams, lang]);

    const message =
        status === 'loading'
            ? t.auth.email_verification_loading
            : status === 'success'
                ? t.auth.email_verification_success
                : t.auth.email_verification_expired;

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
                    <h1 className="text-3xl font-bold text-white mb-3">{t.auth.email_verification_title}</h1>
                    <p className="text-gray-100 mb-6">{message}</p>
                    <Link
                        to={lang === 'en' ? '/login' : `/${lang}/login`}
                        className="inline-block bg-[#00E5FF] hover:bg-[#00c4d9] text-[#0F172A] font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-[1.02]"
                    >
                        {t.auth.email_verification_login}
                    </Link>
                </div>
            </div>
        </div>
    );
}
