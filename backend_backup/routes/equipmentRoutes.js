const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', authMiddleware(['admin', 'to']), equipmentController.createEquipment);
router.put('/:id', authMiddleware(['admin', 'to']), equipmentController.updateEquipment);
router.delete('/:id', authMiddleware(['admin', 'to']), equipmentController.deleteEquipment);

// General access routes
router.get('/', authMiddleware(), equipmentController.getAllEquipment);
router.get('/:id', authMiddleware(), equipmentController.getEquipmentById);

// Borrowing routes (lecturer and student can borrow)
router.post('/:equipmentId/borrow', 
  authMiddleware(['lecturer', 'student', 'admin']), 
  equipmentController.borrowEquipment
);
router.put('/:equipmentId/borrowings/:borrowingId/return', 
  authMiddleware(['lecturer', 'student']), 
  equipmentController.returnEquipment
);


router.put('/:equipmentId/borrowings/:borrowingId/status', authMiddleware(['to', 'admin']), equipmentController.updateBorrowStatus);

router.put(
  '/:equipmentId/borrowings/:borrowingId',
  authMiddleware(['admin', 'to', 'lecturer']),
  equipmentController.updateBorrowing
);
router.delete(
  '/:equipmentId/borrowings/:borrowingId',
  authMiddleware(['admin', 'to', 'lecturer']),
  equipmentController.deleteBorrowing
);

module.exports = router;
