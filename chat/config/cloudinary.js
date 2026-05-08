import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const useCloudinary = process.env.CLOUDINARY_ENABLED === 'true';
const uploadRoot = path.join(process.cwd(), 'uploads');

const ensureDir = (dir) => {
    fs.mkdirSync(dir, { recursive: true });
};

const localStorage = (folder) => {
    const destination = path.join(uploadRoot, folder);
    ensureDir(destination);

    return multer.diskStorage({
        destination,
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.originalname, extension)
                .toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'upload';

            cb(null, `${Date.now()}-${baseName}${extension}`);
        }
    });
};

const fileFilter = (allowedExtensions) => (req, file, cb) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`));
        return;
    }

    cb(null, true);
};

export const getLocalUploadUrl = (req, folder) => {
    if (!req.file?.filename) return null;
    return `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
};

const emojiStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/emojis',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 100, height: 100, crop: 'fill' }]
    }
});

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
});

const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/files',
        allowed_formats: ['pdf', 'zip', 'doc', 'docx', 'txt', 'xlsx'],
        resource_type: 'raw'
    }
});

// Audio storage for voice notes
const audioStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chat_app/audio',
        allowed_formats: ['webm', 'mp3', 'ogg', 'wav', 'm4a'],
        resource_type: 'video' // Cloudinary uses 'video' resource type for audio
    }
});

export const uploadAudio = multer({
    storage: useCloudinary ? audioStorage : localStorage('audio'),
    // Accept any audio MIME type — don't filter by extension since blobs may vary
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).slice(1).toLowerCase();
        const mime = file.mimetype?.toLowerCase() || '';
        const allowed = ['webm', 'mp3', 'ogg', 'wav', 'm4a', 'opus'];
        if (allowed.includes(ext) || mime.startsWith('audio/') || mime.includes('webm')) {
            cb(null, true);
        } else {
            cb(new Error(`Only audio files are allowed (got ${ext || mime})`));
        }
    },
    limits: { fileSize: 20 * 1024 * 1024 }
});

export const uploadEmoji = multer({
    storage: useCloudinary ? emojiStorage : localStorage('emojis'),
    fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'gif', 'webp']),
    limits: { fileSize: 2 * 1024 * 1024 }
});

export const uploadImage = multer({
    storage: useCloudinary ? imageStorage : localStorage('images'),
    fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'gif', 'webp']),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadFile = multer({
    storage: useCloudinary ? fileStorage : localStorage('files'),
    fileFilter: fileFilter(['pdf', 'zip', 'doc', 'docx', 'txt', 'xlsx']),
    limits: { fileSize: 20 * 1024 * 1024 }
});

export default cloudinary;
