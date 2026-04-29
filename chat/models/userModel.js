import pool from '../config/db.js';

// Create a new user
export const createUser = async ({ name, email, password, role }) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, is_verified, created_at`,
        [name, email, password, role]
    );
    return result.rows[0];
};

// Find user by email
export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

// Find user by id
export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, role, is_verified, online, last_seen 
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

// Get all girls
export const getAllGirls = async () => {
    const result = await pool.query(
        `SELECT id, name, email, online, last_seen 
         FROM users 
         WHERE role = 'girl'
         ORDER BY name ASC`
    );
    return result.rows;
};

// Get all mentors
export const getAllMentors = async () => {
    const result = await pool.query(
        `SELECT id, name, email, online, last_seen 
         FROM users 
         WHERE role = 'mentor'
         ORDER BY name ASC`
    );
    return result.rows;
};

// Update online status
export const updateOnlineStatus = async (id, online) => {
    await pool.query(
        `UPDATE users 
         SET online = $1, last_seen = NOW() 
         WHERE id = $2`,
        [online, id]
    );
};

// Save OTP
export const saveOtp = async (email, otp, expiresAt) => {
    await pool.query(
        `UPDATE users 
         SET otp = $1::text, otp_expires = $2::timestamptz 
         WHERE email = $3`,
        [otp, expiresAt, email]
    );
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
    const result = await pool.query(
        `SELECT * FROM users 
         WHERE email = $1 
         AND otp = $2::text 
         AND otp_expires > NOW()`,
        [email, otp]
    );
    return result.rows[0];
};

// Clear OTP
export const clearOtp = async (email) => {
    await pool.query(
        `UPDATE users 
         SET otp = NULL, otp_expires = NULL 
         WHERE email = $1`,
        [email]
    );
};

// Mark email verified
export const markEmailVerified = async (email) => {
    await pool.query(
        `UPDATE users SET is_verified = true WHERE email = $1`,
        [email]
    );
};

// Update password
export const updatePassword = async (email, hashedPassword) => {
    await pool.query(
        `UPDATE users SET password = $1 WHERE email = $2`,
        [hashedPassword, email]
    );
};

// Delete user
export const deleteUser = async (email) => {
    await pool.query(
        `DELETE FROM users WHERE email = $1`,
        [email]
    );
};