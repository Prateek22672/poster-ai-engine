import { v2 as cloudinary } from 'cloudinary';

// Configure once at import time
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload a base64 data URL to Cloudinary
 */
export async function uploadPosterToCloudinary(
  base64DataUrl: string,
  folder = 'poster-ai'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    folder,
    resource_type: 'image',
    format: 'png',
    quality: 95,
    transformation: [{ fetch_format: 'auto', quality: 'auto' }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * Upload a reference image (buffer/base64) for style analysis
 */
export async function uploadReferenceImage(
  base64DataUrl: string
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    folder: 'poster-ai/references',
    resource_type: 'image',
    transformation: [
      { width: 1080, crop: 'limit' }, // normalize size for analysis
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * Delete a poster from Cloudinary
 */
export async function deletePosterFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
