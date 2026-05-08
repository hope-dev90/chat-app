import { useState } from 'react';

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState('general');
  const [offlineToggle, setOfflineToggle] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-lightGrayBg">
      {/* LEFT SIDEBAR (220px) */}
      <aside className="w-[220px] flex-shrink-0 bg-darkNavy text-white flex flex-col h-full p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold mb-1">Community Hub</h1>
          <p className="text-xs text-gray-400">Digital Inclusion</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-accentGreen rounded-full"></div>
          <span className="text-sm text-gray-300">Online</span>
        </div>

        <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center font-bold">
            MU
          </div>
          <div>
            <p className="text-sm font-semibold">Marie Uwase</p>
            <p className="text-xs text-gray-400">Agri-Tech Lead</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: '🏠', label: 'Dashboard' },
            { icon: '📚', label: 'Learning Hub' },
            { icon: '🎯', label: 'Opportunities' },
            { icon: '👩‍💼', label: 'Rolemodels' },
            { icon: '💬', label: 'Mentorship' },
            { icon: '⚙️', label: 'Settings' }
          ].map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition"
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-pill">
            Support Center
          </button>
          <button className="w-full text-gray-400 text-sm hover:text-white transition">
            Logout
          </button>
        </div>
      </aside>

      {/* CENTER CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-whiteCard shadow-subtle flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900">Community Hub</h2>
            <span className="flex items-center gap-1 bg-accentGreen/10 text-accentGreen text-xs font-semibold px-3 py-1 rounded-pill">
              ✅ Synced Offline
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-pill px-1">
              {['General', 'Circles', 'Mentors', 'Dms'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-1.5 rounded-pill text-xs font-semibold transition ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-primaryBlue text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="text-gray-500 hover:text-gray-700">🔍</button>
            <button className="text-gray-500 hover:text-gray-700">🔔</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Search bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search discussions, circles, or mentors..."
              className="w-full bg-whiteCard border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 shadow-subtle focus:outline-none focus:ring-2 focus:ring-primaryBlue/20"
            />
          </div>

          {/* Featured Circles */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Featured Circles</h3>
              <button className="text-primaryBlue text-sm font-semibold hover:underline">
                View all →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-coral rounded-card p-6 text-white shadow-subtle">
                <div className="text-3xl mb-2">🌾</div>
                <h4 className="text-lg font-bold mb-1">Women in Agri-Tech</h4>
                <p className="text-white/90 text-sm mb-4">1.2k Members</p>
                <button className="bg-primaryBlue hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-pill">
                  Join
                </button>
              </div>
              <div className="bg-primaryBlue rounded-card p-6 text-white shadow-subtle">
                <div className="text-3xl mb-2">💻</div>
                <h4 className="text-lg font-bold mb-1">Coding Basics</h4>
                <p className="text-white/90 text-sm mb-4">860 Members</p>
                <button className="bg-white hover:bg-gray-100 text-primaryBlue text-sm font-semibold px-4 py-2 rounded-pill">
                  Join
                </button>
              </div>
            </div>
          </section>

          {/* Recent Discussions */}
          <section>
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Discussions</h3>
            <div className="space-y-4">
              {[
                {
                  user: 'Grace Mukamena',
                  time: '2h ago',
                  hashtag: '#Scholarships',
                  status: 'SYNCED',
                  statusColor: 'bg-accentGreen/10 text-accentGreen',
                  title: 'New STEM Scholarship cycle for 2024 is now open!',
                  body: 'Applications are now open for girls in Rwanda pursuing STEM degrees.',
                  likes: 124,
                  comments: 42,
                  hasImage: false
                },
                {
                  user: 'Aline Gasana',
                  time: '4h ago',
                  hashtag: '#IoT',
                  status: 'SYNC PENDING',
                  statusColor: 'bg-accentOrange/10 text-accentOrange',
                  title: 'Best practices for using IoT in local irrigation?',
                  body: 'I\'m working on a project with smallholder farmers in Musanze.',
                  likes: 89,
                  comments: 18,
                  hasImage: false
                },
                {
                  user: 'Divine Keza',
                  time: '6h ago',
                  hashtag: '#Community',
                  status: 'REACH OFFLINE',
                  statusColor: 'bg-gray-200 text-gray-600',
                  title: 'Documenting our progress in Musanze!',
                  body: 'We had an amazing workshop last week!',
                  likes: 256,
                  comments: 56,
                  hasImage: true
                }
              ].map((post, idx) => (
                <div key={idx} className="bg-whiteCard shadow-subtle rounded-card p-5 border border-gray-100 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                        {post.user.split(' ')[0][0]}{post.user.split(' ')[1][0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{post.user}</p>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-pill text-xs font-semibold ${post.statusColor}`}>
                      {post.status}
                    </span>
                  </div>
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-pill mb-2">
                    {post.hashtag}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{post.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{post.body}</p>
                  {post.hasImage && (
                    <div className="bg-gray-100 rounded-card h-40 mb-3 flex items-center justify-center">
                      📷 Image attached
                    </div>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-primaryBlue">
                      ❤️ {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primaryBlue">
                      💬 {post.comments}
                    </button>
                    <button className="ml-auto hover:text-primaryBlue">
                      📤 Share
                    </button>
                    {post.hasImage && (
                      <button className="text-primaryBlue text-xs font-semibold">
                        Save Photo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* RIGHT SIDEBAR (260px) */}
      <aside className="w-[260px] flex-shrink-0 bg-whiteCard border-l border-gray-100 p-5 overflow-y-auto">
        {/* Community Buzz */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Community Buzz</h3>
          <div className="space-y-3">
            {[
              { hashtag: '#RwandaTech', category: 'Technology', count: 468 },
              { hashtag: '#WomenInSTEM', category: 'Community', count: 324 },
              { hashtag: '#AgriInnovation', category: 'Agriculture', count: 210 },
              { hashtag: '#CodingSisters', category: 'Learning', count: 156 }
            ].map((item, idx) => (
              <div key={idx} className="bg-lightGrayBg rounded-card p-3">
                <p className="text-sm font-bold text-gray-900">{item.hashtag}</p>
                <p className="text-xs text-gray-500">{item.category} • {item.count} discussions today</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-primaryBlue text-sm font-semibold hover:underline">
            Explore All Trending
          </button>
        </section>

        {/* Offline Preparedness */}
        <section className="mb-6">
          <div className="bg-darkNavy rounded-card p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Offline Preparedness</h3>
              <span className="text-accentGreen text-sm font-bold">84% Synced</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div className="bg-accentGreen h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Most of your recent community threads and circles are available to read even without internet access.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 rounded-pill">
              Manage Offline Data
            </button>
          </div>
        </section>

        {/* Top Mentors */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Top Mentors</h3>
          <div className="space-y-3">
            {[
              { name: 'Alice Umutoni', title: 'Senior Engineer', initials: 'AU' },
              { name: 'Diane Mukamena', title: 'Product Lead', initials: 'DM' }
            ].map((mentor, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center text-white font-bold">
                  {mentor.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{mentor.name}</p>
                  <p className="text-xs text-gray-500">{mentor.title}</p>
                </div>
                <button className="bg-primaryBlue text-white text-xs font-semibold px-3 py-1.5 rounded-pill">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
