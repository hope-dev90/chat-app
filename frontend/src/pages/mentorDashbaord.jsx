import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';
import ChatBox from '../components/chat/ChatBox';
import MentorSidebar from '../components/layout/mentorSideBar';
import PendingRequests from '../components/mentor/pendingRequest';
import MenteeList from '../components/mentor/MenteeList';
import api from '../api/axios';

export default function MentorDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);

    const [activeTab, setActiveTab] = useState('requests');
    const [activeMentee, setActiveMentee] = useState(null);
    const [activeDM, setActiveDM] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const tabs = [
        { id: 'requests', label: '📋 Requests', desc: 'Pending requests' },
        { id: 'mentees', label: '👧 My Mentees', desc: 'Approved girls' },
        { id: 'general', label: '🌍 General', desc: 'Community chat' },
        { id: 'dm', label: '💬 DMs', desc: 'Private chats' },
    ];

    return (
        <div className="h-screen bg-gray-950 flex overflow-hidden">

            {/* ── Sidebar ─────────────────────────────────── */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-black transform transition-transform duration-300
                lg:relative lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <MentorSidebar
                    user={user}
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setActiveMentee(null);
                        setActiveDM(null);
                        setSidebarOpen(false);
                    }}
                    onLogout={logout}
                    onlineUsers={onlineUsers}
                />
            </div>

            {/* Sidebar overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main Content ────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">

                {/* Top navbar */}
                <div className="bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">

                        {/* Mobile menu */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            ☰
                        </button>

                        {/* Current room info */}
                        <div>
                            <h2 className="text-white font-semibold">
                                {activeTab === 'requests' && '📋 Pending Requests'}
                                {activeTab === 'mentees' && !activeMentee && '👧 My Mentees'}
                                {activeTab === 'mentees' && activeMentee && `💬 ${activeMentee.name}`}
                                {activeTab === 'general' && '🌍 General Community'}
                                {activeTab === 'dm' && !activeDM && '💬 Direct Messages'}
                                {activeTab === 'dm' && activeDM && `💬 ${activeDM.name}`}
                            </h2>
                            <p className="text-gray-500 text-xs">
                                {activeTab === 'requests' && 'Girls waiting for approval'}
                                {activeTab === 'mentees' && !activeMentee && 'Your approved mentees'}
                                {activeTab === 'mentees' && activeMentee && 'Mentor chat'}
                                {activeTab === 'general' && 'Chat with everyone'}
                                {activeTab === 'dm' && 'Private conversation'}
                            </p>
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-gray-300 text-sm hidden sm:block">
                            {user?.name}
                        </span>
                        <span className="text-blue-500 text-xs hidden sm:block">
                            Mentor
                        </span>
                    </div>
                </div>

                {/* ── Content Area ────────────────────────── */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Pending Requests */}
                    {activeTab === 'requests' && (
                        <PendingRequests />
                    )}

                    {/* My Mentees */}
                    {activeTab === 'mentees' && (
                        <div className="flex flex-1 overflow-hidden">
                            {!activeMentee ? (
                                <MenteeList
                                    onSelectMentee={(mentee) => setActiveMentee(mentee)}
                                    onlineUsers={onlineUsers}
                                />
                            ) : (
                                <ChatBox
                                    roomType="mentor"
                                    otherUserId={activeMentee.girl_id}
                                    key={`mentor-${activeMentee.girl_id}`}
                                    onBack={() => setActiveMentee(null)}
                                    chatName={activeMentee.girl_name}
                                />
                            )}
                        </div>
                    )}

                    {/* General Chat */}
                    {activeTab === 'general' && (
                        <ChatBox
                            roomType="general"
                            otherUserId={null}
                            key="general"
                        />
                    )}

                    {/* DMs */}
                    {activeTab === 'dm' && (
                        <div className="flex flex-1 overflow-hidden">
                            {!activeDM ? (
                                <DMListMentor
                                    onSelectUser={(u) => setActiveDM(u)}
                                    onlineUsers={onlineUsers}
                                />
                            ) : (
                                <ChatBox
                                    roomType="dm"
                                    otherUserId={activeDM.id}
                                    key={`dm-${activeDM.id}`}
                                    onBack={() => setActiveDM(null)}
                                    chatName={activeDM.name}
                                />
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// ── DM List for Mentor ─────────────────────────────────────────
function DMListMentor({ onSelectUser, onlineUsers }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/mentor/my-mentees');
                setUsers(res.data.mentees);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(u =>
        u.girl_name.toLowerCase().includes(search.toLowerCase())
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

            {/* Users list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filtered.length === 0 && (
                    <p className="text-gray-500 text-center mt-8">
                        No mentees found
                    </p>
                )}
                {filtered.map(u => (
                    <div
                        key={u.girl_id}
                        onClick={() => onSelectUser({
                            id: u.girl_id,
                            name: u.girl_name
                        })}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer transition"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {u.girl_name?.[0]?.toUpperCase()}
                            </div>
                            {onlineUsers.includes(u.girl_id) && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
                            )}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{u.girl_name}</p>
                            <p className="text-gray-500 text-xs">
                                {onlineUsers.includes(u.girl_id) ? '🟢 Online' : '⚫ Offline'}
                            </p>
                        </div>
                        <div className="ml-auto text-gray-500 text-xs">
                            💬
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}