import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ChatInput({ onSend, onTyping, roomType }) {
    const { user } = useContext(AuthContext);

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
        <div className="bg-black border-t border-gray-800 p-4">

            {/* ── Upload progress ────────────────────────── */}
            {uploading && (
                <div className="mb-2 flex items-center gap-2 text-blue-400 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    {uploadProgress}
                </div>
            )}

            {/* ── Create custom emoji panel ──────────────── */}
            {showCreateEmoji && (
                <div className="mb-3 bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <h4 className="text-white text-sm font-semibold mb-3">
                        🎨 Create Custom Emoji
                    </h4>

                    {emojiError && (
                        <p className="text-red-400 text-xs mb-2">{emojiError}</p>
                    )}

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Emoji name (e.g. party_blob)"
                            value={newEmojiName}
                            onChange={(e) => setNewEmojiName(e.target.value)}
                            className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => emojiFileRef.current?.click()}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-700 transition"
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
                            <p className="text-gray-400 text-xs">:{newEmojiName}:</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateEmoji}
                            disabled={creatingEmoji}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition"
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
                            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition"
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
                <div className="mb-3 bg-gray-900 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs font-medium">Custom Emojis</p>
                        <button
                            onClick={() => {
                                setShowCustomEmojis(false);
                                setShowCreateEmoji(true);
                            }}
                            className="text-blue-400 text-xs hover:text-blue-300 transition"
                        >
                            + Create New
                        </button>
                    </div>
                    {customEmojis.length === 0 ? (
                        <p className="text-gray-600 text-xs text-center py-2">
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
                <div className="mb-3 bg-gray-900 rounded-xl p-3 border border-gray-700">
                    <div className="grid grid-cols-8 gap-1">
                        {STANDARD_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => insertEmoji(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1 rounded hover:bg-gray-800"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Input row ──────────────────────────────── */}
            <div className="flex items-end gap-2">

                {/* ── Action buttons ─────────────────────── */}
                <div className="flex gap-1">

                    {/* Standard emoji */}
                    <button
                        onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowCustomEmojis(false);
                        }}
                        title="Emoji"
                        className="text-gray-400 hover:text-yellow-400 p-2 rounded-lg hover:bg-gray-900 transition text-xl"
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
                        className="text-gray-400 hover:text-purple-400 p-2 rounded-lg hover:bg-gray-900 transition text-xl"
                    >
                        🎨
                    </button>

                    {/* Upload image */}
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        title="Upload Image"
                        disabled={uploading}
                        className="text-gray-400 hover:text-blue-400 p-2 rounded-lg hover:bg-gray-900 transition text-xl disabled:opacity-50"
                    >
                        🖼️
                    </button>

                    {/* Upload file */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload File"
                        disabled={uploading}
                        className="text-gray-400 hover:text-green-400 p-2 rounded-lg hover:bg-gray-900 transition text-xl disabled:opacity-50"
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
                        className="text-gray-400 hover:text-pink-400 p-2 rounded-lg hover:bg-gray-900 transition text-xl"
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
                        className="w-full bg-gray-900 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-600 max-h-32 overflow-y-auto"
                        style={{ minHeight: '44px' }}
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
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-xl transition flex-shrink-0"
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
            <p className="text-gray-700 text-xs mt-2 text-center">
                Enter to send · Shift+Enter for new line
            </p>

        </div>
    );
}