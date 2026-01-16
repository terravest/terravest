import { CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, AlertTriangle, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../App';
import { content } from '../content';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

// Flexible type definition compatible with backend data
interface Transaction {
    id: number;
    type: string; // Can be 'DEPOSIT', 'WITHDRAWAL', 'SELL' etc., keeping as string for flexibility.
    amount: number;
    status: string;
    created_at: string;
    tx_hash?: string;
    target_address?: string;
    description?: string;
}

export default function TransactionHistory() {
    const { user } = useAuth();
    const lang = useContext(LanguageContext);
    const t = content[lang];

    const { data: transactions = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            const res = await api.getTransactions();
            // 🛡️ GUARDS: Does backend return an array directly or data inside an object? Cover all cases.
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.data)) return res.data;
            if (res && Array.isArray(res.transactions)) return res.transactions;
            return []; // Return empty array if format is unrecognized
        },
        enabled: !!user?.id,
        refetchOnWindowFocus: false,
    });

    const getStatusLabel = (status: string) => {
        const key = status.toLowerCase();
        return t.common.status[key] || status;
    };

    // Status Badge Helper (Case-Insensitive)
    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        const label = getStatusLabel(status);
        if (s === 'completed' || s === 'approved' || s === 'success') {
            return (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                    <CheckCircle size={12} /> {label}
                </span>
            );
        }
        if (s === 'pending' || s === 'processing') {
            return (
                <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">
                    <Clock size={12} /> {label}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                <XCircle size={12} /> {label}
            </span>
        );
    };

    // Helper to determine icon and color based on type
    const getTypeLabel = (type: string) => {
        const key = type.toLowerCase();
        if (t.common.transactionTypes[key]) return t.common.transactionTypes[key];
        return type.replace(/_/g, ' ').toLowerCase();
    };

    const getTypeStyles = (type: string) => {
        const key = type.toLowerCase();
        if (key.includes('deposit') || key.includes('sell') || key.includes('rent')) {
            return { icon: <ArrowDownLeft size={18} />, color: 'bg-green-100 text-green-600' };
        }
        return { icon: <ArrowUpRight size={18} />, color: 'bg-slate-100 text-slate-600' };
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <History className="text-[#009B9E]" size={20} />
                    <h3 className="font-bold text-slate-800 text-lg">{t.transactionHistory.title}</h3>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    title={t.transactionHistory.refreshTitle}
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4">{t.transactionHistory.columnType}</th>
                            <th className="px-6 py-4">{t.transactionHistory.columnDate}</th>
                            <th className="px-6 py-4">{t.transactionHistory.columnAmount}</th>
                            <th className="px-6 py-4">{t.transactionHistory.columnInfo}</th>
                            <th className="px-6 py-4">{t.transactionHistory.columnStatus}</th>
                            <th className="px-6 py-4 text-right">{t.transactionHistory.columnExplorer}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <RefreshCw className="animate-spin" size={18} /> {t.transactionHistory.loading}
                                    </div>
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-red-500 bg-red-50/10">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertTriangle size={24} />
                                        <p className="font-bold">{t.transactionHistory.errorTitle}</p>
                                        <p className="text-xs">
                                            {error instanceof Error ? error.message : t.transactionHistory.errorFallback}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-slate-50 p-3 rounded-full"><History size={24} /></div>
                                        <p>{t.transactionHistory.empty}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx: Transaction) => {
                                const { icon, color } = getTypeStyles(tx.type);
                                const isPositive = ['DEPOSIT', 'SELL', 'RENT_DISTRIBUTION'].includes(tx.type.toUpperCase());

                                return (
                                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/80 transition-colors">
                                        {/* TYPE */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${color}`}>
                                                    {icon}
                                                </div>
                                                <span className="font-bold text-slate-700 capitalize">
                                                    {getTypeLabel(tx.type)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* DATE */}
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="font-medium">{formatDate(tx.created_at, lang)}</div>
                                            <div className="text-xs text-slate-400">{formatTime(tx.created_at, lang)}</div>
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <span className={isPositive ? 'text-green-600' : 'text-slate-900'}>
                                                {isPositive ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), lang)}
                                            </span>
                                        </td>

                                        {/* ADDRESS / INFO */}
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                                            {tx.target_address || tx.description || '-'}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>

                                        {/* EXPLORER LINK */}
                                        <td className="px-6 py-4 text-right">
                                            {tx.tx_hash ? (
                                                <a
                                                    href={`https://mempool.space/tx/${tx.tx_hash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#009B9E] hover:text-[#007f82] inline-flex items-center gap-1 text-xs font-bold border border-[#009B9E]/20 px-2 py-1 rounded hover:bg-[#009B9E]/5 transition"
                                                >
                                                    {t.transactionHistory.viewTx} <ExternalLink size={10} />
                                                </a>
                                            ) : tx.target_address ? (
                                                <a
                                                    href={`https://mempool.space/address/${tx.target_address}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 text-xs font-medium"
                                                >
                                                    {t.transactionHistory.viewAddress} <ExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <span className="text-slate-300 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}