import { useState } from 'react';

export default function DirectMessages() {
  const [activeConversation, setActiveConversation] = useState(0);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    { name: 'Aline Kabanda', initials: 'AK', lastMessage: 'The project proposal looks great!', time: '10:30 AM' },
    { name: 'Divine Keza', initials: 'DK', lastMessage: 'Can we reschedule the talk?', time: '09:15 AM' },
    { name: 'Women in Tech Group', initials: 'WT', lastMessage: 'Sarah: Don\'t forget the workshop on 2PM', time: 'Yesterday' }
  ];

  const messages = [
    { type: 'received', text: 'Hello Umutoni! I just reviewed the draft for the mentorship program. The offline-first feature is exactly what our mentees in the rural areas need.', time: '10:00 AM' },
    { type: 'sent', text: 'That\'s wonderful to hear! I\'ve attached the final technical specs. Can you confirm if these match the user flow we discussed last week?', time: '10:05 AM' },
    { type: 'received', text: 'The project proposal looks great! I\'ve added a few notes regarding the sync frequency.', time: '10:15 AM' },
    { type: 'file', name: 'Feedback_Specs.pdf', size: '2.4 MB' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-lightGrayBg">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] flex-shrink-0 bg-darkNavy text-white flex flex-col h-full p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold mb-1">Her Ingress</h1>
          <p className="text-xs text-gray-400">Chat & Connect</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-accentGreen rounded-full animate-pulse"></div>
          <span className="text-sm text-accentGreen font-semibold">ONLINE NOW</span>
        </div>

        <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center font-bold">
            UG
          </div>
          <div>
            <p className="text-sm font-semibold">Umutoni Grace</p>
            <p className="text-xs text-gray-400">Member</p>
          </div>
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
          <p className="text-xs text-gray-500 text-center">
            © 2024 Her Ingress Rwanda
          </p>
        </div>
      </aside>

      {/* CONVERSATIONS LIST (280px) */}
      <div className="w-[280px] flex-shrink-0 bg-whiteCard border-r border-gray-100 flex flex-col h-full">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Messages</h2>
          <button className="text-primaryBlue hover:bg-primaryBlue/10 p-1.5 rounded-full">
            ✏️
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-lightGrayBg border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryBlue/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, idx) => (
            <button
              key={idx}
              onClick={() => setActiveConversation(idx)}
              className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-50 transition ${
                idx === activeConversation
                  ? 'bg-primaryBlue/5 border-l-4 border-l-primaryBlue'
                  : 'hover:bg-lightGrayBg'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white ${
                idx === 0 ? 'bg-primaryBlue' : 'bg-gray-400'
              }`}>
                {conv.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-semibold ${idx === activeConversation ? 'text-primaryBlue' : 'text-gray-900'}`}>
                    {conv.name}
                  </p>
                  <span className="text-xs text-gray-400">{conv.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE CHAT */}
      <main className="flex-1 flex flex-col bg-whiteCard">
        {/* Chat header */}
        <header className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center text-white font-bold">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">Aline Kabanda</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accentGreen rounded-full"></div>
                  <span className="text-xs text-accentGreen font-semibold">ACTIVE NOW</span>
                </div>
              </div>
              <span className="flex items-center gap-1 bg-accentGreen/10 text-accentGreen text-xs font-semibold px-2 py-0.5 rounded-pill mt-1">
                ✅ OFFLINE READY
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-primaryBlue p-2 rounded-full hover:bg-lightGrayBg">
              📞
            </button>
            <button className="text-gray-500 hover:text-primaryBlue p-2 rounded-full hover:bg-lightGrayBg">
              🎥
            </button>
            <button className="text-gray-500 hover:text-primaryBlue p-2 rounded-full hover:bg-lightGrayBg">
              ⋮
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 bg-lightGrayBg">
          <div className="text-center mb-6">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today</span>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'file' ? (
                  <div className="bg-white shadow-subtle rounded-card p-4 border border-gray-100 flex items-center gap-3">
                    <div className="text-3xl">📄</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{msg.name}</p>
                      <p className="text-xs text-gray-500">{msg.size}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[65%] px-4 py-3 rounded-card shadow-subtle ${
                      msg.type === 'sent'
                        ? 'bg-primaryBlue text-white'
                        : 'bg-white text-gray-900 border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-lightGrayBg rounded-card px-4 py-3">
            <button className="text-gray-500 hover:text-primaryBlue">😊</button>
            <button className="text-gray-500 hover:text-primaryBlue">📎</button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            />
            <button className="text-gray-500 hover:text-primaryBlue">😊</button>
            <button className="bg-primaryBlue hover:bg-blue-700 text-white p-2 rounded-full shadow-subtle">
              ➤
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3 font-semibold">
            MESSAGES WILL SYNC AUTOMATICALLY WHEN ONLINE
          </p>
        </div>
      </main>
    </div>
  );
}
