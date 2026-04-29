import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function MenteeList({ onSelectMentee, onlineUsers }) {
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchMentees = async () => {
            try {
                const res = await api.get('/mentor/my-mentees');
                setMentees(res.data.mentees);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMentees();
    }, []);

    const filtered = mentees.filter(m =>
        m.girl_name.toLowerCase().includes(search.toLowerCase())
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
                    placeholder="Search mentees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Header */}
            <div className="px-4 py-3">
                <p className="text-gray-400 text-sm">
                    {mentees.length} mentee{mentees.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Mentees list */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
                {filtered.length === 0 && (
                    <div className="text-center mt-16">
                        <p className="text-6xl mb-4">👧</p>
                        <p className="text-gray-400">No mentees yet</p>
                        <p className="text-gray-600 text-sm mt-1">
                            Approve requests to get mentees
                        </p>
                    </div>
                )}
                {filtered.map(m => (
                    <div
                        key={m.girl_id}
                        onClick={() => onSelectMentee(m)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 cursor-pointer transition"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {m.girl_name?.[0]?.toUpperCase()}
                            </div>
                            {onlineUsers.includes(m.girl_id) && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-950"></div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{m.girl_name}</p>
                            <p className="text-gray-500 text-xs">
                                {onlineUsers.includes(m.girl_id) ? '🟢 Online' : '⚫ Offline'}
                            </p>
                        </div>

                        {/* Chat icon */}
                        <div className="text-gray-600 hover:text-blue-400 transition">
                            💬
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}