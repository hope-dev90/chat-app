import { useState } from 'react';

export default function MentorChat() {
  const [activeChat, setActiveChat] = useState(0);
  const [messageText, setMessageText] = useState('');

  const recentChats = [
    { name: 'Alice Umutoni', initials: 'AU', lastMessage: 'Did you review the PR yet?', unread: true },
    { name: 'Diane Mukamena', initials: 'DM', lastMessage: 'The workshop starts in th...', unread: false }
  ];

  const messages = [
    {
      type: 'received',
      text: 'Hello Kezia! I\'ve reviewed your latest data models. You\'ve made great progress on the normalization steps. Have you thought about the indexing strategy yet?',
      time: '11:00 AM'
    },
    {
      type: 'sent',
      text: 'Thanks, Alice! I was actually struggling with which columns to index for the \'Orders\' table. Should I prioritize the customer_id or the order_date?',
      time: '11:05 AM'
    }
  ];

  const goals = [
    { name: 'SQL Basics Certificate', completed: true },
    { name: 'Portfolio Launch', completed: false }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-lightGrayBg">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] flex-shrink-0 bg-darkNavy text-white flex flex-col h-full p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold mb-1">Mentor Portal</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: '🏠', label: 'Dashboard' },
            { icon: '💬', label: 'Chat', active: true },
            { icon: '👥', label: 'Mentees' },
            { icon: '🎯', label: 'Opportunities' },
            { icon: '📅', label: 'Schedule' },
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
              KM
            </div>
            <div>
              <p className="text-sm font-semibold">Kezia M.</p>
              <span className="text-xs text-accentGreen font-semibold">ONLINE MODE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RECENT CHATS (280px) */}
      <div className="w-[280px] flex-shrink-0 bg-whiteCard border-r border-gray-100 flex flex-col h-full">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">RECENT CHATS</h2>
          <button className="text-gray-500 hover:text-primaryBlue">🔍</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {recentChats.map((chat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveChat(idx)}
              className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-50 transition ${
                idx === activeChat
                  ? 'bg-primaryBlue/5 border-l-4 border-l-primaryBlue'
                  : 'hover:bg-lightGrayBg'
              }`}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white bg-primaryBlue">
                  {chat.initials}
                </div>
                {chat.unread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primaryBlue border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-semibold ${idx === activeChat ? 'text-primaryBlue' : 'text-gray-900'}`}>
                    {chat.name}
                  </p>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
          
          <div className="m-4 p-4 border-2 border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center h-32 animate-pulse">
            <p className="text-xs text-gray-400">Loading conversations...</p>
          </div>
        </div>
      </div>

      {/* MAIN CHAT WINDOW */}
      <main className="flex-1 flex flex-col bg-whiteCard border-r border-gray-100">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <h2 className="text-base font-bold text-gray-900">Mentor Chats</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-accentGreen text-white text-xs font-semibold px-3 py-1.5 rounded-pill">
                Request New Session
              </button>
              <button className="text-gray-500 hover:text-primaryBlue">🔔</button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center text-white font-bold">
                AU
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">Alice Umutoni</p>
                  <span className="bg-primaryBlue/10 text-primaryBlue text-xs font-semibold px-2 py-0.5 rounded-pill">
                    TECHNICAL MENTOR
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-primaryBlue">↗️</button>
              <button className="text-gray-500 hover:text-primaryBlue">ℹ️</button>
            </div>
          </div>
        </div>

        {/* Milestone banner */}
        <div className="mx-5 my-4 bg-accentOrange/10 border border-accentOrange/30 rounded-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-bold text-gray-900">Milestone Achieved!</h3>
          </div>
          <p className="text-xs text-gray-600">
            You completed the 'Database Design' module with Alice.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5">
          <div className="max-w-3xl mx-auto space-y-4 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[65%] px-4 py-3 rounded-card shadow-subtle ${
                    msg.type === 'sent'
                      ? 'bg-primaryBlue text-white'
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Shared Goals */}
            <div className="bg-lightGrayBg rounded-card p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">SHARED GOALS</h4>
              <div className="space-y-2">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span>{goal.completed ? '✅' : '⬜'}</span>
                    <p className={`text-sm ${goal.completed ? 'text-accentGreen' : 'text-gray-600'}`}>
                      {goal.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="p-5 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-lightGrayBg rounded-card px-4 py-3">
            <button className="text-gray-500 hover:text-primaryBlue">😊</button>
            <input
              type="text"
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            />
            <button className="bg-primaryBlue hover:bg-blue-700 text-white p-2 rounded-full shadow-subtle">
              ➤
            </button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR (200px) */}
      <aside className="w-[200px] flex-shrink-0 bg-whiteCard p-5 overflow-y-auto">
        {/* Growth Tracker */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Growth Tracker</h3>
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-primaryBlue flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-primaryBlue">75%</span>
            </div>
            <p className="text-xs font-semibold text-gray-900">MENTORSHIP</p>
          </div>
          <p className="text-xs text-gray-600">Mentorship Sessions 12/15</p>
        </div>

        {/* Announcements */}
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Announcements</h3>
        <div className="space-y-3">
          <div className="bg-lightGrayBg rounded-card p-3">
            <div className="bg-gray-200 rounded-card h-16 mb-2 flex items-center justify-center">
              🎤
            </div>
            <h4 className="text-xs font-semibold text-gray-900 mb-1">Tech Symposium 2024: Applications Open</h4>
            <p className="text-xs text-gray-600 mb-2">Mentors are sponsoring 5 slots for high-performing mentees. Apply via portal.</p>
            <button className="text-primaryBlue text-xs font-semibold hover:underline">READ MORE</button>
          </div>

          <div className="bg-lightGrayBg rounded-card p-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-1">New SQL Course Added</h4>
            <p className="text-xs text-gray-600 mb-2">Alice recommends checking out the new advanced query module.</p>
            <button className="text-primaryBlue text-xs font-semibold hover:underline">READ MORE</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
