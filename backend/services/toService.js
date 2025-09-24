// toService.js
const TO = require('../models/TO'); // Adjust the path to your TO model

class ToService {
  // Get all technical officers
  async getAllTOs() {
    try {
      const technicalOfficers = await TO.find();
      return technicalOfficers;
    } catch (error) {
      throw new Error('Error fetching technical officers: ' + error.message);
    }
  }

  // Get a technical officer by ID
  async getTOById(id) {
    try {
      const technicalOfficer = await TO.findById(id);
      if (!technicalOfficer) {
        throw new Error('Technical officer not found');
      }
      return technicalOfficer;
    } catch (error) {
      throw new Error('Error fetching technical officer: ' + error.message);
    }
  }

  // Update a technical officer by ID
  async updateTO(id, updateData) {
    try {
      // Check if the updated email or NIC is already in use by another TO
      const existingTOWithEmail = await TO.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existingTOWithEmail) {
        throw new Error('Email is already in use by another technical officer');
      }

      const existingTOWithNIC = await TO.findOne({ NIC: updateData.NIC, _id: { $ne: id } });
      if (existingTOWithNIC) {
        throw new Error('NIC is already in use by another technical officer');
      }

      const updatedTO = await TO.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedTO) {
        throw new Error('Technical officer not found');
      }
      return updatedTO;
    } catch (error) {
      throw new Error('Error updating technical officer: ' + error.message);
    }
  }

  // Delete a technical officer by ID
  async deleteTO(id) {
    try {
      const deletedTO = await TO.findByIdAndDelete(id);
      if (!deletedTO) {
        throw new Error('Technical officer not found');
      }
      return deletedTO;
    } catch (error) {
      throw new Error('Error deleting technical officer: ' + error.message);
    }
  }
}

module.exports = new ToService();