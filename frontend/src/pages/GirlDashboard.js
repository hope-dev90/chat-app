import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import { SocketContext } from "../context/socketContext";
import api from "../api/axios";
import ChatBox from "../components/chat/ChatBox";

// ── Icons ──────────────────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  mentees: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  opportunities: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  schedule: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  emoji: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  image: "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  plus: "M12 5v14M5 12h14",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  video: "M23 7l-7 5 7 5V7zM1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1V5z",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  cloud: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  analytics: "M18 20V10M12 20V4M6 20v-6",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  sync: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15",
  back: "M19 12H5M12 19l-7-7 7-7",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

const C = {
  blue: "#2563EB", blueDark: "#1D4ED8", blueLight: "#EFF6FF",
  green: "#22C55E", greenLight: "#DCFCE7",
  gray50: "#F9FAFB", gray100: "#F3F4F6", gray200: "#E5E7EB",
  gray400: "#9CA3AF", gray500: "#6B7280", gray700: "#374151", gray900: "#111827",
  white: "#FFFFFF", orange: "#F97316", teal: "#0D9488",
};

function Avatar({ initials = "?", size = 40, bg = C.blueLight, color = C.blue, online = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, fontWeight: 700, fontSize: size * 0.35, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {initials}
      </div>
      {online && <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: C.green, border: "2px solid white" }} />}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar({ activeNav, setActiveNav, user, logout }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { key: "circles",   label: "Circles",   icon: icons.opportunities },
    { key: "mentors",   label: "Mentors",   icon: icons.mentees },
    { key: "chat",      label: "Chat",      icon: icons.chat },
    { key: "schedule",  label: "Schedule",  icon: icons.schedule },
    { key: "settings",  label: "Settings",  icon: icons.settings },
  ];
  return (
    <aside style={{ width: 220, background: C.white, borderRight: `1px solid ${C.gray200}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.gray100}` }}>
        <Avatar initials={user?.name?.[0]?.toUpperCase() || "G"} size={40} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>● ONLINE</div>
        </div>
      </div>
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {navItems.map(item => {
          const active = activeNav === item.key;
          return (
            <button key={item.key} onClick={() => setActiveNav(item.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? C.blueLight : "transparent", color: active ? C.blue : C.gray500, fontWeight: active ? 600 : 400, fontSize: 14, marginBottom: 2, borderLeft: active ? `3px solid ${C.blue}` : "3px solid transparent", fontFamily: "inherit" }}>
              <Icon d={item.icon} size={18} stroke={active ? C.blue : C.gray400} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 16px 20px" }}>
        <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: C.gray500, fontSize: 14, fontFamily: "inherit" }}>
          <Icon d={icons.logout} size={18} stroke={C.gray400} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ── Conversation list ──────────────────────────────────────────
function ConversationList({ rooms, mentors, myMentor, onlineUsers, selected, onSelect, requests, onRequest }) {
  const [search, setSearch] = useState("");
  const allConvs = [
    { id: "general", name: "General Community", sub: "Everyone in the app", roomType: "general", otherUserId: null },
    { id: "girls",   name: "Girls Circle",       sub: "Girls-only space",    roomType: "girls",   otherUserId: null },
    ...(myMentor ? [{ id: `mentor-${myMentor.mentor_id}`, name: myMentor.mentor_name, sub: "Your mentor", roomType: "mentor", otherUserId: myMentor.mentor_id }] : []),
  ];
  const filteredMentors = mentors.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: 260, background: C.white, borderRight: `1px solid ${C.gray200}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.gray900 }}>Messages</h2>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ position: "relative" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px 8px 32px", borderRadius: 20, border: `1px solid ${C.gray200}`, background: C.gray50, fontSize: 13, color: C.gray700, outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {allConvs.map(conv => {
          const active = selected?.id === conv.id;
          return (
            <button key={conv.id} onClick={() => onSelect(conv)} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: active ? C.blueLight : "transparent", borderLeft: active ? `3px solid ${C.blue}` : "3px solid transparent" }}>
              <Avatar initials={conv.name[0]} size={40} online={conv.otherUserId ? onlineUsers.includes(conv.otherUserId) : false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.gray900 }}>{conv.name}</div>
                <div style={{ fontSize: 12, color: C.gray500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.sub}</div>
              </div>
            </button>
          );
        })}
        {filteredMentors.length > 0 && (
          <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.06em" }}>Mentors</div>
        )}
        {filteredMentors.map(m => {
          const requested = requests.has(m.id);
          return (
            <button key={m.id} onClick={() => onSelect({ id: `dm-${m.id}`, name: m.name, sub: m.email, roomType: "dm", otherUserId: m.id })} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = C.gray50}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Avatar initials={m.name[0]} size={36} online={onlineUsers.includes(m.id)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.gray900 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: C.gray400 }}>{onlineUsers.includes(m.id) ? "Online" : m.email}</div>
              </div>
              {!requested && (
                <button onClick={e => { e.stopPropagation(); onRequest(m.id); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.blue}`, background: "none", color: C.blue, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  Connect
                </button>
              )}
              {requested && <span style={{ fontSize: 11, color: C.gray400 }}>Sent</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Community Hub Dashboard (replaces DashboardHome) ──────────
const SyncBadge = ({ status }) => {
  const map = {
    offline: { label: "REACH OFFLINE", bg: "#FEF3C7", color: "#92400E" },
    pending: { label: "SYNC PENDING",  bg: "#DBEAFE", color: "#1E40AF" },
    synced:  { label: "SYNCED",        bg: "#D1FAE5", color: "#065F46" },
  };
  const s = map[status] || map.synced;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 20 }}>{s.label}</span>;
};

const TRENDING = [
  { tag: "#TechGrants2024",  category: "Trending in Scholarships & Funding", metric: "468 discussions today" },
  { tag: "#STEMLife",        category: "Trending in Career Growth",           metric: "1.2k active participants" },
  { tag: "#OfflineFirst",    category: "Trending in Development",             metric: "320 new resources saved" },
  { tag: "#GirlsWhoCodeRW", category: "Community Spotlight",                 metric: "Featured circle active now" },
];

const AVATAR_COLORS = ["#F59E0B","#10B981","#6366F1","#EC4899","#8B5CF6","#2563EB"];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DashboardHome({ user, mentors, myMentor, onlineUsers, onChatMentor, onRequest, requests, onGoCircles }) {
  const [circles, setCircles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeCircle, setActiveCircle] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);

  const loadPosts = () => {
    api.get('/posts')
      .then(r => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  };

  useEffect(() => {
    api.get('/circles').then(r => setCircles(r.data.circles || [])).catch(() => {});
    loadPosts();
  }, []);

  const handleJoin = async (circle) => {
    try {
      await api.post(`/circles/${circle.id}/join`);
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, is_member: true, member_count: Number(c.member_count) + 1 } : c));
    } catch (e) { console.error(e); }
  };

  const handleLike = async (postId) => {
    try { await api.post(`/posts/${postId}/like`); loadPosts(); }
    catch (e) { console.error(e); }
  };

  const submitPost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setPosting(true);
    try {
      await api.post('/posts', { title: newTitle.trim(), content: newBody.trim(), status: 'synced' });
      setNewTitle(''); setNewBody(''); setShowNewPost(false);
      loadPosts();
    } catch (e) { console.error(e); } finally { setPosting(false); }
  };

  if (activeCircle) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.gray200}`, background: C.white, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setActiveCircle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray500, fontSize: 13, fontFamily: 'inherit' }}>← Back</button>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: activeCircle.color || C.blue }} />
          <span style={{ fontWeight: 600, color: C.gray900 }}>{activeCircle.name}</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatBox roomType="circle" otherUserId={activeCircle.id} key={`circle-${activeCircle.id}`} chatName={activeCircle.name} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#F8FAFC" }}>
      {/* ── Center feed ─────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {/* Search bar */}
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: C.gray400, fontSize: 13 }}>
          🔍 <span>Search discussions, circles, or mentors...</span>
        </div>

        {/* Featured Circles */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.gray900 }}>Featured Circles</div>
              <div style={{ fontSize: 11, color: C.gray400 }}>Join spaces that align with your journey</div>
            </div>
            <button onClick={onGoCircles} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View all →</button>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {circles.slice(0, 2).map(c => (
              <div key={c.id} style={{ background: c.color || C.blue, borderRadius: 12, padding: "18px 16px", flex: 1, minWidth: 0, color: "#fff" }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{c.name}</div>
                <div style={{ fontSize: 11, opacity: 0.88, lineHeight: 1.5, marginBottom: 16 }}>{c.description || 'No description'}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>{c.member_count} Members</span>
                  {c.is_member
                    ? <button onClick={() => setActiveCircle(c)} style={{ background: "rgba(255,255,255,0.9)", color: c.color || C.blue, border: "none", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Open</button>
                    : <button onClick={() => handleJoin(c)} style={{ background: "#fff", color: c.color || C.blue, border: "none", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Join</button>
                  }
                </div>
              </div>
            ))}
            {circles.length === 0 && <p style={{ color: C.gray400, fontSize: 13 }}>No circles yet — check back soon!</p>}
          </div>
        </div>

        {/* Recent Discussions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.gray900 }}>Recent Discussions</div>
          <button onClick={() => setShowNewPost(v => !v)} style={{ padding: "6px 14px", borderRadius: 8, background: C.blue, color: C.white, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ New Post</button>
        </div>

        {/* New post form */}
        {showNewPost && (
          <div style={{ background: C.white, borderRadius: 10, padding: 16, border: `1px solid ${C.gray200}`, marginBottom: 14 }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 13, outline: "none", marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" }} />
            <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="What's on your mind?" rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.gray200}`, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={submitPost} disabled={posting || !newTitle.trim() || !newBody.trim()} style={{ padding: "8px 20px", borderRadius: 8, background: C.blue, color: C.white, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: (!newTitle.trim() || !newBody.trim()) ? 0.5 : 1 }}>
                {posting ? "Posting…" : "Post"}
              </button>
              <button onClick={() => setShowNewPost(false)} style={{ padding: "8px 16px", borderRadius: 8, background: C.gray100, color: C.gray700, border: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        )}

        {postsLoading && <p style={{ color: C.gray400, fontSize: 13 }}>Loading discussions…</p>}
        {!postsLoading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.gray400 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div>No discussions yet. Be the first to post!</div>
          </div>
        )}
        {posts.map((post, i) => (
          <div key={post.id} style={{ background: C.white, borderRadius: 10, padding: "16px", border: `1px solid #F1F5F9`, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {post.user_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gray900 }}>{post.user_name}</div>
                  <div style={{ fontSize: 10, color: C.gray400 }}>
                    {timeAgo(post.created_at)}
                    {post.hashtags?.filter(Boolean).length > 0 && (
                      <span style={{ color: C.blue }}> · {post.hashtags.filter(Boolean).map(h => `#${h}`).join(' ')}</span>
                    )}
                  </div>
                </div>
              </div>
              <SyncBadge status={post.status || 'synced'} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 5 }}>{post.title}</div>
            <div style={{ fontSize: 12, color: C.gray500, lineHeight: 1.5, marginBottom: 12 }}>{post.content}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => handleLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.gray500, fontFamily: "inherit", padding: 0 }}>
                👍 {post.like_count || 0}
              </button>
              <span style={{ fontSize: 12, color: C.gray500 }}>💬 {post.comment_count || 0}</span>
              <span style={{ fontSize: 12, color: C.blue, cursor: "pointer" }}>↗ Share</span>
            </div>
          </div>
        ))}
      </main>

      {/* ── Right sidebar ────────────────────────────────── */}
      <aside style={{ width: 240, flexShrink: 0, padding: "16px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", borderLeft: `1px solid ${C.gray200}` }}>
        {/* Community Buzz */}
        <div style={{ background: C.white, borderRadius: 10, padding: 14, border: `1px solid #F1F5F9` }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 12 }}>Community Buzz</div>
          {TRENDING.map((t, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{t.tag}</div>
              <div style={{ fontSize: 10, color: C.gray500 }}>{t.category}</div>
              <div style={{ fontSize: 10, color: C.gray400 }}>{t.metric}</div>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: 4, padding: "7px 0", borderRadius: 8, border: `1px solid ${C.gray200}`, background: C.white, color: C.gray700, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Explore All Trending</button>
        </div>

        {/* Offline Preparedness */}
        <div style={{ background: "#1E293B", borderRadius: 10, padding: 14, color: "#fff" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 8 }}>OFFLINE PREPAREDNESS</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>84% <span style={{ fontSize: 12, fontWeight: 400, color: C.green }}>Synced</span></div>
          <div style={{ height: 6, background: "#334155", borderRadius: 3, margin: "8px 0 10px" }}>
            <div style={{ width: "84%", height: "100%", background: C.green, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6, marginBottom: 10 }}>Most of your recent community threads and circles are available to read even without internet access.</div>
          <button style={{ width: "100%", padding: "7px 0", borderRadius: 8, background: C.blue, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Manage Offline Data</button>
        </div>

        {/* Top Mentors */}
        <div style={{ background: C.white, borderRadius: 10, padding: 14, border: `1px solid #F1F5F9` }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gray900, marginBottom: 12 }}>Top Mentors</div>
          {mentors.slice(0, 3).map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: [C.blueLight, "#FCE7F3", "#D1FAE5"][i % 3], color: [C.blue, "#BE185D", "#065F46"][i % 3], fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.gray900 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: C.gray400 }}>{onlineUsers.includes(m.id) ? "🟢 Online" : "Data Scientist"}</div>
              </div>
              <button onClick={() => !requests.has(m.id) && onRequest(m.id)} style={{ padding: "4px 12px", borderRadius: 20, background: C.blueLight, color: C.blue, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {requests.has(m.id) ? "Sent" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Circles tab (girl view) ────────────────────────────────────
function CirclesTab({ user }) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeCircle, setActiveCircle] = useState(null);

  const load = () => api.get('/circles').then(r => setCircles(r.data.circles || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleJoin = async (circle) => {
    try {
      await api.post(`/circles/${circle.id}/join`);
      showToast(`Joined "${circle.name}"!`);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Error'); }
  };

  const handleLeave = async (circle) => {
    try {
      await api.post(`/circles/${circle.id}/leave`);
      showToast(`Left "${circle.name}"`);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Error'); }
  };

  if (activeCircle) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.gray200}`, background: C.white, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setActiveCircle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray500, fontSize: 13, fontFamily: 'inherit' }}>← Back</button>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: activeCircle.color || C.blue }} />
          <span style={{ fontWeight: 600, color: C.gray900 }}>{activeCircle.name}</span>
          <span style={{ fontSize: 12, color: C.gray400 }}>{activeCircle.member_count} members</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatBox roomType="circle" otherUserId={activeCircle.id} key={`circle-${activeCircle.id}`} chatName={activeCircle.name} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: C.gray50 }}>
      {toast && <div style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', background: C.blue, color: C.white, padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast}</div>}
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: C.gray900 }}>Featured Circles</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: C.gray500 }}>Join spaces that align with your journey</p>
      {loading && <p style={{ color: C.gray400 }}>Loading circles…</p>}
      {!loading && circles.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 60, color: C.gray400 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔵</div>
          <div>No circles yet. Ask your mentor to create one!</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {circles.map(c => (
          <div key={c.id} style={{ background: c.color || C.blue, borderRadius: 12, padding: 20, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4, lineHeight: 1.5 }}>{c.description || 'No description'}</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 16 }}>by {c.creator_name} · {c.member_count} members</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {c.is_member ? (
                <>
                  <button onClick={() => setActiveCircle(c)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.25)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    💬 Open Chat
                  </button>
                  <button onClick={() => handleLeave(c)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Leave
                  </button>
                </>
              ) : (
                <button onClick={() => handleJoin(c)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.9)', color: c.color || C.blue, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Join Circle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mentorship tab — full chat with mentor ─────────────────────
function MentorshipTab({ user, mentors, myMentor, onlineUsers, onRequest, requests }) {
  const [view, setView] = useState('discover'); // 'discover' | 'chat'

  // If they have a mentor, default to chat view
  useEffect(() => {
    if (myMentor) setView('chat');
  }, [myMentor]);

  if (view === 'chat' && myMentor) {
    return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: mentor profile card */}
        <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${C.gray200}`, background: C.white, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.gray100}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.blueLight, color: C.blue, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {myMentor.mentor_name?.[0]}
                </div>
                {onlineUsers.includes(myMentor.mentor_id) && (
                  <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: C.green, border: '2px solid white' }} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.gray900 }}>{myMentor.mentor_name}</div>
                <div style={{ fontSize: 12, color: onlineUsers.includes(myMentor.mentor_id) ? C.green : C.gray400, fontWeight: 500 }}>
                  {onlineUsers.includes(myMentor.mentor_id) ? '● Active now' : '○ Offline'}
                </div>
              </div>
            </div>
            <div style={{ background: C.blueLight, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Your Mentor</div>
              <div style={{ fontSize: 12, color: C.gray700 }}>{myMentor.mentor_email}</div>
            </div>
          </div>

          {/* Switch to discover */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.gray100}` }}>
            <button onClick={() => setView('discover')} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.gray200}`, background: C.white, color: C.gray700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              🔍 Discover Other Mentors
            </button>
          </div>

          {/* Chat info */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>About This Chat</div>
            <div style={{ fontSize: 12, color: C.gray500, lineHeight: 1.7 }}>
              This is your private mentorship channel. All messages, files, and resources shared here are only visible to you and your mentor.
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '💬', label: 'Send messages & files' },
                { icon: '📎', label: 'Share documents' },
                { icon: '🖼️', label: 'Share images' },
                { icon: '😊', label: 'React with emojis' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.gray600 }}>
                  <span>{f.icon}</span><span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: full chat */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatBox
            roomType="mentor"
            otherUserId={myMentor.mentor_id}
            key={`mentor-${myMentor.mentor_id}`}
            chatName={myMentor.mentor_name}
          />
        </div>
      </div>
    );
  }

  // Discover view
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: C.gray50 }}>
      {myMentor && (
        <div style={{ background: C.white, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.gray200}`, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.blueLight, color: C.blue, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {myMentor.mentor_name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.gray900 }}>{myMentor.mentor_name}</span>
              <span style={{ fontSize: 11, background: C.greenLight, color: C.green, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>ACTIVE</span>
            </div>
            <div style={{ fontSize: 12, color: C.gray500 }}>Your current mentor</div>
          </div>
          <button onClick={() => setView('chat')} style={{ padding: '10px 20px', background: C.blue, color: C.white, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            💬 Open Chat
          </button>
        </div>
      )}

      <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: C.gray900 }}>Discover Mentors</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: C.gray500 }}>Find the perfect guide for your professional journey.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {mentors.map((m, i) => (
          <div key={m.id} style={{ background: C.white, borderRadius: 12, padding: '18px', border: `1px solid ${C.gray200}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: [C.blueLight, '#FCE7F3', '#D1FAE5'][i % 3], color: [C.blue, '#BE185D', '#065F46'][i % 3], fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.name[0]}
                </div>
                {onlineUsers.includes(m.id) && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: C.green, border: '2px solid white' }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.gray900 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: onlineUsers.includes(m.id) ? C.green : C.gray400 }}>
                  {onlineUsers.includes(m.id) ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.gray500, marginBottom: 14 }}>{m.email}</div>
            <button
              onClick={() => !requests.has(m.id) && onRequest(m.id)}
              disabled={requests.has(m.id)}
              style={{ width: '100%', padding: '9px', borderRadius: 8, border: `1.5px solid ${requests.has(m.id) ? C.gray200 : '#EF4444'}`, background: C.white, color: requests.has(m.id) ? C.gray400 : '#EF4444', fontSize: 13, fontWeight: 600, cursor: requests.has(m.id) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {requests.has(m.id) ? '✓ Request Sent' : 'Request Mentorship'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings tab ───────────────────────────────────────────────
function SettingsTab({ user, logout }) {  return (
    <div style={{ flex: 1, padding: "32px", background: C.gray50 }}>
      <h2 style={{ margin: "0 0 24px", color: C.gray900 }}>Settings</h2>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: "20px 24px", maxWidth: 400 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.gray900, marginBottom: 4 }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: C.gray500, marginBottom: 4 }}>{user?.email}</div>
        <div style={{ fontSize: 12, color: C.gray400, marginBottom: 20 }}>Role: {user?.role}</div>
        <button onClick={logout} style={{ padding: "10px 24px", background: "#EF4444", color: C.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Main GirlDashboard ─────────────────────────────────────────
export default function GirlDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);

  const [nav, setNav]           = useState("dashboard");
  const [mentors, setMentors]   = useState([]);
  const [reqList, setReqList]   = useState([]);
  const [myMentor, setMyMentor] = useState(null);
  const [selected, setSelected] = useState(null); // active conversation
  const [toast, setToast]       = useState("");

  const loadData = async () => {
    const [mRes, rRes, mmRes] = await Promise.all([
      api.get("/mentor/all"),
      api.get("/mentor/my-requests"),
      api.get("/mentor/my-mentor").catch(() => null),
    ]);
    setMentors(mRes.data.mentors || []);
    setReqList(rRes.data.requests || []);
    setMyMentor(mmRes?.data?.mentor || null);
  };

  useEffect(() => { loadData(); }, []);

  const requestedIds = useMemo(() => new Set(reqList.map(r => r.mentor_id || r.mentorId)), [reqList]);

  const requestMentor = async (mentorId) => {
    try {
      const { data } = await api.post("/mentor/request", { mentorId });
      setToast(data.message || "Request sent!");
      setTimeout(() => setToast(""), 3000);
      await loadData();
    } catch (err) {
      setToast(err.response?.data?.message || "Error sending request");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const openMentorChat = () => {
    if (!myMentor) return;
    setSelected({ id: `mentor-${myMentor.mentor_id}`, name: myMentor.mentor_name, sub: "Your mentor", roomType: "mentor", otherUserId: myMentor.mentor_id });
    setNav("chat");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.gray50, fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" }}>
      {/* Top bar */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.gray200}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon d={icons.cloud} size={22} stroke={C.blue} />
          <span style={{ fontWeight: 800, fontSize: 20, color: C.blue }}>Her Ingress</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon d={icons.bell} size={20} stroke={C.gray400} />
          <Icon d={icons.sync} size={20} stroke={C.green} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Synced</span>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: C.blue, color: C.white, padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar activeNav={nav} setActiveNav={setNav} user={user} logout={logout} />

        {/* Chat view */}
        {nav === "chat" && (
          <>
            <ConversationList
              mentors={mentors} myMentor={myMentor} onlineUsers={onlineUsers}
              selected={selected} onSelect={setSelected}
              requests={requestedIds} onRequest={requestMentor}
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              {selected ? (
                <ChatBox
                  key={`${selected.roomType}-${selected.otherUserId || "room"}`}
                  roomType={selected.roomType}
                  otherUserId={selected.otherUserId}
                  chatName={selected.name}
                />
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.gray400, fontSize: 14 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <div>Select a conversation to start chatting</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Circles */}
        {nav === "circles" && <CirclesTab user={user} />}

        {/* Dashboard home */}
        {nav === "dashboard" && (
          <DashboardHome user={user} mentors={mentors} myMentor={myMentor} onlineUsers={onlineUsers}
            onChatMentor={openMentorChat} onRequest={requestMentor} requests={requestedIds}
            onGoCircles={() => setNav("circles")} />
        )}

        {/* Mentors tab */}
        {nav === "mentors" && (
          <MentorshipTab
            user={user} mentors={mentors} myMentor={myMentor}
            onlineUsers={onlineUsers} onRequest={requestMentor} requests={requestedIds}
          />
        )}

        {/* Settings */}
        {nav === "settings" && <SettingsTab user={user} logout={logout} />}

        {/* Schedule placeholder */}
        {nav === "schedule" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray400, fontSize: 14, background: C.gray50 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <div>Schedule coming soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
