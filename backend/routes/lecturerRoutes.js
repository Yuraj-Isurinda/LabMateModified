// lecturerRoutes.js
const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController'); // Adjust the path to your lecturerController
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path to your auth middleware

// Routes for lecturers
router.get('/', authMiddleware(['admin']), lecturerController.getAllLecturers); // Get all lecturers
router.get('/:id', authMiddleware(['admin']), lecturerController.getLecturerById); // Get a lecturer by ID
router.put('/:id', authMiddleware(['admin']), lecturerController.updateLecturer); // Update a lecturer by ID
router.delete('/:id', authMiddleware(['admin']), lecturerController.deleteLecturer); // Delete a lecturer by ID

module.exports = router;