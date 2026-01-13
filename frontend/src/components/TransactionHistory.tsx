import { CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Backend'den gelen birleşmiş veri tipi
interface Transaction {
    type: 'deposit' | 'withdrawal';
    id: number;
    amount: number;
    status: string;
    created_at: string;
    tx_hash?: string;
    target_address?: string;
}

export default function TransactionHistory() {
    const { user } = useAuth();

    const { data: transactions = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            const res = await api.getTransactions();
            return res.success ? res.data : [];
        },
        enabled: !!user?.id,
        refetchOnWindowFocus: false, // Sayfa odağı değişince sürekli istek atmasın
    });

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return (
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle size={12} /> Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">
                        <Clock size={12} /> Pending
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                        <XCircle size={12} /> {status}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Transaction History</h3>
                <button
                    onClick={() => refetch()}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Address / Info</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Chain</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <RefreshCw className="animate-spin" size={16} /> Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <AlertTriangle size={16} />
                                        Error: {error instanceof Error ? error.message : "Failed to fetch data"}
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx: Transaction) => (
                                <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/80 transition-colors">

                                    {/* TYPE (Deposit vs Withdraw) */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <span className="font-bold text-slate-700 capitalize">{tx.type}</span>
                                        </div>
                                    </td>

                                    {/* DATE */}
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="font-medium">{new Date(tx.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</div>
                                    </td>

                                    {/* AMOUNT */}
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        <span className={tx.type === 'deposit' ? 'text-green-600' : 'text-slate-900'}>
                                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                        </span>
                                    </td>

                                    {/* ADDRESS */}
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-[120px] truncate">
                                        {tx.target_address || '-'}
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-6 py-4">
                                        {getStatusBadge(tx.status)}
                                    </td>

                                    {/* LINK (TX Hash or Address) */}
                                    <td className="px-6 py-4 text-right">
                                        {tx.tx_hash ? (
                                            <a
                                                href={`https://mempool.space/tx/${tx.tx_hash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-xs font-medium"
                                            >
                                                TX Check <ExternalLink size={10} />
                                            </a>
                                        ) : tx.target_address ? (
                                            <a
                                                href={`https://mempool.space/address/${tx.target_address}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 text-xs font-medium"
                                            >
                                                View Addr <ExternalLink size={10} />
                                            </a>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}