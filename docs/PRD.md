# Product Requirement Document: "Snap & Go" Photobooth (MVP)

| **Project Name** | Snap & Go Web Photobooth                        |
| :--------------- | :---------------------------------------------- |
| **Version**      | 1.0 (MVP)                                       |
| **Status**       | Draft                                           |
| **Platform**     | Web Application (Mobile & Desktop/Tablet Kiosk) |

---

## 1. Executive Summary

To build a lightweight, browser-based photobooth experience that allows users to take a series of photos, applies a branded overlay, and provides an immediate download link via QR code. The system acts as a "guest" experience—no login, no emails, no persistent user profiles.

## 2. Core Constraints & Assumptions

- **Privacy First:** No Personally Identifiable Information (PII) like email, name, or phone numbers will be stored.
- **Web-Based:** Must run in a browser (Chrome/Safari) without native app installation.
- **Cloud Storage:** While we do not save _user_ data, we must temporarily store the _image file_ on a cloud provider (e.g., AWS S3, Cloudinary) to generate a download URL.
- **Connectivity:** The device (kiosk) must have an active internet connection to upload the final image for retrieval.

## 3. User Flows

### A. The "Kiosk" Experience (Tablet/Laptop)

1.  **Attract Screen:** Display a "Start" button.
2.  **Layout Selection (Fixed for MVP):** User sees the default 3-photo vertical strip layout.
3.  **Capture Phase:** 3-second countdown $\rightarrow$ Photo 1 $\rightarrow$ 3-second countdown $\rightarrow$ Photo 2 $\rightarrow$ etc.
4.  **Processing:** The app stitches photos into a single image with a branded frame.
5.  **Handoff:** A generic QR code appears on the screen.
6.  **Reset:** After 60 seconds of inactivity or a "Done" click, the screen resets.

### B. The "Retrieval" Experience (User Mobile)

1.  **Scan:** User scans the QR code from the Kiosk.
2.  **View:** User lands on a web page displaying _only_ their generated photo strip.
3.  **Download:** User long-presses to save or clicks a "Download Image" button.

---

## 4. Functional Requirements

### 4.1. Camera & Capture

| ID        | Requirement                                                            | Priority | Notes             |
| :-------- | :--------------------------------------------------------------------- | :------- | :---------------- |
| **FR-01** | App must request permissions to access the device webcam/front camera. | **P0**   |                   |
| **FR-02** | Live camera preview must be mirrored (like a mirror).                  | **P1**   | UX best practice. |
| **FR-03** | Visual Countdown timer (3, 2, 1) displayed before each shot.           | **P0**   |                   |
| **FR-04** | Flash animation (white screen flash) upon capture.                     | **P2**   | Visual feedback.  |

### 4.2. Image Processing

| ID        | Requirement                                                                                                                 | Priority | Notes                                    |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------- | :------- | :--------------------------------------- |
| **FR-05** | System automatically stitches captured images into a vertical strip (e.g., `1080x1920` or standard photobooth strip ratio). | **P0**   | Use HTML Canvas API.                     |
| **FR-06** | Apply a static PNG overlay (frame/branding) on top of the photos.                                                           | **P0**   | Frame file stored locally in app assets. |
| **FR-07** | Generate a unique ID (UUID) for the final image file.                                                                       | **P0**   | e.g., `photo-84291.jpg`                  |

### 4.3. Storage & Retrieval

| ID        | Requirement                                                                      | Priority | Notes                              |
| :-------- | :------------------------------------------------------------------------------- | :------- | :--------------------------------- |
| **FR-08** | Upload processed image to blob storage (S3/Firebase Storage).                    | **P0**   |                                    |
| **FR-09** | Generate a public, read-only URL for the image.                                  | **P0**   |                                    |
| **FR-10** | Generate a QR code on the Kiosk screen linked to the image URL.                  | **P0**   | Use a library like `qrcode.react`. |
| **FR-11** | Retrieval page must have a distinct "Download" button that forces file download. | **P1**   | Handle iOS/Android browser quirks. |

### 4.4. Data Cleanup (Privacy)

| ID        | Requirement                                                   | Priority | Notes                                             |
| :-------- | :------------------------------------------------------------ | :------- | :------------------------------------------------ |
| **FR-12** | Cloud function/Cron job to delete images older than 24 hours. | **P0**   | Ensures strict privacy and manages storage costs. |

---

## 5. Non-Functional Requirements (NFR)

- **Performance:** Image processing (stitching + overlay) should take less than 3 seconds on a standard iPad or mid-range laptop.
- **Reliability:** If the internet cuts out, the Kiosk should display an error message: _"Please check connection to generate QR code."_
- **Responsiveness:**
  - _Kiosk View:_ Optimized for Landscape (1024x768 and up).
  - _Retrieval View:_ Optimized for Mobile Portrait.

---

## 6. Technical Recommendations (Stack)

- **Frontend:** React.js or Vue.js (Fast component rendering).
- **Image Manipulation:** HTML5 Canvas API (Client-side processing to reduce server load).
- **Storage:** Firebase Storage or AWS S3.
- **Hosting:** Vercel or Netlify.
- **QR Generation:** `qrcode` (NPM package).

---

## 7. Future Roadmap & Notes

_These features are explicitly **out of scope** for the MVP but recorded here for Phase 2 considerations._

### Feature Improvements

1.  **Physical Printing:** Integration with WebUSB or PrintNode to send photos to a locally connected photo printer.
2.  **Filters:** Allow users to toggle CSS filters (B&W, Sepia, High Contrast) before confirming the photo.
3.  **Retake Logic:** Allow users to "Retake" a specific photo in the sequence before generating the final strip.
4.  **Boomerang Mode:** Capture a short burst of images and compile them into a GIF.
5.  **Multi-Layout:** Offer square cuts, 2x2 grids, or single portrait modes.

### Technical Improvements

1.  **Offline Mode:** Cache photos locally (IndexedDB) if the internet fails, and bulk upload them when the connection is restored (generating a generic link that becomes active later).
2.  **Admin Dashboard:** A hidden page to view analytics (e.g., "Total Sessions Today") without viewing the actual user photos.
