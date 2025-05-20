const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  addAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance);
router.post('/', addAttendance);
router.delete('/:id', deleteAttendance); // optional

module.exports = router;
