const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const STUDENTS_FILE = path.join(__dirname, 'students.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(STUDENTS_FILE)) fs.writeFileSync(STUDENTS_FILE, '[]');

// Save base64 image
const saveBase64Image = (base64Data, filename) => {
  const matches = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matches) throw new Error('Invalid image format');
  const ext = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filepath = path.join(UPLOAD_DIR, `${filename}.${ext}`);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}.${ext}`;
};

// Register student
app.post('/api/students/register', (req, res) => {
  try {
    const {
      id,
      firstName,
      lastName,
      email,
      studentId,
      phoneNumber,
      course,
      faceDescriptors,
      imageData,
      registrationDate,
    } = req.body;

    if (!imageData) return res.status(400).json({ message: 'Missing face image' });

    const imageFilename = `${studentId}-${Date.now()}`;
    const imagePath = saveBase64Image(imageData, imageFilename);

    const newStudent = {
      id,
      firstName,
      lastName,
      email,
      studentId,
      phoneNumber,
      course,
      faceDescriptors,
      imagePath,
      registrationDate,
      status: 'present',
    };

    const students = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf-8'));
    students.push(newStudent);
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));

    res.status(201).json({ message: 'Student registered', student: newStudent });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ View all students
// Assuming Express and previous code
app.get('/api/students', (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf-8'));
    res.json(students);
  } catch (err) {
    console.error('Failed to read students', err);
    res.status(500).json({ message: 'Failed to get students' });
  }
});


// ✅ Update attendance status
app.post('/api/students/attendance', (req, res) => {
  const { studentId, status } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({ message: 'Missing studentId or status' });
  }

  try {
    const students = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf-8'));
    const studentIndex = students.findIndex(s => s.studentId === studentId);

    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }

    students[studentIndex].status = status;
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));

    res.json({ message: 'Attendance updated', student: students[studentIndex] });
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
