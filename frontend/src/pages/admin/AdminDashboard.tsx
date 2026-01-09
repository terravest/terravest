import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { CheckCircle, Clock, Loader2, RefreshCw, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // MODAL STATE (Çirkin prompt yerine bunu kullanacağız)
    const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Verileri Çek
    const fetchDeposits = async () => {
        setIsLoading(true);
        try {
            // Artık doğru adresten (/admin/deposits) çekecek
            const res = await api.getAdminOrders();
            const data = Array.isArray(res) ? res : (res.data || res.results || []);

            // Tarihe göre sırala (En yeni en üstte)
            const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setDeposits(sorted);
        } catch (error) {
            console.error("Veri hatası:", error);
            toast.error("Liste yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    // ONAY FONKSİYONU
    const confirmApproval = async () => {
        if (!selectedDeposit) return;

        setIsProcessing(true);
        const toastId = toast.loading("Transaction is being approved...");

        try {
            // 1. Backend isteği
            await api.manualApproveDeposit(selectedDeposit.id);

            toast.success("✅ Approved!", { id: toastId });

            // 2. Listeyi Anında Güncelle (Refresh yapmadan yeşil olsun)
            setDeposits(current =>
                current.map(d =>
                    d.id === selectedDeposit.id ? { ...d, status: 'completed' } : d
                )
            );

            // Modalı Kapat
            setSelectedDeposit(null);

        } catch (error: any) {
            console.error(error);
            // "Zaten onaylı" hatası gelirse panik yapma, yeşile çevir
            if (error.message?.includes("completed")) {
                toast.success("Already Approved, list updated.", { id: toastId });
                setDeposits(current =>
                    current.map(d => d.id === selectedDeposit.id ? { ...d, status: 'completed' } : d)
                );
                setSelectedDeposit(null);
            } else {
                toast.error("Error: " + error.message, { id: toastId });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
                        <p className="text-slate-500">Manage pending Bitcoin deposits.</p>
                    </div>
                    <button
                        onClick={fetchDeposits}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border hover:bg-slate-50 text-sm font-bold text-slate-600 transition shadow-sm"
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">ID / Date</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={32} /></td></tr>
                                ) : deposits.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">No deposits found.</td></tr>
                                ) : (
                                    deposits.map((deposit) => (
                                        <tr key={deposit.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-slate-500 font-bold">#{deposit.id}</span>
                                                <div className="text-xs text-slate-400 mt-1">{new Date(deposit.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{deposit.username || "User " + deposit.user_id}</div>
                                                <div className="text-xs text-slate-500">{deposit.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-lg">${deposit.amount_usd}</td>
                                            <td className="px-6 py-4">
                                                {deposit.status === 'completed' ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-green-200">
                                                        <CheckCircle size={12} /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-yellow-200 animate-pulse">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {deposit.status === 'pending' && (
                                                    <button
                                                        onClick={() => setSelectedDeposit(deposit)}
                                                        className="bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95 ml-auto flex items-center gap-2"
                                                    >
                                                        Approve Funds
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ✨ MODERN ONAY MODALI (Çirkin prompt yerine) */}
            {selectedDeposit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedDeposit(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Approve Deposit?</h2>
                            <p className="text-slate-500 mt-2 text-sm">
                                Are you sure you want to approve <strong className="text-slate-900">${selectedDeposit.amount_usd}</strong> for <strong className="text-slate-900">{selectedDeposit.username}</strong>?
                            </p>
                            <p className="text-xs text-slate-400 mt-2">This will add funds to user's balance immediately.</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedDeposit(null)}
                                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-[#009B9E] hover:bg-[#008B8E] text-white rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}