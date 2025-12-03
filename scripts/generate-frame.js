// Generate a placeholder frame.png (1080x1920) with white border and branding areas
// This will create an SVG that can be converted to PNG

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Transparent background -->
  <rect width="1080" height="1920" fill="none"/>

  <!-- White border (20px) -->
  <rect x="0" y="0" width="1080" height="20" fill="white"/>
  <rect x="0" y="1900" width="1080" height="20" fill="white"/>
  <rect x="0" y="0" width="20" height="1920" fill="white"/>
  <rect x="1060" y="0" width="20" height="1920" fill="white"/>

  <!-- Top branding area (80px height) -->
  <rect x="20" y="20" width="1040" height="80" fill="white" fill-opacity="0.95"/>
  <text x="540" y="70" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#333">
    SNAP & GO PHOTOBOOTH
  </text>

  <!-- Bottom branding area (80px height) -->
  <rect x="20" y="1820" width="1040" height="80" fill="white" fill-opacity="0.95"/>
  <text x="540" y="1870" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666">
    www.snapandgo.com • #SnapAndGo
  </text>
</svg>`;

const outputPath = path.join(__dirname, '../public/assets/frame.svg');
fs.writeFileSync(outputPath, svgContent);
