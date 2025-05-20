const Attendance = require('../models/Attendance');
const fs = require('fs');
const path = require('path');

const studentsFilePath = path.join(__dirname, '../data/students.json');

const saveStudent = (req, res) => {
  const { name, rollNumber, imageFilename } = req.body;
  const newStudent = { name, rollNumber, image: imageFilename };

  // Read existing students
  fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading file' });

    const students = data ? JSON.parse(data) : [];
    students.push(newStudent);

    fs.writeFile(studentsFilePath, JSON.stringify(students, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error writing file' });

      res.status(201).json({ message: 'Student saved successfully' });
    });
  });
};


// GET all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (error) {
    console.error('Get Attendance Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST new attendance record
const addAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !status) {
      return res.status(400).json({ message: 'studentId and status are required' });
    }

    const newRecord = new Attendance({
      studentId,
      date: date ? new Date(date) : new Date(),
      status,
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Add Attendance Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE an attendance record
const deleteAttendance = async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });

    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllAttendance,
  addAttendance,
  deleteAttendance,
};
