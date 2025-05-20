// const express = require('express');
// const router = express.Router();
// const {
//   getAllStudents,
//   addStudent,
//   deleteStudent
// } = require('../controllers/studentController');

// // GET all students
// router.get('/', getAllStudents);

// // POST - Register a student
// router.post('/register', addStudent);

// // DELETE a student by ID
// router.delete('/:id', deleteStudent);

// module.exports = router;






const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  addStudent,
  deleteStudent
} = require('../controllers/studentController');

router.get('/', getAllStudents);
router.post('/', addStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
