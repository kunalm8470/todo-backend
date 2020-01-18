const express = require('express');

const studentController = require('../controllers/studentController');
const StudentController = new studentController();

const router = express.Router();

router.get('/', StudentController.getAllStudents)
router.get('/:id', StudentController.getStudentById);
router.post('/', StudentController.addStudent);

module.exports = router;