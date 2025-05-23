import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import {
  User,
  Users,
  Calendar,
  Layers,
  UserPlus,
  UserCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import AttendanceChart from '../components/AttendanceChart';

const Dashboard: React.FC = () => {
  const { students, attendanceRecords } = useAttendance();
  const navigate = useNavigate();

  const [todayAttendance, setTodayAttendance] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(r => r.date === today);
    setTodayAttendance(todayRecords.length);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const last7DaysRecords = attendanceRecords.filter(record =>
      last7Days.includes(record.date)
    );

    const maxPossibleAttendance = students.length * 7;
    const rate = maxPossibleAttendance
      ? (last7DaysRecords.length / maxPossibleAttendance) * 100
      : 0;
    setAttendanceRate(Math.round(rate));

    const attendanceByDate: Record<string, { present: number; absent: number }> = {};
    last7Days.forEach(date => {
      const records = attendanceRecords.filter(r => r.date === date);
      attendanceByDate[date] = {
        present: records.length,
        absent: students.length - records.length,
      };
    });

    const formattedData = last7Days
      .map(date => ({
        date,
        present: attendanceByDate[date]?.present || 0,
        absent: attendanceByDate[date]?.absent || 0,
      }))
      .reverse();

    setChartData(formattedData);

    // Unique recent attendance (latest per student)
    const sorted = [...attendanceRecords].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const recentMap = new Map();
    for (const r of sorted) {
      if (!recentMap.has(r.studentId)) {
        recentMap.set(r.studentId, r);
      }
      if (recentMap.size === 5) break;
    }

    setRecentAttendance(Array.from(recentMap.values()));
  }, [students, attendanceRecords]);

  const handleCancel = (id: string) => {
    setRecentAttendance(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = () => {
    setRecentAttendance([]);
  };

  return (
    <div className="space-y-8 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of attendance statistics and activity.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button label="Register" icon={<UserPlus />} onClick={() => navigate('/register')} color="blue" />
          <Button label="Attendance" icon={<UserCheck />} onClick={() => navigate('/attendance')} color="green" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={students.length} icon={<Users className="w-6 h-6" />} iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard title="Today's Attendance" value={todayAttendance} icon={<Calendar className="w-6 h-6" />} iconBg="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={<Layers className="w-6 h-6" />} iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <StatCard title="Total Records" value={attendanceRecords.length} icon={<Layers className="w-6 h-6" />} iconBg="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
      </div>

      {/* Attendance Chart */}
      <AttendanceChart data={chartData} />

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Attendance</h2>
          <div className="flex gap-3 text-sm">
            <button onClick={handleClearAll} className="text-red-600 dark:text-red-400 hover:underline">Clear All</button>
            <button onClick={() => navigate('/records')} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {recentAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Student</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Time</th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map(record => {
                  const student = students.find(s => s.id === record.studentId);
                  return (
                    <tr key={record.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4 flex items-center">
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mr-3">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCancel(record.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors border border-transparent hover:border-red-400 dark:hover:border-red-500 rounded-full"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No attendance records yet.</p>
          </div>
        )}
      </div>

      {/* Onboarding Prompt */}
      {students.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">Get Started</h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Register students with face data to start tracking attendance.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Register First Student
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>
    </div>
  </div>
);

const Button = ({
  label,
  icon,
  onClick,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'blue' | 'green';
}) => {
  const base = color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  return (
    <button
      onClick={onClick}
      className={`${base} text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Dashboard;
