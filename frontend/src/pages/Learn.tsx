import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, FileKey, Zap, Bitcoin, HelpCircle, BookOpen, ArrowRight, Clock, Percent, ShieldCheck } from 'lucide-react';

export default function Learn() {

    // Process Steps Data
    const steps = [
        {
            icon: <Search size={32} />,
            title: "1. Curated Selection",
            desc: "Our team scouts the U.S. market for high-yield opportunities, focusing on areas popular with international investors like Miami and Orlando. We do the hard work—inspections, appraisals, and legal checks."
        },
        {
            icon: <FileKey size={32} />,
            title: "2. The 'Digital Deed'",
            desc: "Instead of buying a whole house, the property is placed into a U.S. Company (LLC). We then split the ownership into digital tokens. Think of it like buying a digital share of an apartment building."
        },
        {
            icon: <Zap size={32} />,
            title: "3. Instant Ownership",
            desc: "You can purchase these tokens using your USD balance. The moment the transaction clears, you are a legal co-owner. No international wire transfer fees, no waiting weeks."
        },
        {
            icon: <Bitcoin size={32} />,
            title: "4. Monthly Income",
            desc: "Rent is calculated daily based on your ownership. You can claim your accumulated earnings to your wallet anytime. Passive income in the world's most secure asset class."
        }
    ];

    // Fee Structure Data (NEW)
    const fees = [
        {
            title: "Trading Fee",
            rate: "1.5%",
            desc: "Applied once when buying or selling property tokens. This covers legal documentation, blockchain gas fees, and platform operations."
        },
        {
            title: "Property Management",
            rate: "10%",
            desc: "Deducted from the gross rental income before distribution. Covers tenant management, repairs, insurance, and property taxes."
        },
        {
            title: "Withdrawal Fee",
            rate: "$5 + 1%",
            desc: "Applied only when moving funds from your TerraVest wallet to your external Bitcoin wallet to cover network transaction costs."
        }
    ];

    // Glossary Data
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
                    <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" alt="Real Estate Background" />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#F7931A]/20 text-[#F7931A] text-sm font-bold mb-6 uppercase tracking-wider border border-[#F7931A]/20">
                        Education Center
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        How to Buy U.S. Real Estate <br />
                        <span className="text-[#F7931A] italic font-serif">
                            (Using Crypto)
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

            {/* --- DAILY VESTING EXPLAINER --- */}
            <section className="bg-[#0F172A] py-20 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#00E5FF]/20 p-3 rounded-lg text-[#00E5FF] shrink-0">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-3">Daily Vesting, Flexible Claims</h3>
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    At TerraVest, fairness is our priority. Unlike traditional systems where you might miss a dividend by a day, our rental income is calculated
                                    <span className="text-[#00E5FF] font-semibold"> daily</span> based on your exact ownership duration.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-gray-400 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2" />
                                        <span>Rent accrues in your "Unclaimed" balance every night based on the shares you hold.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-400 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2" />
                                        <span>You can click the <strong>Claim</strong> button anytime to move these earnings to your main wallet.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-400 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2" />
                                        <span>If you sell a property mid-month, you still keep the rent earned for the specific days you held it. No "dividend capture" tricks—just fair pay.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEE STRUCTURE (NEWLY ADDED SECTION) --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Transparent Fee Structure</h2>
                        <p className="text-slate-500">No hidden costs. We believe in complete transparency to align our success with yours.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {fees.map((fee, index) => (
                            <div key={index} className="bg-[#F9F7F3] rounded-2xl p-8 border border-slate-200 text-center hover:border-[#F7931A]/50 transition duration-300">
                                <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#0F172A]">
                                    {index === 1 ? <ShieldCheck size={24} /> : <Percent size={24} />}
                                </div>
                                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{fee.title}</h3>
                                <div className="text-3xl font-black text-[#009B9E] mb-4">{fee.rate}</div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {fee.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- GLOSSARY SECTION --- */}
            <section className="py-20 bg-[#F9F7F3]">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="text-[#F7931A]" size={32} />
                        <h2 className="text-3xl font-bold text-[#0F172A]">Essential Glossary</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {glossary.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
                            a: "Real estate historically appreciates in value. Additionally, by receiving payouts in Bitcoin, you hold an asset that is independent of any central bank's monetary policy."
                        },
                        {
                            q: "What about U.S. Taxes?",
                            a: "The LLC structure handles the property taxes directly. For your personal income tax, we provide a clean, organized annual report of your earnings."
                        },
                        {
                            q: "Is there a minimum investment?",
                            a: "We believe financial freedom should be for everyone. You can start building your portfolio with as little as $50."
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