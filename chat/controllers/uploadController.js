import { getLocalUploadUrl } from '../config/cloudinary.js';

const getUploadedUrl = (req, folder) => {
    if (req.file.path?.startsWith('http')) return req.file.path;
    return getLocalUploadUrl(req, folder);
};

export const uploadImageFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            file: {
                url: getUploadedUrl(req, 'images'),
                name: req.file.originalname,
                size: req.file.size,
                type: 'image'
            }
        });

    } catch (error) {
        console.error('uploadImage error:', error);
        return res.status(500).json({
            success: false,
            message: 'Image upload failed'
        });
    }
};

export const uploadRegularFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        const extension = req.file.originalname.split('.').pop().toLowerCase();

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                url: getUploadedUrl(req, 'files'),
                name: req.file.originalname,
                size: req.file.size,
                type: extension
            }
        });

    } catch (error) {
        console.error('uploadFile error:', error);
        return res.status(500).json({
            success: false,
            message: 'File upload failed'
        });
    }
};
