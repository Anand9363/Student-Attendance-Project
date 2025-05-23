import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import FaceRecognition from '../components/FaceRecognition';
import { Student } from '../types';
import {
  UserCheck,
  Users,
  Clock,
  ArrowUpCircle,
  CheckCircle,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TakeAttendance: React.FC = () => {
  const { students, attendanceRecords, markAttendance } = useAttendance();
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([]);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const [shownPopups, setShownPopups] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const todayAttendance = attendanceRecords
      .filter((record) => record.date === today)
      .map((record) => record.studentId);
    setRecognizedStudents(todayAttendance);
  }, [attendanceRecords, today]);

  const playSoundAndVibrate = () => {
    const audio = new Audio('/success.mp3');
    audio.play().catch(console.error);
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const showPopup = (student: Student) => {
    if (shownPopups.has(student.id)) return; // Skip if already shown

    setShownPopups((prev) => new Set(prev).add(student.id)); // Mark as shown

    toast.custom(
      (t) => (
        <div
          className={`max-w-sm w-full bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center space-x-4 transform transition-all duration-300 ease-out ${
            t.visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {student.firstName} {student.lastName}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Student ID: {student.studentId || student.id}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Class: { student.course || 'N/A'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Email: {student.email}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              🕒 {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      ),
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  };

  const handleRecognition = async (student: Student) => {
    if (!recognizedStudents.includes(student.id)) {
      try {
        await markAttendance(student.id);
        setRecognizedStudents((prev) => [...prev, student.id]);
        playSoundAndVibrate();
        showPopup(student);
      } catch (error) {
        console.error('Error marking attendance:', error);
        toast.error('Failed to mark attendance.');
      }
    } else {
      showPopup(student); // Still show popup once per session
    }
  };

  const attendancePercentage =
    students.length > 0
      ? Math.round((recognizedStudents.length / students.length) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-11">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Take Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mark student attendance using face recognition
          </p>
        </div>

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

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
            {recognizedStudents.length}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
            <ArrowUpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
            {attendancePercentage}%
          </h3>
        </div>
      </div>

      {/* Face Recognition */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Face Recognition</h2>

        <FaceRecognition onRecognition={handleRecognition} continuous={isContinuousMode} />

        {/* Present Students */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Present Students ({recognizedStudents.length})
          </h3>

          {recognizedStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {students
                .filter((student) => recognizedStudents.includes(student.id))
                .map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-lg shadow text-center border bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white mb-2">
                      {student.firstName} {student.lastName}
                    </p>
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No students marked present yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAttendance;