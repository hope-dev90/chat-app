import express from 'express';
import {
    createCustomEmoji,
    getCustomEmojis,
    deleteCustomEmoji
} from '../controllers/emojiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadEmoji } from '../config/cloudinary.js';

const router = express.Router();

// Get all custom emojis (any logged in user)
router.get('/all', authMiddleware, getCustomEmojis);

// Create custom emoji (any logged in user)
router.post('/create', authMiddleware, uploadEmoji.single('image'), createCustomEmoji);

// Delete custom emoji (only creator)
router.delete('/:id', authMiddleware, deleteCustomEmoji);

export default router;