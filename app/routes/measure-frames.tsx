/**
 * Frame measurement tool page
 * Navigate to /measure-frames to measure photo slot coordinates
 */

import { useState } from 'react';
import { getAllFrames, type FrameConfig } from '~/lib/frame-config';
import { measureFrameSlots } from '~/utils/measure-frame-slots';

export default function MeasureFrames() {
  const frames = getAllFrames();
  const [selectedFrame, setSelectedFrame] = useState<FrameConfig | null>(null);

  const handleMeasure = (frame: FrameConfig) => {
    setSelectedFrame(frame);
    measureFrameSlots(frame.path);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Frame Slot Measurement Tool</h1>

      <div style={{ marginTop: '2rem' }}>
        <h2>Instructions:</h2>
        <ol>
          <li>Click a frame below to load it</li>
          <li>Click 6 times to mark photo slots (top-left, bottom-right for each of 3 slots)</li>
          <li>Coordinates will be logged to console</li>
          <li>Copy coordinates and update frame-config.ts</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Frames:</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '800px' }}>
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => handleMeasure(frame)}
              style={{
                padding: '1rem',
                border: '2px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedFrame?.id === frame.id ? '#e0e0e0' : '#fff',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{frame.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {frame.width}×{frame.height} ({frame.orientation})
              </div>
              <img
                src={frame.path}
                alt={frame.name}
                style={{ width: '100%', marginTop: '0.5rem', border: '1px solid #ddd' }}
              />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Console Output Instructions:</h3>
        <p>After clicking 6 times, check the browser console for output like:</p>
        <pre style={{ background: '#333', color: '#0f0', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
{`photoSlots: [
  { x: 25, y: 20, width: 464, height: 343 }, // Slot 1
  { x: 25, y: 403, width: 464, height: 343 }, // Slot 2
  { x: 25, y: 786, width: 464, height: 344 }, // Slot 3
],`}
        </pre>
      </div>
    </div>
  );
}
