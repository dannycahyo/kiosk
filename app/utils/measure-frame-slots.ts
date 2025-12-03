/**
 * Browser console tool for measuring PNG frame photo slots
 *
 * Usage:
 * 1. Open browser console in dev environment
 * 2. Import and run: measureFrameSlots('/assets/frame-classic-vertical.png')
 * 3. Click to mark top-left and bottom-right corners of each photo slot
 * 4. After 6 clicks (2 corners × 3 slots), coordinates are logged to console
 * 5. Copy output to frame-config.ts
 */

export function measureFrameSlots(imagePath: string): void {
  const img = new Image();

  img.onerror = () => {
    // Ignore error
  };

  img.onload = () => {

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
    `;

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      color: white;
      font-family: monospace;
      font-size: 14px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      max-width: 600px;
    `;
    instructions.innerHTML = `
      <strong>Frame Slot Measurement Tool</strong><br/>
      Click 6 times to mark 3 photo slots (top-left, bottom-right for each slot)<br/>
      <span id="click-counter">Clicks: 0/6</span>
    `;

    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      max-width: 90vw;
      max-height: 80vh;
      overflow: auto;
      background: #fff;
      padding: 8px;
      border-radius: 4px;
    `;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.cursor = 'crosshair';
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const markers: Array<{ x: number; y: number }> = [];
    let currentSlot = 0;

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      markers.push({ x, y });

      // Draw marker
      ctx.fillStyle = markers.length % 2 === 1 ? '#00FF00' : '#FF0000';
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.font = 'bold 16px monospace';
      const text = `${markers.length}: (${x}, ${y})`;
      ctx.strokeText(text, x + 10, y);
      ctx.fillText(text, x + 10, y);

      // Draw connecting line for slot pairs
      if (markers.length % 2 === 0) {
        const prevMarker = markers[markers.length - 2];
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          prevMarker.x,
          prevMarker.y,
          x - prevMarker.x,
          y - prevMarker.y
        );
      }

      // Update counter
      const counter = document.getElementById('click-counter');
      if (counter) {
        counter.textContent = `Clicks: ${markers.length}/6 (Slot ${Math.floor(markers.length / 2) + 1})`;
      }

      // After 6 clicks, output results
      if (markers.length === 6) {

        // Cleanup after short delay
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 2000);
      }
    });

    canvasContainer.appendChild(canvas);
    overlay.appendChild(instructions);
    overlay.appendChild(canvasContainer);
    document.body.appendChild(overlay);
  };

  img.src = imagePath;
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).measureFrameSlots = measureFrameSlots;
}
