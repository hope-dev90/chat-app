import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';

const menu = [
    { id: 'requests', title: 'Pending Requests', subtitle: 'Girls waiting for approval', color: 'blue' },
    { id: 'mentees',  title: 'My Mentees',        subtitle: 'Approved girls',             color: 'blue' },
    { id: 'community',title: 'Mentor Space',       subtitle: 'Guidance dashboard',         color: 'teal' },
];

export default function MentorDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [requests, setRequests]   = useState([]);
    const [mentees, setMentees]     = useState([]);
    const [active, setActive]       = useState('requests');
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState('');
    const [message, setMessage]     = useState('');
    const [processing, setProcessing] = useState(null);

    const loadDashboard = async () => {
        const [pRes, mRes] = await Promise.all([
            api.get('/mentor/pending'),
            api.get('/mentor/my-mentees'),
        ]);
        setRequests(pRes.data.requests || []);
        setMentees(mRes.data.mentees   || []);
    };

    useEffect(() => {
        loadDashboard().catch(e => setMessage(e.response?.data?.message || 'Unable to load dashboard'));
    }, []);

    const updateRequest = async (requestId, action) => {
        setProcessing(requestId);
        setMessage('');
        try {
            const { data } = await api.put(`/mentor/${action}/${requestId}`);
            setMessage(data.message || `Request ${action}d.`);
            await loadDashboard();
            setSelected(null);
        } catch (e) {
            setMessage(e.response?.data?.message || 'Unable to update request');
        } finally {
            setProcessing(null);
        }
    };

    const q = search.trim().toLowerCase();
    const filteredRequests = requests.filter(r =>
        !q || r.girl_name?.toLowerCase().includes(q) || r.girl_email?.toLowerCase().includes(q)
    );
    const filteredMentees = mentees.filter(m =>
        !q || (m.girl_name || m.name || '').toLowerCase().includes(q)
    );
    const visibleList  = active === 'requests' ? filteredRequests : active === 'mentees' ? filteredMentees : [];
    const activeTitle  = active === 'requests' ? 'Pending Requests' : active === 'mentees' ? 'My Mentees' : 'Mentor Space';

    return (
        <main className="h-screen bg-[#F9FAFB] p-0 text-[#111827] md:p-5 overflow-hidden">
            <section className="mx-auto grid h-full max-w-6xl grid-cols-1 overflow-hidden bg-white shadow-sm md:grid-cols-[72px_280px_minmax(0,1fr)_260px] md:rounded-lg border border-[#E5E7EB]">

                <Rail user={user} logout={logout} />

                {/* ── Sidebar list ─────────────────────────── */}
                <aside className="border-r border-[#E5E7EB] bg-[#F9FAFB] px-5 py-6">
                    <SearchBox value={search} onChange={setSearch} placeholder="Search student" />

                    <div className="mt-7 space-y-3">
                        {menu.map(item => (
                            <ConversationButton
                                key={item.id}
                                title={item.title}
                                subtitle={item.subtitle}
                                meta={item.id === 'requests' ? `${requests.length}` : item.id === 'mentees' ? `${mentees.length}` : ''}
                                accent={item.color}
                                active={active === item.id}
                                onClick={() => { setActive(item.id); setSelected(null); }}
                            />
                        ))}

                        {visibleList.map(item => {
                            const name  = item.girl_name || item.name  || 'Student';
                            const email = item.girl_email || item.email || 'Mentee';
                            return (
                                <ConversationButton
                                    key={item.id || item.girl_id}
                                    title={name}
                                    subtitle={email}
                                    meta={active === 'requests' ? 'request' : 'mentee'}
                                    accent="blue"
                                    active={(selected?.id || selected?.girl_id) === (item.id || item.girl_id)}
                                    onClick={() => setSelected(item)}
                                />
                            );
                        })}
                    </div>
                </aside>

                {/* ── Main content ─────────────────────────── */}
                <section className="flex h-full flex-col bg-white overflow-hidden">
                    <Header title={selected ? (selected.girl_name || selected.name) : activeTitle} online />

                    <div className="flex-1 overflow-y-auto bg-white px-8 py-8 min-h-0">
                        {message && (
                            <p className="mb-6 w-fit rounded-lg bg-[#EFF6FF] px-4 py-3 text-xs font-semibold text-[#2563EB] shadow-sm border border-[#BFDBFE]">
                                {message}
                            </p>
                        )}

                        {active === 'requests' && selected && (
                            <RequestConversation
                                request={selected}
                                processing={processing}
                                onApprove={() => updateRequest(selected.id, 'approve')}
                                onReject={() => updateRequest(selected.id, 'reject')}
                            />
                        )}

                        {active === 'requests' && !selected && (
                            <EmptyPanel
                                title={requests.length ? 'Choose a request' : 'No pending requests'}
                                body={requests.length ? 'Select a girl from the list to approve or reject her mentor request.' : 'Girls will appear here when they request you as a mentor.'}
                            />
                        )}

                        {active === 'mentees' && selected && (
                            <MenteeConversation mentee={selected} />
                        )}

                        {active === 'mentees' && !selected && (
                            <EmptyPanel
                                title={mentees.length ? 'Choose a mentee' : 'No mentees yet'}
                                body={mentees.length ? 'Select a mentee to view her profile.' : 'Approved girls will show here after you accept requests.'}
                            />
                        )}

                        {active === 'community' && (
                            <EmptyPanel
                                title="Mentor Space"
                                body="Use this dashboard to review requests, support approved girls, and keep your mentorship organized."
                            />
                        )}
                    </div>
                </section>

                {/* ── Details panel ────────────────────────── */}
                <DetailsPanel
                    user={user}
                    title={selected ? (selected.girl_name || selected.name) : user?.name}
                    subtitle={selected ? (selected.girl_email || selected.email) : 'Mentor dashboard'}
                    info={[
                        ['Role',    'Mentor'],
                        ['Pending', `${requests.length}`],
                        ['Mentees', `${mentees.length}`],
                    ]}
                />

            </section>
        </main>
    );
}

// ── Sub-components ─────────────────────────────────────────────

function RequestConversation({ request, processing, onApprove, onReject }) {
    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-7">
            <Bubble align="left"  text={`${request.girl_name} sent a mentor request.`} />
            <Bubble align="right" text="Review her request and choose whether to start the mentorship." />

            <div className="rounded-lg bg-[#F9FAFB] p-5 shadow-sm border border-[#E5E7EB]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Student</p>
                <h2 className="mt-3 text-2xl font-bold text-[#111827]">{request.girl_name}</h2>
                <p className="mt-1 text-sm text-[#6B7280]">{request.girl_email}</p>
                <p className="mt-3 text-xs text-[#9CA3AF]">
                    Requested {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'recently'}
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onApprove}
                        disabled={processing === request.id}
                        className="rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition disabled:bg-[#9CA3AF]"
                    >
                        {processing === request.id ? 'Working...' : 'Approve'}
                    </button>
                    <button
                        onClick={onReject}
                        disabled={processing === request.id}
                        className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#374151] shadow-sm border border-[#E5E7EB] hover:bg-[#F3F4F6] transition"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

function MenteeConversation({ mentee }) {
    const name  = mentee.girl_name  || mentee.name;
    const email = mentee.girl_email || mentee.email;
    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-7">
            <Bubble align="left"  text={`${name} is one of your approved mentees.`} />
            <Bubble align="right" text="Keep checking in and make sure she has support when she needs it." />
            <div className="rounded-lg bg-[#F9FAFB] p-5 shadow-sm border border-[#E5E7EB]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Mentee profile</p>
                <h2 className="mt-3 text-2xl font-bold text-[#111827]">{name}</h2>
                <p className="mt-1 text-sm text-[#6B7280]">{email}</p>
            </div>
        </div>
    );
}

function Bubble({ align, text }) {
    const own = align === 'right';
    return (
        <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm rounded-lg px-5 py-4 text-xs leading-6 shadow-sm ${own ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#374151]'}`}>
                {text}
            </div>
        </div>
    );
}

function EmptyPanel({ title, body }) {
    return (
        <div className="grid h-full min-h-[420px] place-items-center">
            <div className="max-w-md text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#E5E7EB] text-[#6B7280]">
                    <ChatIcon />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-[#111827]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">{body}</p>
            </div>
        </div>
    );
}

function Rail({ user, logout }) {
    return (
        <aside className="hidden flex-col items-center border-r border-[#E5E7EB] bg-white py-6 md:flex">
            <div className="mb-10 h-5 w-5 rounded-lg bg-[#2563EB]" />
            <nav className="flex flex-1 flex-col gap-8 text-[#6B7280]">
                <IconButton icon={<ChatIcon />} active />
                <IconButton icon={<LockIcon />} />
                <IconButton icon={<GridIcon />} />
                <IconButton icon={<GearIcon />} />
            </nav>
            <button
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#111827] text-sm font-bold text-white"
            >
                {user?.name?.[0]?.toUpperCase() || 'M'}
            </button>
        </aside>
    );
}

function SearchBox({ value, onChange, placeholder }) {
    return (
        <label className="flex h-10 items-center gap-3 rounded-lg bg-white px-3 text-[#6B7280] shadow-sm border border-[#E5E7EB]">
            <SearchIcon />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-xs outline-none placeholder:text-[#9CA3AF]"
            />
        </label>
    );
}

function ConversationButton({ title, subtitle, meta, accent, active, onClick }) {
    const colors = { blue: 'bg-[#2563EB]', teal: 'bg-[#0D9488]' };
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${active ? 'bg-[#F3F4F6] shadow-sm' : 'hover:bg-[#F9FAFB]'}`}
        >
            <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${colors[accent] || 'bg-[#374151]'} text-white`}>
                <ChatDotIcon />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#111827]">{title}</span>
                <span className="block truncate text-[10px] text-[#6B7280]">{subtitle}</span>
            </span>
            <span className="text-[9px] text-[#9CA3AF]">{meta}</span>
        </button>
    );
}

function Header({ title, online }) {
    return (
        <header className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-7">
            <SearchIcon className="text-[#6B7280]" />
            <div className="text-center">
                <h1 className="text-xs font-semibold text-[#111827]">{title}</h1>
                {online && <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />}
            </div>
            <GearIcon className="text-[#6B7280]" />
        </header>
    );
}

function DetailsPanel({ user, title, subtitle, info }) {
    return (
        <aside className="hidden border-l border-[#E5E7EB] bg-[#F9FAFB] px-6 py-7 md:block">
            <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#374151] text-white">
                    <DiamondIcon />
                </div>
                <h2 className="mt-5 text-sm font-semibold text-[#111827]">{title}</h2>
                <p className="mt-1 text-[10px] text-[#6B7280]">{subtitle}</p>
                <div className="mt-6 flex justify-center gap-5 text-[#6B7280]">
                    <PhoneIcon /><VideoIcon /><MailIcon />
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xs font-semibold text-[#111827]">Mentorship</h3>
                <div className="mt-3 space-y-2 rounded-lg bg-white p-4 shadow-sm border border-[#E5E7EB]">
                    {info.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 text-[11px]">
                            <span className="text-[#6B7280]">{label}</span>
                            <span className="font-semibold text-[#111827]">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between gap-3 text-[11px]">
                        <span className="text-[#6B7280]">Signed in</span>
                        <span className="font-semibold text-[#111827]">{user?.name}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xs font-semibold text-[#111827]">Media</h3>
                <div className="mt-3 space-y-3">
                    {['Request notes.pdf', 'Support plan.doc', 'Community guide.png'].map(item => (
                        <div key={item} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-[#E5E7EB]">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563EB] text-[10px] font-bold text-white">File</span>
                            <span className="truncate text-[11px] text-[#6B7280]">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

function IconButton({ icon, active }) {
    return <button className={active ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#111827]'}>{icon}</button>;
}

// ── Icons ──────────────────────────────────────────────────────
function SearchIcon({ className = '' }) {
    return <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ChatIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}
function ChatDotIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 6h14v9H8l-3 3V6z" stroke="currentColor" strokeWidth="2" /><path d="M9 10h.01M12 10h.01M15 10h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}
function LockIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function GridIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function GearIcon({ className = '' }) {
    return <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.6-.9L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.6.9L5.1 6l-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.6.9l.4 3.1h5l.4-3.1a7 7 0 0 0 1.6-.9l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function DiamondIcon() {
    return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 9-8 9-8-9 8-9z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function PhoneIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M6 4l3 3-2 2c1 3 3 5 6 6l2-2 3 3-2 4C9 19 5 15 4 8l2-4z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function VideoIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h11v12H4zM15 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="2" /></svg>;
}
function MailIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" /></svg>;
}
