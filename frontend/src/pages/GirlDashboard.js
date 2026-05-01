import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';

const navItems = [
    { id: 'messages', label: 'Messages', icon: SparkleIcon },
    { id: 'direct', label: 'Direct', icon: HeartIcon },
    { id: 'groups', label: 'Groups', icon: HashIcon },
    { id: 'mentors', label: 'Mentors', icon: UsersIcon },
    { id: 'alerts', label: 'Alerts', icon: BellIcon },
    { id: 'settings', label: 'Settings', icon: GearIcon }
];

const filters = [
    { id: 'all', label: 'All', icon: SparkleIcon },
    { id: 'direct', label: 'Direct', icon: HeartIcon },
    { id: 'groups', label: 'Groups', icon: HashIcon },
    { id: 'mentors', label: 'Mentors', icon: ShieldIcon }
];

const suggestedRooms = [
    { id: 'lounge', title: 'Sisterhood Lounge', subtitle: '248 girls', icon: HashIcon },
    { id: 'wellness', title: 'Wellness Circle', subtitle: '132 girls', icon: HeartIcon },
    { id: 'mentor', title: 'Meet a mentor', subtitle: 'Verified women', icon: ShieldIcon }
];

export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const loadDashboard = async () => {
        const [mentorResponse, requestResponse] = await Promise.all([
            api.get('/mentor/all'),
            api.get('/mentor/my-requests')
        ]);
        setMentors(mentorResponse.data.mentors || []);
        setRequests(requestResponse.data.requests || []);
    };

    useEffect(() => {
        loadDashboard().catch((error) => {
            setMessage(error.response?.data?.message || 'Unable to load dashboard');
        });
    }, []);

    const pendingMentorIds = useMemo(() => {
        return new Set(requests.map((request) => request.mentor_id || request.mentorId));
    }, [requests]);

    const visibleMentors = mentors.filter((mentor) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return mentor.name?.toLowerCase().includes(query) || mentor.email?.toLowerCase().includes(query);
    });

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

    return (
        <main className="min-h-screen bg-[#f6efff] p-0 text-[#18151f] md:p-6">
            <section className="mx-auto flex min-h-screen max-w-6xl overflow-hidden bg-white shadow-2xl shadow-purple-200/70 md:min-h-[760px] md:rounded-[28px]">
                <aside className="hidden w-22 flex-col items-center bg-[#faf6ff] py-6 md:flex">
                    <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9b38eb] to-[#c451ea] text-white shadow-lg shadow-purple-300/60">
                        <SparkleIcon className="h-7 w-7" />
                    </button>

                    <nav className="mt-7 flex flex-1 flex-col items-center gap-4">
                        {navItems.slice(1).map((item, index) => {
                            const Icon = item.icon;
                            const active = index === 0;

                            return (
                                <button
                                    key={item.id}
                                    title={item.label}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                                        active
                                            ? 'bg-[#ead9ff] text-[#8e31df]'
                                            : 'text-[#19151f] hover:bg-[#f0e6fb] hover:text-[#8e31df]'
                                    }`}
                                >
                                    <Icon className="h-6 w-6" />
                                </button>
                            );
                        })}
                    </nav>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d7a8ff] bg-[#ffeaf3] text-sm font-bold text-[#6f2fd8]"
                    >
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </button>
                </aside>

                <section className="flex w-full flex-col bg-white md:w-[432px] md:flex-none">
                    <header className="px-6 pb-5 pt-8 md:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-normal text-[#18151f]">
                                    Messages
                                </h1>
                                <p className="mt-2 text-sm text-[#6f6879]">
                                    A safe space, just for us
                                </p>
                            </div>

                            <button
                                title="New conversation"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9637e8] to-[#c24fea] text-white shadow-xl shadow-purple-300/60"
                            >
                                <PlusIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <label className="mt-5 flex h-12 items-center gap-3 rounded-2xl bg-[#f8f6fa] px-4 text-[#716a7c]">
                            <SearchIcon className="h-5 w-5 flex-none" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search conversations..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#716a7c]"
                            />
                        </label>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {filters.map((filter) => {
                                const Icon = filter.icon;
                                const active = activeFilter === filter.id;

                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`flex h-8 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-gradient-to-r from-[#9637e8] to-[#c653ec] text-white shadow-lg shadow-purple-200'
                                                : 'bg-[#f7f5f7] text-[#625b6c] hover:bg-[#efe6f8]'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col justify-center px-7 pb-8">
                        {message && (
                            <p className="mb-5 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-[#7b2bd6]">
                                {message}
                            </p>
                        )}

                        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#eee4f5] bg-[#f6f1f8]">
                                <HeartIcon className="h-12 w-12 text-[#9d35e7]" />
                                <span className="absolute -right-1 -top-1 flex h-8 min-w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#9235e8] to-[#c64cec] px-2 text-sm font-extrabold text-white">
                                    {requests.length}
                                </span>
                            </div>

                            <h2 className="mt-6 text-base font-extrabold text-[#1c1821]">
                                No conversations yet
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#6f6879]">
                                Invite a friend or join a community to fill this space with sisterhood.
                            </p>

                            <button className="mt-6 w-full rounded-2xl border border-dashed border-[#bf79fb] px-4 py-3 text-left transition hover:bg-[#fbf7ff]">
                                <span className="block text-xs font-bold uppercase text-[#9d36e8]">
                                    Your invite
                                </span>
                                <span className="mt-1 flex items-center justify-between gap-3 text-sm font-bold text-[#1d1723]">
                                    sisterly.app/i/{(user?.name || 'maya').toLowerCase().split(' ')[0]}-001
                                    <CopyIcon className="h-5 w-5 flex-none text-[#9135e6]" />
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="hidden flex-1 flex-col overflow-y-auto bg-gradient-to-b from-[#fbf7ff] via-[#fbf9fd] to-[#f5effb] px-9 pb-10 md:flex">
                    <div className="relative mx-auto h-72 w-full max-w-lg overflow-hidden">
                        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#eddcff] blur-3xl" />
                        <div className="absolute left-1/2 top-3 h-64 w-64 -translate-x-1/2">
                            <div className="absolute left-[95px] top-2 h-14 w-14 rounded-full bg-[#efe1ff]" />
                            <div className="absolute left-[88px] top-16 h-28 w-24 rounded-t-full bg-gradient-to-b from-[#a568e4] to-[#63319e] opacity-80 blur-[1px]" />
                            <div className="absolute left-[58px] top-[116px] h-28 w-40 rounded-[50%] bg-gradient-to-b from-[#8e4dd1]/75 to-[#d8b2fa]/10 blur-sm" />
                            <div className="absolute left-[23px] top-[104px] h-32 w-52 rotate-[-17deg] rounded-full bg-[#b487ec]/20 blur-xl" />
                            <div className="absolute left-[115px] top-[96px] h-32 w-44 rotate-[24deg] rounded-full bg-[#7d42c5]/25 blur-xl" />
                            <div className="absolute left-[82px] top-7 h-24 w-24 rounded-full border border-[#b88ae9]/20" />
                        </div>
                    </div>

                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-3xl font-extrabold tracking-normal">
                            It's just you here <span className="bg-gradient-to-r from-[#8e30e7] to-[#6d36e8] bg-clip-text text-transparent">love</span>
                        </h2>
                        <p className="mt-3 text-[#6f6879]">Bring your girls in.</p>

                        <div className="mt-9 flex justify-center gap-3">
                            <button className="flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#9637e8] to-[#c653ec] px-7 font-bold text-white shadow-xl shadow-purple-200">
                                <UsersPlusIcon className="h-5 w-5" />
                                Invite
                            </button>
                            <button className="flex h-13 items-center gap-2 rounded-2xl bg-white px-7 font-bold text-[#221b2a] shadow-xl shadow-purple-100">
                                <CompassIcon className="h-5 w-5" />
                                Explore
                            </button>
                        </div>
                    </div>

                    <section className="mx-auto mt-11 w-full max-w-lg rounded-[28px] bg-white/85 p-7 shadow-xl shadow-purple-100/80">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#746d7e]">
                            Suggested for you
                        </p>

                        <div className="mt-6 space-y-3">
                            {suggestedRooms.map((room) => {
                                const Icon = room.icon;

                                return (
                                    <article key={room.id} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-[#faf6ff]">
                                        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[#9637e8] to-[#c653ec] text-white">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-extrabold text-[#211b28]">{room.title}</h3>
                                            <p className="text-sm text-[#6f6879]">{room.subtitle}</p>
                                        </div>
                                        <button title={`Join ${room.title}`} className="text-3xl leading-none text-[#746d7e] hover:text-[#9637e8]">
                                            +
                                        </button>
                                    </article>
                                );
                            })}

                            {visibleMentors.slice(0, 3).map((mentor) => {
                                const requested = pendingMentorIds.has(mentor.id);

                                return (
                                    <article key={mentor.id} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-[#faf6ff]">
                                        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#efe1ff] text-lg font-extrabold text-[#8f34e5]">
                                            {mentor.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-extrabold text-[#211b28]">{mentor.name}</h3>
                                            <p className="truncate text-sm text-[#6f6879]">
                                                {onlineUsers.includes(mentor.id) ? 'Online now' : mentor.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => requestMentor(mentor.id)}
                                            disabled={requested}
                                            className="rounded-full px-4 py-2 text-sm font-bold text-[#8f34e5] transition hover:bg-[#efe1ff] disabled:text-[#b7a9c2]"
                                        >
                                            {requested ? 'Sent' : 'Request'}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </section>
            </section>
        </main>
    );
}

function SparkleIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l1.5 5.2L19 10l-5.5 1.8L12 17l-1.5-5.2L5 10l5.5-1.8L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M18 15l.7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function HeartIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20.4 5.6a5.2 5.2 0 0 0-7.4 0L12 6.7l-1-1.1a5.2 5.2 0 0 0-7.4 7.4l1 1L12 21l7.4-7 1-1a5.2 5.2 0 0 0 0-7.4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function HashIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 3L7 21M17 3l-2 18M4 9h17M3 15h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function UsersIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16 11a4 4 0 1 0-3.3-6.3M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21a6 6 0 0 1 12 0M14 15a5.8 5.8 0 0 1 7 5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function GearIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z" stroke="currentColor" strokeWidth="2" />
            <path d="M19 12a7.8 7.8 0 0 0-.1-1l2-1.6-2-3.4-2.5 1a7 7 0 0 0-1.7-1L14.3 3h-4.6L9.3 6a7 7 0 0 0-1.7 1L5.1 6 3.1 9.4l2 1.6a7.8 7.8 0 0 0 0 2l-2 1.6 2 3.4 2.5-1a7 7 0 0 0 1.7 1l.4 3h4.6l.4-3a7 7 0 0 0 1.7-1l2.5 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function ShieldIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function PlusIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4zM16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function CopyIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 8h10v12H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function UsersPlusIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21a6 6 0 0 1 12 0M18 8v6M15 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function CompassIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="2" />
            <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}
