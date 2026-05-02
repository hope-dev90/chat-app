import { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';
import ChatBox from '../components/chat/ChatBox';

// ── Color System ───────────────────────────────────────────────
const colors = {
    primary: '#111827',
    secondary: '#6B7280',
    border: '#E5E7EB',
    background: '#FFFFFF',
    hover: '#F3F4F6',
    active: '#E5E7EB',
    accent: '#2563EB',
};

// ── Icons ──────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    messages: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18",
    settings: "M12 15a3 3 0 1 0 0-6",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0",
    plus: "M12 5v14M5 12h14",
    back: "M19 12H5M12 19l-7-7 7-7",
    search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0",
    spark: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

// ── Nav Item ───────────────────────────────────────────────────
const NavItem = ({ iconPath, active, onClick }) => (
    <button onClick={onClick} style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: active ? colors.primary : 'transparent',
        color: active ? '#fff' : colors.secondary,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <Icon d={iconPath} />
    </button>
);

// ── Conversation Item ──────────────────────────────────────────
const ConversationItem = ({ name, preview, active, onClick }) => (
    <div onClick={onClick} style={{
        display: 'flex',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 10,
        cursor: 'pointer',
        background: active ? colors.active : 'transparent',
    }}>
        <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: colors.hover,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            color: colors.primary,
        }}>
            {name[0]}
        </div>

        <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{name}</p>
            <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>{preview}</p>
        </div>
    </div>
);

// ── Main ───────────────────────────────────────────────────────
export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);

    const [activeNav, setActiveNav] = useState('messages');
    const [activeChat, setActiveChat] = useState(null);
    const [search, setSearch] = useState('');

    const conversations = [
        { id: 1, name: 'General Community', preview: 'Start chatting...' },
        { id: 2, name: 'Girls Only', preview: 'Safe space 💜' },
    ];

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            background: colors.background,
        }}>

            {/* Sidebar */}
            <div style={{
                width: 70,
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 12,
            }}>
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    marginBottom: 20,
                }}>
                    <Icon d={icons.spark} />
                </div>

                <NavItem iconPath={icons.heart} active={activeNav === 'messages'} onClick={() => setActiveNav('messages')} />

                <div style={{ marginTop: 'auto' }}>
                    <div onClick={logout} style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: colors.primary,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}>
                        {user?.name?.[0]}
                    </div>
                </div>
            </div>

            {/* Conversations */}
            <div style={{
                width: 300,
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ padding: 20 }}>
                    <h2 style={{ margin: 0 }}>Messages</h2>

                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            marginTop: 12,
                            width: '100%',
                            padding: 10,
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                        }}
                    />
                </div>

                <div style={{ padding: 10 }}>
                    {conversations.map(c => (
                        <ConversationItem
                            key={c.id}
                            {...c}
                            active={activeChat?.id === c.id}
                            onClick={() => setActiveChat(c)}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                {!activeChat ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.secondary,
                    }}>
                        Select a conversation
                    </div>
                ) : (
                    <ChatBox key={activeChat.id} />
                )}
            </div>
        </div>
    );
}