import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';
import { loadModels, detectFaces, areModelsLoaded } from '../utils/faceDetection';
import WebcamCapture from '../components/WebcamCapture';
import { UserPlus, Camera, X, Loader2, ImagePlus } from 'lucide-react';

interface FaceDetectionResult {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  descriptor: Float32Array;
}

const RegisterStudent: React.FC = () => {
  const { addStudent } = useAttendance();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faceDescriptors, setFaceDescriptors] = useState<number[][]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsModelLoading(true);
        await loadModels();
        setError(null);
      } catch (err) {
        setError('Failed to load face recognition models. Please refresh the page.');
        console.error('Error loading models:', err);
      } finally {
        setIsModelLoading(false);
      }
    };
    
    initializeModels();
  }, []);
  
  const handleCapture = async (imageSrc: string) => {
    try {
      if (!areModelsLoaded()) {
        throw new Error('Face detection models are not loaded yet');
      }

      const img = new Image();
      img.src = imageSrc;
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      
      const faces = await detectFaces(img);
      
      if (faces.length === 0) {
        throw new Error('No face detected in the image');
      }
      
      if (faces.length > 1) {
        throw new Error('Multiple faces detected. Please capture only one face');
      }
      
      // Store the face descriptor
      const descriptorArray = Array.from(faces[0].descriptor);
      setFaceDescriptors(prev => [...prev, descriptorArray]);
      
      // Add the image to captured images
      setCapturedImages(prev => [...prev, imageSrc]);
      setIsCapturing(false);
      setError(null);
    } catch (err) {
      console.error('Error processing captured image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the captured image');
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        await handleCapture(event.target.result);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    setFaceDescriptors(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Validate form
      if (!firstName || !lastName || !studentId) {
        throw new Error('Please fill in all required fields');
      }
      
      if (faceDescriptors.length === 0) {
        throw new Error('Please capture at least one face image');
      }
      
      // Create new student record
      const newStudent: Student = {
        id: crypto.randomUUID(),
        firstName,
        lastName,
        studentId,
        course,
        faceDescriptors,
        registrationDate: new Date().toISOString()
      };
      
      // Add the student to the database
      addStudent(newStudent);
      
      // Navigate back to dashboard
      navigate('/');
      
    } catch (err) {
      console.error('Error registering student:', err);
      setError(err instanceof Error ? err.message : 'Failed to register student');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Register New Student</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new student with their face data to the attendance system
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course/Class
                </label>
                <input
                  type="text"
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Face Images *
                </p>
                
                {isModelLoading ? (
                  <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Loading face detection models...</p>
                  </div>
                ) : isCapturing ? (
                  <WebcamCapture onCapture={handleCapture} />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {capturedImages.map((img, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                          <img src={img} alt="Captured face" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {capturedImages.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setIsCapturing(true)}
                          className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                        >
                          <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Capture</span>
                        </button>
                      )}
                      
                      {capturedImages.length < 3 && (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                          >
                            <ImagePlus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Upload</span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Capture multiple face images for better recognition. At least one image is required.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || isCapturing || capturedImages.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;