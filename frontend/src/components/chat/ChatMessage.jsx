import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";
import EmojiText from "./EmojiText";

// Standard emojis
const STANDARD_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export default function ChatMessage({
  message,
  isOwn,
  showAvatar,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
}) {
  const { user } = useContext(AuthContext);

  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCustomEmojis, setShowCustomEmojis] = useState(false);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      setEditText(message.message || "");
    }
  }, [message.message, editing]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowEmojiPicker(false);
        setShowCustomEmojis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load custom emojis
  const loadCustomEmojis = async () => {
    try {
      const res = await api.get("/emoji/all");
      setCustomEmojis(res.data.emojis);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    if (!editText.trim()) return;
    onEdit(message.id, editText.trim());
    setEditing(false);
    setShowMenu(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditText(message.message);
    setEditing(false);
  };

  // Handle standard reaction
  const handleStandardReact = (emoji) => {
    const existing = message.reactions?.find(
      (r) => r.standard_emoji === emoji && r.users?.includes(user.name),
    );
    console.log('handleStandardReact:', emoji, 'existing:', existing, 'messageId:', message.id);
    if (existing) {
      onRemoveReaction(message.id, emoji, null);
    } else {
      onReact(message.id, "standard", emoji, null);
    }
    setShowEmojiPicker(false);
    setShowMenu(false);
  };

  // Handle custom reaction
  const handleCustomReact = (emoji) => {
    const existing = message.reactions?.find(
      (r) => r.custom_emoji_id === emoji.id && r.users?.includes(user.name),
    );
    if (existing) {
      onRemoveReaction(message.id, null, emoji.id);
    } else {
      onReact(message.id, "custom", null, emoji.id);
    }
    setShowCustomEmojis(false);
    setShowMenu(false);
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Is image file
  const isImage = (type) => {
    return ["jpg", "jpeg", "png", "gif", "webp", "image"].includes(
      type?.toLowerCase(),
    );
  };

  return (
    <div
      className={`flex w-full gap-2 group px-2 py-0.5 rounded-lg transition ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* ── Avatar ─────────────────────────────────── */}
      <div className="flex-shrink-0 w-8">
        {!isOwn && showAvatar && (
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#CECBF6', color: '#3C3489', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {message.sender_name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* ── Message content ────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          maxWidth: '65%',
          minWidth: 0,
        }}
      >
        {/* Sender name + time */}
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#8B80C8' }}>
              {isOwn ? "You" : message.sender_name}
            </span>
            <span style={{ fontSize: 10, color: '#B0A8D9' }}>
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* ── Bubble ─────────────────────────────── */}
        <div className="relative" ref={menuRef}>
          {/* Message bubble */}
          {!editing ? (
            <div className="relative">
              {/* Text message */}
              {message.message && (
                <div style={{
                  display: 'block',
                  background: isOwn ? '#4B3FA0' : '#FFFFFF',
                  color: isOwn ? '#FFFFFF' : '#2E2270',
                  border: isOwn ? 'none' : '0.5px solid #E4DEFF',
                  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '8px 14px',
                  minWidth: 48,
                  marginBottom: message.file_url && isImage(message.file_type) ? 6 : 0,
                }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', writingMode: 'horizontal-tb', letterSpacing: 'normal' }}>
                    <EmojiText text={message.message} />
                  </p>
                </div>
              )}

              {/* Image - Instagram-style clean display */}
              {message.file_url && isImage(message.file_type) && (
                <div>
                  <img
                    src={message.file_url}
                    alt={message.file_name}
                    className="rounded-xl cursor-pointer hover:opacity-95 transition object-cover"
                    onClick={() => window.open(message.file_url, "_blank")}
                    style={{ 
                      display: 'block',
                      maxWidth: '260px', 
                      maxHeight: '260px',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                </div>
              )}

              {/* File */}
              {message.file_url && !isImage(message.file_type) && (
                <div style={{
                  background: isOwn ? '#4B3FA0' : '#FFFFFF',
                  color: isOwn ? '#FFFFFF' : '#2E2270',
                  border: isOwn ? 'none' : '0.5px solid #E4DEFF',
                  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '8px 14px',
                }}>
                  <a href={message.file_url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: isOwn ? 'rgba(255,255,255,0.12)' : '#F3F0FF', textDecoration: 'none' }}>
                    <span style={{ fontSize: 20 }}>
                      {message.file_type === 'pdf' ? '📄' : message.file_type === 'zip' ? '🗜️' : message.file_type === 'doc' || message.file_type === 'docx' ? '📝' : '📎'}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: isOwn ? '#FFFFFF' : '#2E2270', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message.file_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: isOwn ? 'rgba(255,255,255,0.65)' : '#8B80C8' }}>{formatSize(message.file_size)}</p>
                    </div>
                  </a>
                </div>
              )}

              {/* Edited label */}
              {message.is_edited && (
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#B0A8D9' }}>edited</p>
              )}

              {/* Time for non-first messages */}
              {!showAvatar && (
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#B0A8D9' }}>
                  {formatTime(message.created_at)}
                </p>
              )}

              {/* Three dot menu - shows on hover */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`absolute -top-2 opacity-0 group-hover:opacity-100 transition bg-white border border-slate-200 text-slate-500 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-xs ${
                  isOwn ? "-left-3" : "-right-3"
                }`}
              >
                ⋯
              </button>

              {/* Context menu */}
              {showMenu && (
                <div
                  className={`absolute top-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-40 ${
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  {/* React */}
                  <button
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowCustomEmojis(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    😊 React
                  </button>

                  {/* Custom emoji react */}
                  <button
                    onClick={() => {
                      setShowCustomEmojis(!showCustomEmojis);
                      setShowEmojiPicker(false);
                      loadCustomEmojis();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    🎨 Custom React
                  </button>

                  {/* Edit - only own messages */}
                  {isOwn && message.message && (
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {/* Delete - only own messages */}
                  {isOwn && (
                    <button
                      onClick={() => {
                        onDelete(message.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50 transition"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}

              {/* Standard emoji picker */}
              {showEmojiPicker && (
                <div
                  className={`absolute top-8 z-50 bg-white border border-slate-200 rounded-xl p-2 shadow-xl ${
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  <div className="flex gap-1">
                    {STANDARD_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleStandardReact(emoji)}
                        className="text-xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom emoji picker */}
              {showCustomEmojis && (
                <div
                  className={`absolute top-8 z-50 bg-white border border-slate-200 rounded-xl p-3 shadow-xl w-48 ${
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  }`}
                >
                  {customEmojis.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center">
                      No custom emojis yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {customEmojis.map((emoji) => (
                        <button
                          key={emoji.id}
                          onClick={() => handleCustomReact(emoji)}
                          title={`:${emoji.name}:`}
                          className="hover:scale-125 transition-transform"
                        >
                          <img
                            src={emoji.image_url}
                            alt={emoji.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── Edit mode ──────────────────── */
            <div className="flex flex-col gap-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-white text-slate-800 text-sm rounded-xl px-3 py-2 border border-gray-300 focus:outline-none resize-none min-w-48 shadow-sm"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                  if (e.key === "Escape") handleEditCancel();
                }}
              />
              <div className="flex gap-2">
                <button onClick={handleEditSubmit}
                  style={{ background: '#4B3FA0', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Save
                </button>
                <button onClick={handleEditCancel}
                  style={{ background: '#F3F0FF', color: '#2E2270', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Reactions display ───────────────── */}
          {message.reactions?.length > 0 && (
            <div
              className={`flex flex-wrap gap-1 mt-1 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {message.reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (reaction.emoji_type === "standard") {
                      handleStandardReact(reaction.standard_emoji);
                    } else {
                      handleCustomReact({
                        id: reaction.custom_emoji_id,
                        name: reaction.custom_emoji_name,
                      });
                    }
                  }}
                  title={reaction.users?.join(", ")}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 transition shadow-sm"
                >
                  {reaction.emoji_type === "standard" ? (
                    <span className="text-sm">{reaction.standard_emoji}</span>
                  ) : (
                    <img
                      src={reaction.custom_emoji_url}
                      alt={reaction.custom_emoji_name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span className="text-xs text-slate-500">
                    {reaction.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
