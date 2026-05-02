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
    const { socket, connected } = useContext(SocketContext);
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
            if (!otherUserId) return null;
            const sorted = [user.id, otherUserId].sort();
            return `${roomType}_${sorted[0]}_${sorted[1]}`;
        }
        return null;
    };

    const room = getRoom();

    // ── Join room & setup listeners ────────────────────────────
    useEffect(() => {
        if (!socket) return;

        // ── Named handlers so we can remove only these ─────────
        const onChatHistory = (history) => {
            setMessages(history);
            setLoading(false);
            scrollToBottom();
        };

        const onReceiveMessage = (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        };

        const onMessageEdited = ({ messageId, newMessage, editedAt }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, message: newMessage, is_edited: true, edited_at: editedAt }
                    : m
            ));
        };

        const onMessageDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        };

        const onReactionUpdated = ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, reactions } : m
            ));
        };

        const onReactionRemoved = ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, reactions } : m
            ));
        };

        const onUserTyping = ({ name }) => setTyping(name);
        const onUserStopTyping = () => setTyping(null);

        const onError = ({ message: errMsg }) => {
            console.error('Socket room error:', errMsg);
            setLoading(false);
        };

        // Register listeners BEFORE emitting joinRoom
        socket.on('chatHistory', onChatHistory);
        socket.on('receiveMessage', onReceiveMessage);
        socket.on('messageEdited', onMessageEdited);
        socket.on('messageDeleted', onMessageDeleted);
        socket.on('reactionUpdated', onReactionUpdated);
        socket.on('reactionRemoved', onReactionRemoved);
        socket.on('userTyping', onUserTyping);
        socket.on('userStopTyping', onUserStopTyping);
        socket.on('error', onError);

        // Join after listeners are ready
        socket.emit('joinRoom', { roomType, otherUserId });

        return () => {
            socket.emit('leaveRoom', { room });
            socket.off('chatHistory', onChatHistory);
            socket.off('receiveMessage', onReceiveMessage);
            socket.off('messageEdited', onMessageEdited);
            socket.off('messageDeleted', onMessageDeleted);
            socket.off('reactionUpdated', onReactionUpdated);
            socket.off('reactionRemoved', onReactionRemoved);
            socket.off('userTyping', onUserTyping);
            socket.off('userStopTyping', onUserStopTyping);
            socket.off('error', onError);
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

    // ── Handlers ───────────────────────────────────────────────
    const handleSend = ({ message, fileUrl, fileName, fileSize, fileType }) => {
        if (!socket || !connected) {
            console.warn('Cannot send — socket not connected');
            return;
        }
        console.log('Emitting sendMessage:', { roomType, otherUserId, message });
        socket.emit('sendMessage', {
            roomType, otherUserId,
            message, fileUrl, fileName, fileSize, fileType
        });
    };

    const handleTyping = () => {
        if (!socket) return;
        socket.emit('typing', { room });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { room });
        }, 2000);
    };

    const handleEdit = (messageId, newMessage) => {
        if (!socket) return;
        socket.emit('editMessage', { messageId, room, newMessage });
    };

    const handleDelete = (messageId) => {
        if (!socket) return;
        socket.emit('deleteMessage', { messageId, room });
    };

    const handleReaction = (messageId, emojiType, standardEmoji, customEmojiId) => {
        if (!socket) return;
        socket.emit('addReaction', { messageId, room, emojiType, standardEmoji, customEmojiId });
    };

    const handleRemoveReaction = (messageId, standardEmoji, customEmojiId) => {
        if (!socket) return;
        socket.emit('removeReaction', { messageId, room, standardEmoji, customEmojiId });
    };

    return (
        // ── Outer wrapper: fills parent, NO overflow ───────────
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: '#fff',
        }}>

            {/* ── Guard: no roomType ─────────────────────────── */}
            {!roomType ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    Select a conversation to start chatting
                </div>
            ) : (<>

            {/* ── Back button - FIXED, never moves ──────────── */}
            {onBack && (
                <div style={{
                    flexShrink: 0,               // ← never shrinks
                    padding: '12px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: '#fff',
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none', border: 'none',
                            cursor: 'pointer', color: '#94a3b8',
                            fontSize: 14, fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        ← Back
                    </button>
                </div>
            )}

            {/* ── Connection status banner ───────────────── */}
            {!connected && (
                <div style={{
                    flexShrink: 0,
                    padding: '6px 16px',
                    background: '#FEF3C7',
                    borderBottom: '1px solid #FDE68A',
                    fontSize: 12,
                    color: '#92400E',
                    textAlign: 'center',
                }}>
                    ⚠️ Connecting to server...
                </div>
            )}

            {/* ── Messages area - THE ONLY THING THAT SCROLLS ── */}
            <div style={{
                flex: 1,               // ← takes all remaining space
                overflowY: 'auto',     // ← ONLY this scrolls vertically
                overflowX: 'hidden',   // ← never scroll horizontally
                padding: '24px 16px',
            }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>

                    {/* Chat header inside messages */}
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', textAlign: 'center',
                        paddingBottom: 32,
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: '#374151',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 28, fontWeight: 700,
                            marginBottom: 12,
                        }}>
                            {conversationTitle?.[0]?.toUpperCase()}
                        </div>
                        <h2 style={{
                            margin: '0 0 4px', fontSize: 16,
                            fontWeight: 600, color: '#1f2937',
                        }}>
                            {conversationTitle}
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                            Start the conversation here.
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{
                            display: 'flex', justifyContent: 'center',
                            padding: '40px 0',
                        }}>
                            <p style={{ color: '#94a3b8', fontSize: 14 }}>
                                Loading messages...
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && messages.length === 0 && (
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', padding: '40px 0', gap: 8,
                        }}>
                            <p style={{ fontSize: 40, margin: 0 }}>💬</p>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 15 }}>
                                No messages yet
                            </p>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
                                Be the first to say something!
                            </p>
                        </div>
                    )}

                    {/* Messages */}
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
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: 8, padding: '4px 8px',
                        }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[0, 150, 300].map(delay => (
                                    <div key={delay} style={{
                                        width: 8, height: 8,
                                        borderRadius: '50%',
                                        background: '#94a3b8',
                                        animation: 'bounce 1s infinite',
                                        animationDelay: `${delay}ms`,
                                    }} />
                                ))}
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                                {typing} is typing...
                            </p>
                        </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />

                </div>
            </div>

            {/* ── Chat Input - FIXED at bottom, never moves ─── */}
            <div style={{
                flexShrink: 0,
                borderTop: '1px solid #f1f5f9',
                background: '#fff',
            }}>
                <ChatInput
                    onSend={handleSend}
                    onTyping={handleTyping}
                    roomType={roomType}
                />
            </div>

            </>)}
        </div>
    );
}