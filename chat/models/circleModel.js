import pool from '../config/db.js';

export const createCircle = async ({ name, description, color, createdBy }) => {
    const result = await pool.query(
        `INSERT INTO circles (name, description, color, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description || '', color || '#2563EB', createdBy]
    );
    const circle = result.rows[0];
    // Creator auto-joins
    await pool.query(
        `INSERT INTO circle_members (circle_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [circle.id, createdBy]
    );
    return circle;
};

export const getAllCircles = async (userId) => {
    const result = await pool.query(
        `SELECT c.*,
            u.name AS creator_name,
            COUNT(DISTINCT cm.user_id) AS member_count,
            BOOL_OR(cm.user_id = $1) AS is_member
         FROM circles c
         JOIN users u ON c.created_by = u.id
         LEFT JOIN circle_members cm ON cm.circle_id = c.id
         GROUP BY c.id, u.name
         ORDER BY c.created_at DESC`,
        [userId]
    );
    return result.rows;
};

export const getCircleById = async (circleId, userId) => {
    const result = await pool.query(
        `SELECT c.*,
            u.name AS creator_name,
            COUNT(DISTINCT cm.user_id) AS member_count,
            BOOL_OR(cm.user_id = $2) AS is_member
         FROM circles c
         JOIN users u ON c.created_by = u.id
         LEFT JOIN circle_members cm ON cm.circle_id = c.id
         WHERE c.id = $1
         GROUP BY c.id, u.name`,
        [circleId, userId]
    );
    return result.rows[0];
};

export const joinCircle = async (circleId, userId) => {
    await pool.query(
        `INSERT INTO circle_members (circle_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [circleId, userId]
    );
};

export const leaveCircle = async (circleId, userId) => {
    await pool.query(
        `DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2`,
        [circleId, userId]
    );
};

export const getMentorCircles = async (mentorId) => {
    const result = await pool.query(
        `SELECT c.*,
            COUNT(DISTINCT cm.user_id) AS member_count
         FROM circles c
         LEFT JOIN circle_members cm ON cm.circle_id = c.id
         WHERE c.created_by = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [mentorId]
    );
    return result.rows;
};
