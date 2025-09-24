// studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController'); // Adjust the path to your studentController
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path to your auth middleware

// Routes for students
router.get('/', authMiddleware(['admin']), studentController.getAllStudents); // Get all students
router.get('/:id', authMiddleware(['admin']), studentController.getStudentById); // Get a student by ID
router.put('/:id', authMiddleware(['admin']), studentController.updateStudent); // Update a student by ID
router.delete('/:id', authMiddleware(['admin']), studentController.deleteStudent); // Delete a student by ID

module.exports = router;