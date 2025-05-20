import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognition from '../components/FaceRecognition';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';

const StudentRecord: React.FC = () => {
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const { students } = useAttendance();
  const navigate = useNavigate();

  const handleRecognition = (matchedStudent: Student) => {
    const fullStudent = students.find(s => s.id === matchedStudent.id);
    if (fullStudent) {
      setRecognizedStudent(fullStudent);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Scan Face to View Student Record
      </h1>

      <div className="mb-6">
        <FaceRecognition
          onRecognition={handleRecognition}
          continuous={true}
        />
      </div>

      {recognizedStudent ? (
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
          {/* <img
            src={recognizedStudent.profilePhoto}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
          /> */}
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>Name:</strong> {recognizedStudent.firstName} {recognizedStudent.lastName}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>ID:</strong> {recognizedStudent.studentId}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {recognizedStudent.email}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>Phone:</strong> {recognizedStudent.phoneNumber || 'N/A'}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>Course:</strong> {recognizedStudent.course}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please scan a face to view student details.
        </p>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/records')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Take Attendance
        </button>
      </div>
    </div>
  );
};

export default StudentRecord;
