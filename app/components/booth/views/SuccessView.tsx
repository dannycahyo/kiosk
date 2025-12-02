import { QRCodeSVG } from 'qrcode.react';
import { Button } from '~/components/ui/button';

interface SuccessViewProps {
  uploadUrl: string;
  publicId: string;
  images: string[]; // Array of 3 captured photos (base64)
  onReset: () => void;
}

export function SuccessView({ uploadUrl, publicId, images, onReset }: SuccessViewProps) {
  // Construct the retrieval URL
  const retrievalUrl = `${window.location.origin}/photo/${encodeURIComponent(publicId)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-blue-600 text-white p-8">
      <div className="text-center space-y-8 max-w-4xl">
        <div className="space-y-4">
          <div className="text-6xl">✓</div>
          <h2 className="text-5xl font-bold">
            All Done!
          </h2>
          <p className="text-2xl text-green-100">
            Your photo strip is ready
          </p>
        </div>

        {/* Display all 3 captured photos */}
        <div className="flex justify-center gap-4 flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-2xl">
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-48 h-auto rounded shadow-lg"
              />
              <p className="text-gray-700 text-sm mt-2 font-semibold">Photo {index + 1}</p>
            </div>
          ))}
        </div>

        {/* Photo Strip and QR Code side by side */}
        <div className="flex justify-center items-start gap-8 flex-wrap">
          {/* Final stitched photo strip */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold mb-4">Final Photo Strip</h3>
            <div className="bg-white p-4 rounded-lg shadow-2xl">
              <img
                src={uploadUrl}
                alt="Your photo strip"
                className="w-64 h-auto rounded shadow-lg"
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold mb-4">Scan to Download</h3>
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="mb-4">
                <p className="text-gray-600 text-center">
                  Use your phone camera
                </p>
              </div>
              <QRCodeSVG
                value={retrievalUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-lg text-green-100">
          <p>📱 Open your phone camera</p>
          <p>📸 Point at the QR code</p>
          <p>💾 Download your photo strip</p>
        </div>

        {/* Reset button */}
        <div className="pt-8">
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
            className="text-xl px-8 py-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-2 border-white rounded-full"
          >
            Start New Session
          </Button>
        </div>

        <p className="text-sm text-green-200 opacity-75">
          This session will auto-reset in 60 seconds
        </p>
      </div>
    </div>
  );
}
