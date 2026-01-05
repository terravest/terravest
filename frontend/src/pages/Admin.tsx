import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import {
    CheckCircle, Clock, Loader2, DollarSign, History,
    X, Trash2, Plus, Building2, LayoutList, Archive, ArrowDownCircle
} from 'lucide-react';

export default function Admin() {
    // TABS
    const [activeTab, setActiveTab] = useState<'orders' | 'properties' | 'withdrawals'>('orders');

    const [orders, setOrders] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // UI States
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null); // Hem order hem withdrawal için
    const [modalType, setModalType] = useState<'buy' | 'sell'>('buy'); // Hangi modal?

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Property Form State (monthly_yield eklendi)
    const [newProp, setNewProp] = useState({ title: '', description: '', price_usd: '', total_tokens: '', image_url: '', monthly_yield: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'orders') {
                const data = await api.getAdminOrders();
                setOrders(Array.isArray(data) ? data : (data.results || []));
            } else if (activeTab === 'properties') {
                const data = await api.getAdminProperties();
                setProperties(Array.isArray(data) ? data : (data.results || []));
            } else if (activeTab === 'withdrawals') {
                const data = await api.getAdminSellRequests();
                setWithdrawals(Array.isArray(data) ? data : (data.results || []));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Handle Approvals
    const handleConfirmAction = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        try {
            if (modalType === 'buy') {
                await api.approveOrder(selectedItem.id);
                setSuccessMessage("Buy order approved & tokens transferred!");
            } else {
                await api.approveSellRequest(selectedItem.id);
                setSuccessMessage("Withdrawal marked as PAID!");
            }
            setApproveModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Property Handlers
    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.createProperty({
                title: newProp.title,
                description: newProp.description,
                price_usd: parseFloat(newProp.price_usd),
                total_tokens: parseInt(newProp.total_tokens),
                image_url: newProp.image_url,
                monthly_yield: parseFloat(newProp.monthly_yield) // <-- YENİ: KİRA MİKTARI
            });
            setSuccessMessage("Property published!");
            // Formu sıfırla
            setNewProp({ title: '', description: '', price_usd: '', total_tokens: '', image_url: '', monthly_yield: '' });
            fetchData();
        } catch (error: any) { alert("Error: " + error.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteProperty = async (id: number) => {
        if (!confirm("Deactivate property?")) return;
        try {
            await api.deleteProperty(id);
            setSuccessMessage("Property deactivated.");
            fetchData();
        } catch (error: any) { alert(error.message); }
    };

    // Filters
    const pendingOrders = orders.filter(o => o.payment_status === 'pending');
    const historyOrders = orders.filter(o => o.payment_status === 'completed');

    const activeProps = properties.filter(p => p.status === 'active' || !p.status);
    const deletedProps = properties.filter(p => p.status === 'deleted');

    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Admin Dashboard</h1>

                    {/* TABS */}
                    <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
                        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-[#009B9E] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <LayoutList size={16} /> Deposits
                        </button>
                        <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'withdrawals' ? 'bg-[#009B9E] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <ArrowDownCircle size={16} /> Withdrawals
                        </button>
                        <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'properties' ? 'bg-[#009B9E] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <Building2 size={16} /> Properties
                        </button>
                    </div>
                </div>

                {/* --- TAB 1: DEPOSITS (ORDERS) --- */}
                {activeTab === 'orders' && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-green-50 flex items-center gap-2">
                                <Clock className="text-green-600" /> <h2 className="text-lg font-bold text-green-900">Incoming Investments (Pending)</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-green-50/20">
                                                <td className="px-6 py-4">{order.email}</td>
                                                <td className="px-6 py-4">{order.property_title}</td>
                                                <td className="px-6 py-4 text-green-600 font-bold">${order.total_price_usd}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => { setSelectedItem(order); setModalType('buy'); setApproveModalOpen(true); }} className="bg-[#009B9E] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingOrders.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No pending investments.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-90">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                                <History size={20} className="text-slate-500" /> <h2 className="text-lg font-bold text-slate-700">Investment History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historyOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{order.email}</td>
                                                <td className="px-6 py-4">{order.property_title}</td>
                                                <td className="px-6 py-4 font-bold">${order.total_price_usd}</td>
                                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Completed</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: WITHDRAWALS (SELL REQUESTS) --- */}
                {activeTab === 'withdrawals' && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-red-50 flex items-center gap-2">
                                <ArrowDownCircle className="text-red-600" /> <h2 className="text-lg font-bold text-red-900">Pending Withdrawals</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Payout</th><th className="px-6 py-4">Tokens</th><th className="px-6 py-4">Destination</th><th className="px-6 py-4">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingWithdrawals.map(req => (
                                            <tr key={req.id} className="hover:bg-red-50/20">
                                                <td className="px-6 py-4 font-medium">{req.email}</td>
                                                <td className="px-6 py-4 text-red-600 font-bold">${req.total_value_usd.toFixed(2)}</td>
                                                <td className="px-6 py-4">{req.token_amount.toFixed(2)} {req.property_title}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-[200px] truncate" title={req.payment_details}>
                                                    {req.payment_details}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => { setSelectedItem(req); setModalType('sell'); setApproveModalOpen(true); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                                        <CheckCircle size={14} /> Mark Paid
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingWithdrawals.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No pending withdrawals.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-90">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                                <History size={20} className="text-slate-500" /> <h2 className="text-lg font-bold text-slate-700">Withdrawal History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {completedWithdrawals.map(req => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{req.email}</td>
                                                <td className="px-6 py-4 font-bold text-red-400">-${req.total_value_usd.toFixed(2)}</td>
                                                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">Paid</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: PROPERTIES --- */}
                {activeTab === 'properties' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                                <h2 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2"><Plus className="bg-slate-100 p-1 rounded-md" /> Add New Asset</h2>

                                <form onSubmit={handleAddProperty} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                        <input type="text" required className="w-full bg-slate-50 border rounded-lg p-2 text-sm" value={newProp.title} onChange={e => setNewProp({ ...newProp, title: e.target.value })} placeholder="Title" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                        <textarea required className="w-full bg-slate-50 border rounded-lg p-2 text-sm" value={newProp.description} onChange={e => setNewProp({ ...newProp, description: e.target.value })} placeholder="Description" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Image URL (Optional)</label>
                                        <input type="url" className="w-full bg-slate-50 border rounded-lg p-2 text-sm" value={newProp.image_url} onChange={e => setNewProp({ ...newProp, image_url: e.target.value })} placeholder="https://..." />
                                    </div>

                                    {/* FİYAT, TOKEN ve KİRA (YENİ) */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Price $</label>
                                            <input type="number" required className="bg-slate-50 border rounded-lg p-2 text-sm w-full" value={newProp.price_usd} onChange={e => setNewProp({ ...newProp, price_usd: e.target.value })} placeholder="100k" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Tokens</label>
                                            <input type="number" required className="bg-slate-50 border rounded-lg p-2 text-sm w-full" value={newProp.total_tokens} onChange={e => setNewProp({ ...newProp, total_tokens: e.target.value })} placeholder="10k" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600 uppercase">Rent $</label>
                                            <input type="number" required className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm w-full font-bold text-green-700" value={newProp.monthly_yield} onChange={e => setNewProp({ ...newProp, monthly_yield: e.target.value })} placeholder="500" />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F172A] text-white font-bold py-3 rounded-xl">{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Publish'}</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-lg font-bold text-[#0F172A]">Active Listings</h2>
                            {activeProps.map(prop => (
                                <div key={prop.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden shrink-0"><img src={prop.image_url || `https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80&sig=${prop.id}`} className="w-full h-full object-cover opacity-80" /></div>
                                        <div>
                                            <h3 className="font-bold text-[#0F172A]">{prop.title}</h3>
                                            <div className="text-xs text-slate-500">${prop.price_usd?.toLocaleString()} • {prop.available_tokens} left</div>
                                            {/* Kira Getirisi Göstergesi */}
                                            <div className="text-xs text-green-600 font-bold mt-1">Rent Yield: ${prop.monthly_yield}/mo</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteProperty(prop.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* GLOBAL MODALS */}
            {successMessage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><CheckCircle size={32} /></div>
                        <h3 className="text-xl font-bold mb-2">Success!</h3>
                        <p className="text-slate-600 mb-6">{successMessage}</p>
                        <button onClick={() => setSuccessMessage(null)} className="w-full bg-[#009B9E] text-white font-bold py-3 rounded-xl">Continue</button>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            {approveModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                        <button onClick={() => setApproveModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={24} /></button>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">{modalType === 'buy' ? 'Approve Investment' : 'Confirm Payout'}</h2>
                            <p className="text-slate-500 mt-1">
                                {modalType === 'buy' ? `Transfer tokens to ${selectedItem.email}?` : `Mark payment to ${selectedItem.email} as SENT?`}
                            </p>
                        </div>
                        {modalType === 'sell' && (
                            <div className="bg-slate-50 p-3 rounded mb-4 text-xs font-mono break-all text-slate-600 border border-slate-200">
                                Destination: {selectedItem.payment_details}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setApproveModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-600">Cancel</button>
                            <button onClick={handleConfirmAction} disabled={isSubmitting} className={`flex-1 py-3 text-white rounded-xl font-bold flex justify-center gap-2 ${modalType === 'buy' ? 'bg-[#009B9E]' : 'bg-red-500'}`}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (modalType === 'buy' ? 'Confirm' : 'Mark Paid')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}