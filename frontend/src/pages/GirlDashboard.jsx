import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import ChatBox from '../components/chat/ChatBox';
import Sidebar from '../components/layout/sidebar';
import MentorList from '../components/mentor/MentorList';
import DMList from '../components/chat/DMList';

export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);

    const [activeTab, setActiveTab] = useState('general');
    const [activeDM, setActiveDM] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get current room based on active tab
    const getCurrentRoom = () => {
        if (activeTab === 'general') return { roomType: 'general', otherUserId: null };
        if (activeTab === 'girls') return { roomType: 'girls', otherUserId: null };
        if (activeTab === 'mentor') return { roomType: 'mentor', otherUserId: activeDM?.id };
        if (activeTab === 'dm') return { roomType: 'dm', otherUserId: activeDM?.id };
        return null;
    };

    const tabs = [
        { id: 'general', label: '🌍 General', desc: 'Everyone' },
        { id: 'girls', label: '👩‍👧 Girls', desc: 'Girls only' },
        { id: 'mentor', label: '🧑‍🏫 Mentor', desc: 'Your mentor' },
        { id: 'dm', label: '💬 DMs', desc: 'Private chats' },
    ];

    return (
        <div className="h-screen w-screen bg-gray-950 flex overflow-hidden fixed inset-0">

            {/* ── Sidebar - FIXED/STATIC ───────────────── */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-black transform transition-transform duration-300
                lg:relative lg:translate-x-0 flex-shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar
                    user={user}
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setActiveDM(null);
                        setSidebarOpen(false);
                    }}
                    onLogout={logout}
                    onlineUsers={onlineUsers}
                />
            </div>

            {/* Sidebar overlay for mobile - FIXED */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main Content ────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top navbar - FIXED/STATIC */}
                <div className="flex-shrink-0 bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            ☰
                        </button>

                        {/* Current room info */}
                        <div>
                            <h2 className="text-white font-semibold">
                                {activeTab === 'general' && '🌍 General Community'}
                                {activeTab === 'girls' && '👩‍👧 Girls Community'}
                                {activeTab === 'mentor' && `🧑‍🏫 ${activeDM?.name || 'My Mentor'}`}
                                {activeTab === 'dm' && `💬 ${activeDM?.name || 'Direct Messages'}`}
                            </h2>
                            <p className="text-gray-500 text-xs">
                                {activeTab === 'general' && 'Chat with everyone'}
                                {activeTab === 'girls' && 'Girls only space'}
                                {activeTab === 'mentor' && 'Chat with your mentor'}
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
                    </div>
                </div>

                {/* ── Content Area ────────────────────────── */}
                <div className="flex-1 flex overflow-hidden">

                    {/* General Chat */}
                    {activeTab === 'general' && (
                        <ChatBox
                            roomType="general"
                            otherUserId={null}
                            key="general"
                        />
                    )}

                    {/* Girls Chat */}
                    {activeTab === 'girls' && (
                        <ChatBox
                            roomType="girls"
                            otherUserId={null}
                            key="girls"
                        />
                    )}

                    {/* Mentor Chat */}
                    {activeTab === 'mentor' && (
                        <div className="flex flex-1 overflow-hidden">
                            {!activeDM ? (
                                <MentorList
                                    onSelectMentor={(mentor) => setActiveDM(mentor)}
                                />
                            ) : (
                                <ChatBox
                                    roomType="mentor"
                                    otherUserId={activeDM.id}
                                    key={`mentor-${activeDM.id}`}
                                    onBack={() => setActiveDM(null)}
                                    chatName={activeDM.name}
                                />
                            )}
                        </div>
                    )}

                    {/* DMs */}
                    {activeTab === 'dm' && (
                        <div className="flex flex-1 overflow-hidden">
                            {!activeDM ? (
                                <DMList
                                    onSelectUser={(dmUser) => setActiveDM(dmUser)}
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