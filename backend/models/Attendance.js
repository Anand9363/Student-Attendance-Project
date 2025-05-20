


const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: String,
  date: { type: Date, default: Date.now },
  status: String, // "Present" or "Absent"
});

module.exports = mongoose.model('Attendance', attendanceSchema);
