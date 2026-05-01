import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../../context/socketContext';
import { AuthContext } from '../../context/authContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatBox({
    roomType,
    otherUserId,
    onBack,
    chatName
}) {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const conversationTitle = chatName ||
        (roomType === 'general' ? 'General Community' :
            roomType === 'girls' ? 'Girls Circle' :
                roomType === 'mentor' ? 'Mentor Chat' :
                    'Direct Message');

    // Current room name
    const getRoom = () => {
        if (roomType === 'general') return 'general';
        if (roomType === 'girls') return 'girls';
        if (roomType === 'mentor' || roomType === 'dm') {
            const sorted = [user.id, otherUserId].sort();
            return `${roomType}_${sorted[0]}_${sorted[1]}`;
        }
    };

    const room = getRoom();

    // ── Join room & setup listeners ────────────────────────────
    useEffect(() => {
        if (!socket) return;

        // Join room
        socket.emit('joinRoom', { roomType, otherUserId });

        // Load chat history
        socket.on('chatHistory', (history) => {
            setMessages(history);
            setLoading(false);
            scrollToBottom();
        });

        // Receive new message
        socket.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        // Message edited
        socket.on('messageEdited', ({ messageId, newMessage, editedAt }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, message: newMessage, is_edited: true, edited_at: editedAt }
                    : m
            ));
        });

        // Message deleted
        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        });

        // Reaction updated
        socket.on('reactionUpdated', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, reactions } : m
            ));
        });

        // Reaction removed
        socket.on('reactionRemoved', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, reactions } : m
            ));
        });

        // Typing indicator
        socket.on('userTyping', ({ name }) => {
            setTyping(name);
        });

        socket.on('userStopTyping', () => {
            setTyping(null);
        });

        // Cleanup on unmount
        return () => {
            socket.emit('leaveRoom', { room });
            socket.off('chatHistory');
            socket.off('receiveMessage');
            socket.off('messageEdited');
            socket.off('messageDeleted');
            socket.off('reactionUpdated');
            socket.off('reactionRemoved');
            socket.off('userTyping');
            socket.off('userStopTyping');
        };
    }, [socket, roomType, otherUserId, room]);

    // ── Scroll to bottom ───────────────────────────────────────
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ── Send message ───────────────────────────────────────────
    const handleSend = ({ message, fileUrl, fileName, fileSize, fileType }) => {
        if (!socket) return;

        socket.emit('sendMessage', {
            roomType,
            otherUserId,
            message,
            fileUrl,
            fileName,
            fileSize,
            fileType
        });
    };

    // ── Typing indicator ───────────────────────────────────────
    const handleTyping = () => {
        if (!socket) return;
        socket.emit('typing', { room });

        // Stop typing after 2 seconds
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { room });
        }, 2000);
    };

    // ── Edit message ───────────────────────────────────────────
    const handleEdit = (messageId, newMessage) => {
        if (!socket) return;
        socket.emit('editMessage', { messageId, room, newMessage });
    };

    // ── Delete message ─────────────────────────────────────────
    const handleDelete = (messageId) => {
        if (!socket) return;
        socket.emit('deleteMessage', { messageId, room });
    };

    // ── Add reaction ───────────────────────────────────────────
    const handleReaction = (messageId, emojiType, standardEmoji, customEmojiId) => {
        if (!socket) return;
        socket.emit('addReaction', {
            messageId,
            room,
            emojiType,
            standardEmoji,
            customEmojiId
        });
    };

    // ── Remove reaction ────────────────────────────────────────
    const handleRemoveReaction = (messageId, standardEmoji, customEmojiId) => {
        if (!socket) return;
        socket.emit('removeReaction', {
            messageId,
            room,
            standardEmoji,
            customEmojiId
        });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

            {/* Back button (for DM and mentor chat) */}
            {onBack && (
                <div className="px-5 py-3 border-b border-slate-100 bg-white">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-[#6429ef] text-sm font-medium flex items-center gap-2 transition"
                    >
                        ← Back
                    </button>
                </div>
            )}

            {/* ── Messages area ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto bg-white px-3 py-6">
                <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col space-y-2">
                    <div className="flex flex-col items-center px-4 pb-8 pt-2 text-center">
                        <img
                            src="/chat.png"
                            alt=""
                            className="h-24 w-24 rounded-full object-cover shadow-sm sm:h-28 sm:w-28"
                        />
                        <h2 className="mt-4 text-base font-semibold text-slate-900">
                            {conversationTitle}
                        </h2>
                        <p className="mt-1 max-w-xs text-sm text-slate-400">
                            Start the conversation here.
                        </p>
                    </div>

                {loading && (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-slate-400">Loading messages...</p>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="text-slate-800 font-semibold">No messages yet</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Be the first to say something!
                        </p>
                    </div>
                )}

                {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const showAvatar = !prevMessage ||
                        prevMessage.sender_id !== message.sender_id;

                    return (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === user.id}
                            showAvatar={showAvatar}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReact={handleReaction}
                            onRemoveReaction={handleRemoveReaction}
                        />
                    );
                })}

                {/* Typing indicator */}
                {typing && (
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-slate-400 text-xs">{typing} is typing...</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ── Chat Input ─────────────────────────────── */}
            <div className="flex-shrink-0 bg-white">
                <ChatInput
                    onSend={handleSend}
                    onTyping={handleTyping}
                    roomType={roomType}
                />
            </div>

        </div>
    );
}
