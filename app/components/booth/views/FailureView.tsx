import { Button } from '~/components/ui/button';

interface FailureViewProps {
  error: string;
  onRetry: () => void;
}

export function FailureView({ error, onRetry }: FailureViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-pink-600 text-white p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="text-8xl">⚠️</div>
          <h2 className="text-5xl font-bold">
            Oops!
          </h2>
          <p className="text-2xl text-red-100">
            Something went wrong
          </p>
        </div>

        {/* Error message */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl">
          <p className="text-lg font-mono text-white">
            {error}
          </p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 text-lg text-red-100">
          <p>• Check your internet connection</p>
          <p>• Make sure camera is allowed</p>
          <p>• Try again in a moment</p>
        </div>

        {/* Retry button */}
        <div className="pt-8">
          <Button
            onClick={onRetry}
            size="lg"
            className="text-2xl px-12 py-8 bg-white text-red-600 hover:bg-red-50 hover:scale-105 transition-all duration-300 rounded-full shadow-2xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
