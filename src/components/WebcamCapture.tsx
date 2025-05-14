import React, { useRef, useEffect, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  showFaceDetection?: boolean;
  width?: number;
  height?: number;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onCapture, 
  showFaceDetection = false, 
  width = 640, 
  height = 480 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Start webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setStream(stream);
        setError(null);
      } catch (err) {
        setError('Could not access the camera. Please ensure you have granted camera permissions.');
        console.error('Error accessing webcam:', err);
      }
    };
    
    startWebcam();
    
    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [width, height]);
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL and pass it to the onCapture callback
    const imageSrc = canvas.toDataURL('image/jpeg');
    onCapture(imageSrc);
  };
  
  return (
    <div className="relative">
      {error ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please check your camera permissions in your browser settings.
          </p>
        </div>
      ) : (
        <>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-full h-auto"
              style={{ maxHeight: `${height}px` }}
            />
            {showFaceDetection && (
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full" 
              />
            )}
          </div>
          
          <button
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors duration-200 shadow-lg"
          >
            <Camera className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamCapture;