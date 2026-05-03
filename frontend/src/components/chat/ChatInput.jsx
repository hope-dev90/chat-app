import { useState, useRef } from 'react';
import api from '../../api/axios';
import { invalidateEmojiCache } from './EmojiText';

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
    
    // New state for image preview
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);

    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiFileRef = useRef(null);
    const textareaRef = useRef(null);

    const STANDARD_EMOJIS = [
        '😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢',
        '😮', '🥳', '😴', '🤩', '😡', '🥺', '😇', '🤗',
        '👍', '👎', '❤️', '🔥', '✨', '🎉', '👏', '🙌',
        '💯', '🎊', '💪', '🙏', '👋', '✌️', '🤝', '💀'
    ];

    // ── Load custom emojis ─────────────────────────────────────
    const loadCustomEmojis = async () => {
        try {
            const res = await api.get('/emoji/all');
            setCustomEmojis(res.data.emojis);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Handle message send ────────────────────────────────────
    const handleSend = async () => {
        // If we have a selected image, upload it first
        if (selectedImage) {
            setUploading(true);
            setUploadProgress('Uploading image...');
            setUploadError('');

            try {
                const formData = new FormData();
                formData.append('image', selectedImage);

                const res = await api.post('/upload/image', formData);

                const { url, name, size, type } = res.data.file;

                // Send message with file and text
                onSend({
                    message: message.trim(),
                    fileUrl: url,
                    fileName: name,
                    fileSize: size,
                    fileType: type
                });

                // Reset everything
                setSelectedImage(null);
                setSelectedImagePreview(null);
                setMessage('');

            } catch (err) {
                console.error('Image upload failed:', err);
                setUploadError(err.response?.data?.message || 'Image upload failed');
                return;
            } finally {
                setUploading(false);
                setUploadProgress('');
            }
        } else if (message.trim()) {
            // Just send text
            onSend({ message: message.trim() });
            setMessage('');
        }
        
        textareaRef.current?.focus();
    };

    // ── Handle Enter key ───────────────────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        onTyping();
    };

    // ── Insert emoji into message ──────────────────────────────
    const insertEmoji = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    // ── Select image for preview ────────────────────────────────
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedImage(file);
        setSelectedImagePreview(URL.createObjectURL(file));
        e.target.value = '';
    };

    // ── Remove selected image ───────────────────────────────────
    const removeSelectedImage = () => {
        setSelectedImage(null);
        setSelectedImagePreview(null);
    };

    // ── Upload file (still immediate for non-images) ───────────
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

            onSend({
                message: '',
                fileUrl: url,
                fileName: name,
                fileSize: size,
                fileType: type
            });

        } catch (err) {
            console.error('File upload failed:', err);
            setUploadError(err.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
            setUploadProgress('');
            e.target.value = '';
        }
    };

    // ── Create custom emoji ────────────────────────────────────
    const handleCreateEmoji = async () => {
        if (!newEmojiName || !newEmojiFile) {
            setEmojiError('Name and image are required');
            return;
        }

        setCreatingEmoji(true);
        setEmojiError('');
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('name', newEmojiName);
            formData.append('image', newEmojiFile);

            await api.post('/emoji/create', formData);

            // Reset and reload
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

    return (
        <div style={{ background: '#FFFFFF', padding: '10px 14px 12px' }}>

            {/* ── Upload progress ────────────────────────── */}
            {uploading && (
                <div className="mb-2 flex items-center gap-2 text-[#2563EB] text-sm">
                    <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                    {uploadProgress}
                </div>
            )}

            {uploadError && (
                <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {uploadError}
                </p>
            )}

            {/* ── Image Preview ───────────────────────────── */}
            {selectedImagePreview && (
                <div className="mb-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex gap-3">
                        <div className="relative">
                            <img
                                src={selectedImagePreview}
                                alt="Preview"
                                className="w-24 h-24 rounded-xl object-cover"
                            />
                            <button
                                onClick={removeSelectedImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition shadow"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Image selected</p>
                            <p className="text-sm text-slate-700 truncate">{selectedImage.name}</p>
                            <p className="text-xs text-slate-400 mt-1">Add a message below and click Send</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create custom emoji panel ──────────────── */}
            {showCreateEmoji && (
                <div className="mb-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h4 className="text-slate-800 text-sm font-semibold mb-3">
                        🎨 Create Custom Emoji
                    </h4>

                    {emojiError && (
                        <p className="text-red-500 text-xs mb-2">{emojiError}</p>
                    )}

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Emoji name (e.g. party_blob)"
                            value={newEmojiName}
                            onChange={(e) => setNewEmojiName(e.target.value)}
                            className="flex-1 bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                        <button
                            onClick={() => emojiFileRef.current?.click()}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm px-3 py-2 rounded-lg border border-slate-200 transition"
                        >
                            {newEmojiFile ? '✅ Image' : '📷 Pick Image'}
                        </button>
                    </div>

                    {/* Preview */}
                    {newEmojiFile && (
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src={URL.createObjectURL(newEmojiFile)}
                                alt="preview"
                                className="w-10 h-10 rounded object-cover"
                            />
                            <p className="text-slate-500 text-xs">:{newEmojiName}:</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateEmoji}
                            disabled={creatingEmoji}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#9CA3AF] text-white text-sm px-4 py-2 rounded-lg transition"
                        >
                            {creatingEmoji ? 'Creating...' : 'Create Emoji'}
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateEmoji(false);
                                setEmojiError('');
                                setNewEmojiName('');
                                setNewEmojiFile(null);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-4 py-2 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Hidden file input for emoji */}
                    <input
                        ref={emojiFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setNewEmojiFile(e.target.files[0])}
                    />
                </div>
            )}

            {/* ── Custom emoji picker ────────────────────── */}
            {showCustomEmojis && (
                <div className="mb-3 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs font-medium">Custom Emojis</p>
                        <button
                            onClick={() => {
                                setShowCustomEmojis(false);
                                setShowCreateEmoji(true);
                            }}
                            className="text-[#2563EB] text-xs hover:text-[#1D4ED8] transition"
                        >
                            + Create New
                        </button>
                    </div>
                    {customEmojis.length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-2">
                            No custom emojis yet. Create one!
                        </p>
                    ) : (
                        <div className="grid grid-cols-8 gap-2">
                            {customEmojis.map(emoji => (
                                <button
                                    key={emoji.id}
                                    onClick={() => insertEmoji(`:${emoji.name}:`)}
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

            {/* ── Standard emoji picker ──────────────────── */}
            {showEmojiPicker && (
                <div className="mb-3 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-8 gap-1">
                        {STANDARD_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => insertEmoji(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1 rounded hover:bg-slate-100"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Input row ──────────────────────────────── */}
            <div style={{
                display: 'flex',
                flexDirection: selectedImagePreview ? 'column' : 'row',
                gap: 8,
                background: '#F3F0FF',
                borderRadius: 24,
                padding: '8px 14px',
                alignItems: selectedImagePreview ? 'stretch' : 'flex-end',
            }}>
                
                {selectedImagePreview && (
                    <div className="flex gap-2 items-start">
                        <img
                            src={selectedImagePreview}
                            alt="Preview"
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <button
                            onClick={removeSelectedImage}
                            className="text-slate-400 hover:text-red-500 text-sm p-1"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {/* ── Action buttons ─────────────────────── */}
                    <div className="flex flex-shrink-0 gap-1">

                        {/* Standard emoji */}
                        <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowCustomEmojis(false); }}
                            title="Emoji" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: '#8B80C8' }}>
                            😊
                        </button>

                        {/* Custom emoji */}
                        <button onClick={() => { setShowCustomEmojis(!showCustomEmojis); setShowEmojiPicker(false); loadCustomEmojis(); }}
                            title="Custom Emoji" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: '#8B80C8' }}>
                            🎨
                        </button>

                        {/* Upload image */}
                        <button onClick={() => imageInputRef.current?.click()} title="Upload Image"
                            disabled={uploading || selectedImage !== null}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: '#8B80C8', opacity: uploading || selectedImage ? 0.4 : 1 }}>
                            🖼️
                        </button>

                        {/* Upload file */}
                        <button onClick={() => fileInputRef.current?.click()} title="Upload File"
                            disabled={uploading}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: '#8B80C8', opacity: uploading ? 0.4 : 1 }}>
                            📎
                        </button>

                        {/* Create custom emoji */}
                        <button onClick={() => { setShowCreateEmoji(!showCreateEmoji); setShowCustomEmojis(false); setShowEmojiPicker(false); }}
                            title="Create Custom Emoji" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: '#8B80C8' }}>
                            ✨
                        </button>

                    </div>

                    {/* ── Text input ─────────────────────────── */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedImage ? "Add a message..." : "Type a message..."}
                            rows={1}
                            style={{ minHeight: 38, background: 'transparent', color: '#2E2270', border: 'none', outline: 'none', resize: 'none', width: '100%', fontSize: 13, fontFamily: 'inherit', padding: '8px 4px' }}
                            className="max-h-32 overflow-y-auto placeholder:text-[#A89ED4]"
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                            }}
                        />
                    </div>

                    {/* ── Send button ────────────────────────── */}
                    <button
                        onClick={handleSend}
                        disabled={(!message.trim() && !selectedImage) || uploading}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: (!message.trim() && !selectedImage) || uploading ? '#CECBF6' : '#4B3FA0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>

                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip,.doc,.docx,.txt,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
            />

        </div>
    );
}
