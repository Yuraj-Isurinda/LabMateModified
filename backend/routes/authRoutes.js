const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register/lecturer', authController.registerLecturer);
router.post('/register/admin', authController.registerAdmin);
router.post('/register/student', authController.registerStudent);
router.post('/register/to', authController.registerTO);
router.get('/admin/:id', authController.getAdminById);
router.get('/lecturer/:id', authController.getLecturerById);
router.get('/student/:id', authController.getStudentById);
router.get('/to/:id', authController.getToById);
router.post('/login', authController.login);

router.get('/profile', authMiddleware(), authController.getProfile);

module.exports = router;