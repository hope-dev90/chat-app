import pool from '../config/db.js';

// Create a new circle
export const createCircle = async ({ name, description, coverImageUrl, color, createdBy }) => {
    const result = await pool.query(
        `INSERT INTO circles (name, description, cover_image_url, color, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, description, coverImageUrl || null, color, createdBy]
    );
    return result.rows[0];
};

// Get all circles
export const getAllCircles = async () => {
    const result = await pool.query(
        `SELECT c.*, 
                COUNT(DISTINCT cm.user_id) as member_count
         FROM circles c
         LEFT JOIN circle_members cm ON c.id = cm.circle_id
         GROUP BY c.id
         ORDER BY c.created_at DESC`
    );
    return result.rows;
};

// Get circle by id
export const getCircleById = async (circleId) => {
    const result = await pool.query(
        `SELECT c.*, 
                COUNT(DISTINCT cm.user_id) as member_count
         FROM circles c
         LEFT JOIN circle_members cm ON c.id = cm.circle_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [circleId]
    );
    return result.rows[0];
};

// Join a circle
export const joinCircle = async (circleId, userId) => {
    const result = await pool.query(
        `INSERT INTO circle_members (circle_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [circleId, userId]
    );
    return result.rows[0];
};

// Leave a circle
export const leaveCircle = async (circleId, userId) => {
    const result = await pool.query(
        `DELETE FROM circle_members
         WHERE circle_id = $1 AND user_id = $2
         RETURNING *`,
        [circleId, userId]
    );
    return result.rows[0];
};

// Check if user is a member of a circle
export const isCircleMember = async (circleId, userId) => {
    const result = await pool.query(
        `SELECT 1 FROM circle_members
         WHERE circle_id = $1 AND user_id = $2`,
        [circleId, userId]
    );
    return result.rows.length > 0;
};

// Get all members of a circle
export const getCircleMembers = async (circleId) => {
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.online, u.last_seen, cm.joined_at
         FROM circle_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.circle_id = $1
         ORDER BY cm.joined_at DESC`,
        [circleId]
    );
    return result.rows;
};

// Get circles a user is a member of
export const getUserCircles = async (userId) => {
    const result = await pool.query(
        `SELECT c.*, 
                COUNT(DISTINCT cm2.user_id) as member_count
         FROM circle_members cm
         JOIN circles c ON cm.circle_id = c.id
         LEFT JOIN circle_members cm2 ON c.id = cm2.circle_id
         WHERE cm.user_id = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [userId]
    );
    return result.rows;
};
