import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels, detectFaces, recognizeFace } from '../utils/faceDetection';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface FaceRecognitionProps {
  onRecognition?: (student: Student) => void;
  continuous?: boolean;
}



const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  onRecognition,
  continuous = false,
}) => {
  const { students, markAttendance } = useAttendance();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognizedIds = useRef<Set<string>>(new Set());
  const lastRecognitionTime = useRef<Record<string, number>>({});

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await loadModels();

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        console.error('Face recognition init error:', err);
        setError('Failed to initialize. Grant camera permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (isLoading || error || !videoRef.current || students.length === 0) return;

    let intervalId: NodeJS.Timeout;
    let isProcessing = false;

    intervalId = setInterval(async () => {
      if (isProcessing || !videoRef.current) return;
      isProcessing = true;

      try {
        const faces = await detectFaces(videoRef.current);
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        const { width, height } = video.getBoundingClientRect();

        faceapi.matchDimensions(canvas, { width, height });
        ctx?.clearRect(0, 0, width, height);

        for (const face of faces) {
          const matched = recognizeFace(face.descriptor, students);

          if (matched) {
            const now = Date.now();
            const alreadyRecognized = recognizedIds.current.has(matched.id);
            const lastSeen = lastRecognitionTime.current[matched.id] || 0;
            const elapsed = now - lastSeen;

            let statusText = '';
            let color = '#00FF00'; // Green

            // First recognition
            if (!alreadyRecognized) {
              recognizedIds.current.add(matched.id);
              lastRecognitionTime.current[matched.id] = now;
              await markAttendance(matched.id);
              onRecognition?.(matched);
              statusText = 'Marked as Present';
              color = '#00FF00';
            }
            // Duplicate punch
            else if (elapsed > 10000) {
              lastRecognitionTime.current[matched.id] = now;
              onRecognition?.(matched);
              statusText = 'Duplicate Punch';
              color = '#FF0000'; // Red
            } else {
              statusText = 'Already Marked';
              color = '#FF0000';
            }

            // Draw bounding box and label
            if (ctx) {
              const box = face.detection.box;
              const name = `${matched.firstName} ${matched.lastName}`;
              const label = `${name} - ${statusText}`;
              const textWidth = ctx.measureText(label).width;

              // Draw box
              ctx.strokeStyle = color;
              ctx.lineWidth = 4;
              ctx.strokeRect(box.x, box.y, box.width, box.height);

              // Background for label
              ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
              ctx.fillRect(box.x, box.y - 40, textWidth + 70, 35);

              // Text
              ctx.fillStyle = color;
              ctx.font = 'bold 14px Arial';
              ctx.fillText(label, box.x + 5, box.y - 20);
            }
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
      } finally {
        isProcessing = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isLoading, error, students, continuous, markAttendance, onRecognition]);

  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300 mt-2">Loading face recognition models...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-80 bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <AlertCircle className="w-10 h-10 text-red-600" />
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      ) : (
        <div className="relative bg-black rounded">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto rounded" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;