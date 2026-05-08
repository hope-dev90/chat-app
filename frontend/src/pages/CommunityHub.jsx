import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CommunityHub() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleColor, setNewCircleColor] = useState('#2563EB');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, circlesRes, postsRes, usersRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/circles'),
          api.get('/posts'),
          api.get('/auth/users')
        ]);
        setCurrentUser(profileRes.data.user);
        setCircles(circlesRes.data.circles || []);
        setPosts(postsRes.data.posts || []);
        setUsers(usersRes.data.users || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Navigate to different screens
  const handleTabClick = (tab) => {
    switch(tab) {
      case 'dms':
        navigate('/chat');
        break;
      case 'circles':
        navigate('/circles');
        break;
      case 'mentors':
        navigate('/mentorship/chat');
        break;
      default:
        break;
    }
  };

  // Join circle
  const handleJoinCircle = async (circleId) => {
    try {
      await api.post(`/circles/${circleId}/join`);
      const circlesRes = await api.get('/circles');
      setCircles(circlesRes.data.circles || []);
    } catch (error) {
      console.error('Failed to join circle:', error);
    }
  };

  // Create circle
  const handleCreateCircle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/circles', {
        name: newCircleName,
        description: newCircleDescription,
        color: newCircleColor
      });
      setShowCreateModal(false);
      setNewCircleName('');
      setNewCircleDescription('');
      const circlesRes = await api.get('/circles');
      setCircles(circlesRes.data.circles || []);
    } catch (error) {
      console.error('Failed to create circle:', error);
    }
  };

  // Format status display
  const getStatusInfo = (status) => {
    switch(status) {
      case 'synced':
        return { label: 'SYNCED', color: 'bg-accentGreen/10 text-accentGreen' };
      case 'sync_pending':
        return { label: 'SYNC PENDING', color: 'bg-accentOrange/10 text-accentOrange' };
      case 'reach_offline':
        return { label: 'REACH OFFLINE', color: 'bg-gray-200 text-gray-600' };
      default:
        return { label: 'SYNCED', color: 'bg-accentGreen/10 text-accentGreen' };
    }
  };

  // Format time
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-lightGrayBg">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
            {currentUser?.name?.split(' ')[0][0]}{currentUser?.name?.split(' ')[1]?.[0] || ''}
          </div>
          <div>
            <p className="text-sm font-semibold">{currentUser?.name}</p>
            <p className="text-xs text-gray-400">Member</p>
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
                  onClick={() => handleTabClick(tab.toLowerCase())}
                  className="px-4 py-1.5 rounded-pill text-xs font-semibold transition text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  {tab}
                </button>
              ))}
            </div>
            {currentUser?.role === 'mentor' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primaryBlue text-white text-sm font-semibold px-4 py-1.5 rounded-pill"
              >
                + Create Circle
              </button>
            )}
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
              {circles.map((circle) => (
                <div 
                  key={circle.id} 
                  className="rounded-card p-6 text-white shadow-subtle"
                  style={{ backgroundColor: circle.color || '#2563EB' }}
                >
                  <div className="text-3xl mb-2">
                    {circle.color === '#EF6C6C' ? '🌾' : '💻'}
                  </div>
                  <h4 className="text-lg font-bold mb-1">{circle.name}</h4>
                  <p className="text-white/90 text-sm mb-4">
                    {circle.member_count || 0} Members
                  </p>
                  <button 
                    onClick={() => handleJoinCircle(circle.id)}
                    className={`text-sm font-semibold px-4 py-2 rounded-pill ${
                      circle.color === '#EF6C6C' 
                        ? 'bg-primaryBlue hover:bg-blue-700 text-white' 
                        : 'bg-white hover:bg-gray-100 text-primaryBlue'
                    }`}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Discussions */}
          <section>
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Discussions</h3>
            <div className="space-y-4">
              {posts.map((post) => {
                const statusInfo = getStatusInfo(post.status);
                return (
                  <div key={post.id} className="bg-whiteCard shadow-subtle rounded-card p-5 border border-gray-100 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                          {post.user_name?.split(' ')[0][0]}{post.user_name?.split(' ')[1]?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.user_name}</p>
                          <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-pill text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {post.hashtags?.[0] && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-pill mb-2">
                        #{post.hashtags[0]}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                    {post.image_url && (
                      <div className="bg-gray-100 rounded-card h-40 mb-3 flex items-center justify-center">
                        📷 Image attached
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-primaryBlue">
                        ❤️ {post.like_count || 0}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primaryBlue">
                        💬 {post.comment_count || 0}
                      </button>
                      <button className="ml-auto hover:text-primaryBlue">
                        📤 Share
                      </button>
                      {post.image_url && (
                        <button className="text-primaryBlue text-xs font-semibold">
                          Save Photo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
            {users.filter(u => u.role === 'mentor').slice(0, 2).map((mentor) => (
              <div key={mentor.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primaryBlue flex items-center justify-center text-white font-bold">
                  {mentor.name?.split(' ')[0][0]}{mentor.name?.split(' ')[1]?.[0] || ''}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{mentor.name}</p>
                  <p className="text-xs text-gray-500">{mentor.role}</p>
                </div>
                <button className="bg-primaryBlue text-white text-xs font-semibold px-3 py-1.5 rounded-pill">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-whiteCard rounded-card p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Circle</h3>
            <form onSubmit={handleCreateCircle}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Circle Name</label>
                <input
                  type="text"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryBlue/20"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCircleDescription}
                  onChange={(e) => setNewCircleDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryBlue/20"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {['#EF6C6C', '#2563EB', '#10B981', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCircleColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${newCircleColor === color ? 'border-gray-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-pill hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primaryBlue text-white text-sm font-semibold py-2 rounded-pill hover:bg-blue-700"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
