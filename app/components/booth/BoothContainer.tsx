import { useEffect, useRef, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import Webcam from 'react-webcam';
import { fromPromise } from 'xstate';
import { match } from 'ts-pattern';
import { boothMachine } from '~/machines/boothMachine';
import { stitchPhotos } from '~/lib/canvas-stitcher';
import { uploadToCloudinary } from '~/lib/cloudinary-upload';
import { generateBeepSound, generateShutterSound } from '~/lib/audio-utils';
import type { FrameConfig } from '~/lib/frame-config';
import { IdleView } from './views/IdleView';
import { CountdownView } from './views/CountdownView';
import { CaptureView } from './views/CaptureView';
import { ProcessingView } from './views/ProcessingView';
import { SuccessView } from './views/SuccessView';
import { FailureView } from './views/FailureView';

export function BoothContainer() {
  const webcamRef = useRef<Webcam | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const shutterAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webcamReadyRef = useRef(false);

  // Initialize state machine with service implementations
  const [state, send] = useMachine(
    boothMachine.provide({
      actors: {
        stitchPhotos: fromPromise(async ({ input }) => {
          const { images, frameConfig } = input as {
            images: string[];
            frameConfig: FrameConfig;
          };
          return await stitchPhotos(images, frameConfig);
        }),
        uploadToCloudinary: fromPromise(async ({ input }) => {
          const { blob, cloudName, uploadPreset } = input as {
            blob: Blob;
            cloudName: string;
            uploadPreset: string;
          };
          return await uploadToCloudinary(blob, cloudName, uploadPreset);
        }),
      },
    })
  );

  // Handle webcam ready
  const handleWebcamReady = useCallback(() => {
    webcamReadyRef.current = true;
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    try {
      const beepDataUrl = generateBeepSound();
      const shutterDataUrl = generateShutterSound();

      beepAudioRef.current = new Audio(beepDataUrl);
      shutterAudioRef.current = new Audio(shutterDataUrl);

      // Preload
      beepAudioRef.current.load();
      shutterAudioRef.current.load();
    } catch (error) {
      // Ignore error
    }

    return () => {
      beepAudioRef.current = null;
      shutterAudioRef.current = null;
    };
  }, []);

  // Reset webcam ready flag on state transitions
  useEffect(() => {
    // Reset webcam ready when entering countdown (new webcam instance)
    if (state.matches('countdown')) {
      webcamReadyRef.current = false;
    }
  }, [state.value]);

  // Handle countdown ticks and audio
  useEffect(() => {
    if (state.matches('countdown')) {
      // Play beep sound
      beepAudioRef.current?.play().catch(() => {});

      // Start countdown tick interval
      let tickCount = 0;
      countdownIntervalRef.current = setInterval(() => {
        tickCount++;
        if (tickCount < 3) {
          send({ type: 'COUNTDOWN_TICK' });
          beepAudioRef.current?.play().catch(() => {});
        }
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [state.value, send]);

  // Capture photo callback
  const capturePhoto = useCallback(() => {
    try {
      if (!webcamRef.current) {
        throw new Error('Webcam ref is null');
      }

      const screenshot = webcamRef.current.getScreenshot();

      if (!screenshot) {
        throw new Error('Screenshot returned null - check camera permissions');
      }

      return screenshot;
    } catch (error) {
      throw error;
    }
  }, []);

  // Handle capture with retry logic
  useEffect(() => {
    if (state.matches('capture')) {
      // Play shutter sound
      shutterAudioRef.current?.play().catch(() => {});

      let attempts = 0;
      const maxAttempts = 5;

      // Retry capture if needed (video might not be ready immediately)
      const attemptCapture = () => {
        attempts++;

        try {
          const screenshot = capturePhoto();
          send({ type: 'CAPTURE_DONE', image: screenshot });
        } catch (error) {
          if (attempts < maxAttempts) {
            setTimeout(attemptCapture, 100);
          } else {
            send({
              type: 'CAPTURE_ERROR',
              error: error instanceof Error ? error.message : 'Failed to capture photo'
            });
          }
        }
      };

      // Wait longer for webcam to be fully ready after state transition
      // The webcam remounts when transitioning from countdown to capture
      const timer = setTimeout(attemptCapture, 600);

      return () => clearTimeout(timer);
    }
  }, [state.value, send, capturePhoto]);

  // Render appropriate view based on state using pattern matching
  return match(state.value)
    .with('idle', () => (
      <IdleView
        onStart={() => send({ type: 'START' })}
        onSelectFrame={(frameId: string) => send({ type: 'SELECT_FRAME', frameId })}
        selectedFrameId={state.context.selectedFrameId}
      />
    ))
    .with('countdown', () => (
      <CountdownView
        countdown={state.context.countdown}
        webcamRef={webcamRef}
        currentPhotoNumber={state.context.currentImageIndex + 1}
        onWebcamReady={handleWebcamReady}
      />
    ))
    .with('capture', () => (
      <CaptureView
        webcamRef={webcamRef}
        onWebcamReady={handleWebcamReady}
      />
    ))
    .with('checkProgress', () => (
      <ProcessingView message="Processing..." />
    ))
    .with('stitching', () => (
      <ProcessingView message="Creating your photo strip..." />
    ))
    .with('uploading', () => (
      <ProcessingView message="Uploading your photos..." />
    ))
    .with('success', () => (
      <SuccessView
        uploadUrl={state.context.uploadUrl!}
        publicId={state.context.publicId!}
        images={state.context.images}
        onReset={() => send({ type: 'RESET' })}
      />
    ))
    .with('failure', () => (
      <FailureView
        error={state.context.error || 'An unknown error occurred'}
        onRetry={() => send({ type: 'RETRY' })}
      />
    ))
    .otherwise(() => <div>Loading...</div>);
}
