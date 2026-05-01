import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
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
    }, [socket, roomType, otherUserId]);

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
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">

            {/* Back button (for DM and mentor chat) */}
            {onBack && (
                <div className="px-4 py-2 border-b border-gray-800">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition"
                    >
                        ← Back
                    </button>
                </div>
            )}

            {/* ── Messages area ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading messages...</p>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-6xl mb-4">💬</p>
                        <p className="text-gray-400 font-medium">No messages yet</p>
                        <p className="text-gray-600 text-sm mt-1">
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
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-gray-500 text-xs">{typing} is typing...</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Chat Input ─────────────────────────────── */}
            <ChatInput
                onSend={handleSend}
                onTyping={handleTyping}
                roomType={roomType}
            />

        </div>
    );
}