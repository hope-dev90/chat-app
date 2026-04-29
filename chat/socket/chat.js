import {
    saveMessage,
    getRecentMessages,
    markMessagesAsRead,
    getUnreadCount,
    deleteMessage
} from '../models/messageModel.js';

import {
    updateOnlineStatus
} from '../models/userModel.js';

import {
    isApprovedPair
} from '../models/mentorModel.js';

// ─── Room name helpers ─────────────────────────────────────────
export const getRoomName = (type, id1, id2) => {
    if (type === 'general') return 'general';
    if (type === 'girls') return 'girls';
    if (type === 'mentor') return `mentor_${id1}_${id2}`;
    if (type === 'dm') {
        const sorted = [id1, id2].sort();
        return `dm_${sorted[0]}_${sorted[1]}`;
    }
};

// ─── Check room access ─────────────────────────────────────────
const canAccessRoom = async (socket, roomType, otherUserId) => {
    const userId = socket.user.id;
    const role = socket.user.role;

    // General - everyone can access
    if (roomType === 'general') return true;

    // Girls only - only girls can access
    if (roomType === 'girls') return role === 'girl';

    // Mentor chat - only approved pairs
    if (roomType === 'mentor') {
        if (role === 'girl') {
            return await isApprovedPair(userId, otherUserId);
        }
        if (role === 'mentor') {
            return await isApprovedPair(otherUserId, userId);
        }
    }

    // DM - any two users
    if (roomType === 'dm') return true;

    return false;
};

// ─── Main socket logic ─────────────────────────────────────────
export default function chatSocket(io) {

    io.on('connection', async (socket) => {
        console.log(`✅ connected: ${socket.user.name} (${socket.user.role})`);

        // Update user online status
        await updateOnlineStatus(socket.user.id, true);

        // Tell everyone this user is online
        io.emit('userOnline', {
            userId: socket.user.id,
            name: socket.user.name
        });

        // ─── Join Room ─────────────────────────────────────────
        socket.on('joinRoom', async ({ roomType, otherUserId }) => {
            try {
                // Check access
                const allowed = await canAccessRoom(socket, roomType, otherUserId);
                if (!allowed) {
                    socket.emit('error', {
                        message: 'You are not allowed in this room'
                    });
                    return;
                }

                // Get room name
                const room = getRoomName(
                    roomType,
                    socket.user.role === 'mentor' ? socket.user.id : otherUserId,
                    socket.user.role === 'girl' ? socket.user.id : otherUserId
                );

                // Join the room
                socket.join(room);
                console.log(`${socket.user.name} joined room: ${room}`);

                // Load last 50 messages
                const history = await getRecentMessages(room);
                socket.emit('chatHistory', history);

                // Mark messages as read
                await markMessagesAsRead(room, socket.user.id);

                // Get unread count
                const unread = await getUnreadCount(room, socket.user.id);
                socket.emit('unreadCount', { room, count: unread });

            } catch (error) {
                console.error('joinRoom error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // ─── Send Message ──────────────────────────────────────
        socket.on('sendMessage', async ({ roomType, otherUserId, message }) => {
            try {
                if (!message || message.trim() === '') {
                    socket.emit('error', { message: 'Message cannot be empty' });
                    return;
                }

                // Check access
                const allowed = await canAccessRoom(socket, roomType, otherUserId);
                if (!allowed) {
                    socket.emit('error', {
                        message: 'You are not allowed in this room'
                    });
                    return;
                }

                // Get room name
                const room = getRoomName(
                    roomType,
                    socket.user.role === 'mentor' ? socket.user.id : otherUserId,
                    socket.user.role === 'girl' ? socket.user.id : otherUserId
                );

                // Save to DB
                const saved = await saveMessage({
                    senderId: socket.user.id,
                    room,
                    roomType,
                    message: message.trim()
                });

                // Send to everyone in room
                io.to(room).emit('receiveMessage', {
                    id: saved.id,
                    sender_id: socket.user.id,
                    sender_name: socket.user.name,
                    sender_role: socket.user.role,
                    message: saved.message,
                    room,
                    room_type: roomType,
                    created_at: saved.created_at
                });

            } catch (error) {
                console.error('sendMessage error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ─── Delete Message ────────────────────────────────────
        socket.on('deleteMessage', async ({ messageId, room }) => {
            try {
                const deleted = await deleteMessage(messageId, socket.user.id);

                if (!deleted) {
                    socket.emit('error', { message: 'Message not found' });
                    return;
                }

                // Tell everyone in the saved message room to remove message
                io.to(deleted.room).emit('messageDeleted', { messageId });

            } catch (error) {
                console.error('deleteMessage error:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // ─── Typing ────────────────────────────────────────────
        socket.on('typing', ({ room }) => {
            socket.to(room).emit('userTyping', {
                userId: socket.user.id,
                name: socket.user.name
            });
        });

        // ─── Stop Typing ───────────────────────────────────────
        socket.on('stopTyping', ({ room }) => {
            socket.to(room).emit('userStopTyping', {
                userId: socket.user.id
            });
        });

        // ─── Leave Room ────────────────────────────────────────
        socket.on('leaveRoom', ({ room }) => {
            socket.leave(room);
            console.log(`${socket.user.name} left room: ${room}`);
        });

        // ─── Disconnect ────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log(`❌ disconnected: ${socket.user.name}`);

            // Update offline status
            await updateOnlineStatus(socket.user.id, false);

            // Tell everyone this user is offline
            io.emit('userOffline', {
                userId: socket.user.id,
                name: socket.user.name
            });
        });

    });
}
