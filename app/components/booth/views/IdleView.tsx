import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';

interface IdleViewProps {
  onStart: () => void;
}

type CameraStatus = 'checking' | 'granted' | 'denied' | 'error';

export function IdleView({ onStart }: IdleViewProps) {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Request camera permission on mount
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });

        // Permission granted - stop the stream immediately
        stream.getTracks().forEach((track) => track.stop());
        setCameraStatus('granted');
        console.log('Camera permission granted');
      } catch (error) {
        console.error('Camera permission error:', error);
        setCameraStatus('denied');

        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage('Camera permission denied. Please allow camera access.');
          } else if (error.name === 'NotFoundError') {
            setErrorMessage('No camera found on this device.');
          } else {
            setErrorMessage('Camera access error: ' + error.message);
          }
        }
      }
    };

    requestCamera();
  }, []);

  const handleRetryPermission = async () => {
    setCameraStatus('checking');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      stream.getTracks().forEach((track) => track.stop());
      setCameraStatus('granted');
    } catch (error) {
      setCameraStatus('denied');
      if (error instanceof Error) {
        setErrorMessage('Camera permission denied. Please check browser settings.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold animate-pulse">
          Snap & Go
        </h1>
        <p className="text-2xl text-blue-100">
          Your instant photobooth experience
        </p>

        {/* Camera status indicator */}
        <div className="mt-8">
          {cameraStatus === 'checking' && (
            <div className="flex items-center justify-center gap-2 text-yellow-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Requesting camera access...</span>
            </div>
          )}
          {cameraStatus === 'granted' && (
            <div className="text-green-200 flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Camera ready</span>
            </div>
          )}
          {cameraStatus === 'denied' && (
            <div className="text-red-200 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">✗</span>
                <span>{errorMessage}</span>
              </div>
              <Button
                onClick={handleRetryPermission}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-purple-600"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12">
          <Button
            onClick={onStart}
            disabled={cameraStatus !== 'granted'}
            size="lg"
            className="text-2xl px-12 py-8 bg-white text-purple-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 rounded-full shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Start Photo Session
          </Button>
        </div>

        <div className="mt-16 text-blue-100 space-y-2">
          <p className="text-lg">✓ Takes 3 photos with countdown</p>
          <p className="text-lg">✓ Creates instant photo strip</p>
          <p className="text-lg">✓ Download via QR code</p>
        </div>
      </div>
    </div>
  );
}
