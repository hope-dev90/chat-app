import pool from '../config/db.js';

// Add a reaction
export const addReaction = async ({ messageId, userId, emojiType, standardEmoji, customEmojiId }) => {
    const result = await pool.query(
        `INSERT INTO reactions 
         (message_id, user_id, emoji_type, standard_emoji, custom_emoji_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [messageId, userId, emojiType, standardEmoji || null, customEmojiId || null]
    );
    return result.rows[0];
};

// Remove a reaction
export const removeReaction = async ({ messageId, userId, standardEmoji, customEmojiId }) => {
    const result = await pool.query(
        `DELETE FROM reactions
         WHERE message_id = $1
         AND user_id = $2
         AND (standard_emoji = $3 OR custom_emoji_id = $4)
         RETURNING *`,
        [messageId, userId, standardEmoji || null, customEmojiId || null]
    );
    return result.rows[0];
};

// Get all reactions for a message
export const getReactionsByMessage = async (messageId) => {
    const result = await pool.query(
        `SELECT
            r.id,
            r.emoji_type,
            r.standard_emoji,
            r.created_at,
            u.id as user_id,
            u.name as user_name,
            ce.id as custom_emoji_id,
            ce.name as custom_emoji_name,
            ce.image_url as custom_emoji_url
         FROM reactions r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN custom_emojis ce ON r.custom_emoji_id = ce.id
         WHERE r.message_id = $1
         ORDER BY r.created_at ASC`,
        [messageId]
    );
    return result.rows;
};

// Get reactions grouped by emoji for a message
export const getGroupedReactions = async (messageId) => {
    const result = await pool.query(
        `SELECT
            r.emoji_type,
            r.standard_emoji,
            ce.name as custom_emoji_name,
            ce.image_url as custom_emoji_url,
            COUNT(*) as count,
            JSON_AGG(u.name) as users
         FROM reactions r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN custom_emojis ce ON r.custom_emoji_id = ce.id
         WHERE r.message_id = $1
         GROUP BY 
            r.emoji_type,
            r.standard_emoji,
            ce.name,
            ce.image_url`,
        [messageId]
    );
    return result.rows;
};
