import * as faceapi from 'face-api.js';
import { Student, FaceDetectionResult } from '../types';

// Track model loading state
let modelsLoaded = false;

/**
 * Load face detection models
 */
export const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    throw new Error('Failed to load face recognition models. Please check your internet connection and try again.');
  }
};

/**
 * Check if models are loaded
 */
export const areModelsLoaded = (): boolean => {
  return modelsLoaded && 
    faceapi.nets.ssdMobilenetv1.isLoaded && 
    faceapi.nets.faceLandmark68Net.isLoaded && 
    faceapi.nets.faceRecognitionNet.isLoaded;
};

/**
 * Detect and extract face features from an image
 */
export const detectFaces = async (
  image: HTMLImageElement | HTMLVideoElement
): Promise<FaceDetectionResult[]> => {
  if (!areModelsLoaded()) {
    throw new Error('Face detection models are not loaded. Please wait for models to load completely.');
  }

  try {
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections.map(d => ({
      detection: {
        box: d.detection.box
      },
      descriptor: d.descriptor
    }));
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw new Error('Failed to detect faces. Please ensure the image is clear and try again.');
  }
};

/**
 * Compare detected face with registered students
 */
export const recognizeFace = (
  faceDescriptor: Float32Array,
  students: Student[]
): Student | null => {
  if (!areModelsLoaded()) {
    throw new Error('Face detection models are not loaded. Please wait for models to load completely.');
  }

  if (!faceDescriptor || students.length === 0) return null;
  
  // Create face matcher with registered students
  const labeledDescriptors = students
    .filter(student => student.faceDescriptors && student.faceDescriptors.length > 0)
    .map(student => {
      // Convert stored descriptors back to Float32Array
      const descriptors = student.faceDescriptors.map(d => 
        new Float32Array(Object.values(d))
      );
      
      return new faceapi.LabeledFaceDescriptors(
        student.id,
        descriptors
      );
    });

  if (labeledDescriptors.length === 0) return null;
  
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  const match = faceMatcher.findBestMatch(faceDescriptor);
  
  if (match.label !== 'unknown') {
    return students.find(student => student.id === match.label) || null;
  }
  
  return null;
};

/**
 * Draw face detection boxes on canvas
 */
export const drawFaceDetections = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLVideoElement,
  detections: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>>[]
): void => {
  if (!areModelsLoaded()) {
    throw new Error('Face detection models are not loaded. Please wait for models to load completely.');
  }

  const displaySize = { 
    width: image.width, 
    height: image.height 
  };
  
  // Match the canvas display size to the image
  faceapi.matchDimensions(canvas, displaySize);
  
  // Resize the detections to match the canvas size
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
  // Clear the canvas
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // Draw boxes around the faces
  faceapi.draw.drawDetections(canvas, resizedDetections);
};