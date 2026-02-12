import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isOpen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // const capturePhoto = useCallback(() => {
  //   if (!videoRef.current || !canvasRef.current) return;

  //   const video = videoRef.current;
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext('2d');

  //   if (!context) return;

  //   // Set canvas dimensions to match video
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   // Draw the video frame to canvas
  //   context.drawImage(video, 0, 0, canvas.width, canvas.height);

  //   // Convert to blob and create file
  //   canvas.toBlob((blob) => {
  //     if (blob) {
  //       const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
  //       setCapturedImage(imageUrl);
  //       stopCamera();
  //     }
  //   }, 'image/jpeg', 0.8);
  // }, [stopCamera]);


  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Define 4:5 frame
    const targetWidth = videoWidth;
    const targetHeight = Math.floor(videoWidth * 5 / 4);

    const offsetY = Math.floor((videoHeight - targetHeight) / 2);

    // Set canvas size to 600x750 pixels
    const finalWidth = 600;
    const finalHeight = 750;
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // Draw cropped area scaled to final size
    context.drawImage(
      video,
      0, offsetY, targetWidth, targetHeight,
      0, 0, finalWidth, finalHeight
    );

    // Create data URL
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);


  const confirmCapture = useCallback(() => {
    if (!canvasRef.current || !capturedImage) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCapture(file);
        setCapturedImage(null);
        onClose();
      }
    }, 'image/jpeg', 0.8);
  }, [capturedImage, onCapture, onClose]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  React.useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, capturedImage, facingMode]);

  if (!isOpen) return null;




  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-black/50">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {isStreaming && (
            <Button
              type="button"
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Camera View */}
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Passport Photo Frame Overlay */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-40 h-52 border-4 border-white rounded-md"></div>
            </div>

            {/* Capture Button */}
            {isStreaming && (
              <div className="absolute bottom-25 left-1/2 transform -translate-x-1/2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100"
                >
                  <Camera className="w-8 h-8 text-gray-800" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Preview */}
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />

            {/* Action Buttons */}
            <div className="absolute bottom-25 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                type="button"
                onClick={retakePhoto}
                className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                type="button"
                onClick={confirmCapture}
                className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-6 h-6" />
              </Button>
            </div>
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};