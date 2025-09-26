const EquipmentService = require('../services/equipmentService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/equipment');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
}).single('image');

class EquipmentController {
  async createEquipment(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      try {
        const equipmentData = {
          item_num: req.body.item_num,
          name: req.body.name,
          quantity: req.body.quantity,
          img_url: req.file ? `/uploads/equipment/${req.file.filename}` : undefined,
        };
        const equipment = await EquipmentService.createEquipment(equipmentData);
        res.status(201).json(equipment);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  async updateEquipment(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      try {
        const { id } = req.params;
        const existingEquipment = await EquipmentService.getEquipmentById(id);
        if (!existingEquipment) throw new Error('Equipment not found');

        const equipmentData = {
          item_num: req.body.item_num,
          name: req.body.name,
          quantity: req.body.quantity,
        };

        // Handle image update
        if (req.file) {
          // Delete old image if it exists
          if (existingEquipment.img_url) {
            const oldImagePath = path.join(__dirname, '../', existingEquipment.img_url);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          equipmentData.img_url = `/uploads/equipment/${req.file.filename}`;
        }

        const equipment = await EquipmentService.updateEquipment(id, equipmentData);
        if (!equipment) throw new Error('Equipment not found');
        res.json(equipment);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.getEquipmentById(id);
      if (!equipment) throw new Error('Equipment not found');

      // Delete image file if it exists
      if (equipment.img_url) {
        const imagePath = path.join(__dirname, '../', equipment.img_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await EquipmentService.deleteEquipment(id);
      res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Other methods remain unchanged
  async getEquipmentById(req, res) {
    try {
      const equipment = await EquipmentService.getEquipmentById(req.params.id);
      if (!equipment) throw new Error('Equipment not found');
      res.json(equipment);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllEquipment(req, res) {
    try {
      const equipment = await EquipmentService.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async borrowEquipment(req, res) {
    try {
      const borrowingData = {
        ...req.body,
        borrowed_by: req.user.id,
      };
      const equipment = await EquipmentService.borrowEquipment(
        req.params.equipmentId, 
        borrowingData, 
        req.user.id
      );
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateBorrowStatus(req, res) {
    try {
      const { status } = req.body;
      const equipment = await EquipmentService.updateBorrowStatus(
        req.params.equipmentId,
        req.params.borrowingId,
        status,
        req.user.id
      );
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async returnEquipment(req, res) {
    try {
      const equipment = await EquipmentService.returnEquipment(
        req.params.equipmentId,
        req.params.borrowingId,
        req.body
      );
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateBorrowing(req, res) {
    try {
      const { equipmentId, borrowingId } = req.params;
      const borrowingData = {
        num_of_items: req.body.num_of_items,
        borrow_date: req.body.borrow_date,
        return_date: req.body.return_date,
        status: "pending",
        borrowed_by: req.body.borrowed_by || req.user.id, 
      };

      console.log(borrowingData)

      // Remove undefined fields to avoid overwriting with undefined
      Object.keys(borrowingData).forEach(
        (key) => borrowingData[key] === undefined && delete borrowingData[key]
      );

      const equipment = await EquipmentService.updateBorrowing(
        equipmentId,
        borrowingId,
        borrowingData
      );
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // New method: Delete a specific borrowing
  async deleteBorrowing(req, res) {
    try {
      const { equipmentId, borrowingId } = req.params;
      const equipment = await EquipmentService.deleteBorrowing(equipmentId, borrowingId);
      res.json({ message: 'Borrowing record deleted successfully', equipment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new EquipmentController();