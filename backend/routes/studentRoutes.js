const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Paths
const studentsFilePath = path.join(__dirname, '../data/students.json');
const studentFilePath = path.join(__dirname, '../data/student.json');
const uploadsDir = path.join(__dirname, '../uploads');

// Create uploads dir if not exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// JSON Helpers
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`⚠️ JSON parsing error in ${filePath}:`, err.message);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ Failed to write JSON to ${filePath}:`, err.message);
  }
};

// 📌 POST /api/students/register
router.post('/register', upload.single('image'), (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      studentId,
      phoneNumber,
      course,
      descriptor
    } = req.body;

    const image = req.file?.filename;

    if (!firstName || !lastName || !email || !studentId || !descriptor || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let parsedDescriptor;
    try {
      parsedDescriptor = JSON.parse(descriptor);
    } catch (parseErr) {
      return res.status(400).json({ message: 'Invalid face descriptor format' });
    }

    const newStudent = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      studentId,
      phoneNumber,
      course,
      image,
      descriptor: parsedDescriptor,
      registrationDate: new Date().toISOString(),
      attendanceStatus: 'Absent', // default
    };

    // Save to both student JSON files
    const students = readJsonFile(studentsFilePath);
    students.push(newStudent);
    writeJsonFile(studentsFilePath, students);

    const studentList = readJsonFile(studentFilePath);
    studentList.push(newStudent);
    writeJsonFile(studentFilePath, studentList);

    return res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('❌ Error registering student:', error);
    return res.status(500).json({ error: 'Failed to register student' });
  }
});

// 📌 GET /api/students
router.get('/', (req, res) => {
  try {
    const students = readJsonFile(studentsFilePath);

    const studentsWithImages = students.map((student) => {
      const imagePath = path.join(uploadsDir, student.image);
      let imageData = '';

      try {
        const fileData = fs.readFileSync(imagePath);
        imageData = `data:image/jpeg;base64,${fileData.toString('base64')}`;
      } catch (e) {
        console.warn('⚠️ Unable to read image for student:', student.image);
      }

      return {
        ...student,
        imageData
      };
    });

    return res.json(studentsWithImages);
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
