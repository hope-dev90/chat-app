import {
    createEmoji,
    getAllEmojis,
    getEmojiByName,
    deleteEmoji
} from '../models/emojiModel.js';
import cloudinary from '../config/cloudinary.js';

// ─── Create custom emoji ───────────────────────────────────────
export const createCustomEmoji = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    try {
        // Validate fields
        if (!name || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Emoji name and image are required'
            });
        }

        // Validate name (no spaces, lowercase)
        const cleanName = name.toLowerCase().trim().replace(/\s+/g, '_');
        if (!/^[a-z0-9_]+$/.test(cleanName)) {
            return res.status(400).json({
                success: false,
                message: 'Emoji name can only contain letters, numbers and underscores'
            });
        }

        // Check if name already exists
        const existing = await getEmojiByName(cleanName);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Emoji name :${cleanName}: already exists`
            });
        }

        // Save to DB (image already uploaded to cloudinary by multer)
        const emoji = await createEmoji({
            name: cleanName,
            imageUrl: req.file.path,
            createdBy: userId
        });

        return res.status(201).json({
            success: true,
            message: `Custom emoji :${cleanName}: created successfully!`,
            emoji
        });

    } catch (error) {
        console.error('createCustomEmoji error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Get all custom emojis ─────────────────────────────────────
export const getCustomEmojis = async (req, res) => {
    try {
        const emojis = await getAllEmojis();

        return res.status(200).json({
            success: true,
            count: emojis.length,
            emojis
        });

    } catch (error) {
        console.error('getCustomEmojis error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Delete custom emoji ───────────────────────────────────────
export const deleteCustomEmoji = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const emoji = await deleteEmoji(id, userId);

        if (!emoji) {
            return res.status(404).json({
                success: false,
                message: 'Emoji not found or you are not the creator'
            });
        }

        // Delete from cloudinary too
        const publicId = emoji.image_url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`chat_app/emojis/${publicId}`);

        return res.status(200).json({
            success: true,
            message: `Emoji :${emoji.name}: deleted successfully`
        });

    } catch (error) {
        console.error('deleteCustomEmoji error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};