import pool from "../config/db.js";
import { getGroupedReactions } from "./reactionModel.js";

// Save a new message
export const saveMessage = async ({
  senderId,
  room,
  roomType,
  message,
  fileUrl = null,
  fileName = null,
  fileSize = null,
  fileType = null,
}) => {
  const result = await pool.query(
    `INSERT INTO messages (
            sender_id,
            room,
            room_type,
            message,
            file_url,
            file_name,
            file_size,
            file_type
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
    [senderId, room, roomType, message, fileUrl, fileName, fileSize, fileType],
  );
  return result.rows[0];
};

// Get messages by room
export const getMessagesByRoom = async (room) => {
  const result = await pool.query(
    `SELECT 
            m.id,
            m.message,
            m.file_url,
            m.file_name,
            m.file_size,
            m.file_type,
            m.room,
            m.room_type,
            m.is_read,
            m.is_edited,
            m.edited_at,
            m.created_at,
            u.id as sender_id,
            u.name as sender_name,
            u.role as sender_role
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.room = $1
         ORDER BY m.created_at ASC`,
    [room],
  );

  const messages = result.rows;

  // Add reactions to each message
  for (const message of messages) {
    const reactions = await getGroupedReactions(message.id);
    message.reactions = reactions;
  }

  return messages;
};

// Get recent messages with limit
export const getRecentMessages = async (room, limit = 50) => {
  const result = await pool.query(
    `SELECT 
            m.id,
            m.message,
            m.file_url,
            m.file_name,
            m.file_size,
            m.file_type,
            m.room,
            m.room_type,
            m.is_read,
            m.is_edited,
            m.edited_at,
            m.created_at,
            u.id as sender_id,
            u.name as sender_name,
            u.role as sender_role
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.room = $1
         ORDER BY m.created_at DESC
         LIMIT $2`,
    [room, limit],
  );
  // reverse so oldest is first
  let messages = result.rows.reverse();

  // Add reactions to each message
  for (const message of messages) {
    const reactions = await getGroupedReactions(message.id);
    message.reactions = reactions;
  }

  return messages;
};

// Mark messages as read
export const markMessagesAsRead = async (room, userId) => {
  await pool.query(
    `UPDATE messages 
         SET is_read = true
         WHERE room = $1 
         AND sender_id != $2
         AND is_read = false`,
    [room, userId],
  );
};

// Get unread count per room
export const getUnreadCount = async (room, userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) as count
         FROM messages
         WHERE room = $1
         AND sender_id != $2
         AND is_read = false`,
    [room, userId],
  );
  return parseInt(result.rows[0].count);
};

// Get unread counts for all rooms a user is in
export const getAllUnreadCounts = async (userId, rooms) => {
  const result = await pool.query(
    `SELECT room, COUNT(*) as count
         FROM messages
         WHERE room = ANY($1)
         AND sender_id != $2
         AND is_read = false
         GROUP BY room`,
    [rooms, userId],
  );
  return result.rows;
};

// Delete a message (only sender can delete)
export const deleteMessage = async (messageId, senderId) => {
  const result = await pool.query(
    `DELETE FROM messages
         WHERE id = $1 AND sender_id = $2
         RETURNING *`,
    [messageId, senderId],
  );
  return result.rows[0];
};

// Get last message in a room (for chat preview)
export const getLastMessage = async (room) => {
  const result = await pool.query(
    `SELECT 
            m.message,
            m.file_url,
            m.file_name,
            m.file_type,
            m.created_at,
            u.name as sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.room = $1
         ORDER BY m.created_at DESC
         LIMIT 1`,
    [room],
  );
  return result.rows[0];
};
// Add this to your existing messageModel.js
export const updateMessage = async (messageId, senderId, newMessage) => {
  const result = await pool.query(
    `UPDATE messages
         SET message = $1,
             is_edited = true,
             edited_at = NOW()
         WHERE id = $2 AND sender_id = $3
         RETURNING *`,
    [newMessage, messageId, senderId],
  );
  return result.rows[0];
};
