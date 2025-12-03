/**
 * Frame configuration system for photobooth
 * Defines frame templates with photo slot coordinates
 */

export interface PhotoSlot {
  x: number; // Top-left X coordinate
  y: number; // Top-left Y coordinate
  width: number; // Slot width
  height: number; // Slot height
}

export interface FrameConfig {
  id: string; // Unique identifier
  name: string; // Display name
  path: string; // Asset path
  width: number; // Frame width
  height: number; // Frame height
  orientation: 'vertical' | 'horizontal';
  photoSlots: [PhotoSlot, PhotoSlot, PhotoSlot]; // Exactly 3 slots
  isDefault?: boolean; // Default selection flag
}

export type FrameOrientation = 'vertical' | 'horizontal';

/**
 * Frame configurations
 * NOTE: Photo slot coordinates are estimated and need verification
 * TODO: Measure exact coordinates using image editor or measurement tool
 */
export const FRAME_CONFIGS: Record<string, FrameConfig> = {
  'classic-vertical': {
    id: 'classic-vertical',
    name: 'Classic',
    path: '/assets/frame-classic-vertical.png',
    width: 514,
    height: 1170,
    orientation: 'vertical',
    isDefault: true,
    photoSlots: [
      // Measured coordinates accounting for brown frame borders
      // Border margins: ~25px sides, ~20px top/bottom of each slot
      { x: 50, y: 46, width: 418, height: 304 },
      { x: 50, y: 384, width: 418, height: 304 },
      { x: 50, y: 723, width: 418, height: 304 },
    ],
  },
  'bright-bold-vertical': {
    id: 'bright-bold-vertical',
    name: 'Bright & Bold',
    path: '/assets/frame-bright-and-bold-vertical.png',
    width: 688,
    height: 1506,
    orientation: 'vertical',
    photoSlots: [
      // Measured coordinates accounting for decorative borders and oval shapes
      // Border margins: ~60px sides, ~40px top/bottom, plus bottom text area
      { x: 94, y: 110, width: 568, height: 370 },
      { x: 94, y: 528, width: 568, height: 370 },
      { x: 94, y: 935, width: 568, height: 370 },
    ],
  },
  'elegant-horizontal': {
    id: 'elegant-horizontal',
    name: 'Elegant',
    path: '/assets/frame-elegant-horizontal.png',
    width: 2758,
    height: 988,
    orientation: 'horizontal',
    photoSlots: [
      { x: 135, y: 130, width: 805, height: 526 },
      { x: 978, y: 129, width: 802, height: 528 },
      { x: 1811, y: 127, width: 805, height: 525 },
    ],
  },
  'modern-horizontal': {
    id: 'modern-horizontal',
    name: 'Modern',
    path: '/assets/frame-modern-horizontal.png',
    width: 2494,
    height: 786,
    orientation: 'horizontal',
    photoSlots: [
      { x: 76, y: 152, width: 705, height: 535 },
      { x: 828, y: 144, width: 701, height: 548 },
      { x: 1585, y: 140, width: 693, height: 546 },
    ],
  },
};

/**
 * Get the default frame configuration
 */
export function getDefaultFrame(): FrameConfig {
  return (
    Object.values(FRAME_CONFIGS).find((f) => f.isDefault) ||
    FRAME_CONFIGS['classic-vertical']
  );
}

/**
 * Get frame configuration by ID
 */
export function getFrameById(id: string): FrameConfig | undefined {
  return FRAME_CONFIGS[id];
}

/**
 * Get all frames filtered by orientation
 */
export function getFramesByOrientation(
  orientation: FrameOrientation,
): FrameConfig[] {
  return Object.values(FRAME_CONFIGS).filter(
    (f) => f.orientation === orientation,
  );
}

/**
 * Get all available frames
 */
export function getAllFrames(): FrameConfig[] {
  return Object.values(FRAME_CONFIGS);
}
