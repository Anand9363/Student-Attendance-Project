import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Props = {
  data: { date: string; present: number; absent: number }[];
};

const AttendanceChart: React.FC<Props> = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
    <h3 className="text-lg font-bold mb-4 dark:text-white">Attendance Summary</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="present" fill="#4ade80" name="Present" />
        <Bar dataKey="absent" fill="#f87171" name="Absent" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default AttendanceChart;
