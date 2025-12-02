/**
 * Cloudinary unsigned upload utility
 */

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  asset_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a blob to Cloudinary using unsigned upload
 * @param blob The image blob to upload
 * @param cloudName Cloudinary cloud name
 * @param uploadPreset Unsigned upload preset name
 * @returns Promise<UploadResult> with URL and public_id
 */
export async function uploadToCloudinary(
  blob: Blob,
  cloudName: string,
  uploadPreset: string
): Promise<UploadResult> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary cloud name and upload preset are required');
  }

  const formData = new FormData();
  formData.append('file', blob, 'photobooth-strip.jpg');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'photobooth');

  // Add timestamp to filename for uniqueness
  formData.append('public_id', `strip_${Date.now()}`);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `Upload failed with status ${response.status}`
      );
    }

    const data: CloudinaryResponse = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out after 30 seconds');
      }
      throw error;
    }

    throw new Error('Upload failed with unknown error');
  }
}
