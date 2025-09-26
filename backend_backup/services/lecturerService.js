// lecturerService.js
const Lecturer = require('../models/Lecturer'); // Adjust the path to your Lecturer model

class LecturerService {
  // Get all lecturers
  async getAllLecturers() {
    try {
      const lecturers = await Lecturer.find();
      return lecturers;
    } catch (error) {
      throw new Error('Error fetching lecturers: ' + error.message);
    }
  }

  // Get a lecturer by ID
  async getLecturerById(id) {
    try {
      const lecturer = await Lecturer.findById(id);
      if (!lecturer) {
        throw new Error('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      throw new Error('Error fetching lecturer: ' + error.message);
    }
  }

  // Update a lecturer by ID
  async updateLecturer(id, updateData) {
    try {
      // Check if the updated email or lec_id is already in use by another lecturer
      const existingLecturerWithEmail = await Lecturer.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingLecturerWithEmail) {
        throw new Error('Email is already in use by another lecturer');
      }

      const existingLecturerWithLecId = await Lecturer.findOne({
        lec_id: updateData.lec_id,
        _id: { $ne: id },
      });
      if (existingLecturerWithLecId) {
        throw new Error('Lecturer ID is already in use by another lecturer');
      }

      const updatedLecturer = await Lecturer.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedLecturer) {
        throw new Error('Lecturer not found');
      }
      return updatedLecturer;
    } catch (error) {
      throw new Error('Error updating lecturer: ' + error.message);
    }
  }

  // Delete a lecturer by ID
  async deleteLecturer(id) {
    try {
      const deletedLecturer = await Lecturer.findByIdAndDelete(id);
      if (!deletedLecturer) {
        throw new Error('Lecturer not found');
      }
      return deletedLecturer;
    } catch (error) {
      throw new Error('Error deleting lecturer: ' + error.message);
    }
  }
}

module.exports = new LecturerService();