# Technical Requirement Document (TRD): "Snap & Go" Photobooth (v1.2)

| **Project Name**     | Snap & Go Web Photobooth              |
| :------------------- | :------------------------------------ |
| **Tech Stack**       | React (Vite), Tailwind CSS, Shadcn UI |
| **State Management** | **XState** (Finite State Machine)     |
| **Storage**          | Cloudinary (Unsigned Uploads)         |
| **Infrastructure**   | Vercel (Frontend Hosting)             |

---

## 1\. High-Level Architecture

The application logic is driven entirely by a state machine. The React view layer is simply a "renderer" of the current machine state. This ensures that the UI can never be out of sync with the logic (e.g., the "Capture" button cannot exist during the "Uploading" phase).

---

## 2\. Core Technology Stack

### A. Frontend Framework & UI

- **Build Tool:** Vite (React + TypeScript).
- **Routing:** `react-router-dom` (v6).
- **UI Library:** `shadcn/ui` (Components: Button, Card, Progress, Dialog).
- **Styling:** `tailwindcss`.

### B. State Management (NEW)

- **Library:** `xstate` (v5) and `@xstate/react`.
- **Purpose:** To manage the strict flow of the photobooth session.
- **Visualization:** We can use the [Stately.ai](https://stately.ai) inspector during development to debug the flow.

### C. Camera & Capture

- **Webcam:** `react-webcam` (Mirrored, 720p/1080p).
- **Audio:** Native `Audio()` API for shutter sounds and countdown beeps.

### D. Image Processing & Storage

- **Processing:** Native HTML5 Canvas API (Offscreen stitching).
- **Storage:** Cloudinary (Unsigned Uploads via `fetch`).
- **QR Code:** `qrcode.react`.

---

## 3\. Detailed Component Spec

### 3.1. Directory Structure

```bash
/src
  /assets
    frame.png
    shutter.mp3
  /machines
    boothMachine.ts    # The XState machine definition
  /components
    BoothContainer.tsx # The main component consuming the machine
    /views
      IdleView.tsx
      CountdownView.tsx
      CaptureView.tsx
      ReviewView.tsx   # (Optional) quick preview between shots
      ProcessingView.tsx
      ResultView.tsx
  /lib
    canvas-stitcher.ts
    cloudinary-upload.ts
```

### 3.2. The XState Machine Definition (`boothMachine.ts`)

The machine will have the following structure.

**Context (Extended State):**

```typescript
interface BoothContext {
  images: string[]; // Array of base64 captured photos
  finalStripUrl: string; // The local blob URL of the stitched strip
  uploadUrl: string; // The remote Cloudinary URL
  error: string | null;
}
```

**States & Transitions:**

1.  **`idle`**
    - _On Event:_ `START` $\rightarrow$ Transition to `countdown`.
    - _Action:_ Reset context (clear previous images).
2.  **`countdown`**
    - _Invoke:_ 3-second timer service.
    - _On Event:_ `TICK` $\rightarrow$ Update UI counter.
    - _On Done:_ $\rightarrow$ Transition to `capture`.
3.  **`capture`**
    - _Entry:_ Trigger shutter sound.
    - _Invoke:_ Capture promise (getScreenshot).
    - _On Done:_ Add image to context.
      - _Guard:_ If `images.length < 3` $\rightarrow$ Transition back to `countdown`.
      - _Guard:_ If `images.length === 3` $\rightarrow$ Transition to `stitching`.
4.  **`stitching`**
    - _Invoke:_ `stitchPhotos(ctx.images)` promise.
    - _On Done:_ Save `finalStripUrl` to context $\rightarrow$ Transition to `uploading`.
    - _On Error:_ $\rightarrow$ `failure`.
5.  **`uploading`**
    - _Invoke:_ `uploadToCloudinary` promise.
    - _On Done:_ Save `uploadUrl` to context $\rightarrow$ Transition to `success`.
    - _On Error:_ $\rightarrow$ `failure` (or retry logic).
6.  **`success`**
    - _UI:_ Show QR Code.
    - _After:_ 60s timeout $\rightarrow$ Transition to `idle`.
    - _On Event:_ `RESET` $\rightarrow$ Transition to `idle`.
7.  **`failure`**
    - _UI:_ Show error message + "Try Again" button.
    - _On Event:_ `RETRY` $\rightarrow$ `idle`.
