import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Download, Search, Filter, User, BookOpen } from 'lucide-react';

const ViewRecords: React.FC = () => {
  const { students, attendanceRecords, getAttendanceByDate, exportAttendanceData } = useAttendance();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [totalStudents, setTotalStudents] = useState(students.length);
  const [presentStudents, setPresentStudents] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);
  const [recordsForDate, setRecordsForDate] = useState([]);

  useEffect(() => {
    const records = getAttendanceByDate(selectedDate);
    setRecordsForDate(records);

    let filtered = students;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = students.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);

    const presentIds = records.map(r => r.studentId);
    const presentCount = filtered.filter(student => presentIds.includes(student.id)).length;
    setPresentStudents(presentCount);
    setAbsentStudents(filtered.length - presentCount);
  }, [selectedDate, searchQuery, students, getAttendanceByDate]);

  useEffect(() => {
    setTotalStudents(students.length);
  }, [students]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleExport = () => {
    const formattedRecords = recordsForDate.map(record => ({
      ...record,
      date: new Date(record.timestamp).toLocaleDateString(),  // Format Date
      time: new Date(record.timestamp).toLocaleTimeString(),  // Format Time
    }));
    
    exportAttendanceData(formattedRecords);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-11">
      {/* Header and Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Attendance Records</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and export attendance data by date</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Student</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Filter className="w-5 h-5" />
              <span>Showing {filteredStudents.length} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{totalStudents}</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{presentStudents}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
              <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{absentStudents}</h3>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <User className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const record = recordsForDate.find(r => r.studentId === student.id);
                  const isPresent = !!record;
                  const time = record ? new Date(record.timestamp).toLocaleTimeString() : '-';
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.course || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={isPresent
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No students found for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewRecords;
