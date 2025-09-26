const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware(), notificationController.getNotifications);
router.put('/:id/seen', authMiddleware(), notificationController.markAsSeen);

module.exports = router;