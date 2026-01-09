import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CheckCircle, Clock, XCircle, Loader2, Search, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function AdminDeposits() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all'); // all | pending | completed

    // Verileri Çek
    const { data: deposits = [], isLoading } = useQuery({
        queryKey: ['admin-deposits'],
        queryFn: api.getAllDeposits,
        refetchInterval: 10000 // 10 saniyede bir otomatik yenile (Canlı takip)
    });

    // Onaylama Fonksiyonu
    const handleApprove = async (id: number, amount: number, username: string) => {
        if (!window.confirm(`Are you sure you want to approve $${amount} for ${username}?`)) return;

        const toastId = toast.loading("Processing approval...");
        try {
            await api.manualApproveDeposit(id);
            toast.success("Deposit approved successfully!", { id: toastId });
            queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    // Filtreleme
    const filteredDeposits = deposits.filter((d: any) => {
        if (filter === 'all') return true;
        return d.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Completed</span>;
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit animate-pulse"><Clock size={12} /> Pending</span>;
            default:
                return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> {status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Deposit Management</h1>
                        <p className="text-slate-500">Monitor and approve Bitcoin deposits.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>All</button>
                        <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Pending</button>
                        <button onClick={() => setFilter('completed')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${filter === 'completed' ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Completed</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">ID / Date</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount (USD)</th>
                                    <th className="px-6 py-4">BTC Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>
                                ) : filteredDeposits.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">No deposits found.</td></tr>
                                ) : (
                                    filteredDeposits.map((deposit: any) => (
                                        <tr key={deposit.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-slate-400">#{deposit.id}</span>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {new Date(deposit.created_at).toLocaleDateString()}
                                                    <br />
                                                    {new Date(deposit.created_at).toLocaleTimeString().slice(0, 5)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{deposit.username || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500">{deposit.email}</div>
                                                <div className="text-xs text-slate-400 mt-1">UID: {deposit.user_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-bold text-slate-900">${deposit.amount_usd}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-[200px]">
                                                    <span className="font-mono text-xs text-slate-600 truncate">{deposit.address}</span>
                                                    <button onClick={() => { navigator.clipboard.writeText(deposit.address); toast.success("Copied") }} className="text-slate-400 hover:text-slate-600"><Copy size={12} /></button>
                                                </div>
                                                <a href={`https://mempool.space/address/${deposit.address}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 text-xs mt-1 inline-flex items-center gap-1">
                                                    Check Blockchain <ExternalLink size={10} />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(deposit.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {deposit.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprove(deposit.id, deposit.amount_usd, deposit.username)}
                                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
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
        </div>
    );
}