# Snap & Go Photobooth - Setup Guide

## Prerequisites

- Node.js 18+ or compatible package manager (pnpm, npm, yarn)
- Cloudinary account (free tier works fine)

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Cloudinary:**

   a. Create a free account at [Cloudinary](https://cloudinary.com/users/register/free)

   b. In your Cloudinary dashboard:
      - Navigate to Settings → Upload
      - Scroll to "Upload presets"
      - Click "Add upload preset"
      - Set "Signing Mode" to **Unsigned**
      - Set "Folder" to `photobooth` (optional but recommended)
      - Set "Max file size" to 10MB
      - Save the preset name

   c. Copy `.env.template` to `.env`:
      ```bash
      cp .env.template .env
      ```

   d. Edit `.env` with your credentials:
      ```
      VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
      VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
      ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

## Usage

### Kiosk Mode (Desktop/Laptop)
- Navigate to `http://localhost:5173/`
- Click "Start Photo Session"
- Allow camera permissions
- Follow countdown prompts
- Scan QR code to retrieve photos on mobile

### Photo Retrieval (Mobile)
- Scan the QR code displayed on kiosk
- Download or share your photo strip

## Features

- ✓ 3-photo countdown capture
- ✓ Automatic photo stitching with custom frame
- ✓ Cloud upload to Cloudinary
- ✓ QR code generation for easy retrieval
- ✓ Audio feedback (beeps & shutter sound)
- ✓ Auto-reset after 60 seconds
- ✓ 3 retry attempts for uploads

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted in browser
- Check if camera is being used by another application
- Try refreshing the page

### Upload failing
- Verify Cloudinary credentials in `.env`
- Check internet connection
- Ensure upload preset is set to "Unsigned"

### QR code not scanning
- Make sure you're using the latest version of your phone's camera app
- Try adjusting phone distance from screen
- Ensure good lighting

## Architecture

- **Frontend**: React Router 7 + Vite + TypeScript
- **State Management**: XState v5 (finite state machine)
- **Camera**: react-webcam
- **Image Processing**: HTML5 Canvas API
- **Storage**: Cloudinary (unsigned uploads)
- **Styling**: Tailwind CSS + shadcn/ui

## Privacy

- No personal information is stored
- Photos are uploaded to Cloudinary temporarily
- **Important**: Configure auto-deletion in Cloudinary dashboard for 24hr TTL
- No user accounts or authentication required

## Development

### Project Structure
```
app/
├── machines/          # XState state machines
│   └── boothMachine.ts
├── lib/              # Utilities
│   ├── canvas-stitcher.ts
│   ├── cloudinary-upload.ts
│   └── audio-utils.ts
├── components/
│   └── booth/        # Photobooth components
│       ├── BoothContainer.tsx
│       └── views/    # State-specific views
├── routes/           # React Router routes
│   ├── _index.tsx    # Kiosk experience
│   └── photo.$id.tsx # Photo retrieval
└── assets/           # Static assets

public/
└── assets/
    └── frame.svg     # Photobooth overlay frame
```

### State Machine Flow
1. `idle` → User clicks Start → `countdown`
2. `countdown` (3s) → `capture` → Take photo
3. Repeat 3x → `stitching` → Canvas processing
4. `uploading` → Cloudinary (with 3 retries)
5. `success` → Show QR code (60s auto-reset)
6. `failure` → Show error + retry option

## License

MIT
