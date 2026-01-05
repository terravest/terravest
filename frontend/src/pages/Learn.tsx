import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, FileKey, Zap, Bitcoin, HelpCircle, BookOpen, ArrowRight } from 'lucide-react'; // Coins yerine Bitcoin ikonu

export default function Learn() {

    // Süreç Adımları Verisi (BTC Güncellendi)
    const steps = [
        {
            icon: <Search size={32} />,
            title: "1. Curated Selection",
            desc: "Our team scouts the U.S. market for high-yield opportunities, focusing on areas popular with international investors like Miami and Orlando. We do the hard work—inspections, appraisals, and legal checks—so you don't have to."
        },
        {
            icon: <FileKey size={32} />,
            title: "2. The 'Digital Deed'",
            desc: "Instead of buying a whole house, the property is placed into a U.S. Company (LLC). We then split the ownership into digital tokens. Think of it like buying a digital share of an apartment building rather than the whole thing."
        },
        {
            icon: <Zap size={32} />,
            title: "3. Instant Ownership",
            desc: "You can purchase these tokens using Bitcoin (BTC). The moment the transaction clears on the blockchain, you are a legal co-owner. No international wire transfer fees, no waiting weeks for bank approvals."
        },
        {
            icon: <Bitcoin size={32} />, // İkon değişti
            title: "4. Weekly Bitcoin Rent", // Başlık değişti
            desc: "As tenants pay their rent in USD, we collect it, convert it, and distribute your share directly to your wallet in Bitcoin. You earn passive income in the world's most secure digital asset."
        }
    ];

    // Sözlük Verisi (USDC -> BTC)
    const glossary = [
        {
            term: "BTC (Bitcoin)",
            def: "The world's first decentralized digital currency. It allows you to store value and receive payments globally without relying on the traditional banking system."
        },
        {
            term: "RWA (Real World Assets)",
            def: "Bringing tangible assets (like a house in Florida) onto the blockchain. It connects digital finance with physical value."
        },
        {
            term: "LLC (Limited Liability Company)",
            def: "A U.S. corporate structure. It acts as the legal wrapper that holds the property deed and protects investors' personal assets."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-[#0F172A] py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#F7931A]/20 text-[#F7931A] text-sm font-bold mb-6 uppercase tracking-wider border border-[#F7931A]/20">
                        Education Center
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        How to Buy U.S. Real Estate <br />
                        <span className="text-[#F7931A] italic font-serif">
                            (Using Bitcoin)
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Discover how TerraVest allows you to invest in American properties using cryptocurrency starting from just $50.
                    </p>
                </div>
            </section>

            {/* --- THE PROCESS SECTION --- */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#0F172A] mb-4">The Process</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        We have stripped away the complexity of international investing. Here is how it works:
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 relative group">
                            <div className="absolute top-4 right-4 text-6xl font-black text-slate-100 -z-0 group-hover:text-[#F7931A]/10 transition">
                                {index + 1}
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-[#F7931A]/10 text-[#F7931A] flex items-center justify-center mb-6">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{step.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- GLOSSARY SECTION --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="text-[#F7931A]" size={32} />
                        <h2 className="text-3xl font-bold text-[#0F172A]">Essential Glossary</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {glossary.map((item, i) => (
                            <div key={i} className="bg-[#F9F7F3] p-6 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-[#0F172A] mb-2 text-lg">{item.term}</h4>
                                <p className="text-slate-600 text-sm">{item.def}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="py-20 container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-6">
                    {[
                        {
                            q: "Do I need a U.S. Visa or Green Card to invest?",
                            a: "No. You do not need to be a U.S. citizen or resident. TerraVest is designed specifically for international investors to access the U.S. market remotely."
                        },
                        {
                            q: "How does this protect me from inflation?",
                            a: "Real estate historically appreciates in value. Additionally, by receiving payouts in Bitcoin, you hold an asset that is independent of any central bank's monetary policy, offering a potential hedge against fiat currency devaluation."
                        },
                        {
                            q: "What about U.S. Taxes?",
                            a: "The LLC structure handles the property taxes directly. For your personal income tax, we provide a clean, organized annual report of your earnings."
                        },
                        {
                            q: "Is there a minimum investment?",
                            a: "We believe financial freedom should be for everyone. You can start building your portfolio with as little as $50 worth of BTC."
                        }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-[#F7931A]/50 transition cursor-default">
                            <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-3 mb-3">
                                <HelpCircle size={20} className="text-[#F7931A] flex-shrink-0" />
                                {faq.q}
                            </h3>
                            <p className="text-slate-600 pl-8 leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                {/* --- CTA --- */}
                <div className="mt-16 text-center">
                    <p className="text-slate-500 mb-6">Ready to start your journey?</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold transition shadow-xl">
                        Browse Properties <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}