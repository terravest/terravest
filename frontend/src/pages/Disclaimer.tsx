import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-4xl px-4 py-12 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-yellow-500" size={32} />
                        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A]">General Disclaimer</h1>
                    </div>

                    <div className="space-y-6 text-slate-600 leading-relaxed">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="font-bold text-[#0F172A] mb-2">Website Disclosures</h3>
                            <p>
                                The information presented on this website is provided solely for informational purposes to parties who have expressed interest in learning about TerraVest and related technologies.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">Nothing on this website constitutes:</p>
                            <ul className="list-disc pl-5 space-y-2 mb-6">
                                <li>An offer to sell securities</li>
                                <li>A solicitation to buy securities</li>
                                <li>Legal, tax, financial, or investment advice</li>
                            </ul>
                        </div>

                        <p>
                            Any potential participation in offerings, if applicable, will be subject exclusively to separate offering documents, subscription agreements, and applicable regulatory requirements.
                        </p>

                        <p className="font-medium text-[#0F172A]">
                            TerraVest does not act as a broker, dealer, underwriter, or investment advisor.
                        </p>

                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                            <p className="text-red-800 font-medium">
                                Digital assets and tokenized structures involve a high degree of risk, including the possible loss of the entire amount contributed. No public market for such assets is guaranteed to exist.
                            </p>
                        </div>

                        <p>
                            You should consult your own legal, tax, and financial advisors before making any investment decisions.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}