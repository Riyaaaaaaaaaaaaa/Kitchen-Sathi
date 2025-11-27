import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'));
      return;
    }
    cb(null, true);
  }
});

/**
 * Upload image to Cloudinary
 * @param file - The file buffer from multer
 * @param folder - Cloudinary folder name
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string = 'kitchensathi/recipes'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' }, // Limit max dimensions
          { quality: 'auto:good' }, // Auto quality optimization
          { fetch_format: 'auto' } // Auto format (WebP when supported)
        ]
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error);
          reject(error);
        } else if (result) {
          console.log('[Cloudinary] Upload success:', result.public_id);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(file.buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param publicId - The Cloudinary public ID
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('[Cloudinary] Delete result:', result);
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw error;
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

console.log('[Cloudinary] Configured:', isCloudinaryConfigured());

