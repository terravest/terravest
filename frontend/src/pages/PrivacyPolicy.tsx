import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-4xl px-4 py-12 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Privacy Policy</h1>
                    <p className="text-slate-400 text-sm mb-8">Last updated: January 21, 2026</p>

                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <p>
                            TerraVest ("TerraVest", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you share with us through our website and services.
                        </p>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">1. Information We Collect</h2>
                            <p className="mb-2">We may collect the following types of information:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Email address</li>
                                <li>Name and basic contact details</li>
                                <li>Account registration information</li>
                                <li>Technical data such as IP address, browser type, and device information</li>
                            </ul>
                            <p className="mb-2">We collect this information when you:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Visit our website</li>
                                <li>Register an account</li>
                                <li>Contact us</li>
                                <li>Receive or interact with our emails</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">2. How We Use Your Information</h2>
                            <p className="mb-2">We use your information to:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Provide access to our platform and services</li>
                                <li>Communicate with you regarding onboarding, account-related, or informational updates</li>
                                <li>Respond to inquiries and support requests</li>
                                <li>Improve our website and services</li>
                                <li>Comply with legal and regulatory requirements</li>
                            </ul>
                            <p className="font-medium text-[#0F172A]">We do not sell your personal data.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">3. Email Communications</h2>
                            <p className="mb-2">You may receive emails from TerraVest related to:</p>
                            <ul className="list-disc pl-5 space-y-1 mb-4">
                                <li>Platform information</li>
                                <li>Account onboarding</li>
                                <li>Service updates</li>
                                <li>Relevant informational outreach</li>
                            </ul>
                            <p>All emails include a clear unsubscribe option, and you may opt out at any time.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">4. Legal Basis & Compliance</h2>
                            <p className="mb-2">Where applicable, we process personal data in accordance with:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>GDPR</li>
                                <li>LGPD (Brazil)</li>
                                <li>CAN-SPAM Act</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">5. Data Security</h2>
                            <p>We implement reasonable administrative and technical safeguards to protect your information.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">6. Third-Party Services</h2>
                            <p>We may use third-party service providers (e.g., hosting, email delivery) solely to support our operations. These providers are obligated to protect your data.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">7. Your Rights</h2>
                            <p className="mb-2">Depending on your jurisdiction, you may have the right to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Access, correct, or delete your data</li>
                                <li>Withdraw consent</li>
                                <li>Request information about data processing</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#0F172A] mb-3">8. Contact</h2>
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