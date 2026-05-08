import { useState, useEffect } from "react";
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// ─── CreateCircleModal ────────────────────────────────────────────────────────
function CreateCircleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "", description: "", category: "Tech", color: "#2563EB", isPrivate: false,
  });
  const [loading, setLoading] = useState(false);

  const COLORS = ["#2563EB", "#E05C5C", "#7C3AED", "#10B981", "#F59E0B", "#EC4899"];
  const CATEGORIES = ["Tech", "Agriculture", "Business", "Health", "Education", "Arts"];

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await api.post('/circles', {
        name: form.name,
        description: form.description,
        color: form.color
      });
      onCreated({ ...form, id: Date.now(), members: 1 });
    } catch (error) {
      console.error('Failed to create circle:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>Create a New Circle</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              Build a space for your mentees to connect
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#F1F5F9", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748B",
          }}>✕</button>
        </div>

        {/* Circle Name */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Circle Name *</div>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Data Science for Beginners"
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #E2E8F0", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </label>

        {/* Description */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Description</div>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What will members learn or discuss?"
            rows={3}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #E2E8F0", fontSize: 13, outline: "none",
              resize: "vertical", boxSizing: "border-box",
            }}
          />
        </label>

        {/* Category */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Category</div>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #E2E8F0", fontSize: 13, background: "#fff",
            }}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>

        {/* Color picker */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Circle Color</div>
          <div style={{ display: "flex", gap: 8 }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c,
                  border: form.color === c ? "3px solid #0F172A" : "3px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: form.color, borderRadius: 10, padding: "14px 16px",
          color: "#fff", marginBottom: 18,
        }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{form.name || "Your Circle Name"}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
            {form.description || "Your circle description will appear here."}
          </div>
          <div style={{ fontSize: 10, marginTop: 8, opacity: 0.8 }}>1 Member · {form.category}</div>
        </div>

        {/* Private toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: form.isPrivate ? "#2563EB" : "#CBD5E1",
              position: "relative", cursor: "pointer", transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: form.isPrivate ? 20 : 3,
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
          <span style={{ fontSize: 12, color: "#374151" }}>Make this circle private (invite-only)</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 8,
            background: form.name.trim() ? "#2563EB" : "#CBD5E1",
            color: "#fff", border: "none",
            fontSize: 14, fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Creating Circle..." : "Create Circle"}
        </button>
      </div>
    </div>
  );
}

// ─── MentorDashboard ──────────────────────────────────────────────────────────
export default function MentorDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [myCircles, setMyCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const res = await api.get('/circles');
        setMyCircles(res.data.circles || []);
      } catch (error) {
        console.error('Failed to fetch circles:', error);
        setMyCircles([
          { id: 1, name: "Coding Basics", description: "HTML, CSS, JS for Rwandan women", color: "#2563EB", member_count: 860, category: "Tech" },
          { id: 2, name: "Women in Agri-Tech", description: "Sustainable farming tech", color: "#E05C5C", member_count: 1200, category: "Agriculture" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, []);

  const handleCreated = async (circle) => {
    try {
      const res = await api.get('/circles');
      setMyCircles(res.data.circles || []);
    } catch (error) {
      setMyCircles(prev => [circle, ...prev]);
    }
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#F8FAFC",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, background: "#fff", borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column", padding: "20px 0",
      }}>
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "Georgia, serif" }}>Her Ingress</div>
          <div style={{ fontSize: 10, color: "#10B981", fontWeight: 600, marginTop: 4 }}>● MENTOR MODE</div>
        </div>
        {["Dashboard", "My Mentees", "Circles", "Schedule", "Analytics", "Settings"].map((item, i) => (
          <button
            key={item}
            onClick={() => i === 0 && navigate('/mentor-dashboard')}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "9px 20px", border: "none", cursor: "pointer",
              background: i === 2 ? "#EFF6FF" : "transparent",
              color: i === 2 ? "#2563EB" : "#64748B",
              fontSize: 13, fontWeight: i === 2 ? 700 : 400,
            }}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 22, color: "#0F172A", margin: 0 }}>My Circles</h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
              Create and manage learning circles for your mentees
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 20px", borderRadius: 8, background: "#2563EB",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            + Create Circle
          </button>
        </div>

        {/* Circles grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {myCircles.map(circle => (
            <div
              key={circle.id}
              onClick={() => navigate(`/circles/${circle.id}`)}
              style={{
                background: circle.color, borderRadius: 12, padding: 18,
                color: "#fff", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{circle.name}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 14 }}>{circle.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, opacity: 0.9 }}>{circle.member_count || 0} Members</span>
                <span style={{
                  fontSize: 10, background: "rgba(255,255,255,0.25)",
                  padding: "2px 8px", borderRadius: 20,
                }}>{circle.category || "Tech"}</span>
              </div>
            </div>
          ))}

          {/* Empty add card */}
          <div
            onClick={() => setShowModal(true)}
            style={{
              borderRadius: 12, padding: 18, border: "2px dashed #CBD5E1",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, cursor: "pointer",
              minHeight: 120, color: "#94A3B8",
            }}
          >
            <div style={{ fontSize: 28 }}>＋</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>New Circle</div>
          </div>
        </div>
      </main>

      {showModal && (
        <CreateCircleModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
