/**
 * Canvas stitcher utility for combining 3 photos into a vertical strip
 * with an overlay frame
 */

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const PHOTO_HEIGHT = 640; // Each photo slot height (1920 / 3 = 640)

/**
 * Load an image from a data URL or regular URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
    img.src = src;
  });
}

/**
 * Stitch 3 photos into a vertical strip with frame overlay
 * @param images Array of 3 base64 data URLs
 * @param frameUrl URL to the frame overlay image
 * @returns Promise<Blob> JPEG blob of the final stitched image
 */
export async function stitchPhotos(images: string[], frameUrl: string): Promise<Blob> {
  if (images.length !== 3) {
    throw new Error(`Expected 3 images, got ${images.length}`);
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  try {
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Load all images in parallel
    const loadedImages = await Promise.all(images.map(loadImage));

    // Draw each photo
    for (let i = 0; i < 3; i++) {
      const img = loadedImages[i];
      const yOffset = i * PHOTO_HEIGHT;

      // Calculate crop/scale to maintain aspect ratio
      const targetAspect = OUTPUT_WIDTH / PHOTO_HEIGHT;
      const sourceAspect = img.width / img.height;

      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;

      if (sourceAspect > targetAspect) {
        // Image wider than target - crop width (center crop)
        sWidth = img.height * targetAspect;
        sx = (img.width - sWidth) / 2;
      } else {
        // Image taller than target - crop height (center crop)
        sHeight = img.width / targetAspect;
        sy = (img.height - sHeight) / 2;
      }

      // Draw cropped/scaled image
      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight, // source crop
        0,
        yOffset,
        OUTPUT_WIDTH,
        PHOTO_HEIGHT // destination
      );
    }

    // Load and draw frame overlay
    const frame = await loadImage(frameUrl);
    ctx.drawImage(frame, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

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
        0.9 // Quality 90%
      );
    });
  } finally {
    // Cleanup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  }
}
