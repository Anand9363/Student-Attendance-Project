import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';
import { loadModels, detectFaces, areModelsLoaded } from '../utils/faceDetection';
import WebcamCapture from '../components/WebcamCapture';
import { UserPlus, Camera, X, Loader2, ImagePlus } from 'lucide-react';

const RegisterStudent: React.FC = () => {
  const { addStudent } = useAttendance();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      if (!areModelsLoaded()) throw new Error('Face detection models are not loaded yet');

      const img = new Image();
      img.src = imageSrc;
      await new Promise<void>((resolve) => (img.onload = () => resolve()));

      const faces = await detectFaces(img);
      if (faces.length === 0) throw new Error('No face detected in the image');
      if (faces.length > 1) throw new Error('Multiple faces detected. Please capture only one face');

      const descriptorArray = Array.from(faces[0].descriptor);
      setFaceDescriptors((prev) => [...prev, descriptorArray]);
      setCapturedImages((prev) => [...prev, imageSrc]);
      setIsCapturing(false);
      setError(null);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the captured image');
      setIsCapturing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        await handleCapture(event.target.result);
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    setFaceDescriptors((prev) => prev.filter((_, i) => i !== index));
  };

  const registerStudent = async (formData: Student) => {
    try {
      const res = await fetch('http://localhost:5000/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Student registered successfully!');
        return true;
      } else {
        throw new Error(data.message || 'Failed to register student');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to register student');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !studentId || !phoneNumber || !course) {
      setError('Please fill in all required fields');
      return;
    }
    if (faceDescriptors.length === 0 || capturedImages.length === 0) {
      setError('Please capture at least one face image');
      return;
    }

    setIsProcessing(true);
    const newStudent: Student = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      studentId,
      phoneNumber,
      course,
      faceDescriptors,
      imageData: capturedImages[0], // base64 image string
      registrationDate: new Date().toISOString(),
    };

    // Optionally add student to context if needed
    addStudent(newStudent);

    const success = await registerStudent(newStudent);
    setIsProcessing(false);
    if (success) navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Register New Student</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new student with their face data</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            {[
              { label: 'First Name', value: firstName, onChange: setFirstName, type: 'text' },
              { label: 'Last Name', value: lastName, onChange: setLastName, type: 'text' },
              { label: 'Email', value: email, onChange: setEmail, type: 'email' },
              { label: 'Student ID', value: studentId, onChange: setStudentId, type: 'text' },
              { label: 'Phone Number', value: phoneNumber, onChange: setPhoneNumber, type: 'tel' },
            ].map(({ label, value, onChange, type }, idx) => (
              <div key={idx}>
                <label
                  htmlFor={label.replace(/\s+/g, '').toLowerCase()}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {label} *
                </label>
                <input
                  id={label.replace(/\s+/g, '').toLowerCase()}
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Course *
              </label>
              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a department</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AI&DS">AI&DS</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Right Column: Face Images */}
          <div className="space-y-6">
            <div>
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Face Images *
              </p>
              {isModelLoading ? (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-2" />
                  <p className="text-gray-600 dark:text-gray-400">Loading face detection models...</p>
                </div>
              ) : isCapturing ? (
                <WebcamCapture onCapture={handleCapture} />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {capturedImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt={`Captured face ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {capturedImages.length < 3 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsCapturing(true)}
                          className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg"
                          aria-label="Capture face"
                        >
                          <Camera className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500">Capture</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg"
                          aria-label="Upload face image"
                        >
                          <ImagePlus className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500">Upload</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Capture multiple face images for better recognition. At least one image required.
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
            className="px-4 py-2 border text-gray-700 rounded-lg mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || isCapturing || capturedImages.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
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
  );
};

export default RegisterStudent;

