import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';
import ChatBox from '../components/chat/ChatBox';

// ── Design tokens ──────────────────────────────────────────────
const C = {
    sidebarBg:   '#4B3FA0',
    accent:      '#4B3FA0',
    pageBg:      '#FAF9FF',
    panelBg:     '#FFFFFF',
    border:      '#E4DEFF',
    lavender:    '#F3F0FF',
    activeItem:  '#EEEDFE',
    avatarBg:    '#CECBF6',
    avatarText:  '#3C3489',
    textPrimary: '#2E2270',
    textMuted:   '#8B80C8',
    textTime:    '#B0A8D9',
    online:      '#5DCAA5',
};

const rooms = [
    { id: 'general', name: 'General Community', subtitle: 'Everyone in the app', type: 'general' },
    { id: 'girls',   name: 'Girls Circle',       subtitle: 'Girls-only safe space',  type: 'girls'   },
    { id: 'mentor',  name: 'My Mentor',           subtitle: 'Guidance and support',   type: 'mentor'  },
];

export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [myMentor, setMyMentor] = useState(null);
    const [active, setActive] = useState({
        kind: 'chat',
        data: { roomType: 'general', otherUserId: null, name: 'General Community', subtitle: 'Everyone in the app' }
    });
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');

    const loadDashboard = async () => {
        const [mentorRes, requestRes, myMentorRes] = await Promise.all([
            api.get('/mentor/all'),
            api.get('/mentor/my-requests'),
            api.get('/mentor/my-mentor').catch(() => null),
        ]);
        setMentors(mentorRes.data.mentors || []);
        setRequests(requestRes.data.requests || []);
        setMyMentor(myMentorRes?.data?.mentor || null);
    };

    useEffect(() => {
        loadDashboard().catch(err => setMessage(err.response?.data?.message || 'Unable to load dashboard'));
    }, []);

    const requestedMentorIds = useMemo(
        () => new Set(requests.map(r => r.mentor_id || r.mentorId)),
        [requests]
    );

    const filteredMentors = mentors.filter(m => {
        const q = search.trim().toLowerCase();
        return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    });

    const requestMentor = async (mentorId) => {
        setMessage('');
        try {
            const { data } = await api.post('/mentor/request', { mentorId });
            setMessage(data.message || 'Mentor request sent.');
            await loadDashboard();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Unable to send request');
        }
    };

    const openRoom = (room) => {
        if (room.id === 'mentor') {
            if (!myMentor) { setActive({ kind: 'empty-mentor' }); return; }
            setActive({ kind: 'chat', data: { roomType: 'mentor', otherUserId: myMentor.mentor_id, name: myMentor.mentor_name, subtitle: myMentor.mentor_email } });
            return;
        }
        if (room.id === 'girls') { setActive({ kind: 'empty-girls', data: room }); return; }
        setActive({ kind: 'chat', data: { roomType: room.type, otherUserId: null, name: room.name, subtitle: room.subtitle } });
    };

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', background: C.pageBg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* ── Far-left icon rail ─────────────────────── */}
            <Rail user={user} logout={logout} />

            {/* ── Conversation list ──────────────────────── */}
            <div style={{ width: 220, flexShrink: 0, borderRight: `0.5px solid ${C.border}`, background: C.panelBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '18px 14px 10px' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, marginBottom: 10 }}>Messages</p>
                    <SearchBox value={search} onChange={setSearch} placeholder="Search…" />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
                    {rooms.map(room => (
                        <ConvItem
                            key={room.id}
                            title={room.name}
                            subtitle={room.id === 'mentor' && myMentor ? myMentor.mentor_name : room.subtitle}
                            active={active.data?.roomType === room.type || active.data?.name === room.name}
                            onClick={() => openRoom(room)}
                        />
                    ))}
                    {filteredMentors.length > 0 && (
                        <p style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px 8px 4px' }}>Mentors</p>
                    )}
                    {filteredMentors.map(mentor => (
                        <ConvItem
                            key={mentor.id}
                            title={mentor.name}
                            subtitle={onlineUsers.includes(mentor.id) ? 'Online' : mentor.email}
                            online={onlineUsers.includes(mentor.id)}
                            active={active.data?.otherUserId === mentor.id}
                            onClick={() => setActive({ kind: 'mentor-card', data: mentor })}
                        />
                    ))}
                </div>
            </div>

            {/* ── Chat / main area ───────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.panelBg }}>
                <ChatHeader title={active.data?.name || 'Girls Circle'} subtitle={active.data?.subtitle || ''} />
                <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    {active.kind === 'chat' && (
                        <ChatBox roomType={active.data.roomType} otherUserId={active.data.otherUserId} key={`${active.data.roomType}-${active.data.otherUserId || 'room'}`} />
                    )}
                    {active.kind === 'mentor-card' && (
                        <CenteredPanel title={active.data.name} subtitle={active.data.email}
                            actionLabel={requestedMentorIds.has(active.data.id) ? 'Request sent' : 'Request mentor'}
                            disabled={requestedMentorIds.has(active.data.id)}
                            onAction={() => requestMentor(active.data.id)} message={message} />
                    )}
                    {active.kind === 'empty-girls' && (
                        <EmptyPanel title="It's just you here" body="When another girl joins, the girls-only room will open."
                            actionLabel="Explore mentors" onAction={() => setActive(mentors[0] ? { kind: 'mentor-card', data: mentors[0] } : { kind: 'empty-mentor' })} />
                    )}
                    {active.kind === 'empty-mentor' && (
                        <EmptyPanel title="No mentor connected yet" body="Request a mentor from the list to start a private chat."
                            actionLabel="Find a mentor" onAction={() => setActive(mentors[0] ? { kind: 'mentor-card', data: mentors[0] } : { kind: 'empty-mentor' })} />
                    )}
                </div>
            </div>

            {/* ── Right detail panel ─────────────────────── */}
            <DetailsPanel user={user}
                title={active.data?.name || 'Girls Circle'}
                subtitle={active.data?.subtitle || active.data?.email || 'Safe community space'}
                info={[['Role', 'Girl'], ['Mentors', `${mentors.length}`], ['Requests', `${requests.length}`]]}
            />
        </div>
    );
}

// ── Rail ───────────────────────────────────────────────────────
function Rail({ user, logout }) {
    return (
        <div style={{ width: 56, flexShrink: 0, background: C.sidebarBg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <ChatIcon color="#fff" />
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <RailBtn icon={<ChatIcon color="#fff" />} active />
                <RailBtn icon={<LockIcon color="rgba(255,255,255,0.5)" />} />
                <RailBtn icon={<HeartIcon color="rgba(255,255,255,0.5)" />} />
                <RailBtn icon={<GridIcon color="rgba(255,255,255,0.5)" />} />
                <RailBtn icon={<GearIcon color="rgba(255,255,255,0.5)" />} />
            </nav>
            <button onClick={logout} style={{ width: 32, height: 32, borderRadius: '50%', background: C.avatarBg, color: C.avatarText, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.name?.[0]?.toUpperCase() || 'G'}
            </button>
        </div>
    );
}

function RailBtn({ icon, active }) {
    return (
        <button style={{ width: 34, height: 34, borderRadius: 10, background: active ? 'rgba(255,255,255,0.18)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </button>
    );
}

// ── Search box ─────────────────────────────────────────────────
function SearchBox({ value, onChange, placeholder }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.lavender, borderRadius: 8, padding: '6px 10px' }}>
            <SearchIcon color={C.textMuted} />
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: C.textPrimary, fontFamily: 'inherit' }}
            />
        </div>
    );
}

// ── Conversation item ──────────────────────────────────────────
function ConvItem({ title, subtitle, active, online, onClick }) {
    return (
        <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10, background: active ? C.activeItem : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.lavender; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.avatarBg, color: C.avatarText, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                {title[0]?.toUpperCase()}
                {online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: C.online, border: '1.5px solid #fff' }} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
            </div>
        </button>
    );
}

// ── Chat header ────────────────────────────────────────────────
function ChatHeader({ title, subtitle }) {
    return (
        <div style={{ flexShrink: 0, borderBottom: `0.5px solid ${C.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: C.panelBg }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.avatarBg, color: C.avatarText, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {title[0]?.toUpperCase()}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{title}</p>
                {subtitle && <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{subtitle}</p>}
            </div>
        </div>
    );
}

// ── Centered / empty panels ────────────────────────────────────
function CenteredPanel({ title, subtitle, actionLabel, disabled, onAction, message }) {
    return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.pageBg, padding: 32 }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.activeItem, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <HeartIcon color={C.accent} />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{title}</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.textMuted }}>{subtitle}</p>
                {message && <p style={{ margin: '0 0 16px', fontSize: 12, color: C.accent, background: C.lavender, borderRadius: 8, padding: '8px 12px' }}>{message}</p>}
                <button disabled={disabled} onClick={onAction} style={{ background: disabled ? C.textMuted : C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}

function EmptyPanel({ title, body, actionLabel, onAction }) {
    return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.pageBg, padding: 32 }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.activeItem, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ChatIcon color={C.accent} />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{title}</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{body}</p>
                <button onClick={onAction} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}

// ── Right details panel ────────────────────────────────────────
function DetailsPanel({ user, title, subtitle, info }) {
    return (
        <div style={{ width: 210, flexShrink: 0, borderLeft: `0.5px solid ${C.border}`, background: C.panelBg, padding: '20px 16px', overflowY: 'auto', display: 'none' }}
            className="md:block">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.avatarBg, color: C.avatarText, fontSize: 18, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    {title[0]?.toUpperCase()}
                </div>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{subtitle}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                    <PhoneIcon color={C.textMuted} /><VideoIcon color={C.textMuted} /><MailIcon color={C.textMuted} />
                </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Connection</p>
            <div style={{ background: C.lavender, borderRadius: 12, padding: '10px 12px', marginBottom: 20 }}>
                {[...info, ['Signed in', user?.name]].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: C.textMuted }}>{label}</span>
                        <span style={{ color: C.textPrimary, fontWeight: 500 }}>{value}</span>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Media</p>
            {['Chat support.pdf', 'Community guide.png', 'Mentor notes.doc'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.activeItem, borderRadius: 7, padding: '7px 10px', marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>📄</span>
                    <span style={{ fontSize: 11, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
                </div>
            ))}
        </div>
    );
}

// ── SVG icons ──────────────────────────────────────────────────
function SearchIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM16 16l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>; }
function ChatIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg>; }
function LockIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" stroke={color} strokeWidth="2" /></svg>; }
function HeartIcon({ color = 'currentColor' }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6.5a5 5 0 0 0-7 0l-1 1-1-1a5 5 0 0 0-7 7L12 21l8-7.5a5 5 0 0 0 0-7z" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg>; }
function GridIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke={color} strokeWidth="2" /></svg>; }
function GearIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="2" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.6-.9L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.6.9L5.1 6l-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.6.9l.4 3.1h5l.4-3.1a7 7 0 0 0 1.6-.9l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" stroke={color} strokeWidth="2" /></svg>; }
function DiamondIcon({ color = 'currentColor' }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 9-8 9-8-9 8-9z" stroke={color} strokeWidth="2" /></svg>; }
function PhoneIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 4l3 3-2 2c1 3 3 5 6 6l2-2 3 3-2 4C9 19 5 15 4 8l2-4z" stroke={color} strokeWidth="2" /></svg>; }
function VideoIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h11v12H4zM15 10l5-3v10l-5-3" stroke={color} strokeWidth="2" /></svg>; }
function MailIcon({ color = 'currentColor' }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke={color} strokeWidth="2" /></svg>; }
