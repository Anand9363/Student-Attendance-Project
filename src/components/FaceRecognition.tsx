import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels, detectFaces, recognizeFace } from '../utils/faceDetection';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';
import { Loader2, AlertCircle, ThumbsUp } from 'lucide-react';

interface FaceRecognitionProps {
  onRecognition?: (student: Student) => void;
  continuous?: boolean;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ 
  onRecognition, 
  continuous = false 
}) => {
  const { students, markAttendance } = useAttendance();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const [recognitionSuccess, setRecognitionSuccess] = useState(false);
  
  // Load face-api models and start webcam
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Load face-api.js models
        await loadModels();
        
        // Start webcam
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        console.error('Error initializing face recognition:', err);
        setError('Failed to initialize face recognition. Please ensure you have granted camera permissions.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Face detection loop
  useEffect(() => {
    if (isLoading || error || !videoRef.current || students.length === 0 || !continuous) {
      return;
    }
    
    let animationFrameId: number;
    let isProcessing = false;
    
    const detectFacesInterval = setInterval(() => {
      if (isProcessing || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }
      
      isProcessing = true;
      
      // Detect faces in the video stream
      detectFaces(videoRef.current)
        .then(faces => {
          if (faces.length > 0) {
            // Attempt to recognize each detected face
            for (const face of faces) {
              const recognized = recognizeFace(face.descriptor, students);
              
              if (recognized) {
                setRecognizedStudent(recognized);
                
                // Mark attendance for the recognized student
                markAttendance(recognized.id);
                
                // Call onRecognition callback if provided
                if (onRecognition) {
                  onRecognition(recognized);
                }
                
                // Show success notification
                setRecognitionSuccess(true);
                setTimeout(() => setRecognitionSuccess(false), 3000);
                
                // Draw face detections on canvas
                if (canvasRef.current && videoRef.current) {
                  const displaySize = { 
                    width: videoRef.current.videoWidth, 
                    height: videoRef.current.videoHeight 
                  };
                  
                  // Match the canvas display size to the video
                  faceapi.matchDimensions(canvasRef.current, displaySize);
                  
                  // Draw the detection with labeled name
                  const context = canvasRef.current.getContext('2d');
                  if (context) {
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    context.font = '16px Arial';
                    context.fillStyle = '#00ff00';
                    
                    const box = face.detection.box;
                    context.strokeStyle = '#00ff00';
                    context.lineWidth = 2;
                    context.strokeRect(box.x, box.y, box.width, box.height);
                    
                    const text = `${recognized.firstName} ${recognized.lastName}`;
                    const textWidth = context.measureText(text).width;
                    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    context.fillRect(box.x, box.y - 20, textWidth + 10, 20);
                    context.fillStyle = '#00ff00';
                    context.fillText(text, box.x + 5, box.y - 5);
                  }
                }
              }
            }
          }
        })
        .catch(err => {
          console.error('Error detecting faces:', err);
        })
        .finally(() => {
          isProcessing = false;
        });
    }, 1000); // Process every 1 second
    
    return () => {
      clearInterval(detectFacesInterval);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isLoading, error, students, continuous, markAttendance, onRecognition]);
  
  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-6 h-96">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-700 dark:text-gray-300">
            Loading face recognition models...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-6 h-96">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please check your camera permissions in your browser settings.
          </p>
        </div>
      ) : (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full" 
          />
          
          {/* Recognition success notification */}
          {recognitionSuccess && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 animate-fade-in-out">
              <ThumbsUp className="w-5 h-5" />
              <span>Attendance marked for {recognizedStudent?.firstName} {recognizedStudent?.lastName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;