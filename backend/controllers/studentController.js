// const Student = require("../models/Student");

// // GET all students
// const getAllStudents = async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.json(students);
//   } catch (err) {
//     console.error("Get Students Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // POST - Register student
// const addStudent = async (req, res) => {
//   try {
//     const { studentId, firstName, lastName, course, photoUrl } = req.body;

//     if (!studentId || !firstName || !lastName || !course) {
//       return res.status(400).json({ message: "All fields except photo are required" });
//     }

//     const newStudent = new Student({
//       studentId,
//       firstName,
//       lastName,
//       course,
//       photoUrl: photoUrl || "",
//     });

//     await newStudent.save();
//     res.status(201).json({ message: "Student registered", student: newStudent });
//   } catch (err) {
//     console.error("Add Student Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // DELETE student by ID
// const deleteStudent = async (req, res) => {
//   try {
//     const deleted = await Student.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Student not found" });

//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     console.error("Delete Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { getAllStudents, addStudent, deleteStudent };










const fs = require('fs');
const path = require('path');

// Full path to student.json
const studentPath = path.join(__dirname, '../data/student.json');

// Get all students
const getAllStudents = (req, res) => {
  try {
    const data = fs.readFileSync(studentPath, 'utf-8');
    const students = JSON.parse(data);
    res.json(students);
  } catch (err) {
    console.error('Error reading students:', err);
    res.status(500).json({ message: 'Failed to load students' });
  }
};

// Add a new student
const addStudent = (req, res) => {
  try {
    const { studentId, firstName, lastName, course, photoUrl } = req.body;

    // Check for required fields
    if (!studentId || !firstName || !lastName || !course || !photoUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Read existing data
    const data = fs.readFileSync(studentPath, 'utf-8');
    const students = JSON.parse(data);

    // Create new student
    const newStudent = {
      id: Date.now().toString(),
      studentId,
      firstName,
      lastName,
      course,
      photoUrl,
    };

    students.push(newStudent);

    // Save updated list
    fs.writeFileSync(studentPath, JSON.stringify(students, null, 2));

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a student by ID
const deleteStudent = (req, res) => {
  try {
    const data = fs.readFileSync(studentPath, 'utf-8');
    const students = JSON.parse(data);

    const updated = students.filter(s => s.id !== req.params.id);
    fs.writeFileSync(studentPath, JSON.stringify(updated, null, 2));

    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  deleteStudent,
};
