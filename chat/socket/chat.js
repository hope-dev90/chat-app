import {
    saveMessage,
    getRecentMessages,
    markMessagesAsRead,
    getUnreadCount,
    deleteMessage,
    updateMessage
} from '../models/messageModel.js';

import {
    updateOnlineStatus
} from '../models/userModel.js';

import {
    isApprovedPair
} from '../models/mentorModel.js';

import {
    addReaction,
    removeReaction,
    getGroupedReactions
} from '../models/reactionModel.js';

// ─── Room name helper ──────────────────────────────────────────
const getRoom = (roomType, userId, otherUserId) => {
    if (roomType === 'general') return 'general';
    if (roomType === 'girls') return 'girls';
    if (roomType === 'mentor' || roomType === 'dm') {
        const sorted = [userId, otherUserId].sort();
        return `${roomType}_${sorted[0]}_${sorted[1]}`;
    }
};

// ─── Check room access ─────────────────────────────────────────
const canAccessRoom = async (socket, roomType, otherUserId) => {
    const userId = socket.user.id;
    const role = socket.user.role;

    if (roomType === 'general') return true;
    if (roomType === 'girls') return role === 'girl';
    if (roomType === 'dm') return true;

    if (roomType === 'mentor') {
        if (role === 'girl') return await isApprovedPair(userId, otherUserId);
        if (role === 'mentor') return await isApprovedPair(otherUserId, userId);
    }

    return false;
};

// ─── Main socket logic ─────────────────────────────────────────
export default function chatSocket(io) {

    io.on('connection', async (socket) => {
        console.log(`✅ connected: ${socket.user.name} (${socket.user.role})`);

        // Update online status
        await updateOnlineStatus(socket.user.id, true);
        io.emit('userOnline', {
            userId: socket.user.id,
            name: socket.user.name
        });

        // ─── Join Room ─────────────────────────────────────────
        socket.on('joinRoom', async ({ roomType, otherUserId }) => {
            try {
                const allowed = await canAccessRoom(socket, roomType, otherUserId);
                if (!allowed) {
                    socket.emit('error', { message: 'You are not allowed in this room' });
                    return;
                }

                const room = getRoom(roomType, socket.user.id, otherUserId);
                socket.join(room);

                // Load last 50 messages
                const history = await getRecentMessages(room);
                socket.emit('chatHistory', history);

                // Mark as read
                await markMessagesAsRead(room, socket.user.id);

                // Unread count
                const unread = await getUnreadCount(room, socket.user.id);
                socket.emit('unreadCount', { room, count: unread });

            } catch (error) {
                console.error('joinRoom error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // ─── Send Message ──────────────────────────────────────
        socket.on('sendMessage', async ({
            roomType,
            otherUserId,
            message,
            fileUrl,
            fileName,
            fileSize,
            fileType
        }) => {
            try {
                // Must have message or file
                if (!message?.trim() && !fileUrl) {
                    socket.emit('error', { message: 'Message or file is required' });
                    return;
                }

                const allowed = await canAccessRoom(socket, roomType, otherUserId);
                if (!allowed) {
                    socket.emit('error', { message: 'You are not allowed in this room' });
                    return;
                }

                const room = getRoom(roomType, socket.user.id, otherUserId);

                // Save to DB
                const saved = await saveMessage({
                    senderId: socket.user.id,
                    room,
                    roomType,
                    message: message?.trim() || '',
                    fileUrl: fileUrl || null,
                    fileName: fileName || null,
                    fileSize: fileSize || null,
                    fileType: fileType || null
                });

                // Broadcast to room
                io.to(room).emit('receiveMessage', {
                    id: saved.id,
                    sender_id: socket.user.id,
                    sender_name: socket.user.name,
                    sender_role: socket.user.role,
                    message: saved.message,
                    file_url: saved.file_url,
                    file_name: saved.file_name,
                    file_size: saved.file_size,
                    file_type: saved.file_type,
                    room,
                    room_type: roomType,
                    is_edited: false,
                    reactions: [],
                    created_at: saved.created_at
                });

            } catch (error) {
                console.error('sendMessage error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ─── Edit Message ──────────────────────────────────────
        socket.on('editMessage', async ({ messageId, room, newMessage }) => {
            try {
                if (!newMessage?.trim()) {
                    socket.emit('error', { message: 'Message cannot be empty' });
                    return;
                }

                // Only sender can edit
                const updated = await updateMessage(
                    messageId,
                    socket.user.id,
                    newMessage.trim()
                );

                if (!updated) {
                    socket.emit('error', { message: 'Message not found or not yours' });
                    return;
                }

                // Tell everyone in room
                io.to(room).emit('messageEdited', {
                    messageId,
                    newMessage: updated.message,
                    editedAt: updated.edited_at
                });

            } catch (error) {
                console.error('editMessage error:', error);
                socket.emit('error', { message: 'Failed to edit message' });
            }
        });

        // ─── Delete Message ────────────────────────────────────
        socket.on('deleteMessage', async ({ messageId }) => {
            try {
                const deleted = await deleteMessage(messageId, socket.user.id);

                if (!deleted) {
                    socket.emit('error', { message: 'Message not found or not yours' });
                    return;
                }

                io.to(deleted.room).emit('messageDeleted', { messageId });

            } catch (error) {
                console.error('deleteMessage error:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // ─── Add Reaction ──────────────────────────────────────
        socket.on('addReaction', async ({
            messageId,
            room,
            emojiType,
            standardEmoji,
            customEmojiId
        }) => {
            try {
                // Validate
                if (emojiType === 'standard' && !standardEmoji) {
                    socket.emit('error', { message: 'Standard emoji is required' });
                    return;
                }
                if (emojiType === 'custom' && !customEmojiId) {
                    socket.emit('error', { message: 'Custom emoji ID is required' });
                    return;
                }

                // Save reaction
                await addReaction({
                    messageId,
                    userId: socket.user.id,
                    emojiType,
                    standardEmoji,
                    customEmojiId
                });

                // Get updated grouped reactions
                const reactions = await getGroupedReactions(messageId);

                // Tell everyone in room
                io.to(room).emit('reactionUpdated', {
                    messageId,
                    reactions
                });

            } catch (error) {
                console.error('addReaction error:', error);
                socket.emit('error', { message: 'Failed to add reaction' });
            }
        });

        // ─── Remove Reaction ───────────────────────────────────
        socket.on('removeReaction', async ({
            messageId,
            room,
            standardEmoji,
            customEmojiId
        }) => {
            try {
                await removeReaction({
                    messageId,
                    userId: socket.user.id,
                    standardEmoji,
                    customEmojiId
                });

                // Get updated reactions
                const reactions = await getGroupedReactions(messageId);

                io.to(room).emit('reactionRemoved', {
                    messageId,
                    reactions
                });

            } catch (error) {
                console.error('removeReaction error:', error);
                socket.emit('error', { message: 'Failed to remove reaction' });
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
            await updateOnlineStatus(socket.user.id, false);
            io.emit('userOffline', {
                userId: socket.user.id,
                name: socket.user.name
            });
        });

    });
}
