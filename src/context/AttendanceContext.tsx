import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceContextType {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  addStudent: (student: Student) => void;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (studentId: string) => void;
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  getAttendanceByStudent: (studentId: string) => AttendanceRecord[];
  exportAttendanceData: (records: AttendanceRecord[]) => void;
  clearAllData: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedStudents = localStorage.getItem('students');
      return savedStudents ? JSON.parse(savedStudents) : [];
    } catch (error) {
      console.error('Error loading students from localStorage:', error);
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const savedRecords = localStorage.getItem('attendanceRecords');
      return savedRecords ? JSON.parse(savedRecords) : [];
    } catch (error) {
      console.error('Error loading attendance records from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
      console.error('Error saving students to localStorage:', error);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    } catch (error) {
      console.error('Error saving attendance records to localStorage:', error);
    }
  }, [attendanceRecords]);

  const addStudent = (student: Student) => {
    try {
      // Validate student data
      if (!student.id || !student.firstName || !student.lastName || !student.studentId) {
        throw new Error('Invalid student data');
      }

      // Check for duplicate student ID
      const isDuplicate = students.some(s => s.studentId === student.studentId);
      if (isDuplicate) {
        throw new Error('A student with this ID already exists');
      }

      setStudents(prev => {
        const newStudents = [...prev, student];
        // Immediately persist to localStorage
        try {
          localStorage.setItem('students', JSON.stringify(newStudents));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        return newStudents;
      });
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => 
      prev.map(student => student.id === updatedStudent.id ? updatedStudent : student)
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    // Also remove associated attendance records
    setAttendanceRecords(prev => prev.filter(record => record.studentId !== id));
  };

  const markAttendance = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendanceRecords.find(
      record => record.studentId === studentId && record.date === today
    );

    if (!existingRecord) {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        studentId,
        date: today,
        timestamp: new Date().toISOString(),
        present: true
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  const getAttendanceByDate = (date: string) => {
    return attendanceRecords.filter(record => record.date === date);
  };

  const getAttendanceByStudent = (studentId: string) => {
    return attendanceRecords.filter(record => record.studentId === studentId);
  };

  const exportAttendanceData = (records: AttendanceRecord[]) => {
    const enrichedRecords = records.map(record => {
      const student = students.find(s => s.id === record.studentId);
      return {
        date: record.date,
        timestamp: record.timestamp,
        studentId: record.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        present: record.present
      };
    });

    const csv = [
      ['Date', 'Time', 'Student ID', 'Student Name', 'Present'],
      ...enrichedRecords.map(record => [
        record.date,
        new Date(record.timestamp).toLocaleTimeString(),
        record.studentId,
        record.studentName,
        record.present ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setStudents([]);
      setAttendanceRecords([]);
      localStorage.removeItem('students');
      localStorage.removeItem('attendanceRecords');
    }
  };

  return (
    <AttendanceContext.Provider 
      value={{ 
        students, 
        attendanceRecords, 
        addStudent, 
        updateStudent, 
        deleteStudent, 
        markAttendance, 
        getAttendanceByDate, 
        getAttendanceByStudent, 
        exportAttendanceData,
        clearAllData
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};