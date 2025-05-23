const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const router = express.Router();

router.post('/mark', (req, res) => {
  const { rollNumber, status } = req.body;
  const date = new Date().toISOString().split('T')[0];

  const studentsPath = path.join(__dirname, '../data/students.json');
  const students = JSON.parse(fs.readFileSync(studentsPath));
  const student = students.find(s => s.rollNumber === rollNumber);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Avoid marking duplicate for the day
  const alreadyMarked = student.attendance.find(a => a.date === date);
  if (!alreadyMarked) {
    student.attendance.push({ date, status });
  }

  fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));

  // Update Excel
  const excelPath = path.join(__dirname, '../data/attendance.xlsx');
  let workbook, worksheet;

  if (fs.existsSync(excelPath)) {
    workbook = XLSX.readFile(excelPath);
    worksheet = workbook.Sheets['Sheet1'];
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  }

  const data = XLSX.utils.sheet_to_json(worksheet);
  data.push({ Date: date, RollNumber: rollNumber, Status: status });

  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets['Sheet1'] = newSheet;
  XLSX.writeFile(workbook, excelPath);

  res.json({ message: 'Attendance marked' });
});

module.exports = router;
