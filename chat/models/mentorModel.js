import pool from '../config/db.js';

// Girl requests a mentor
export const requestMentor = async (girlId, mentorId) => {
    const result = await pool.query(
        `INSERT INTO mentor_requests (girl_id, mentor_id, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [girlId, mentorId]
    );
    return result.rows[0];
};

// Check if request already exists
export const checkExistingRequest = async (girlId, mentorId) => {
    const result = await pool.query(
        `SELECT * FROM mentor_requests
         WHERE girl_id = $1 AND mentor_id = $2`,
        [girlId, mentorId]
    );
    return result.rows[0];
};

// Mentor approves a girl
export const approveRequest = async (requestId, mentorId) => {
    const result = await pool.query(
        `UPDATE mentor_requests 
         SET status = 'approved'
         WHERE id = $1 AND mentor_id = $2
         RETURNING *`,
        [requestId, mentorId]
    );
    return result.rows[0];
};

// Mentor rejects a girl
export const rejectRequest = async (requestId, mentorId) => {
    const result = await pool.query(
        `UPDATE mentor_requests
         SET status = 'rejected'
         WHERE id = $1 AND mentor_id = $2
         RETURNING *`,
        [requestId, mentorId]
    );
    return result.rows[0];
};

// Get all pending requests for a mentor
export const getPendingRequests = async (mentorId) => {
    const result = await pool.query(
        `SELECT 
            mr.id,
            mr.status,
            mr.created_at,
            u.id as girl_id,
            u.name as girl_name,
            u.email as girl_email,
            u.online as girl_online,
            u.last_seen as girl_last_seen
         FROM mentor_requests mr
         JOIN users u ON mr.girl_id = u.id
         WHERE mr.mentor_id = $1 
         AND mr.status = 'pending'
         ORDER BY mr.created_at DESC`,
        [mentorId]
    );
    return result.rows;
};

// Get all approved mentees for a mentor
export const getMyMentees = async (mentorId) => {
    const result = await pool.query(
        `SELECT 
            mr.id as request_id,
            mr.created_at as approved_at,
            u.id as girl_id,
            u.name as girl_name,
            u.email as girl_email,
            u.online as girl_online,
            u.last_seen as girl_last_seen
         FROM mentor_requests mr
         JOIN users u ON mr.girl_id = u.id
         WHERE mr.mentor_id = $1 
         AND mr.status = 'approved'
         ORDER BY u.name ASC`,
        [mentorId]
    );
    return result.rows;
};

// Get a girl's mentor (approved only)
export const getMyMentor = async (girlId) => {
    const result = await pool.query(
        `SELECT 
            mr.id as request_id,
            mr.created_at as approved_at,
            u.id as mentor_id,
            u.name as mentor_name,
            u.email as mentor_email,
            u.online as mentor_online,
            u.last_seen as mentor_last_seen
         FROM mentor_requests mr
         JOIN users u ON mr.mentor_id = u.id
         WHERE mr.girl_id = $1 
         AND mr.status = 'approved'`,
        [girlId]
    );
    return result.rows[0];
};

// Check if girl and mentor are connected (approved)
export const isApprovedPair = async (girlId, mentorId) => {
    const result = await pool.query(
        `SELECT * FROM mentor_requests
         WHERE girl_id = $1 
         AND mentor_id = $2 
         AND status = 'approved'`,
        [girlId, mentorId]
    );
    return result.rows[0];
};

// Get all requests for a girl
export const getGirlRequests = async (girlId) => {
    const result = await pool.query(
        `SELECT 
            mr.id,
            mr.status,
            mr.created_at,
            u.id as mentor_id,
            u.name as mentor_name,
            u.email as mentor_email
         FROM mentor_requests mr
         JOIN users u ON mr.mentor_id = u.id
         WHERE mr.girl_id = $1
         ORDER BY mr.created_at DESC`,
        [girlId]
    );
    return result.rows;
};