import { CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function TransactionHistory() {
    const { user } = useAuth();

    const { data: transactions = [], isLoading, isError, error, refetch } = useQuery({
        // Only run if user ID exists
        queryKey: ['transactions', user?.id],

        queryFn: async () => {
            if (!user?.id) return [];
            return await api.getTransactions(user.id);
        },

        enabled: !!user?.id,
        refetchOnWindowFocus: true,
    });

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
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
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Address</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
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
                            transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(tx.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">Deposit</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        ${tx.amount_usd}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-[120px] truncate" title={tx.address}>
                                        {tx.address}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(tx.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.address && (
                                            <a
                                                href={`https://mempool.space/address/${tx.address}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-xs font-medium"
                                            >
                                                View <ExternalLink size={10} />
                                            </a>
                                        )}
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