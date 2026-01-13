import { useEffect, useState } from 'react';
import {
    CheckCircle, ExternalLink, RefreshCw, X, AlertCircle, Loader2,
    ArrowDownLeft, ArrowUpRight, Hash, Copy, Clipboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import AdminNavbar from '../../components/AdminNavbar';

// --- TİP TANIMLARI ---
interface Deposit {
    id: number;
    user_id: number;
    username: string;
    email: string;
    amount_usd: number;
    address: string;
    status: 'pending' | 'completed';
    created_at: string;
}

interface Withdrawal {
    id: number;
    user_id: number;
    username: string;
    email: string;
    amount: number;
    address: string;
    status: 'pending' | 'approved' | 'rejected';
    tx_hash?: string;
    created_at: string;
}

export default function AdminDashboard() {
    // --- STATE ---
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // MODAL STATES
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null); // Deposit Onay Modalı için
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null); // Withdraw Onay Modalı için
    const [txInput, setTxInput] = useState(""); // Withdraw TX Hash girişi için

    // --- VERİ ÇEKME ---
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [depRes, withRes] = await Promise.all([
                api.getAdminDeposits(),
                api.getAdminWithdrawals()
            ]);

            if (depRes.success) setDeposits(depRes.data);
            if (withRes.success) setWithdrawals(withRes.data);

        } catch (error: any) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // --- 1. DEPOSIT ONAY FONKSİYONU ---
    const confirmDepositApproval = async () => {
        if (!selectedDeposit) return;
        setIsProcessing(true);
        const toastId = toast.loading("Approving deposit...");

        try {
            await api.approveDeposit(selectedDeposit.id);
            toast.success("Deposit approved!", { id: toastId });
            fetchDashboardData();
            setSelectedDeposit(null);
        } catch (error: any) {
            toast.error(error.message || "Failed", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 2. WITHDRAW ONAY FONKSİYONU ---
    const confirmWithdrawalApproval = async () => {
        if (!selectedWithdrawal) return;
        if (txInput.length < 5) return toast.error("Please enter a valid TX Hash");

        setIsProcessing(true);
        const toastId = toast.loading("Processing withdrawal...");

        try {
            await api.approveWithdraw(selectedWithdrawal.id, txInput);
            toast.success("Withdrawal approved & TX saved!", { id: toastId });
            fetchDashboardData();
            setSelectedWithdrawal(null);
            setTxInput(""); // Inputu temizle
        } catch (error: any) {
            toast.error(error.message || "Failed", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // Pano'dan yapıştırma yardımcısı
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTxInput(text);
            toast.success("Pasted from clipboard");
        } catch (err) {
            toast.error("Failed to read clipboard");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
                        <p className="text-slate-500">Real-time financial requests monitoring.</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition text-sm font-medium shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                    </button>
                </div>

                {/* 🔽 DEPOSITS TABLE */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><ArrowDownLeft size={20} /></div>
                        Incoming Deposits <span className="text-sm font-normal text-slate-400">({deposits.filter(d => d.status === 'pending').length} Pending)</span>
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Address</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {deposits.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No deposit records.</td></tr>
                                    ) : (
                                        deposits.slice(0, 10).map((deposit) => (
                                            <tr key={deposit.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-slate-500">{new Date(deposit.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium">{deposit.username || 'Unknown'}</td>
                                                <td className="px-6 py-4 font-bold text-green-600">+${deposit.amount_usd.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[100px]">{deposit.address}</td>
                                                <td className="px-6 py-4">
                                                    {deposit.status === 'completed' ?
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Completed</span> :
                                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">Pending</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {deposit.status === 'pending' && (
                                                        <button onClick={() => setSelectedDeposit(deposit)} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Approve</button>
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

                {/* 🔼 WITHDRAWALS TABLE */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600"><ArrowUpRight size={20} /></div>
                        Outgoing Withdrawals <span className="text-sm font-normal text-slate-400">({withdrawals.filter(w => w.status === 'pending').length} Pending)</span>
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Target Address</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {withdrawals.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No withdrawal records.</td></tr>
                                    ) : (
                                        withdrawals.slice(0, 10).map((w) => (
                                            <tr key={w.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium">{w.username || 'Unknown'}</td>
                                                <td className="px-6 py-4 font-bold text-red-600">-${w.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 truncate max-w-[120px]" title={w.address}>{w.address}</code>
                                                        <button onClick={() => { navigator.clipboard.writeText(w.address); toast.success("Copied") }} className="text-slate-400 hover:text-slate-600"><Copy size={12} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {w.status === 'approved' || w.status === 'completed' ?
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Paid</span> :
                                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">Action Needed</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {w.status === 'pending' && (
                                                        <button
                                                            onClick={() => { setSelectedWithdrawal(w); setTxInput(""); }}
                                                            className="bg-[#0F172A] text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
                                                        >
                                                            Approve
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

                {/* --- MODAL 1: DEPOSIT APPROVAL --- */}
                {selectedDeposit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setSelectedDeposit(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><AlertCircle size={32} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Approve Deposit?</h2>
                                <p className="text-slate-500 mt-2 text-sm">Add <strong className="text-slate-900">${selectedDeposit.amount_usd}</strong> to <strong className="text-slate-900">{selectedDeposit.username}</strong>?</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedDeposit(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button onClick={confirmDepositApproval} disabled={isProcessing} className="flex-1 py-3 bg-[#009B9E] hover:bg-[#008B8E] text-white rounded-xl font-bold flex justify-center items-center gap-2">
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL 2: WITHDRAWAL APPROVAL (YENİ MODERN VERSİYON) --- */}
                {selectedWithdrawal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setSelectedWithdrawal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>

                            <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Withdrawal</h2>
                            <p className="text-slate-500 text-sm mb-6">Enter the Transaction ID (Hash) to complete this request.</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Amount:</span> <span className="font-bold text-red-600">-${selectedWithdrawal.amount}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">To:</span> <span className="font-mono text-slate-700 truncate max-w-[200px]">{selectedWithdrawal.address}</span></div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Hash</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={16} /></div>
                                    <input
                                        type="text"
                                        value={txInput}
                                        onChange={(e) => setTxInput(e.target.value)}
                                        className="w-full pl-9 pr-10 bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#009B9E] focus:border-transparent transition"
                                        placeholder="e.g. 8a2f..."
                                        autoFocus
                                    />
                                    <button
                                        onClick={handlePaste}
                                        className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-[#009B9E] transition"
                                        title="Paste from Clipboard"
                                    >
                                        <Clipboard size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setSelectedWithdrawal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button onClick={confirmWithdrawalApproval} disabled={isProcessing} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Approve & Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}