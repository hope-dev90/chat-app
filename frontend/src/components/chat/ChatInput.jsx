import { useState, useRef } from 'react';
import api from '../../api/axios';
import { invalidateEmojiCache } from './EmojiText';

// ── Design tokens ──────────────────────────────────────────────
const C = {
    purple:      '#4B3FA0',
    purpleMid:   '#7F77DD',
    purpleLight: '#CECBF6',
    purpleFaint: '#EEEDFE',
    purpleTint:  '#F3F0FF',
    textPrimary: '#2E2270',
    textMuted:   '#8B80C8',
    textHint:    '#A89ED4',
    textTime:    '#B0A8D9',
    border:      '#E4DEFF',
    white:       '#FFFFFF',
    green:       '#5DCAA5',
    red:         '#E24B4A',
    redLight:    '#FCEBEB',
};

const S = {
    // Wrapper around the whole component
    root: {
        background: C.white,
        padding: '10px 14px 14px',
        borderTop: `0.5px solid ${C.border}`,
        overflow: 'hidden',
        flexShrink: 0,
    },
    // Status bar (uploading / error)
    uploading: {
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8, fontSize: 13, color: C.purple,
    },
    spinner: {
        width: 14, height: 14,
        border: `2px solid ${C.purpleLight}`,
        borderTopColor: C.purple,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    },
    error: {
        marginBottom: 8, padding: '6px 12px',
        background: C.redLight, border: `0.5px solid #F7C1C1`,
        borderRadius: 8, fontSize: 12, color: C.red,
    },
    // Image preview above input
    previewWrap: {
        marginBottom: 10,
        background: C.purpleFaint,
        border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
    },
    previewImg: {
        width: 72, height: 72, borderRadius: 10, objectFit: 'cover',
        border: `0.5px solid ${C.border}`,
    },
    previewRemove: {
        position: 'absolute', top: -6, right: -6,
        width: 20, height: 20, borderRadius: '50%',
        background: C.red, border: 'none',
        color: C.white, fontSize: 13, lineHeight: 1,
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    },
    previewLabel: { fontSize: 11, color: C.textMuted, marginBottom: 3 },
    previewName:  { fontSize: 13, color: C.textPrimary, fontWeight: 500 },
    previewHint:  { fontSize: 11, color: C.textHint, marginTop: 4 },
    // Emoji / custom-emoji / create-emoji panels
    panel: {
        marginBottom: 10, background: C.white,
        border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: '10px 12px',
    },
    panelHeader: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8,
    },
    panelTitle: { fontSize: 11, fontWeight: 500, color: C.textMuted },
    panelLink: {
        fontSize: 12, color: C.purple,
        background: 'none', border: 'none', cursor: 'pointer',
    },
    emojiGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
    },
    emojiBtn: {
        fontSize: 20, background: 'none', border: 'none',
        cursor: 'pointer', borderRadius: 8, padding: 4,
        transition: 'background 0.1s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    // Create emoji form
    createTitle: { fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 10 },
    createInput: {
        flex: 1, background: C.purpleTint,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8, padding: '7px 10px',
        fontSize: 13, color: C.textPrimary, outline: 'none',
    },
    createPickBtn: {
        background: C.purpleTint, border: `0.5px solid ${C.border}`,
        borderRadius: 8, padding: '7px 12px',
        fontSize: 13, color: C.textPrimary, cursor: 'pointer',
    },
    createSubmit: {
        background: C.purple, border: 'none', borderRadius: 8,
        padding: '7px 16px', fontSize: 13, color: C.white,
        cursor: 'pointer', fontWeight: 500,
    },
    createCancel: {
        background: C.purpleTint, border: 'none', borderRadius: 8,
        padding: '7px 16px', fontSize: 13, color: C.textPrimary, cursor: 'pointer',
    },
    // Main input bar
    inputBar: {
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: C.purpleTint, borderRadius: 24,
        padding: '6px 10px 6px 14px',
        minWidth: 0,
    },
    actionBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 17, padding: '2px 3px', color: C.textMuted,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, transition: 'background 0.12s',
        lineHeight: 1,
    },
    textarea: {
        flex: 1,
        minWidth: 0,
        width: '100%',
        background: 'transparent',
        color: C.textPrimary, border: 'none', outline: 'none',
        resize: 'none', fontSize: 13, fontFamily: 'inherit',
        padding: '6px 4px', minHeight: 34, lineHeight: 1.5,
    },
    sendBtn: (active) => ({
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: active ? C.purple : C.purpleLight,
        border: 'none', cursor: active ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    }),
};

export default function ChatInput({ onSend, onTyping, roomType }) {
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCustomEmojis, setShowCustomEmojis] = useState(false);
    const [customEmojis, setCustomEmojis] = useState([]);
    const [showCreateEmoji, setShowCreateEmoji] = useState(false);
    const [newEmojiName, setNewEmojiName] = useState('');
    const [newEmojiFile, setNewEmojiFile] = useState(null);
    const [creatingEmoji, setCreatingEmoji] = useState(false);
    const [emojiError, setEmojiError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);

    const imageInputRef = useRef(null);
    const fileInputRef  = useRef(null);
    const emojiFileRef  = useRef(null);
    const textareaRef   = useRef(null);

    const STANDARD_EMOJIS = [
        '😀','😂','😍','🥰','😊','😎','🤔','😢',
        '😮','🥳','😴','🤩','😡','🥺','😇','🤗',
        '👍','👎','❤️','🔥','✨','🎉','👏','🙌',
        '💯','🎊','💪','🙏','👋','✌️','🤝','💀',
    ];

    // ── Handlers (unchanged logic) ─────────────────────────────
    const loadCustomEmojis = async () => {
        try {
            const res = await api.get('/emoji/all');
            setCustomEmojis(res.data.emojis);
        } catch (err) { console.error(err); }
    };

    const handleSend = async () => {
        if (selectedImage) {
            setUploading(true);
            setUploadProgress('Uploading image...');
            setUploadError('');
            try {
                const formData = new FormData();
                formData.append('image', selectedImage);
                const res = await api.post('/upload/image', formData);
                const { url, name, size, type } = res.data.file;
                onSend({ message: message.trim(), fileUrl: url, fileName: name, fileSize: size, fileType: type });
                setSelectedImage(null);
                setSelectedImagePreview(null);
                setMessage('');
            } catch (err) {
                setUploadError(err.response?.data?.message || 'Image upload failed');
                return;
            } finally {
                setUploading(false);
                setUploadProgress('');
            }
        } else if (message.trim()) {
            onSend({ message: message.trim() });
            setMessage('');
        }
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        onTyping();
    };

    const insertEmoji = (emoji) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setMessage(prev => prev + emoji);
            setShowEmojiPicker(false);
            return;
        }
        const start = textarea.selectionStart ?? message.length;
        const end   = textarea.selectionEnd   ?? message.length;
        const newValue = message.slice(0, start) + emoji + message.slice(end);
        setMessage(newValue);
        setShowEmojiPicker(false);
        setShowCustomEmojis(false);
        // Restore cursor right after the inserted emoji
        requestAnimationFrame(() => {
            textarea.focus();
            const newPos = start + emoji.length;
            textarea.setSelectionRange(newPos, newPos);
        });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedImage(file);
        setSelectedImagePreview(URL.createObjectURL(file));
        e.target.value = '';
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setSelectedImagePreview(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setUploadProgress('Uploading file...');
        setUploadError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload/file', formData);
            const { url, name, size, type } = res.data.file;
            onSend({ message: '', fileUrl: url, fileName: name, fileSize: size, fileType: type });
        } catch (err) {
            setUploadError(err.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
            setUploadProgress('');
            e.target.value = '';
        }
    };

    const handleCreateEmoji = async () => {
        if (!newEmojiName || !newEmojiFile) { setEmojiError('Name and image are required'); return; }
        setCreatingEmoji(true);
        setEmojiError('');
        try {
            const formData = new FormData();
            formData.append('name', newEmojiName);
            formData.append('image', newEmojiFile);
            await api.post('/emoji/create', formData);
            setNewEmojiName('');
            setNewEmojiFile(null);
            setShowCreateEmoji(false);
            invalidateEmojiCache();
            loadCustomEmojis();
        } catch (err) {
            setEmojiError(err.response?.data?.message || 'Failed to create emoji');
        } finally {
            setCreatingEmoji(false);
        }
    };

    const canSend = (message.trim() || selectedImage) && !uploading;

    // ── Render ─────────────────────────────────────────────────
    return (
        <div style={S.root}>

            {/* Spinner */}
            {uploading && (
                <div style={S.uploading}>
                    <div style={S.spinner} />
                    <span>{uploadProgress}</span>
                </div>
            )}

            {/* Error */}
            {uploadError && <div style={S.error}>{uploadError}</div>}

            {/* Image preview */}
            {selectedImagePreview && (
                <div style={S.previewWrap}>
                    <div style={{ position: 'relative' }}>
                        <img src={selectedImagePreview} alt="Preview" style={S.previewImg} />
                        <button onClick={removeSelectedImage} style={S.previewRemove}>×</button>
                    </div>
                    <div>
                        <p style={S.previewLabel}>Image selected</p>
                        <p style={S.previewName}>{selectedImage?.name}</p>
                        <p style={S.previewHint}>Add a message and tap send</p>
                    </div>
                </div>
            )}

            {/* Create emoji panel */}
            {showCreateEmoji && (
                <div style={S.panel}>
                    <p style={S.createTitle}>🎨 Create custom emoji</p>
                    {emojiError && <p style={{ fontSize: 12, color: C.red, marginBottom: 8 }}>{emojiError}</p>}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input
                            type="text"
                            placeholder="Emoji name (e.g. party_blob)"
                            value={newEmojiName}
                            onChange={(e) => setNewEmojiName(e.target.value)}
                            style={S.createInput}
                        />
                        <button onClick={() => emojiFileRef.current?.click()} style={S.createPickBtn}>
                            {newEmojiFile ? '✅ Image' : '📷 Pick image'}
                        </button>
                    </div>
                    {newEmojiFile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <img src={URL.createObjectURL(newEmojiFile)} alt="preview"
                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                            <span style={{ fontSize: 12, color: C.textMuted }}>:{newEmojiName}:</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleCreateEmoji} disabled={creatingEmoji} style={S.createSubmit}>
                            {creatingEmoji ? 'Creating…' : 'Create emoji'}
                        </button>
                        <button onClick={() => { setShowCreateEmoji(false); setEmojiError(''); setNewEmojiName(''); setNewEmojiFile(null); }}
                            style={S.createCancel}>Cancel</button>
                    </div>
                    <input ref={emojiFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => setNewEmojiFile(e.target.files[0])} />
                </div>
            )}

            {/* Custom emoji picker */}
            {showCustomEmojis && (
                <div style={S.panel}>
                    <div style={S.panelHeader}>
                        <span style={S.panelTitle}>Custom emojis</span>
                        <button style={S.panelLink}
                            onClick={() => { setShowCustomEmojis(false); setShowCreateEmoji(true); }}>
                            + Create new
                        </button>
                    </div>
                    {customEmojis.length === 0
                        ? <p style={{ fontSize: 12, color: C.textHint, textAlign: 'center', padding: '8px 0' }}>No custom emojis yet — create one!</p>
                        : (
                            <div style={S.emojiGrid}>
                                {customEmojis.map(emoji => (
                                    <button key={emoji.id} onClick={() => insertEmoji(`:${emoji.name}:`)}
                                        title={`:${emoji.name}:`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, padding: 2 }}>
                                        <img src={emoji.image_url} alt={emoji.name}
                                            style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )
                    }
                </div>
            )}

            {/* Standard emoji picker */}
            {showEmojiPicker && (
                <div style={S.panel}>
                    <div style={S.emojiGrid}>
                        {STANDARD_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => insertEmoji(emoji)}
                                style={S.emojiBtn}
                                onMouseEnter={e => e.currentTarget.style.background = C.purpleTint}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main input bar */}
            <div style={S.inputBar}>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button title="Emoji" style={S.actionBtn}
                        onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowCustomEmojis(false); }}>
                        😊
                    </button>
                    <button title="Custom emoji" style={S.actionBtn}
                        onClick={() => { setShowCustomEmojis(!showCustomEmojis); setShowEmojiPicker(false); loadCustomEmojis(); }}>
                        🎨
                    </button>
                    <button title="Upload image" style={{ ...S.actionBtn, opacity: (uploading || selectedImage) ? 0.35 : 1 }}
                        disabled={uploading || !!selectedImage}
                        onClick={() => imageInputRef.current?.click()}>
                        🖼️
                    </button>
                    <button title="Upload file" style={{ ...S.actionBtn, opacity: uploading ? 0.35 : 1 }}
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}>
                        📎
                    </button>
                    <button title="Create custom emoji" style={S.actionBtn}
                        onClick={() => { setShowCreateEmoji(!showCreateEmoji); setShowCustomEmojis(false); setShowEmojiPicker(false); }}>
                        ✨
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedImage ? 'Add a message…' : 'Type a message…'}
                    rows={1}
                    style={S.textarea}
                    className="placeholder:text-[#A89ED4]"
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                />

                {/* Send button */}
                <button onClick={handleSend} disabled={!canSend} style={S.sendBtn(canSend)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>

            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
            <input ref={fileInputRef} type="file" accept=".pdf,.zip,.doc,.docx,.txt,.xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />

        </div>
    );
}