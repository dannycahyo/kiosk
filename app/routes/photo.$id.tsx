import { useParams } from "react-router";
import type { Route } from "./+types/photo.$id";
import { Button } from "~/components/ui/button";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Your Photo Strip | Snap & Go" },
    { name: "description", content: "Download your photobooth photo strip" },
  ];
}

export default function PhotoRetrieval() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Photo Not Found</h1>
          <p className="text-xl text-gray-400">Invalid photo ID</p>
        </div>
      </div>
    );
  }

  // Construct Cloudinary URL from public_id
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${id}.jpg`;

  const handleDownload = () => {
    // Create temporary anchor to trigger download
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `photobooth-${id.split('/').pop()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Photo Strip',
          text: 'Check out my photobooth photo strip!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center text-white space-y-2">
          <h1 className="text-4xl font-bold">Your Photo Strip</h1>
          <p className="text-xl text-blue-200">Snap & Go Photobooth</p>
        </div>

        {/* Photo Display - responsive container for variable dimensions */}
        <div className="bg-white p-4 rounded-2xl shadow-2xl">
          <img
            src={imageUrl}
            alt="Your photobooth strip"
            className="w-full h-auto rounded-lg shadow-lg max-h-screen object-contain"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxOTIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA lIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleDownload}
            size="lg"
            className="flex-1 text-lg py-6 bg-white text-purple-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 rounded-full shadow-xl"
          >
            📥 Download
          </Button>

          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
            className="flex-1 text-lg py-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-2 border-white rounded-full"
          >
            📤 Share
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-blue-200 text-sm space-y-1">
          <p>• Long-press on the image to save (iOS/Android)</p>
          <p>• Or use the download button above</p>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-300 text-xs pt-4">
          <p>Photos are automatically deleted after 24 hours</p>
          <p className="mt-2">Powered by Snap & Go Photobooth</p>
        </div>
      </div>
    </div>
  );
}
