export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  course: string;
  profilePhoto?: string;
  faceDescriptors: number[][];
  registrationDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  timestamp: string;
  present: boolean;
}

export interface FaceDetectionResult {
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