import { useContext } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Contact() {
    const lang = useContext(LanguageContext);
    const t = content[lang].contactPage;

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
                            <div className="flex items-start gap-5">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-[#009B9E] border border-slate-100">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">{t.emailTitle}</h3>
                                    <p className="text-slate-500 text-sm mb-2">{t.emailDesc}</p>
                                    <a href="mailto:support@terravest.homes" className="text-[#009B9E] font-bold hover:underline text-lg">
                                        support@terravest.homes
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-[#009B9E] border border-slate-100">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">{t.chatTitle}</h3>
                                    <p className="text-slate-500 text-sm">
                                        {t.chatDesc}
                                    </p>
                                </div>
                            </div>

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
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.firstName}</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.lastName}</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.email}</label>
                                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.subject}</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all text-slate-600">
                                    <option>General Inquiry</option>
                                    <option>Investment Support</option>
                                    <option>Technical Issue</option>
                                    <option>Partnership</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.form.message}</label>
                                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-32 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all resize-none"></textarea>
                            </div>

                            <button className="w-full bg-[#009B9E] hover:bg-[#008B8E] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                {t.form.submit}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}