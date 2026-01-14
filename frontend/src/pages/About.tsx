import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Layers, Globe, ShieldCheck, ArrowRight } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans">
            <Navbar />

            {/* HERO */}
            <section className="bg-[#0F172A] py-24 px-4 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-6">About TerraVest</h1>
                <p className="text-slate-300 max-w-3xl mx-auto text-lg">
                    TerraVest is building a simpler, more global way to invest in income-producing real estate through tokenization.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link to="/marketplace" className="px-6 py-3 rounded-full bg-white text-[#0F172A] font-semibold">Explore Marketplace</Link>
                    <Link to="/register" className="px-6 py-3 rounded-full bg-[#F7931A] text-white font-semibold">Create Account</Link>
                </div>
            </section>

            {/* INTRO TO TOKENIZED REAL ESTATE */}
            <section className="py-20 container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold mb-6">An Introduction to Tokenized Real Estate</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                    The way people invest in assets has continuously evolved — from physical ownership to paper certificates, and now to digital systems. Tokenization represents the next step in this evolution. By converting ownership rights into blockchain-based tokens, real-world assets can be accessed, transferred, and managed with far greater efficiency.
                </p>
                <p className="text-slate-600 leading-relaxed">
                    At TerraVest, we apply tokenization to income-producing U.S. real estate. This approach makes property ownership more accessible, more transparent, and more flexible for investors worldwide.
                </p>

                {/* SOFT CTA */}
                <div className="mt-10">
                    <Link to="/marketplace" className="inline-flex items-center gap-2 font-semibold text-[#F7931A]">
                        View Tokenized Properties <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* WHAT IS ASSET TOKENIZATION */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <h2 className="text-3xl font-bold mb-6">What Is Asset Tokenization?</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        Asset tokenization is the process of converting rights to a real-world asset into a digital token on a blockchain. Each token represents a defined share of ownership and the associated economic rights. These tokens can be securely held, transferred, and tracked on a global digital ledger.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        In TerraVest’s model, properties are owned by U.S.-based LLCs. Investors hold tokens that represent indirect ownership in these entities, giving them exposure to rental income without the complexity of traditional cross-border real estate investing.
                    </p>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <h2 className="text-3xl font-bold text-center mb-12">Why Tokenization Matters</h2>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="bg-white p-6 rounded-2xl border">
                        <ShieldCheck className="text-[#009B9E] mb-3" />
                        <h3 className="font-bold mb-2">Transparency</h3>
                        <p className="text-sm text-slate-600">Ownership records and transfers are immutably recorded, increasing clarity and trust.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <Layers className="text-[#F7931A] mb-3" />
                        <h3 className="font-bold mb-2">Liquidity</h3>
                        <p className="text-sm text-slate-600">Fractional tokens make traditionally illiquid assets easier to trade and rebalance.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <Globe className="text-[#00B3A4] mb-3" />
                        <h3 className="font-bold mb-2">Global Access</h3>
                        <p className="text-sm text-slate-600">Investors from around the world can access U.S. real estate without borders.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border">
                        <ArrowRight className="text-slate-500 mb-3" />
                        <h3 className="font-bold mb-2">Lower Barriers</h3>
                        <p className="text-sm text-slate-600">Smaller minimum investments enable gradual, flexible portfolio building.</p>
                    </div>
                </div>

                {/* MID CTA */}
                <div className="text-center mt-12">
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold">
                        Browse Marketplace <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* REAL ESTATE EXAMPLE */}
            <section className="bg-white py-20">
                <div className="container mx-auto max-w-4xl px-4">
                    <h2 className="text-3xl font-bold mb-6">Real Estate, Reimagined</h2>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        Imagine a $100,000 rental property divided into 100 tokens. Each token represents a 1% share of the property. By purchasing tokens, investors can gradually build ownership — from a small allocation to a meaningful position — without committing large amounts of capital upfront.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        This structure allows investors to diversify, adjust their exposure, and access rental income while maintaining flexibility that traditional real estate investing often lacks.
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 text-center">
                <p className="text-slate-500 mb-6">Start investing in tokenized real estate with daily income accrual and monthly visibility.</p>
                <div className="flex justify-center gap-4 mb-8">
                    <Link to="/register" className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-full font-bold">
                        Create Account
                    </Link>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border font-bold">
                        Explore Marketplace <ArrowRight size={20} />
                    </Link>
                </div>

                {/* LEGAL / RISK DISCLOSURE (SHORT) */}
                <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    TerraVest provides access to tokenized real estate investments through property-holding U.S. LLCs. Investments involve risk, including potential loss of capital, vacancy, market fluctuations, and regulatory changes. Rental income is not guaranteed and past performance is not indicative of future results. Nothing on this website constitutes financial or investment advice.
                </p>
            </section>
        </div>
    );
}
