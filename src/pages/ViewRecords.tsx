import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Download, Search, Filter, User, BookOpen } from 'lucide-react';
import { Student } from '../types';

const ViewRecords: React.FC = () => {
  const navigate = useNavigate();
  const { students, attendanceRecords, getAttendanceByDate, exportAttendanceData } = useAttendance();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [recordsForDate, setRecordsForDate] = useState<any[]>([]);
  const [presentStudents, setPresentStudents] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleExport = () => {
    const formattedRecords = recordsForDate.map(record => ({
      ...record,
      date: new Date(record.timestamp).toLocaleDateString(),
      time: new Date(record.timestamp).toLocaleTimeString(),
    }));
    exportAttendanceData(formattedRecords);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-11">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Attendance Records</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and export attendance data by date</p>
          <button
            onClick={() => navigate('/student-record')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Student Record Page (Scan Face)
          </button>
        </div>
        <button
          onClick={handleExport}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="pl-10 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <StatCard label="Total Students" value={students.length} icon={<BookOpen className="text-blue-600" />} bgColor="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard label="Present" value={presentStudents} icon={<User className="text-green-600" />} bgColor="bg-green-100 dark:bg-green-900/30" />
        <StatCard label="Absent" value={absentStudents} icon={<User className="text-red-600" />} bgColor="bg-red-100 dark:bg-red-900/30" />
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <TableHead title="Student" />
                <TableHead title="ID" />
                <TableHead title="Course" />
                <TableHead title="Time" />
                <TableHead title="Status" />
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{student.studentId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{student.course || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isPresent
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
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

const StatCard = ({ label, value, icon, bgColor }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
    </div>
  </div>
);

const TableHead = ({ title }: { title: string }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
    {title}
  </th>
);

export default ViewRecords;
