import { useEffect, useState, useMemo } from 'react';
import {
    RefreshCw, X, AlertCircle, Loader2,
    ArrowDownLeft, ArrowUpRight, Hash, Copy, Clipboard,
    Users, Search, ArrowUp, ArrowDown // Yeni ikonlar eklendi
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';
import { formatCurrency, formatDate } from '../../utils/format';

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
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    tx_hash?: string;
    created_at: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    usd_balance: number;
    created_at: string;
    is_verified?: boolean;
}

// Sıralama Tipi
type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: keyof User;
    direction: SortDirection;
}

export default function AdminDashboard() {
    const lang = 'en' as const;

    // --- STATE ---
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // USER MANAGEMENT STATES
    const [users, setUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // FILTER & SORT STATES (YENİ EKLENDİ)
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userSortConfig, setUserSortConfig] = useState<SortConfig | null>({ key: 'id', direction: 'desc' });

    // MODAL STATES
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
    const [txInput, setTxInput] = useState("");

    // --- DATA FETCHING ---
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

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.getAdminUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("User Fetch Error:", error);
            toast.error("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleOpenUserModal = () => {
        setIsUserModalOpen(true);
        fetchUsers();
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // --- SORTING & FILTERING LOGIC (YENİ) ---
    const handleUserSort = (key: keyof User) => {
        let direction: SortDirection = 'asc';
        if (userSortConfig && userSortConfig.key === key && userSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setUserSortConfig({ key, direction });
    };

    const sortedAndFilteredUsers = useMemo(() => {
        let processedData = [...users];

        // 1. Filter
        if (userSearchTerm) {
            const term = userSearchTerm.toLowerCase();
            processedData = processedData.filter(u =>
                u.username.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                u.role.toLowerCase().includes(term)
            );
        }

        // 2. Sort
        if (userSortConfig) {
            processedData.sort((a, b) => {
                const aValue = a[userSortConfig.key];
                const bValue = b[userSortConfig.key];

                // String comparison
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return userSortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                // Number comparison
                if (aValue < bValue) return userSortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return userSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processedData;
    }, [users, userSearchTerm, userSortConfig]);

    const renderSortIcon = (key: keyof User) => {
        if (userSortConfig?.key !== key) return <div className="w-4" />;
        return userSortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    // --- ACTION FUNCTIONS ---
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
            setTxInput("");
        } catch (error: any) {
            toast.error(error.message || "Failed", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
                        <p className="text-slate-500">Real-time financial requests & user monitoring.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleOpenUserModal}
                            className="flex items-center gap-2 bg-[#0F172A] text-white border border-transparent px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm font-bold shadow-sm"
                        >
                            <Users size={18} /> User Management
                        </button>

                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition text-sm font-medium shadow-sm text-slate-700"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>

                {/* DEPOSITS TABLE */}
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
                                                <td className="px-6 py-4 text-slate-500">{formatDate(deposit.created_at, lang)}</td>
                                                <td className="px-6 py-4 font-medium">{deposit.username || 'Unknown'}</td>
                                                <td className="px-6 py-4 font-bold text-green-600">+{formatCurrency(deposit.amount_usd, lang)}</td>
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

                {/* WITHDRAWALS TABLE */}
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
                                                <td className="px-6 py-4 text-slate-500">{formatDate(w.created_at, lang)}</td>
                                                <td className="px-6 py-4 font-medium">{w.username || 'Unknown'}</td>
                                                <td className="px-6 py-4 font-bold text-red-600">-{formatCurrency(w.amount, lang)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 truncate max-w-[120px]" title={w.address}>{w.address}</code>
                                                        <button onClick={() => { navigator.clipboard.writeText(w.address); toast.success("Copied") }} className="text-slate-400 hover:text-slate-600"><Copy size={12} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {w.status === 'completed' ?
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Paid</span> :
                                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">Action Needed</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {w.status === 'pending' && (
                                                        <button onClick={() => { setSelectedWithdrawal(w); setTxInput(""); }} className="bg-[#0F172A] text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition">
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

                {/* MODAL 1: DEPOSIT APPROVAL */}
                {selectedDeposit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setSelectedDeposit(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><AlertCircle size={32} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Approve Deposit?</h2>
                                <p className="text-slate-500 mt-2 text-sm">Add <strong className="text-slate-900">{formatCurrency(selectedDeposit.amount_usd, lang)}</strong> to <strong className="text-slate-900">{selectedDeposit.username}</strong>?</p>
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

                {/* MODAL 2: WITHDRAWAL APPROVAL */}
                {selectedWithdrawal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setSelectedWithdrawal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Withdrawal</h2>
                            <p className="text-slate-500 text-sm mb-6">Enter the Transaction ID (Hash) to complete this request.</p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Amount:</span>
                                    <span className="font-bold text-red-600">-{formatCurrency(selectedWithdrawal.amount, lang)}</span>
                                </div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">To:</span> <span className="font-mono text-slate-700 truncate max-w-[200px]">{selectedWithdrawal.address}</span></div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Hash</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={16} /></div>
                                    <input type="text" value={txInput} onChange={(e) => setTxInput(e.target.value)} className="w-full pl-9 pr-10 bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#009B9E] focus:border-transparent transition" placeholder="e.g. 8a2f..." autoFocus />
                                    <button onClick={handlePaste} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-[#009B9E] transition" title="Paste from Clipboard"><Clipboard size={16} /></button>
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

                {/* MODAL 3: USER MANAGEMENT LIST (UPDATED WITH SEARCH & SORT) */}
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col relative animate-in slide-in-from-bottom-5 duration-300">

                            {/* Modal Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-slate-200 gap-4">
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-700"><Users size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                                        <p className="text-sm text-slate-500">Total Registered: {users.length}</p>
                                    </div>
                                </div>

                                {/* SEARCH BAR (NEW) */}
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search user..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#009B9E] outline-none text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={fetchUsers} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Refresh List">
                                        <RefreshCw size={20} className={loadingUsers ? "animate-spin" : ""} />
                                    </button>
                                    <button onClick={() => setIsUserModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body (Table) */}
                            <div className="flex-1 overflow-auto p-0">
                                {loadingUsers ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                        <Loader2 size={40} className="animate-spin text-[#009B9E]" />
                                        <p>Loading users...</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('id')}>
                                                    <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('username')}>
                                                    <div className="flex items-center gap-1">Username {renderSortIcon('username')}</div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('email')}>
                                                    <div className="flex items-center gap-1">Email {renderSortIcon('email')}</div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('role')}>
                                                    <div className="flex items-center gap-1">Role {renderSortIcon('role')}</div>
                                                </th>
                                                <th className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('usd_balance')}>
                                                    <div className="flex items-center justify-end gap-1">Balance {renderSortIcon('usd_balance')}</div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleUserSort('created_at')}>
                                                    <div className="flex items-center gap-1">Joined At {renderSortIcon('created_at')}</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {sortedAndFilteredUsers.length === 0 ? (
                                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                    {userSearchTerm ? "No users match your search." : "No users found."}
                                                </td></tr>
                                            ) : (
                                                sortedAndFilteredUsers.map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50 transition">
                                                        <td className="px-6 py-4 font-mono text-slate-400">#{u.id}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                                                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {u.role.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono font-medium text-[#009B9E]">
                                                            {formatCurrency(u.usd_balance / 100, lang)}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                                            {formatDate(u.created_at, lang)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl text-right">
                                <button onClick={() => setIsUserModalOpen(false)} className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 shadow-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}