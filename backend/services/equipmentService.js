const Equipment = require('../models/Equipment');
const notificationService = require('./notificationService');

class EquipmentService {
  async createEquipment(equipmentData) {
    return await Equipment.create(equipmentData);
  }

  async getEquipmentById(id) {
    return await Equipment.findById(id).populate('borrowings.borrowed_by');
  }

  async getAllEquipment() {
    return await Equipment.find().populate('borrowings.borrowed_by');
  }

  async updateEquipment(id, equipmentData) {
    return await Equipment.findByIdAndUpdate(id, equipmentData, { new: true });
  }

  async deleteEquipment(id) {
    return await Equipment.findByIdAndDelete(id);
  }

  async borrowEquipment(equipmentId, borrowingData, requesterId) {
    console.log(borrowingData)
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    const totalBorrowed = equipment.borrowings.reduce((sum, b) => 
      b.status === 'accepted' && !b.return_date ? sum + b.num_of_items : sum, 0);
    
    if (totalBorrowed + borrowingData.num_of_items > equipment.quantity) {
      throw new Error('Not enough items available');
    }

    borrowingData.borrowed_by = requesterId;
    equipment.borrowings.push(borrowingData);
    const updatedEquipment = await equipment.save();
    
    await notificationService.notifyBorrowRequestCreated(equipment, borrowingData, requesterId);
    
    return updatedEquipment;
  }

  async updateBorrowStatus(equipmentId, borrowingId, status, requesterId) {
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value. Must be pending, accepted, or rejected');
    }
  
    try {
      // Find the equipment
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) throw new Error('Equipment not found');
  
      // Find the borrowing record
      const borrowingIndex = equipment.borrowings.findIndex(
        (b) => b._id.toString() === borrowingId
      );
      if (borrowingIndex === -1) throw new Error('Borrowing record not found');
  
      // Update the status
      equipment.borrowings[borrowingIndex].status = status;
      equipment.markModified('borrowings'); 
  
      // Save the updated equipment
      const updatedEquipment = await equipment.save();
      console.log('Updated equipment:', updatedEquipment);
  
      // Send notification after successful update
      await notificationService.notifyBorrowRequestStatus(
        equipment,
        equipment.borrowings[borrowingIndex],
        equipment.borrowings[borrowingIndex].borrowed_by,
        status
      );
  
      return updatedEquipment;
    } catch (error) {
      throw new Error(`Failed to update borrowing status: ${error.message}`);
    }
  }

  async returnEquipment(equipmentId, borrowingId, returnData) {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    const borrowingIndex = equipment.borrowings.findIndex(b => 
      b._id.toString() === borrowingId
    );
    if (borrowingIndex === -1) throw new Error('Borrowing record not found');

    equipment.borrowings[borrowingIndex].return_date = returnData.return_date || new Date();
    equipment.borrowings[borrowingIndex].isNew = false;
    return await equipment.save();
  }

  async updateBorrowing(equipmentId, borrowingId, borrowingData) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) throw new Error('Equipment not found');

      const borrowingIndex = equipment.borrowings.findIndex(
        (b) => b._id.toString() === borrowingId
      );
      if (borrowingIndex === -1) throw new Error('Borrowing record not found');

      // Validate num_of_items if provided
      if (borrowingData.num_of_items !== undefined) {
        const totalBorrowed = equipment.borrowings.reduce((sum, b) => 
          b.status === 'accepted' && !b.return_date && b._id.toString() !== borrowingId 
            ? sum + b.num_of_items 
            : sum, 
          0
        );
        if (totalBorrowed + borrowingData.num_of_items > equipment.quantity) {
          throw new Error('Not enough items available for this update');
        }
      }

      // Update only the fields provided in borrowingData
      const borrowing = equipment.borrowings[borrowingIndex];
      if (borrowingData.num_of_items !== undefined) borrowing.num_of_items = borrowingData.num_of_items;
      if (borrowingData.borrow_date) borrowing.borrow_date = borrowingData.borrow_date;
      if (borrowingData.return_date !== undefined) borrowing.return_date = borrowingData.return_date;
      if (borrowingData.status) {
        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (!validStatuses.includes(borrowingData.status)) {
          throw new Error('Invalid status value. Must be pending, accepted, or rejected');
        }
        borrowing.status = borrowingData.status;
      }
      if (borrowingData.borrowed_by) borrowing.borrowed_by = borrowingData.borrowed_by;
      if (borrowingData.isNew !== undefined) borrowing.isNew = borrowingData.isNew;

      equipment.markModified('borrowings'); // Mark the borrowings array as modified
      const updatedEquipment = await equipment.save();

      // Notify if status changed
      if (borrowingData.status) {
        await notificationService.notifyBorrowRequestStatus(
          equipment,
          equipment.borrowings[borrowingIndex],
          equipment.borrowings[borrowingIndex].borrowed_by,
          borrowingData.status
        );
      }

      return updatedEquipment;
    } catch (error) {
      throw new Error(`Failed to update borrowing: ${error.message}`);
    }
  }

  // New method: Delete a specific borrowing record
  async deleteBorrowing(equipmentId, borrowingId) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) throw new Error('Equipment not found');

      const borrowingIndex = equipment.borrowings.findIndex(
        (b) => b._id.toString() === borrowingId
      );
      if (borrowingIndex === -1) throw new Error('Borrowing record not found');

      // Remove the borrowing record from the array
      equipment.borrowings.splice(borrowingIndex, 1);
      equipment.markModified('borrowings'); // Mark the borrowings array as modified
      const updatedEquipment = await equipment.save();

      return updatedEquipment;
    } catch (error) {
      throw new Error(`Failed to delete borrowing: ${error.message}`);
    }
  }
}

module.exports = new EquipmentService();