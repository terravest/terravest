import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-[#F9F7F3] font-sans flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto max-w-6xl px-4 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-start">

                    {/* Sol Taraf: İletişim Bilgileri */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6">Contact Us</h1>
                        <p className="text-slate-600 text-lg mb-12 leading-relaxed">
                            Have questions about real estate tokenization, our platform, or investment opportunities?
                            Our team is ready to assist you.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-5">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-[#009B9E] border border-slate-100">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">Email Support</h3>
                                    <p className="text-slate-500 text-sm mb-2">For general inquiries and support:</p>
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
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">Live Chat</h3>
                                    <p className="text-slate-500 text-sm">
                                        Available weekdays from 9am to 6pm EST.
                                        <br />
                                        Click the chat icon in the bottom right corner.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-[#009B9E] border border-slate-100">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#0F172A] text-lg mb-1">Office</h3>
                                    <p className="text-slate-500 text-sm">
                                        TerraVest HQ<br />
                                        100 Biscayne Blvd, Suite 1200<br />
                                        Miami, FL 33132
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Taraf: İletişim Formu */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-6">Send us a message</h3>
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" placeholder="Jane" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all" placeholder="jane@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all text-slate-600">
                                    <option>General Inquiry</option>
                                    <option>Investment Support</option>
                                    <option>Technical Issue</option>
                                    <option>Partnership</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-32 outline-none focus:ring-2 focus:ring-[#009B9E] transition-all resize-none" placeholder="Tell us how we can help..."></textarea>
                            </div>

                            <button className="w-full bg-[#009B9E] hover:bg-[#008B8E] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}