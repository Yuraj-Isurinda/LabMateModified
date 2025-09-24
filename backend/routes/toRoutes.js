const express = require('express');
const router = express.Router();
const toController = require('../controllers/toController'); // Adjust the path to your toController
const authMiddleware = require('../middleware/authMiddleware'); // Adjust the path to your auth middleware

// Routes for technical officers
router.get('/', authMiddleware(['admin']), toController.getAllTOs); // Get all technical officers
router.get('/:id', authMiddleware(['admin']), toController.getTOById); // Get a technical officer by ID
router.put('/:id', authMiddleware(['admin']), toController.updateTO); // Update a technical officer by ID
router.delete('/:id', authMiddleware(['admin']), toController.deleteTO); // Delete a technical officer by ID

module.exports = router;