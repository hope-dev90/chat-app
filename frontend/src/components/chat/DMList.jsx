import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function DMList({ onSelectUser, onlineUsers }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/mentor/all');
            setUsers(res.data.mentors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filtered.map(u => (
                    <div
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer transition"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {u.name?.[0]?.toUpperCase()}
                            </div>
                            {onlineUsers.includes(u.id) && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
                            )}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{u.name}</p>
                            <p className="text-gray-500 text-xs">
                                {onlineUsers.includes(u.id) ? '🟢 Online' : '⚫ Offline'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}