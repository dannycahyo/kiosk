/**
 * Canvas stitcher utility for combining 3 photos into a photo strip
 * with frame template that has transparent photo slots
 */

import type { FrameConfig, PhotoSlot } from './frame-config';

/**
 * Load an image from a data URL or regular URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
    img.src = src;
  });
}

/**
 * Calculate crop coordinates to fit source image into target dimensions
 * while maintaining aspect ratio (center crop)
 */
interface CropResult {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

function calculateCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): CropResult {
  const targetAspect = targetWidth / targetHeight;
  const sourceAspect = sourceWidth / sourceHeight;

  let sx = 0,
    sy = 0,
    sWidth = sourceWidth,
    sHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    // Image wider than target - crop width (center crop)
    sWidth = sourceHeight * targetAspect;
    sx = (sourceWidth - sWidth) / 2;
  } else {
    // Image taller than target - crop height (center crop)
    sHeight = sourceWidth / targetAspect;
    sy = (sourceHeight - sHeight) / 2;
  }

  return { sx, sy, sWidth, sHeight };
}

/**
 * Stitch 3 photos into a photo strip using frame template
 * @param images Array of 3 base64 data URLs
 * @param frameConfig Frame configuration with dimensions and photo slots
 * @returns Promise<Blob> JPEG blob of the final stitched image
 */
export async function stitchPhotos(
  images: string[],
  frameConfig: FrameConfig
): Promise<Blob> {
  console.log('🖼️ STITCHER START');
  console.log('  Images received:', images.length);
  console.log('  Images valid?:', images.every(img => img.startsWith('data:image/')));
  console.log('  Frame config:', frameConfig.id, frameConfig.width, 'x', frameConfig.height);

  if (images.length !== 3) {
    throw new Error(`Expected 3 images, got ${images.length}`);
  }

  // Create canvas with frame dimensions
  const canvas = document.createElement('canvas');
  canvas.width = frameConfig.width;
  canvas.height = frameConfig.height;
  console.log('  Canvas created:', canvas.width, 'x', canvas.height);

  const ctx = canvas.getContext('2d', { alpha: true }); // Enable alpha for transparency
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  try {
    // Load all images in parallel
    console.log('  Loading frame and photos...');
    const [frameImage, ...photoImages] = await Promise.all([
      loadImage(frameConfig.path),
      ...images.map(loadImage),
    ]);
    console.log('  Frame loaded:', frameImage.width, 'x', frameImage.height);
    console.log('  Photos loaded:', photoImages.map(p => `${p.width}x${p.height}`));

    // STEP 1: Draw frame as background
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(frameImage, 0, 0, frameConfig.width, frameConfig.height);
    console.log('  ✓ Frame drawn as background');

    // STEP 2: Draw photos ON TOP of frame at slot positions
    // Photos will completely override/cover the frame at slot areas
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < 3; i++) {
      const photo = photoImages[i];
      const slot = frameConfig.photoSlots[i];

      console.log(`  Drawing photo ${i + 1} on top:`, {
        photoSize: `${photo.width}x${photo.height}`,
        slot: `x:${slot.x} y:${slot.y} w:${slot.width} h:${slot.height}`
      });

      // Calculate crop to fit slot while maintaining aspect ratio
      const { sx, sy, sWidth, sHeight } = calculateCrop(
        photo.width,
        photo.height,
        slot.width,
        slot.height
      );

      // Draw photo on top of frame
      ctx.drawImage(
        photo,
        sx,
        sy,
        sWidth,
        sHeight, // Source crop
        slot.x,
        slot.y,
        slot.width,
        slot.height // Destination slot
      );
      console.log(`  ✓ Photo ${i + 1} drawn on top`);
    }

    console.log('  Converting to blob...');
    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        'image/jpeg',
        0.92 // Quality 92% (slightly higher for larger frames)
      );
    });
  } finally {
    // Cleanup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  }
}
