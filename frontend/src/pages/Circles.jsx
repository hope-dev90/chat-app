import { useState } from 'react';

export default function Circles() {
  const [activeTab, setActiveTab] = useState('all');
  const [offlineToggle, setOfflineToggle] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-lightGrayBg">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] flex-shrink-0 bg-darkNavy text-white flex flex-col h-full p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold mb-1">Her Ingress</h1>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-accentGreen rounded-full"></div>
          <span className="text-sm text-accentGreen font-semibold">ONLINE MODE</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: '🏠', label: 'Dashboard' },
            { icon: '👥', label: 'Mentees' },
            { icon: '💬', label: 'Circle chat', active: true },
            { icon: '📊', label: 'Analytics' },
            { icon: '⚙️', label: 'Settings' }
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                item.active ? 'bg-primaryBlue text-white' : 'text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center font-bold">
              HI
            </div>
            <div>
              <p className="text-sm font-semibold">Her Ingress Portal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CIRCLE INFO (260px) */}
      <div className="w-[260px] flex-shrink-0 bg-whiteCard border-r border-gray-100 flex flex-col h-full p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Coding Basics Circle</h2>
          <div className="flex items-center gap-1">
            <span>☁️</span>
            <span className="text-xs text-accentGreen font-semibold">SYNCED</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-500">Offline Feed</span>
          <button
            onClick={() => setOfflineToggle(!offlineToggle)}
            className={`w-11 h-6 rounded-full transition ${offlineToggle ? 'bg-primaryBlue' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${offlineToggle ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-200 to-purple-300 rounded-card h-32 mb-4 flex items-center justify-center text-4xl">
          💻
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-2">About Circle</h3>
        <p className="text-xs text-gray-600 mb-6">
          A supportive space for Rwandan women to master HTML, CSS, and JS fundamentals. Built for resilience and collective growth.
        </p>

        <div className="flex items-center mb-6">
          {['AM', 'DK', 'SK', 'AC'].map((initials, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-primaryBlue text-white text-xs font-bold flex items-center justify-center border-2 border-white -ml-2 first:ml-0"
            >
              {initials}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center border-2 border-white -ml-2">
            +12
          </div>
        </div>

        <button className="w-full border border-primaryBlue text-primaryBlue text-sm font-semibold py-2 rounded-pill mb-6 hover:bg-primaryBlue/5">
          Invite Peer
        </button>

        <div className="bg-darkNavy rounded-card p-4 text-white mb-6">
          <h4 className="text-sm font-bold mb-2">Weekly Challenge</h4>
          <p className="text-xs text-gray-300 mb-3">Build a responsive card using only CSS Grid.</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-accentGreen font-semibold">75% PARTICIPATION</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-accentGreen h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      {/* POSTS FEED */}
      <main className="flex-1 flex flex-col overflow-hidden bg-whiteCard border-r border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-pill text-sm font-semibold transition ${
              activeTab === 'all' ? 'bg-primaryBlue text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-1.5 rounded-pill text-sm font-semibold transition ${
              activeTab === 'questions' ? 'bg-primaryBlue text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Questions
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Pinned Announcement */}
          <div className="bg-white shadow-subtle rounded-card p-5 border-l-4 border-l-primaryBlue mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                AM
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Aline Mutoni · Circle Facilitator</p>
                <p className="text-xs text-gray-500">2h ago</p>
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Offline Syncing Tutorial is Live</h4>
            <p className="text-sm text-gray-600 mb-3">
              I've uploaded the new module on how to handle local storage for our project. You can access it even if your internet is spotty.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>❤️ 24</span>
              <span>💬 12</span>
            </div>
          </div>

          {/* Regular Post */}
          <div className="bg-white shadow-subtle rounded-card p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                  SK
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Solange K. · Member</p>
                  <p className="text-xs text-gray-500">5h ago</p>
                </div>
              </div>
              <span className="bg-accentOrange/10 text-accentOrange text-xs font-semibold px-2 py-0.5 rounded-pill">
                HELP NEEDED
              </span>
            </div>
            <p className="text-sm text-gray-900 mb-3">
              Can someone explain the difference between 'flex-basis' and 'width' in CSS? I'm getting confused with my layout logic.
            </p>
            <p className="text-xs text-gray-500">⏱ Waiting for sync to post your reply...</p>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR (200px) */}
      <aside className="w-[200px] flex-shrink-0 bg-whiteCard p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Resources</h3>
          <button className="text-gray-500">⋮</button>
        </div>
        <div className="space-y-2 mb-6">
          {[
            { name: 'FeedbackCheatSheet.pdf', icon: '📄' },
            { name: 'JS_Basics_Guide.docx', icon: '📝' }
          ].map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-lightGrayBg rounded-card">
              <span>{file.icon}</span>
              <p className="text-xs text-gray-700 truncate">{file.name}</p>
              <button className="ml-auto text-primaryBlue">⬇️</button>
            </div>
          ))}
        </div>

        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Top Contributors</h3>
        <div className="space-y-2 mb-6">
          {[
            { name: 'Marie-Claire', badge: 'LVL 17' },
            { name: 'Divine A.', badge: 'DEV 17' }
          ].map((person, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <p className="text-xs text-gray-700">{person.name}</p>
              <span className="text-xs bg-primaryBlue/10 text-primaryBlue font-semibold px-2 py-0.5 rounded-pill">
                {person.badge}
              </span>
            </div>
          ))}
        </div>
        <button className="text-primaryBlue text-xs font-semibold mb-6 hover:underline">
          VIEW FULL RANK
        </button>

        <div className="bg-darkNavy rounded-card p-4 text-white">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Circle Vitality</h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">42 ACTIVE MBR</span>
            <span className="text-xs text-accentGreen font-semibold">89% SYNC RATE</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
