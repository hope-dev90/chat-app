import express from 'express';
import {
    uploadImageFile,
    uploadRegularFile,
    uploadAudioFile
} from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadImage, uploadFile, uploadAudio } from '../config/cloudinary.js';

const router = express.Router();

const uploadSingle = (upload, fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        console.error('Upload middleware error:', error);

        const isSizeError = error.code === 'LIMIT_FILE_SIZE';
        const isValidationError = error.message?.startsWith('Only ');

        res.status(isSizeError || isValidationError ? 400 : 500).json({
            success: false,
            message: isSizeError
                ? 'The selected file is too large'
                : error.message || 'Upload failed'
        });
    });
};

// Upload image (photos in chat)
router.post('/image', authMiddleware, uploadSingle(uploadImage, 'image'), uploadImageFile);

// Upload file (pdf, zip, doc etc)
router.post('/file', authMiddleware, uploadSingle(uploadFile, 'file'), uploadRegularFile);

// Upload audio (voice notes)
router.post('/audio', authMiddleware, uploadSingle(uploadAudio, 'audio'), uploadAudioFile);

export default router;
