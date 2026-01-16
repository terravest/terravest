import { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
    Bell, Lock, Shield, Mail,
    CheckCircle, Save, Loader2, Wallet, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Settings() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const lang = useContext(LanguageContext);
    const t = content[lang];

    // --- FORM STATES ---
    // 1. Password
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // 2. Notifications
    const [notifications, setNotifications] = useState({
        email: true,
        security: true,
        marketing: false
    });

    // 3. Wallet Address
    const [savedAddress, setSavedAddress] = useState('');
    const [isAddressEditing, setIsAddressEditing] = useState(false);

    // --- HANDLERS ---

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new.length < 8) return toast.error(t.settings.toastPasswordTooShort);
        if (passwords.new !== passwords.confirm) return toast.error(t.settings.toastPasswordMismatch);

        setIsLoading(true);
        try {
            // API cagrisi
            await api.changePassword(passwords.new);
            toast.success(t.settings.toastPasswordUpdated);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast.error(error.message || t.settings.toastPasswordUpdateFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success(t.settings.toastPreferenceUpdated);
    };

    const saveWalletAddress = () => {
        // Burada normalde API'ye istek atilir
        if (savedAddress.length < 10) return toast.error(t.settings.toastInvalidAddress);
        setIsAddressEditing(false);
        toast.success(t.settings.toastAddressSaved);
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] pb-20 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0F172A]">{t.settings.title}</h1>
                    <p className="text-slate-500 mt-1">{t.settings.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN (Profile & Status) --- */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                                <span className="text-3xl font-bold">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#0F172A]">{user?.username}</h2>
                            <p className="text-slate-500 text-sm mb-4">{user?.email}</p>

                            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                <CheckCircle size={14} /> {t.settings.verifiedInvestor}
                            </div>
                        </div>

                        {/* KYC / Limits Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-[#009B9E]" /> {t.settings.accountLimits}
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">{t.settings.depositLimit}</span>
                                    <span className="font-bold text-slate-700">{t.settings.depositLimitValue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">{t.settings.withdrawalLimit}</span>
                                    <span className="font-bold text-slate-700">{t.settings.withdrawalLimitValue}</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button className="text-[#009B9E] font-bold text-xs hover:underline">
                                        {t.settings.requestHigherLimits} &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN (Settings Forms) --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. NOTIFICATIONS */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Bell size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg">{t.settings.notificationsTitle}</h3>
                                    <p className="text-xs text-slate-500">{t.settings.notificationsSubtitle}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition">
                                    <div className="flex items-center gap-3">
                                        <Mail size={18} className="text-slate-400" />
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{t.settings.emailAlerts}</p>
                                            <p className="text-xs text-slate-400">{t.settings.emailAlertsDesc}</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => toggleNotification('email')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications.email ? 'bg-[#009B9E]' : 'bg-slate-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications.email ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-slate-400" />
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{t.settings.securityAlerts}</p>
                                            <p className="text-xs text-slate-400">{t.settings.securityAlertsDesc}</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => toggleNotification('security')}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications.security ? 'bg-[#009B9E]' : 'bg-slate-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications.security ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SECURITY & PASSWORD */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Lock size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg">{t.settings.securityTitle}</h3>
                                    <p className="text-xs text-slate-500">{t.settings.securitySubtitle}</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.settings.newPassword}</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#009B9E] transition"
                                        placeholder={t.settings.passwordPlaceholder}
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.settings.confirmNewPassword}</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#009B9E] transition"
                                        placeholder={t.settings.passwordPlaceholder}
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#0F172A] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {t.settings.updatePassword}</>}
                                </button>
                            </form>
                        </div>

                        {/* 3. SAVED WALLET ADDRESS (NEW FEATURE) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Wallet size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg">{t.settings.withdrawalAddressTitle}</h3>
                                    <p className="text-xs text-slate-500">{t.settings.withdrawalAddressSubtitle}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    disabled={!isAddressEditing}
                                    className={`flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#009B9E] transition ${!isAddressEditing && 'text-slate-500 bg-slate-100'}`}
                                    placeholder={t.settings.withdrawalAddressPlaceholder}
                                    value={savedAddress}
                                    onChange={e => setSavedAddress(e.target.value)}
                                />
                                {isAddressEditing ? (
                                    <button onClick={saveWalletAddress} className="bg-[#009B9E] text-white p-3 rounded-lg hover:bg-[#00888a] transition">
                                        <Save size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsAddressEditing(true)} className="bg-slate-200 text-slate-600 p-3 rounded-lg hover:bg-slate-300 transition font-bold text-sm">
                                        {t.settings.edit}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 4. DANGER ZONE */}
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-red-500" size={20} />
                                <h3 className="font-bold text-red-700">{t.settings.dangerZoneTitle}</h3>
                            </div>
                            <p className="text-sm text-red-600/80 mb-4">{t.settings.dangerZoneText}</p>
                            <button className="border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition">
                                {t.settings.deleteAccount}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}