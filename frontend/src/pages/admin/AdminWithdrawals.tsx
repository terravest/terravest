import { useEffect, useState } from 'react';
import { CheckCircle, Clock, ExternalLink, RefreshCw, Hash, DollarSign, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

// Backend'den gelen veriye tam uygun Interface
interface Withdrawal {
    id: number;
    user_id: number;
    username: string; // LEFT JOIN'den geliyor
    email: string;    // LEFT JOIN'den geliyor
    amount: number;   // DİKKAT: Veritabanında artık 'amount' oldu
    address: string;
    status: 'pending' | 'approved' | 'rejected';
    tx_hash?: string;
    created_at: string;
}

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Verileri Çek
    const fetchWithdrawals = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            console.log("📡 Admin: Withdrawals verisi isteniyor...");
            const res = await api.getAdminWithdrawals();

            console.log("📡 Backend Yanıtı:", res); // Konsola yanıtı yazdır

            if (res.success && Array.isArray(res.data)) {
                setWithdrawals(res.data);
            } else {
                console.error("Beklenmedik veri formatı:", res);
                setErrorMsg("Backend'den geçersiz veri formatı geldi.");
            }
        } catch (error: any) {
            console.error("❌ Veri çekme hatası:", error);
            setErrorMsg(error.message || "Failed to load withdrawals");
            toast.error("Failed to load withdrawals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    // Onaylama İşlemi (TX Hash İster)
    const handleApprove = async (id: number) => {
        const txHash = window.prompt("Enter the Blockchain Transaction Hash (TX ID):");

        if (!txHash) return;
        if (txHash.length < 10) return toast.error("Invalid TX Hash");

        setProcessingId(id);
        try {
            await api.approveWithdraw(id, txHash);
            toast.success("Withdrawal approved successfully!");
            fetchWithdrawals();
        } catch (error: any) {
            toast.error(error.message || "Approval failed");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="text-green-600" /> Withdraw Requests
                    </h1>
                    <p className="text-slate-500">Manage outgoing user payments</p>
                </div>
                <button
                    onClick={fetchWithdrawals}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* --- ERROR MESSAGE BOX (Eğer hata varsa görünür) --- */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertTriangle />
                    <div>
                        <p className="font-bold">Error Loading Data</p>
                        <p className="text-sm">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* --- TABLE CARD --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">ID / Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Target Address</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status / TX Hash</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading requests...</td></tr>
                            ) : withdrawals.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No withdrawal requests found.</td></tr>
                            ) : (
                                withdrawals.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50 transition">
                                        {/* 1. ID & DATE */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500">#{w.id}</span>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {w.created_at ? new Date(w.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </td>

                                        {/* 2. USER INFO */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{w.username || 'Deleted User'}</div>
                                            <div className="text-xs text-slate-500">{w.email}</div>
                                        </td>

                                        {/* 3. AMOUNT */}
                                        <td className="px-6 py-4">
                                            {/* Güvenli Erişim: w.amount undefined ise 0 göster */}
                                            <div className="font-bold text-red-600">-${(w.amount || 0).toLocaleString()}</div>
                                        </td>

                                        {/* 4. ADDRESS */}
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 truncate max-w-[150px]" title={w.address}>
                                                    {w.address}
                                                </code>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(w.address); toast.success("Copied!") }}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    <Hash size={12} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 5. STATUS & TX */}
                                        <td className="px-6 py-4">
                                            {w.status === 'approved' || w.status === 'completed' ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mb-1">
                                                        <CheckCircle size={12} /> Paid
                                                    </span>
                                                    {w.tx_hash && (
                                                        <a
                                                            href={`https://mempool.space/tx/${w.tx_hash}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700"
                                                        >
                                                            TX: {w.tx_hash.substring(0, 8)}... <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 animate-pulse">
                                                    <Clock size={12} /> Pending Action
                                                </span>
                                            )}
                                        </td>

                                        {/* 6. ACTIONS */}
                                        <td className="px-6 py-4 text-right">
                                            {w.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(w.id)}
                                                    disabled={processingId === w.id}
                                                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                                                >
                                                    {processingId === w.id ? "Saving..." : "Approve & Add TX"}
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
    );
}