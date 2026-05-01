import express from 'express';
import {
    createCustomEmoji,
    getCustomEmojis,
    deleteCustomEmoji
} from '../controllers/emojiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadEmoji } from '../config/cloudinary.js';

const router = express.Router();

const uploadSingle = (upload, fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        console.error('Emoji upload middleware error:', error);

        const isSizeError = error.code === 'LIMIT_FILE_SIZE';
        const isValidationError = error.message?.startsWith('Only ');

        res.status(isSizeError || isValidationError ? 400 : 500).json({
            success: false,
            message: isSizeError
                ? 'The selected image is too large'
                : error.message || 'Emoji upload failed'
        });
    });
};

// Get all custom emojis (any logged in user)
router.get('/all', authMiddleware, getCustomEmojis);

// Create custom emoji (any logged in user)
router.post('/create', authMiddleware, uploadSingle(uploadEmoji, 'image'), createCustomEmoji);

// Delete custom emoji (only creator)
router.delete('/:id', authMiddleware, deleteCustomEmoji);

export default router;
