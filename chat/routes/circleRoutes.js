import express from 'express';
import {
    createCircleController,
    getAllCirclesController,
    getCircleByIdController,
    joinCircleController,
    leaveCircleController,
    getCircleMembersController,
    getUserCirclesController
} from '../controllers/circleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createCircleController);
router.get('/', authMiddleware, getAllCirclesController);
router.get('/my', authMiddleware, getUserCirclesController);
router.get('/:circleId', authMiddleware, getCircleByIdController);
router.post('/:circleId/join', authMiddleware, joinCircleController);
router.post('/:circleId/leave', authMiddleware, leaveCircleController);
router.get('/:circleId/members', authMiddleware, getCircleMembersController);

export default router;
