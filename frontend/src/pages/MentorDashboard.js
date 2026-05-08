import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';
import ChatBox from '../components/chat/ChatBox';
import PendingRequests from '../components/mentor/pendingRequest';

const C = {
  blue:'#2563EB', blueLight:'#EFF6FF', blueDark:'#1D4ED8',
  green:'#22C55E', greenLight:'#DCFCE7',
  gray50:'#F9FAFB', gray100:'#F3F4F6', gray200:'#E5E7EB',
  gray400:'#9CA3AF', gray500:'#6B7280', gray700:'#374151', gray900:'#111827',
  white:'#FFFFFF', red:'#EF4444',
};

const COLORS = ['#2563EB','#E05C5C','#10B981','#F59E0B','#8B5CF6','#EC4899'];

function Av({ s='?', size=38, bg=C.blueLight, color=C.blue, online=false }) {
  return (
    <div style={{position:'relative',flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:'50%',background:bg,color,fontWeight:700,fontSize:size*0.36,display:'flex',alignItems:'center',justifyContent:'center'}}>{s}</div>
      {online && <span style={{position:'absolute',bottom:1,right:1,width:9,height:9,borderRadius:'50%',background:C.green,border:'2px solid white'}}/>}
    </div>
  );
}

function NavBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{width:'100%',textAlign:'left',padding:'10px 16px',border:'none',cursor:'pointer',background:active?C.blueLight:'transparent',color:active?C.blue:C.gray500,fontWeight:active?600:400,fontSize:14,borderLeft:active?`3px solid ${C.blue}`:'3px solid transparent',fontFamily:'inherit'}}>
      {label}
    </button>
  );
}

// ── Create Circle Modal ────────────────────────────────────────
function CreateCircleModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim()) { setErr('Name is required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/circles', { name: name.trim(), description: desc, color });
      onCreated(data.circle);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to create circle');
    } finally { setLoading(false); }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:C.white,borderRadius:16,padding:28,width:420,maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:17,color:C.gray900}}>Create a Circle</div>
          <button onClick={onClose} style={{background:C.gray100,border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:C.gray500}}>✕</button>
        </div>
        {err && <p style={{color:C.red,fontSize:12,marginBottom:10}}>{err}</p>}
        <label style={{display:'block',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.gray700,marginBottom:5}}>Circle Name *</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Coding Basics" style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${C.gray200}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
        </label>
        <label style={{display:'block',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.gray700,marginBottom:5}}>Description</div>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What will members learn?" rows={3} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${C.gray200}`,fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
        </label>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:600,color:C.gray700,marginBottom:8}}>Color</div>
          <div style={{display:'flex',gap:8}}>
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:'50%',background:c,border:color===c?`3px solid ${C.gray900}`:'3px solid transparent',cursor:'pointer'}}/>
            ))}
          </div>
        </div>
        {/* Preview */}
        <div style={{background:color,borderRadius:10,padding:'14px 16px',color:'#fff',marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:14}}>{name||'Circle Name'}</div>
          <div style={{fontSize:11,opacity:0.85,marginTop:4}}>{desc||'Description preview'}</div>
        </div>
        <button onClick={submit} disabled={loading||!name.trim()} style={{width:'100%',padding:'11px 0',borderRadius:8,background:name.trim()?C.blue:C.gray200,color:name.trim()?C.white:C.gray400,border:'none',fontSize:14,fontWeight:700,cursor:name.trim()?'pointer':'not-allowed',fontFamily:'inherit'}}>
          {loading?'Creating…':'Create Circle'}
        </button>
      </div>
    </div>
  );
}

// ── Mentees list with chat ─────────────────────────────────────
function MenteesTab({ onlineUsers }) {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/mentor/my-mentees').then(r => setMentees(r.data.mentees||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = mentees.filter(m => m.girl_name?.toLowerCase().includes(search.toLowerCase()));

  if (active) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.gray200}`,background:C.white,display:'flex',alignItems:'center',gap:10}}>
          <button onClick={()=>setActive(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.gray500,fontSize:13,fontFamily:'inherit'}}>← Back</button>
          <Av s={active.girl_name?.[0]} size={32} online={onlineUsers.includes(active.girl_id)}/>
          <span style={{fontWeight:600,color:C.gray900}}>{active.girl_name}</span>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          <ChatBox roomType="mentor" otherUserId={active.girl_id} key={`mentor-${active.girl_id}`} chatName={active.girl_name}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:C.gray50}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.gray200}`,background:C.white}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mentees…" style={{width:'100%',padding:'8px 14px',borderRadius:20,border:`1px solid ${C.gray200}`,fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
        {loading && <p style={{color:C.gray400,textAlign:'center',marginTop:40}}>Loading…</p>}
        {!loading && filtered.length===0 && (
          <div style={{textAlign:'center',marginTop:60,color:C.gray400}}>
            <div style={{fontSize:40,marginBottom:12}}>👧</div>
            <div>No mentees yet. Approve requests to get started.</div>
          </div>
        )}
        {filtered.map(m=>(
          <button key={m.girl_id} onClick={()=>setActive(m)} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,border:'none',cursor:'pointer',background:C.white,marginBottom:8,boxShadow:`0 1px 3px rgba(0,0,0,0.06)`,textAlign:'left',fontFamily:'inherit'}}>
            <Av s={m.girl_name?.[0]} size={44} bg={C.blueLight} color={C.blue} online={onlineUsers.includes(m.girl_id)}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:C.gray900}}>{m.girl_name}</div>
              <div style={{fontSize:12,color:onlineUsers.includes(m.girl_id)?C.green:C.gray400}}>{onlineUsers.includes(m.girl_id)?'🟢 Online':'⚫ Offline'}</div>
            </div>
            <span style={{fontSize:12,color:C.blue,fontWeight:600}}>Chat →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Circles tab ────────────────────────────────────────────────
function CirclesTab() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeCircle, setActiveCircle] = useState(null);

  const load = () => api.get('/circles/mine').then(r=>setCircles(r.data.circles||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  // ── Circle chat view ───────────────────────────────────────
  if (activeCircle) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'12px 20px',borderBottom:`1px solid ${C.gray200}`,background:C.white,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <button onClick={()=>setActiveCircle(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.gray500,fontSize:13,fontFamily:'inherit'}}>← Back</button>
          <div style={{width:28,height:28,borderRadius:8,background:activeCircle.color||C.blue,flexShrink:0}}/>
          <div>
            <span style={{fontWeight:600,color:C.gray900,fontSize:15}}>{activeCircle.name}</span>
            <span style={{fontSize:12,color:C.gray400,marginLeft:10}}>{activeCircle.member_count} members</span>
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          <ChatBox roomType="circle" otherUserId={activeCircle.id} key={`circle-${activeCircle.id}`} chatName={activeCircle.name}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:'24px 28px',background:C.gray50}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.gray900}}>My Circles</h2>
          <p style={{margin:'4px 0 0',fontSize:13,color:C.gray500}}>Create learning circles for your mentees</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{padding:'10px 20px',borderRadius:8,background:C.blue,color:C.white,border:'none',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
          + Create Circle
        </button>
      </div>

      {loading && <p style={{color:C.gray400}}>Loading…</p>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {circles.map(c=>(
          <div key={c.id} style={{background:c.color||C.blue,borderRadius:12,padding:18,color:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{c.name}</div>
            <div style={{fontSize:11,opacity:0.85,marginBottom:10,lineHeight:1.5}}>{c.description||'No description'}</div>
            <div style={{fontSize:11,opacity:0.8,marginBottom:14}}>{c.member_count||0} Members</div>
            <button onClick={()=>setActiveCircle(c)} style={{width:'100%',padding:'8px',borderRadius:8,background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.4)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              💬 Open Chat
            </button>
          </div>
        ))}
        <div onClick={()=>setShowModal(true)} style={{borderRadius:12,padding:18,border:`2px dashed ${C.gray200}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',minHeight:120,color:C.gray400}}>
          <div style={{fontSize:28}}>＋</div>
          <div style={{fontSize:12,fontWeight:600}}>New Circle</div>
        </div>
      </div>

      {showModal && <CreateCircleModal onClose={()=>setShowModal(false)} onCreated={c=>{setCircles(prev=>[c,...prev]);}}/>}
    </div>
  );
}

// ── Dashboard overview ─────────────────────────────────────────
function DashboardOverview({ user, onlineUsers }) {
  const [stats, setStats] = useState({ mentees:0, pending:0, circles:0 });
  useEffect(()=>{
    Promise.all([
      api.get('/mentor/my-mentees').catch(()=>({data:{mentees:[]}})),
      api.get('/mentor/pending').catch(()=>({data:{requests:[]}})),
      api.get('/circles/mine').catch(()=>({data:{circles:[]}})),
    ]).then(([m,p,c])=>setStats({ mentees:m.data.mentees?.length||0, pending:p.data.requests?.length||0, circles:c.data.circles?.length||0 }));
  },[]);

  return (
    <div style={{flex:1,overflowY:'auto',padding:'28px 32px',background:C.gray50}}>
      <h2 style={{margin:'0 0 4px',fontSize:22,fontWeight:700,color:C.gray900}}>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
      <p style={{margin:'0 0 28px',fontSize:14,color:C.gray500}}>Here's your mentorship overview.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
        {[
          {label:'My Mentees', value:stats.mentees, color:C.blue, bg:C.blueLight},
          {label:'Pending Requests', value:stats.pending, color:'#F59E0B', bg:'#FFFBEB'},
          {label:'My Circles', value:stats.circles, color:C.green, bg:C.greenLight},
        ].map(s=>(
          <div key={s.label} style={{background:C.white,borderRadius:12,padding:'18px 20px',border:`1px solid ${C.gray200}`}}>
            <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:C.gray500,marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.white,borderRadius:12,padding:'20px 24px',border:`1px solid ${C.gray200}`}}>
        <p style={{margin:'0 0 4px',fontSize:14,fontWeight:600,color:C.gray900}}>Quick Tips</p>
        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:C.gray500,lineHeight:2}}>
          <li>Go to <b>Requests</b> to approve pending mentees</li>
          <li>Go to <b>My Mentees</b> to chat with approved mentees</li>
          <li>Go to <b>Circles</b> to create group learning spaces</li>
          <li>Go to <b>General</b> to chat with the whole community</li>
        </ul>
      </div>
    </div>
  );
}

// ── Main MentorDashboard ───────────────────────────────────────
export default function MentorDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const [nav, setNav] = useState('dashboard');

  const navItems = [
    { key:'dashboard', label:'Dashboard'   },
    { key:'requests',  label:'Requests'    },
    { key:'mentees',   label:'My Mentees'  },
    { key:'circles',   label:'Circles'     },
    { key:'general',   label:'General Chat'},
    { key:'settings',  label:'Settings'    },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',fontFamily:"'Inter','Segoe UI',sans-serif",overflow:'hidden'}}>
      {/* Header */}
      <header style={{background:C.white,borderBottom:`1px solid ${C.gray200}`,padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontWeight:800,fontSize:20,color:C.blue}}>Her Ingress</span>
          <span style={{fontSize:11,background:C.greenLight,color:C.green,padding:'2px 8px',borderRadius:20,fontWeight:600}}>MENTOR</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Av s={user?.name?.[0]?.toUpperCase()||'M'} size={32} online/>
          <span style={{fontSize:13,color:C.gray700,fontWeight:500}}>{user?.name}</span>
        </div>
      </header>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {/* Sidebar */}
        <aside style={{width:200,background:C.white,borderRight:`1px solid ${C.gray200}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <nav style={{padding:'12px 8px',flex:1}}>
            {navItems.map(item=>(
              <NavBtn key={item.key} label={item.label} active={nav===item.key} onClick={()=>setNav(item.key)}/>
            ))}
          </nav>
          <div style={{padding:'12px 16px 20px'}}>
            <button onClick={logout} style={{width:'100%',textAlign:'left',padding:'10px 16px',border:'none',cursor:'pointer',background:'transparent',color:C.gray500,fontSize:14,fontFamily:'inherit'}}>
              ↪ Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        {nav==='dashboard' && <DashboardOverview user={user} onlineUsers={onlineUsers}/>}
        {nav==='requests'  && <div style={{flex:1,overflow:'hidden'}}><PendingRequests/></div>}
        {nav==='mentees'   && <MenteesTab onlineUsers={onlineUsers}/>}
        {nav==='circles'   && <CirclesTab/>}
        {nav==='general'   && <div style={{flex:1,overflow:'hidden'}}><ChatBox roomType="general" key="general"/></div>}
        {nav==='settings'  && (
          <div style={{flex:1,padding:32,background:C.gray50}}>
            <h2 style={{margin:'0 0 20px',color:C.gray900}}>Settings</h2>
            <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.gray200}`,padding:'20px 24px',maxWidth:400}}>
              <div style={{fontWeight:700,fontSize:15,color:C.gray900,marginBottom:4}}>{user?.name}</div>
              <div style={{fontSize:13,color:C.gray500,marginBottom:16}}>{user?.email}</div>
              <button onClick={logout} style={{padding:'10px 24px',background:C.red,color:C.white,border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
