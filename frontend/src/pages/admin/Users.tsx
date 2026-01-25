import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { User, Shield, Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface UserData {
    id: number;
    username: string;
    email: string;
    usd_balance: number; // Cent cinsinden
    role: string;
    created_at: string;
    is_verified: number;
}

export default function Users() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            if (res.success) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#009B9E]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-[#009B9E]" /> Users Management
                </h1>
                <div className="text-slate-400 text-sm">
                    Total: <span className="text-white font-bold">{users.length}</span>
                </div>
            </div>

            {/* Arama Çubuğu */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-[#009B9E] outline-none"
                />
            </div>

            {/* Tablo */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase border-b border-slate-700">
                                <th className="p-4">ID</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-4 text-slate-500 font-mono text-xs">#{user.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{user.username}</div>
                                        <div className="text-xs text-slate-400">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/30">
                                                <Shield size={10} /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">User</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-[#009B9E] font-bold">
                                        {formatCurrency(user.usd_balance / 100)}
                                    </td>
                                    <td className="p-4">
                                        {user.is_verified ? (
                                            <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded">Verified</span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded">Pending</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}