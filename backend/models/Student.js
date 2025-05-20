const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  course: { type: String, required: true },
  photoUrl: { type: String, default: "" },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Student", studentSchema);
