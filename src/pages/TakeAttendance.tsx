import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import FaceRecognition from '../components/FaceRecognition';
import { Student } from '../types';
import { UserCheck, Users, Clock, ArrowUpCircle, CheckCircle2 } from 'lucide-react';

const TakeAttendance: React.FC = () => {
  const { students, attendanceRecords, markAttendance } = useAttendance();
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([]);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate today's attendance
  useEffect(() => {
    const todayAttendance = attendanceRecords
      .filter(record => record.date === today)
      .map(record => record.studentId);
    
    setRecognizedStudents(todayAttendance);
  }, [attendanceRecords, today]);
  
  const handleRecognition = (student: Student) => {
    if (!recognizedStudents.includes(student.id)) {
      setRecognizedStudents(prev => [...prev, student.id]);
      markAttendance(student.id);
    }
  };
  
  // Calculate attendance percentage for today
  const attendancePercentage = students.length > 0
    ? Math.round((recognizedStudents.length / students.length) * 100)
    : 0;
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-11">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Take Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mark student attendance using face recognition
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setIsContinuousMode(!isContinuousMode)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isContinuousMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{isContinuousMode ? 'Continuous Mode' : 'Manual Mode'}</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{students.length}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Students Present</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{recognizedStudents.length}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
            <ArrowUpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{attendancePercentage}%</h3>
        </div>
      </div>
      
      {/* Face recognition section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Face Recognition</h2>
        
        <div className="mb-6">
          <FaceRecognition 
            onRecognition={handleRecognition} 
            continuous={isContinuousMode}
          />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Today's Attendance ({recognizedStudents.length} students)</h3>
          
          {recognizedStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {students
                .filter(student => recognizedStudents.includes(student.id))
                .map(student => (
                  <div 
                    key={student.id}
                    className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="truncate">{student.firstName} {student.lastName}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No students marked as present yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAttendance;