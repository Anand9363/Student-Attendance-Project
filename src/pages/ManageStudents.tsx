import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';

const ManageStudents: React.FC = () => {
  const { students = [], updateStudent, deleteStudent } = useAttendance();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Student, 'id' | 'studentId' | 'faceDescriptors' | 'registrationDate'>>({
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    phoneNumber: '',
    profilePhoto: '',
  });
  const [studentId, setStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setStudentId(student.studentId);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      course: student.course || '',
      phoneNumber: student.phoneNumber || '',
      profilePhoto: student.profilePhoto || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      course: '',
      phoneNumber: '',
      profilePhoto: '',
    });
    setStudentId('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, profilePhoto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = () => {
    if (!editingId) return;

    const existingStudent = students.find(s => s.id === editingId);
    if (!existingStudent) return;

    updateStudent({
      id: editingId,
      studentId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      course: form.course,
      profilePhoto: form.profilePhoto,
      faceDescriptors: existingStudent.faceDescriptors,
      registrationDate: existingStudent.registrationDate,
    });

    cancelEdit();
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(id);
    }
  };

  const clearAllStudents = () => {
    if (students.length === 0) return;
    if (window.confirm('This will delete all student records. Are you sure?')) {
      students.forEach(student => deleteStudent(student.id));
    }
  };

  const filteredStudents = students
    .filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const term = searchTerm.toLowerCase();
      const aId = a.studentId.toLowerCase();
      const bId = b.studentId.toLowerCase();

      const aExact = aId === term;
      const bExact = bId === term;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aIncludes = aId.includes(term);
      const bIncludes = bId.includes(term);

      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;

      return 0;
    });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Students</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Search by name or student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
        />

        <button
          onClick={clearAllStudents}
          disabled={students.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Clear All Students
        </button>
      </div>

      {students.length === 0 && <p>No students registered yet.</p>}

      <ul className="space-y-4">
        {filteredStudents.map(student => (
          <li
            key={student.id}
            className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center space-x-4"
          >
            {editingId === student.id ? (
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Student ID: {studentId}</p>

                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  name="course"
                  placeholder="Course"
                  value={form.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ID: {student.studentId} | Course: {student.course || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Email: {student.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Phone: {student.phoneNumber || 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(student)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(student.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageStudents;
