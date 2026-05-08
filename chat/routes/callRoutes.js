import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createRoom } from '../controllers/callController.js';

const router = express.Router();

// POST /calls/create-room — creates a Daily.co room and returns the URL
router.post('/create-room', authMiddleware, createRoom);

export default router;
