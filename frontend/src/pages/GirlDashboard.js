import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';
import ChatBox from '../components/chat/ChatBox';

const rooms = [
    { id: 'general', name: 'General Community', subtitle: 'Everyone in the app', type: 'general', accent: 'blue' },
    { id: 'girls', name: 'Girls Circle', subtitle: 'Girls-only safe space', type: 'girls', accent: 'teal' },
    { id: 'mentor', name: 'My Mentor', subtitle: 'Guidance and support', type: 'mentor', accent: 'purple' }
];

export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [myMentor, setMyMentor] = useState(null);
    const [active, setActive] = useState({
        kind: 'chat',
        data: {
            roomType: 'general',
            otherUserId: null,
            name: 'General Community',
            subtitle: 'Everyone in the app'
        }
    });
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');

    const loadDashboard = async () => {
        const [mentorResponse, requestResponse, myMentorResponse] = await Promise.all([
            api.get('/mentor/all'),
            api.get('/mentor/my-requests'),
            api.get('/mentor/my-mentor').catch(() => null)
        ]);

        setMentors(mentorResponse.data.mentors || []);
        setRequests(requestResponse.data.requests || []);
        setMyMentor(myMentorResponse?.data?.mentor || null);
    };

    useEffect(() => {
        loadDashboard().catch((error) => {
            setMessage(error.response?.data?.message || 'Unable to load dashboard');
        });
    }, []);

    const requestedMentorIds = useMemo(() => {
        return new Set(requests.map((request) => request.mentor_id || request.mentorId));
    }, [requests]);

    const filteredMentors = mentors.filter((mentor) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return mentor.name?.toLowerCase().includes(query) || mentor.email?.toLowerCase().includes(query);
    });

    const hasOtherGirls = false;

    const requestMentor = async (mentorId) => {
        setMessage('');

        try {
            const { data } = await api.post('/mentor/request', { mentorId });
            setMessage(data.message || 'Mentor request sent.');
            await loadDashboard();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to send request');
        }
    };

    const openMentorChat = () => {
        if (!myMentor) {
            setActive({ kind: 'empty-mentor' });
            return;
        }

        setActive({
            kind: 'chat',
            data: {
                roomType: 'mentor',
                otherUserId: myMentor.mentor_id,
                name: myMentor.mentor_name,
                subtitle: myMentor.mentor_email
            }
        });
    };

    const openRoom = (room) => {
        if (room.id === 'mentor') {
            openMentorChat();
            return;
        }

        if (room.id === 'girls' && !hasOtherGirls) {
            setActive({ kind: 'empty-girls', data: room });
            return;
        }

        setActive({
            kind: 'chat',
            data: {
                roomType: room.type,
                otherUserId: null,
                name: room.name,
                subtitle: room.subtitle
            }
        });
    };

    return (
        <main className="min-h-screen bg-[#8f72ff] p-0 text-[#202134] md:p-5">
            <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 overflow-hidden bg-white shadow-2xl md:min-h-[720px] md:grid-cols-[72px_280px_minmax(0,1fr)_260px] md:rounded-sm">
                <Rail user={user} logout={logout} />

                <aside className="border-r border-[#f0eff8] bg-[#fbfbff] px-5 py-6">
                    <SearchBox value={search} onChange={setSearch} placeholder="Search contact" />

                    <div className="mt-7 space-y-3">
                        {rooms.map((room) => (
                            <ConversationButton
                                key={room.id}
                                title={room.name}
                                subtitle={room.subtitle}
                                meta={room.id === 'mentor' && myMentor ? myMentor.mentor_name : 'now'}
                                accent={room.accent}
                                active={active.data?.name === room.name || active.data?.roomType === room.type}
                                onClick={() => openRoom(room)}
                            />
                        ))}

                        {filteredMentors.map((mentor) => (
                            <ConversationButton
                                key={mentor.id}
                                title={mentor.name}
                                subtitle={onlineUsers.includes(mentor.id) ? 'Online mentor' : mentor.email}
                                meta={requestedMentorIds.has(mentor.id) ? 'sent' : 'mentor'}
                                accent="purple"
                                active={active.data?.otherUserId === mentor.id}
                                onClick={() => setActive({ kind: 'mentor-card', data: mentor })}
                            />
                        ))}
                    </div>
                </aside>

                <section className="flex min-h-[640px] flex-col bg-white">
                    <Header
                        title={active.data?.name || active.data?.title || 'Girls Circle'}
                        online
                    />

                    <div className="flex-1 overflow-hidden">
                        {active.kind === 'chat' && (
                            <ChatBox
                                roomType={active.data.roomType}
                                otherUserId={active.data.otherUserId}
                                key={`${active.data.roomType}-${active.data.otherUserId || 'room'}`}
                            />
                        )}

                        {active.kind === 'mentor-card' && (
                            <CenteredPanel
                                title={active.data.name}
                                subtitle={active.data.email}
                                actionLabel={requestedMentorIds.has(active.data.id) ? 'Request sent' : 'Request mentor'}
                                disabled={requestedMentorIds.has(active.data.id)}
                                onAction={() => requestMentor(active.data.id)}
                                message={message}
                            />
                        )}

                        {active.kind === 'empty-girls' && (
                            <EmptyPanel
                                title="It's just you here"
                                body="When another girl joins, the girls-only room will open for safe conversations."
                                actionLabel="Explore mentors"
                                onAction={() => setActive(mentors[0] ? { kind: 'mentor-card', data: mentors[0] } : { kind: 'empty-mentor' })}
                            />
                        )}

                        {active.kind === 'empty-mentor' && (
                            <EmptyPanel
                                title="No mentor connected yet"
                                body="Request a mentor from the list, then your private mentor chat will appear here."
                                actionLabel="Find a mentor"
                                onAction={() => setActive(mentors[0] ? { kind: 'mentor-card', data: mentors[0] } : { kind: 'empty-mentor' })}
                            />
                        )}
                    </div>
                </section>

                <DetailsPanel
                    user={user}
                    title={active.data?.name || 'Girls Circle'}
                    subtitle={active.data?.subtitle || active.data?.email || 'Safe community space'}
                    info={[
                        ['Role', 'Girl'],
                        ['Mentors', `${mentors.length} available`],
                        ['Requests', `${requests.length} sent`]
                    ]}
                />
            </section>
        </main>
    );
}

function Rail({ user, logout }) {
    return (
        <aside className="hidden flex-col items-center border-r border-[#f0eff8] bg-white py-6 md:flex">
            <div className="mb-10 h-5 w-5 rounded-lg bg-gradient-to-br from-[#6a61ff] to-[#7ee4d1]" />
            <nav className="flex flex-1 flex-col gap-8 text-[#9aa0b8]">
                <IconButton icon={<ChatIcon />} active />
                <IconButton icon={<LockIcon />} />
                <IconButton icon={<HeartIcon />} />
                <IconButton icon={<GridIcon />} />
                <IconButton icon={<GearIcon />} />
            </nav>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full bg-[#8f72ff] text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'G'}
            </button>
        </aside>
    );
}

function SearchBox({ value, onChange, placeholder }) {
    return (
        <label className="flex h-10 items-center gap-3 rounded-sm bg-white px-3 text-[#a5a9bd] shadow-sm">
            <SearchIcon />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-xs outline-none placeholder:text-[#c0c4d3]"
            />
        </label>
    );
}

function ConversationButton({ title, subtitle, meta, accent, active, onClick }) {
    const colors = {
        blue: 'from-[#82cef7] to-[#67aef1]',
        teal: 'from-[#6fe3d1] to-[#54c9be]',
        purple: 'from-[#d468f4] to-[#8f72ff]'
    };

    return (
        <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-sm p-2 text-left transition ${active ? 'bg-white shadow-md' : 'hover:bg-white'}`}>
            <span className={`grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br ${colors[accent]} text-white shadow-lg`}>
                <ChatDotIcon />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-[#3b3d53]">{title}</span>
                <span className="block truncate text-[10px] text-[#a0a5b8]">{subtitle}</span>
            </span>
            <span className="text-[9px] text-[#c0c4d3]">{meta}</span>
        </button>
    );
}

function Header({ title, online }) {
    return (
        <header className="flex h-14 items-center justify-between border-b border-[#f0eff8] px-7">
            <SearchIcon className="text-[#9da3b9]" />
            <div className="text-center">
                <h1 className="text-xs font-extrabold text-[#25283c]">{title}</h1>
                {online && <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#43d17c]" />}
            </div>
            <GearIcon className="text-[#9da3b9]" />
        </header>
    );
}

function CenteredPanel({ title, subtitle, actionLabel, disabled, onAction, message }) {
    return (
        <div className="grid h-full place-items-center bg-[#fbfbff] px-8">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#d468f4] to-[#8f72ff] text-white shadow-xl shadow-purple-200">
                    <HeartIcon />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-[#25283c]">{title}</h2>
                <p className="mt-2 text-sm text-[#83889d]">{subtitle}</p>
                {message && <p className="mt-5 rounded-sm bg-white px-4 py-3 text-xs text-[#6a61ff] shadow">{message}</p>}
                <button disabled={disabled} onClick={onAction} className="mt-7 rounded-sm bg-[#6429ef] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 disabled:bg-[#b6b4ca]">
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}

function EmptyPanel({ title, body, actionLabel, onAction }) {
    return (
        <div className="grid h-full place-items-center bg-[#fbfbff] px-8">
            <div className="max-w-md text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2efff] text-[#8f72ff]">
                    <ChatIcon />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-[#25283c]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#83889d]">{body}</p>
                <button onClick={onAction} className="mt-7 rounded-sm bg-[#6429ef] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200">
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}

function DetailsPanel({ user, title, subtitle, info }) {
    return (
        <aside className="hidden border-l border-[#f0eff8] bg-[#fbfbff] px-6 py-7 md:block">
            <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#f5a4cf] to-[#8f72ff] text-white shadow-xl shadow-purple-200">
                    <DiamondIcon />
                </div>
                <h2 className="mt-5 text-sm font-extrabold text-[#31334a]">{title}</h2>
                <p className="mt-1 text-[10px] text-[#9ba0b4]">{subtitle}</p>
                <div className="mt-6 flex justify-center gap-5 text-[#9ba0b4]">
                    <PhoneIcon />
                    <VideoIcon />
                    <MailIcon />
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xs font-extrabold text-[#31334a]">Connection</h3>
                <div className="mt-3 space-y-2 rounded-sm bg-white p-4 shadow-sm">
                    {info.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 text-[11px]">
                            <span className="text-[#9ba0b4]">{label}</span>
                            <span className="font-bold text-[#31334a]">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between gap-3 text-[11px]">
                        <span className="text-[#9ba0b4]">Signed in</span>
                        <span className="font-bold text-[#31334a]">{user?.name}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xs font-extrabold text-[#31334a]">Media</h3>
                <div className="mt-3 space-y-3">
                    {['Chat support.pdf', 'Community guide.png', 'Mentor notes.doc'].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-sm bg-white p-3 shadow-sm">
                            <span className="grid h-8 w-8 place-items-center rounded-sm bg-[#76c9f5] text-[10px] font-bold text-white">File</span>
                            <span className="truncate text-[11px] text-[#73788c]">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

function IconButton({ icon, active }) {
    return <button className={active ? 'text-[#6429ef]' : 'hover:text-[#6429ef]'}>{icon}</button>;
}

function SearchIcon({ className = '' }) { return <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function ChatIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>; }
function ChatDotIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 6h14v9H8l-3 3V6z" stroke="currentColor" strokeWidth="2" /><path d="M9 10h.01M12 10h.01M15 10h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>; }
function LockIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" stroke="currentColor" strokeWidth="2" /></svg>; }
function HeartIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M20 6.5a5 5 0 0 0-7 0l-1 1-1-1a5 5 0 0 0-7 7L12 21l8-7.5a5 5 0 0 0 0-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>; }
function GridIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="2" /></svg>; }
function GearIcon({ className = '' }) { return <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.6-.9L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.6.9L5.1 6l-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.6.9l.4 3.1h5l.4-3.1a7 7 0 0 0 1.6-.9l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" stroke="currentColor" strokeWidth="2" /></svg>; }
function DiamondIcon() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 9-8 9-8-9 8-9z" stroke="currentColor" strokeWidth="2" /></svg>; }
function PhoneIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M6 4l3 3-2 2c1 3 3 5 6 6l2-2 3 3-2 4C9 19 5 15 4 8l2-4z" stroke="currentColor" strokeWidth="2" /></svg>; }
function VideoIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h11v12H4zM15 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="2" /></svg>; }
function MailIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" /></svg>; }
