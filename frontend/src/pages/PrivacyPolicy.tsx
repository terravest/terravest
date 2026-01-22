import { useContext } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LanguageContext } from '../App';
import { content } from '../content';

export default function PrivacyPolicy() {
    const lang = useContext(LanguageContext);
    const t = content[lang].legal;
    const p = t.privacy;

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-4xl px-4 py-12 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">{p.title}</h1>
                    <p className="text-slate-400 text-sm mb-8">{t.lastUpdated}</p>

                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <p>{p.intro}</p>

                        {p.sections.map((section, index) => (
                            <div key={index}>
                                <h2 className="text-xl font-bold text-[#0F172A] mb-3">{section.title}</h2>
                                {Array.isArray(section.content) ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {section.content.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{section.content}</p>
                                )}
                            </div>
                        ))}

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">Contact</h2>
                            <p>For any privacy-related questions, contact us at:</p>
                            <a href="mailto:support@terravest.homes" className="text-[#009B9E] font-bold hover:underline">support@terravest.homes</a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}