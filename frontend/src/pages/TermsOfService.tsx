import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-4xl px-4 py-12 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Terms of Service</h1>
                    <p className="text-slate-400 text-sm mb-8">Last updated: January 21, 2026</p>

                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <p>
                            By accessing or using the TerraVest website or services, you agree to the following Terms of Service.
                        </p>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">1. Platform Purpose</h2>
                            <p>
                                TerraVest provides a technology platform designed to present informational content and tools related to tokenized real estate and digital asset-based structures.
                                <br />
                                <strong>Nothing on this website constitutes legal, financial, tax, or investment advice.</strong>
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">2. Eligibility</h2>
                            <p>
                                You are responsible for ensuring that your use of TerraVest complies with the laws and regulations applicable in your jurisdiction.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">3. No Investment Offer</h2>
                            <p className="mb-2">TerraVest does not:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Offer securities</li>
                                <li>Act as a broker, dealer, or investment advisor</li>
                                <li>Solicit investments on behalf of any offering</li>
                            </ul>
                            <p>Any future participation in offerings, if applicable, will be governed solely by separate transaction documents.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">4. User Accounts</h2>
                            <p>
                                You are responsible for maintaining the confidentiality of your account credentials and all activities conducted under your account.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">5. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, TerraVest shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">6. Modifications</h2>
                            <p>
                                We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the updated Terms.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">7. Governing Law</h2>
                            <p>
                                These Terms are governed by applicable laws without regard to conflict-of-law principles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}