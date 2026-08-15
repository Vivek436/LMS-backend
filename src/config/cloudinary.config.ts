import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on file type
        const isVideo = file.mimetype.startsWith('video/');
        const isImage = file.mimetype.startsWith('image/');

        let folder = 'lms/documents';
        let resourceType: 'auto' | 'video' | 'image' | 'raw' = 'auto';

        if (isVideo) {
            folder = 'lms/videos';
            resourceType = 'video';
        } else if (isImage) {
            folder = 'lms/images';
            resourceType = 'image';
        } else {
            folder = 'lms/documents';
            resourceType = 'raw';
        }

        return {
            folder: folder,
            resource_type: resourceType,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mov', 'avi', 'webm'],
            // For videos, enable transformation
            transformation: isVideo ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
        };
    },
});

export { cloudinary };
