import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// ─── Configure Cloudinary ──────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Emoji Storage ─────────────────────────────────────────────
const emojiStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/emojis',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 100, height: 100, crop: 'fill' }]
    }
});

// ─── Image Storage ─────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    }
});

// ─── File Storage ──────────────────────────────────────────────
const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/files',
        allowed_formats: ['pdf', 'zip', 'doc', 'docx', 'txt', 'xlsx'],
        resource_type: 'raw'
    }
});

// ─── Multer instances ──────────────────────────────────────────
export const uploadEmoji = multer({
    storage: emojiStorage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

export const uploadFile = multer({
    storage: fileStorage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

export default cloudinary;