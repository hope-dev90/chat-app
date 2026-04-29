import pool from '../config/db.js';

// Create custom emoji
export const createEmoji = async ({ name, imageUrl, createdBy }) => {
    const result = await pool.query(
        `INSERT INTO custom_emojis (name, image_url, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, imageUrl, createdBy]
    );
    return result.rows[0];
};

// Get all custom emojis
export const getAllEmojis = async () => {
    const result = await pool.query(
        `SELECT 
            ce.id,
            ce.name,
            ce.image_url,
            ce.created_at,
            u.name as created_by_name
         FROM custom_emojis ce
         JOIN users u ON ce.created_by = u.id
         ORDER BY ce.created_at DESC`
    );
    return result.rows;
};

// Get emoji by id
export const getEmojiById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM custom_emojis WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

// Get emoji by name
export const getEmojiByName = async (name) => {
    const result = await pool.query(
        `SELECT * FROM custom_emojis WHERE name = $1`,
        [name]
    );
    return result.rows[0];
};

// Delete emoji (only creator can delete)
export const deleteEmoji = async (id, createdBy) => {
    const result = await pool.query(
        `DELETE FROM custom_emojis
         WHERE id = $1 AND created_by = $2
         RETURNING *`,
        [id, createdBy]
    );
    return result.rows[0];
};