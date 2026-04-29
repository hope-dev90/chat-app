import express from 'express';
import {
    uploadImageFile,
    uploadRegularFile
} from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadImage, uploadFile } from '../config/cloudinary.js';

const router = express.Router();

// Upload image (photos in chat)
router.post('/image', authMiddleware, uploadImage.single('image'), uploadImageFile);

// Upload file (pdf, zip, doc etc)
router.post('/file', authMiddleware, uploadFile.single('file'), uploadRegularFile);

export default router;