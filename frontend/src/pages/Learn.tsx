import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Search,
    FileKey,
    Zap,
    Bitcoin,
    HelpCircle,
    BookOpen,
    ArrowRight,
    Clock,
    Percent,
    ShieldCheck,
    Globe,
    Wallet,
    Layers,
    RefreshCcw,
    Lock,
    Calendar
} from 'lucide-react';

export default function Learn() {

    /* ==========================
       WHAT IS TERRAVEST
       ========================== */

    const whatIs = [
        {
            icon: <Layers size={28} />,
            title: "What is TerraVest?",
            desc: "TerraVest is a real estate investment platform that tokenizes income‑producing U.S. properties. Each property is owned by a U.S. LLC and divided into digital tokens, allowing investors to own fractions of rental real estate instead of buying entire properties."
        },
        {
            icon: <Globe size={28} />,
            title: "Built for Global Investors",
            desc: "TerraVest is designed for international investors who want exposure to the U.S. property market without U.S. residency, local banks, or complex cross‑border paperwork."
        },
        {
            icon: <Bitcoin size={28} />,
            title: "Low Minimums",
            desc: "By fractionalizing ownership, TerraVest lowers the barrier to entry. Investors can start with small amounts instead of committing tens of thousands of dollars upfront."
        }
    ];

    /* ==========================
       WHO CAN INVEST
       ========================== */

    const whoCanInvest = [
        "Open to investors from most countries worldwide.",
        "No U.S. visa, residency, or American bank account required.",
        "Compliance restrictions apply to sanctioned or high‑risk jurisdictions.",
        "Ideal for non‑U.S. investors seeking stable, dollar‑denominated rental income."
    ];

    /* ==========================
       HOW IT WORKS (INCOME FLOW CLARITY)
       ========================== */

    const steps = [
        {
            icon: <Search size={32} />,
            title: "1. Explore the Marketplace",
            desc: "Browse vetted U.S. rental properties in the marketplace. Each listing shows expected yield, rental details, and legal structure."
        },
        {
            icon: <FileKey size={32} />,
            title: "2. Buy Property Tokens",
            desc: "When you invest, you purchase tokens that represent fractional ownership in a specific property‑holding U.S. LLC."
        },
        {
            icon: <Clock size={32} />,
            title: "3. Daily Rent Accrual",
            desc: "Rental income accrues daily based on the exact number of tokens you hold. Earnings accumulate continuously in the background."
        },
        {
            icon: <Calendar size={32} />,
            title: "4. Monthly Dashboard Payout",
            desc: "At the beginning of each month, your accrued rent becomes visible in your dashboard as income. From there, you can claim it or reinvest it."
        }
    ];

    /* ==========================
       WALLET, SECURITY & INCOME FLOW
       ========================== */

    const walletFeatures = [
        {
            icon: <Wallet size={26} />,
            title: "Investor Wallet",
            desc: "Hold property tokens and rental income in one place. Use TerraVest’s integrated wallet or connect your own external wallet."
        },
        {
            icon: <RefreshCcw size={26} />,
            title: "Flexible Income Use",
            desc: "Once rent appears in your dashboard each month, you can withdraw it or reinvest directly into new property tokens."
        },
        {
            icon: <Lock size={26} />,
            title: "Security & Control",
            desc: "Non‑custodial architecture, strong authentication, and no storage of private keys on TerraVest servers."
        }
    ];

    /* ==========================
       FEES
       ========================== */

    const fees = [
        {
            title: "Trading Fee",
            rate: "1.5%",
            desc: "Applied when buying or selling tokens. Covers platform operations, legal structuring, and compliance."
        },
        {
            title: "Property Management",
            rate: "10%",
            desc: "Deducted from rental income before distribution. Covers tenants, maintenance, insurance, and local taxes."
        },
        {
            title: "Withdrawal Fee",
            rate: "$5 + 1%",
            desc: "Only applies when transferring funds to an external wallet to cover network and processing costs."
        }
    ];

    /* ==========================
       GLOSSARY
       ========================== */

    const glossary = [
        {
            term: "Tokenized Real Estate",
            def: "A structure where real estate ownership is represented by blockchain tokens, enabling fractional ownership and easier transfers."
        },
        {
            term: "Daily Accrual",
            def: "Rental income is calculated and accumulated every day based on token ownership, even though it is shown monthly."
        },
        {
            term: "U.S. LLC",
            def: "A legal entity that holds the property title and limits investor liability."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* HERO */}
            <section className="bg-[#0F172A] py-24 px-4 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-6">
                    Learn How TerraVest Works
                </h1>
                <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                    Earn daily rental income from U.S. real estate — with monthly clarity in your dashboard.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link to="/marketplace" className="px-6 py-3 rounded-full bg-white text-[#0F172A] font-semibold">Marketplace</Link>
                    <Link to="/register" className="px-6 py-3 rounded-full bg-[#F7931A] text-white font-semibold">Create Account</Link>
                </div>
            </section>

            {/* WHAT IS TERRAVEST */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold">What is TerraVest?</h2>
                    <Link to="/about" className="text-sm font-semibold text-[#F7931A] hover:underline">About TerraVest</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {whatIs.map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-[#F7931A] mb-4">{item.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-slate-600 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHO CAN INVEST */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">Who Can Invest?</h2>
                        <Link to="/register" className="text-sm font-semibold text-[#F7931A] hover:underline">Register</Link>
                    </div>
                    <ul className="space-y-4 text-slate-600">
                        {whoCanInvest.map((item, i) => (
                            <li key={i} className="flex gap-3">
                                <ShieldCheck className="text-[#009B9E]" size={18} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* PROCESS */}
            <section className="py-20 container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">How Investing Works</h2>
                <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">
                    Tokens earn rent daily. Earnings are aggregated and shown in your dashboard at the start of each month.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-[#F7931A] mb-4">{step.icon}</div>
                            <h3 className="font-bold mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-600">{step.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold">
                        View Marketplace <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* WALLET */}
            <section className="bg-[#0F172A] py-20 px-4">
                <div className="container mx-auto max-w-5xl text-white">
                    <h2 className="text-3xl font-bold mb-10">Wallet, Security & Income Flow</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {walletFeatures.map((w, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="text-[#00E5FF] mb-3">{w.icon}</div>
                                <h3 className="font-bold mb-2">{w.title}</h3>
                                <p className="text-sm text-gray-300">{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEES */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-5xl px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Fees & Transparency</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {fees.map((fee, i) => (
                            <div key={i} className="bg-[#F9F7F3] p-8 rounded-2xl text-center border">
                                <div className="text-3xl font-black text-[#009B9E] mb-2">{fee.rate}</div>
                                <h3 className="font-bold mb-2">{fee.title}</h3>
                                <p className="text-sm text-slate-600">{fee.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GLOSSARY */}
            <section className="py-20 bg-[#F9F7F3]">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="text-[#F7931A]" />
                        <h2 className="text-3xl font-bold">Glossary</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {glossary.map((g, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border">
                                <h4 className="font-bold mb-2">{g.term}</h4>
                                <p className="text-sm text-slate-600">{g.def}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LEGAL & RISK DISCLOSURE */}
            <section className="bg-white py-16 px-4 border-t">
                <div className="container mx-auto max-w-4xl text-center">
                    <h3 className="text-xl font-bold mb-4">Legal & Risk Disclosure</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        TerraVest provides access to tokenized real estate investments. Investing in real estate involves risks,
                        including but not limited to market fluctuations, tenant vacancies, property expenses, and regulatory changes.
                        Rental income is not guaranteed and past performance does not predict future results.
                        Tokens represent indirect ownership through property‑holding U.S. LLCs and do not constitute securities,
                        financial advice, or an offer to the public where prohibited by law.
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 text-center">
                <p className="text-slate-500 mb-6">Start earning daily rental income with monthly clarity.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border font-bold">
                        Marketplace <ArrowRight size={20} />
                    </Link>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-full font-bold">
                        Create Account
                    </Link>
                </div>
            </section>
        </div>
    );
}
