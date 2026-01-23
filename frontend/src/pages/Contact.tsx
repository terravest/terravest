import { useContext, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Loader2 } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function Contact() {
    const lang = useContext(LanguageContext);
    const t = content[lang]?.contactPage || content['en'].contactPage;

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Backend tek bir 'name' alanı beklediği için ad ve soyadı birleştiriyoruz
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            };

            await api.contact(payload);
            toast.success(t.form?.success || "Message sent successfully!");

            // Formu temizle
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: 'General Inquiry',
                message: ''
            });
        } catch (error) {
            console.error(error);
            toast.error(t.form?.error || "Failed to send message.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-6xl px-4 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-start">

                    {/* Sol Taraf: İletişim Bilgileri */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6">{t.title}</h1>
                        <p className="text-slate-600 text-lg mb-12 leading-relaxed">
                            {t.subtitle}
                        </p>

                        <div className="space-y-8">
                            {/* Mail ve Chat kısımları SİLİNDİ */}

                            {/* Sadece Ofis Bilgisi Kaldı */}
                            <div className="flex items-start gap-5">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-[#009B9E] border border-slate-100">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">{t.officeTitle}</h3>
                                    <p className="text-slate-500 text-sm">
                                        {t.officeDesc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Taraf: İletişim Formu */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-6">{t.formTitle}</h3>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.firstName}</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.lastName}</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.email}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.subject}</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all text-slate-600"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Investment Support">Investment Support</option>
                                    <option value="Technical Issue">Technical Issue</option>
                                    <option value="Partnership">Partnership</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.message}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-32 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#009B9E] hover:bg-[#008B8E] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Sending...
                                    </>
                                ) : (
                                    t.form.submit
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}