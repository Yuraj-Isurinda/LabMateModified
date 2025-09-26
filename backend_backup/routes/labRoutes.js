const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', authMiddleware(['admin']), labController.createLab);
router.put('/:id', authMiddleware(['admin']), labController.updateLab);
router.delete('/:id', authMiddleware(['admin']), labController.deleteLab);

// General access routes
router.get('/', authMiddleware(), labController.getAllLabs);
router.get('/:id', authMiddleware(), labController.getLabById);

// Booking routes (lecturer only for creating/updating)
router.post('/:labId/bookings', authMiddleware(['lecturer', 'admin', 'to', 'student']), labController.createBooking);
router.put('/:labId/bookings/:bookingId', authMiddleware(['lecturer', 'admin', 'to', 'student']), labController.updateBooking);
router.put('/:labId/bookings/:bookingId/status', authMiddleware(['to', 'admin']), labController.updateBookingStatus);
router.get('/:labId/bookings/:bookingId', authMiddleware(), labController.getBooking);
router.delete('/:labId/bookings/:bookingId', authMiddleware(['lecturer', 'admin', 'to', 'student']), labController.cancelBooking);

module.exports = router;