// Generate placeholder audio files using Web Audio API

export function generateBeepSound(): string {
  // Generate a 440Hz beep sound (0.2s duration) as a data URL
  // This is a simple sine wave
  const sampleRate = 44100;
  const duration = 0.2; // 200ms
  const frequency = 440; // A4 note
  const samples = sampleRate * duration;

  // Create WAV file header
  const dataSize = samples * 2; // 16-bit samples
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, 1, true); // num channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate audio data
  const data = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.max(0, 1 - (i / samples)); // Simple fade-out
    data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * envelope * 32767;
  }

  // Combine header and data
  const wav = new Uint8Array(44 + dataSize);
  wav.set(new Uint8Array(header), 0);
  wav.set(new Uint8Array(data.buffer), 44);

  // Convert to base64
  const base64 = btoa(String.fromCharCode(...wav));
  return `data:audio/wav;base64,${base64}`;
}

export function generateShutterSound(): string {
  // Generate a camera shutter click sound (0.3s duration)
  // This simulates a percussive click with quick decay
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = sampleRate * duration;

  // Create WAV file header (same as above)
  const dataSize = samples * 2;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate click sound (mix of frequencies with fast decay)
  const data = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 20); // Exponential decay
    const noise = (Math.random() * 2 - 1) * 0.1; // White noise
    const click = Math.sin(2 * Math.PI * 800 * t) * 0.2 +
                  Math.sin(2 * Math.PI * 1200 * t) * 0.15 +
                  noise;
    data[i] = click * envelope * 32767;
  }

  const wav = new Uint8Array(44 + dataSize);
  wav.set(new Uint8Array(header), 0);
  wav.set(new Uint8Array(data.buffer), 44);

  const base64 = btoa(String.fromCharCode(...wav));
  return `data:audio/wav;base64,${base64}`;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
