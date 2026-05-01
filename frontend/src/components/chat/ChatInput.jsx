import { useState, useRef } from 'react';
import api from '../../api/axios';

export default function ChatInput({ onSend, onTyping, roomType }) {
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCustomEmojis, setShowCustomEmojis] = useState(false);
    const [customEmojis, setCustomEmojis] = useState([]);
    const [showCreateEmoji, setShowCreateEmoji] = useState(false);
    const [newEmojiName, setNewEmojiName] = useState('');
    const [newEmojiFile, setNewEmojiFile] = useState(null);
    const [creatingEmoji, setCreatingEmoji] = useState(false);
    const [emojiError, setEmojiError] = useState('');

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
    const handleSend = () => {
        if (!message.trim()) return;
        onSend({ message: message.trim() });
        setMessage('');
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

    // ── Upload image ───────────────────────────────────────────
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress('Uploading image...');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { url, name, size, type } = res.data.file;

            // Send message with file
            onSend({
                message: '',
                fileUrl: url,
                fileName: name,
                fileSize: size,
                fileType: type
            });

        } catch (err) {
            console.error('Image upload failed:', err);
        } finally {
            setUploading(false);
            setUploadProgress('');
            e.target.value = '';
        }
    };

    // ── Upload file ────────────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/upload/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

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

        try {
            const formData = new FormData();
            formData.append('name', newEmojiName);
            formData.append('image', newEmojiFile);

            await api.post('/emoji/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset and reload
            setNewEmojiName('');
            setNewEmojiFile(null);
            setShowCreateEmoji(false);
            loadCustomEmojis();

        } catch (err) {
            setEmojiError(err.response?.data?.message || 'Failed to create emoji');
        } finally {
            setCreatingEmoji(false);
        }
    };

    return (
        <div className="bg-white px-4 pb-4 pt-2">

            {/* ── Upload progress ────────────────────────── */}
            {uploading && (
                <div className="mb-2 flex items-center gap-2 text-[#6429ef] text-sm">
                    <div className="w-4 h-4 border-2 border-[#6429ef] border-t-transparent rounded-full animate-spin"></div>
                    {uploadProgress}
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
                            className="flex-1 bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8f72ff]/30 focus:border-[#8f72ff]"
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
                            className="bg-[#6429ef] hover:bg-[#5220c7] disabled:bg-[#b6a7ef] text-white text-sm px-4 py-2 rounded-lg transition"
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
                            className="text-[#6429ef] text-xs hover:text-[#5220c7] transition"
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
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">

                {/* ── Action buttons ─────────────────────── */}
                <div className="flex flex-shrink-0 gap-1">

                    {/* Standard emoji */}
                    <button
                        onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowCustomEmojis(false);
                        }}
                        title="Emoji"
                        className="text-slate-600 hover:text-[#6429ef] p-1.5 rounded-full hover:bg-slate-50 transition text-xl"
                    >
                        😊
                    </button>

                    {/* Custom emoji */}
                    <button
                        onClick={() => {
                            setShowCustomEmojis(!showCustomEmojis);
                            setShowEmojiPicker(false);
                            loadCustomEmojis();
                        }}
                        title="Custom Emoji"
                        className="text-slate-600 hover:text-[#6429ef] p-1.5 rounded-full hover:bg-slate-50 transition text-xl"
                    >
                        🎨
                    </button>

                    {/* Upload image */}
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        title="Upload Image"
                        disabled={uploading}
                        className="text-slate-600 hover:text-[#6429ef] p-1.5 rounded-full hover:bg-slate-50 transition text-xl disabled:opacity-50"
                    >
                        🖼️
                    </button>

                    {/* Upload file */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload File"
                        disabled={uploading}
                        className="text-slate-600 hover:text-[#6429ef] p-1.5 rounded-full hover:bg-slate-50 transition text-xl disabled:opacity-50"
                    >
                        📎
                    </button>

                    {/* Create custom emoji */}
                    <button
                        onClick={() => {
                            setShowCreateEmoji(!showCreateEmoji);
                            setShowCustomEmojis(false);
                            setShowEmojiPicker(false);
                        }}
                        title="Create Custom Emoji"
                        className="text-slate-600 hover:text-[#6429ef] p-1.5 rounded-full hover:bg-slate-50 transition text-xl"
                    >
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
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full bg-transparent text-slate-800 text-sm px-2 py-2 border-0 focus:outline-none focus:ring-0 resize-none placeholder-slate-400 max-h-32 overflow-y-auto"
                        style={{ minHeight: '38px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }}
                    />
                </div>

                {/* ── Send button ────────────────────────── */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || uploading}
                    className="bg-transparent hover:bg-slate-50 disabled:text-slate-300 text-[#6429ef] p-2 rounded-full transition flex-shrink-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>

            </div>

            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip,.doc,.docx,.txt,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Hint */}
            <p className="text-slate-400 text-xs mt-2 text-center hidden">
                Enter to send · Shift+Enter for new line
            </p>

        </div>
    );
}
