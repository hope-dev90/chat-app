import pool from '../config/db.js';

// Create a new post
export const createPost = async ({ circleId, userId, title, content, imageUrl, status, hashtags }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const postResult = await client.query(
            `INSERT INTO posts (circle_id, user_id, title, content, image_url, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [circleId || null, userId, title, content, imageUrl || null, status || 'synced']
        );
        const post = postResult.rows[0];
        
        // Insert hashtags if any
        if (hashtags && hashtags.length > 0) {
            for (const hashtag of hashtags) {
                await client.query(
                    `INSERT INTO post_hashtags (post_id, hashtag)
                     VALUES ($1, $2)`,
                    [post.id, hashtag]
                );
            }
        }
        
        await client.query('COMMIT');
        return post;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get all posts (with likes count, comments count, and hashtags)
export const getAllPosts = async () => {
    const result = await pool.query(
        `SELECT 
            p.*,
            u.id as user_id,
            u.name as user_name,
            COUNT(DISTINCT pl.id) as like_count,
            COUNT(DISTINCT pc.id) as comment_count,
            ARRAY_AGG(DISTINCT ph.hashtag) as hashtags
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN post_likes pl ON p.id = pl.post_id
         LEFT JOIN post_comments pc ON p.id = pc.post_id
         LEFT JOIN post_hashtags ph ON p.id = ph.post_id
         GROUP BY p.id, u.id
         ORDER BY p.created_at DESC`
    );
    return result.rows;
};

// Get posts by circle id
export const getPostsByCircle = async (circleId) => {
    const result = await pool.query(
        `SELECT 
            p.*,
            u.id as user_id,
            u.name as user_name,
            COUNT(DISTINCT pl.id) as like_count,
            COUNT(DISTINCT pc.id) as comment_count,
            ARRAY_AGG(DISTINCT ph.hashtag) as hashtags
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN post_likes pl ON p.id = pl.post_id
         LEFT JOIN post_comments pc ON p.id = pc.post_id
         LEFT JOIN post_hashtags ph ON p.id = ph.post_id
         WHERE p.circle_id = $1
         GROUP BY p.id, u.id
         ORDER BY p.created_at DESC`,
        [circleId]
    );
    return result.rows;
};

// Like a post
export const likePost = async (postId, userId) => {
    const result = await pool.query(
        `INSERT INTO post_likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [postId, userId]
    );
    return result.rows[0];
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
    const result = await pool.query(
        `DELETE FROM post_likes
         WHERE post_id = $1 AND user_id = $2
         RETURNING *`,
        [postId, userId]
    );
    return result.rows[0];
};

// Add a comment to a post
export const addComment = async (postId, userId, content) => {
    const result = await pool.query(
        `INSERT INTO post_comments (post_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [postId, userId, content]
    );
    return result.rows[0];
};

// Get comments for a post
export const getCommentsByPost = async (postId) => {
    const result = await pool.query(
        `SELECT pc.*, u.id as user_id, u.name as user_name
         FROM post_comments pc
         JOIN users u ON pc.user_id = u.id
         WHERE pc.post_id = $1
         ORDER BY pc.created_at ASC`,
        [postId]
    );
    return result.rows;
};

// Check if user liked a post
export const hasUserLikedPost = async (postId, userId) => {
    const result = await pool.query(
        `SELECT 1 FROM post_likes
         WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
    );
    return result.rows.length > 0;
};
