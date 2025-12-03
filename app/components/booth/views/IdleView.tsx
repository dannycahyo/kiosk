import { useState, useEffect, useReducer } from 'react';
import { Button } from '~/components/ui/button';
import { getAllFrames } from '~/lib/frame-config';
import { cn } from '~/lib/utils';

interface IdleViewProps {
  onStart: () => void;
  onSelectFrame: (frameId: string) => void;
  selectedFrameId: string;
}

type CameraStatus = 'checking' | 'granted' | 'denied' | 'error';

// Frame selector state management using useReducer
type SelectorState = {
  selectedId: string;
  hoveredId: string | null;
  orientationFilter: 'all' | 'vertical' | 'horizontal';
};

type SelectorAction =
  | { type: 'SELECT'; id: string }
  | { type: 'HOVER'; id: string | null }
  | {
      type: 'FILTER';
      orientation: SelectorState['orientationFilter'];
    };

function selectorReducer(
  state: SelectorState,
  action: SelectorAction,
): SelectorState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'HOVER':
      return { ...state, hoveredId: action.id };
    case 'FILTER':
      return { ...state, orientationFilter: action.orientation };
    default:
      return state;
  }
}

export function IdleView({
  onStart,
  onSelectFrame,
  selectedFrameId,
}: IdleViewProps) {
  const [cameraStatus, setCameraStatus] =
    useState<CameraStatus>('checking');

  const [selectorState, dispatch] = useReducer(selectorReducer, {
    selectedId: selectedFrameId,
    hoveredId: null,
    orientationFilter: 'all',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Filter frames based on orientation
  const frames = getAllFrames().filter(
    (frame) =>
      selectorState.orientationFilter === 'all' ||
      frame.orientation === selectorState.orientationFilter,
  );

  const handleFrameSelect = (frameId: string) => {
    dispatch({ type: 'SELECT', id: frameId });
    onSelectFrame(frameId);
  };

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
      } catch (error) {
        setCameraStatus('denied');

        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage(
              'Camera permission denied. Please allow camera access.',
            );
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
        setErrorMessage(
          'Camera permission denied. Please check browser settings.',
        );
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

        {/* Frame Selection Section */}
        <div className="mt-8 space-y-4 max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold">
            Choose Your Frame
          </h2>

          {/* Orientation Filter */}
          <div className="flex justify-center gap-2">
            {(['all', 'vertical', 'horizontal'] as const).map(
              (filter) => (
                <Button
                  key={filter}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch({ type: 'FILTER', orientation: filter })
                  }
                  className={cn(
                    'capitalize border-2 transition-all',
                    selectorState.orientationFilter === filter
                      ? 'bg-white text-purple-600 border-white hover:bg-white'
                      : 'bg-transparent text-white border-white/50 hover:bg-white/20 hover:border-white',
                  )}
                >
                  {filter}
                </Button>
              ),
            )}
          </div>

          {/* Frame Grid */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleFrameSelect(frame.id)}
                onMouseEnter={() =>
                  dispatch({ type: 'HOVER', id: frame.id })
                }
                onMouseLeave={() =>
                  dispatch({ type: 'HOVER', id: null })
                }
                className={cn(
                  'relative p-1.5 rounded-lg border-2 transition-all duration-200',
                  'hover:scale-105 hover:shadow-xl',
                  selectorState.selectedId === frame.id
                    ? 'border-yellow-400 bg-white/20 shadow-2xl'
                    : 'border-white/30 bg-white/10',
                )}
              >
                {/* Frame Preview */}
                <div className="aspect-[3/4] bg-white rounded overflow-hidden">
                  <img
                    src={frame.path}
                    alt={frame.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Frame Name */}
                <p className="mt-1 text-xs font-medium">
                  {frame.name}
                </p>

                {/* Orientation Badge */}
                <span
                  className={cn(
                    'absolute top-2 right-2 px-1.5 py-0.5 text-[10px] rounded-full font-semibold',
                    frame.orientation === 'vertical'
                      ? 'bg-blue-500'
                      : 'bg-purple-500',
                  )}
                >
                  {frame.orientation === 'vertical' ? '↕' : '↔'}
                </span>

                {/* Selected Indicator */}
                {selectorState.selectedId === frame.id && (
                  <div className="absolute top-1 left-1 text-lg bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-purple-600">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
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
