import express from 'express';
import {
    createPostController,
    getAllPostsController,
    getPostsByCircleController,
    likePostController,
    unlikePostController,
    addCommentController,
    getCommentsByPostController
} from '../controllers/postController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPostController);
router.get('/', authMiddleware, getAllPostsController);
router.get('/circle/:circleId', authMiddleware, getPostsByCircleController);
router.post('/:postId/like', authMiddleware, likePostController);
router.post('/:postId/unlike', authMiddleware, unlikePostController);
router.post('/:postId/comments', authMiddleware, addCommentController);
router.get('/:postId/comments', authMiddleware, getCommentsByPostController);

export default router;
