import {
    createPost,
    getAllPosts,
    getPostsByCircle,
    likePost,
    unlikePost,
    addComment,
    getCommentsByPost,
    hasUserLikedPost
} from '../models/postModel.js';

// Create a new post
export const createPostController = async (req, res) => {
    const { circleId, title, content, imageUrl, status, hashtags } = req.body;
    const userId = req.user.id;

    try {
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const post = await createPost({
            circleId,
            userId,
            title,
            content,
            imageUrl,
            status,
            hashtags
        });

        return res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post
        });

    } catch (error) {
        console.error('createPostController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get all posts
export const getAllPostsController = async (req, res) => {
    try {
        const posts = await getAllPosts();
        return res.status(200).json({
            success: true,
            posts
        });

    } catch (error) {
        console.error('getAllPostsController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get posts by circle id
export const getPostsByCircleController = async (req, res) => {
    const { circleId } = req.params;

    try {
        const posts = await getPostsByCircle(circleId);
        return res.status(200).json({
            success: true,
            posts
        });

    } catch (error) {
        console.error('getPostsByCircleController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Like a post
export const likePostController = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const liked = await likePost(postId, userId);
        if (!liked) {
            return res.status(400).json({
                success: false,
                message: 'Already liked this post'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Post liked'
        });

    } catch (error) {
        console.error('likePostController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Unlike a post
export const unlikePostController = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const unliked = await unlikePost(postId, userId);
        if (!unliked) {
            return res.status(404).json({
                success: false,
                message: 'Post not liked'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Post unliked'
        });

    } catch (error) {
        console.error('unlikePostController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Add a comment to a post
export const addCommentController = async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const comment = await addComment(postId, userId, content);
        return res.status(201).json({
            success: true,
            message: 'Comment added',
            comment
        });

    } catch (error) {
        console.error('addCommentController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get comments for a post
export const getCommentsByPostController = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await getCommentsByPost(postId);
        return res.status(200).json({
            success: true,
            comments
        });

    } catch (error) {
        console.error('getCommentsByPostController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};
