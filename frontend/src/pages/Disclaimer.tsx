import { useContext } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle } from 'lucide-react';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function Disclaimer() {
    const lang = useContext(LanguageContext);
    const d = content[lang].legal.disclaimer;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-4xl px-4 py-12 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-yellow-500" size={32} />
                        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A]">{d.title}</h1>
                    </div>

                    <div className="space-y-6 text-slate-600 leading-relaxed">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p className="font-bold text-[#0F172A]">{d.introBox}</p>
                        </div>

                        <p>{d.introText}</p>

                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            {d.bullets.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>

                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                            <p className="text-red-800 font-medium">
                                {d.closing}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}