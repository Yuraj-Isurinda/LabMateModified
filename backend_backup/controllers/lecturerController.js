// lecturerController.js
const lecturerService = require('../services/lecturerService'); // Adjust the path to your lecturerService

class LecturerController {
  // Get all lecturers
  async getAllLecturers(req, res) {
    try {
      const lecturers = await lecturerService.getAllLecturers();
      res.status(200).json(lecturers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get a lecturer by ID
  async getLecturerById(req, res) {
    try {
      const { id } = req.params;
      const lecturer = await lecturerService.getLecturerById(id);
      res.status(200).json(lecturer);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Update a lecturer by ID
  async updateLecturer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedLecturer = await lecturerService.updateLecturer(id, updateData);
      res.status(200).json(updatedLecturer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a lecturer by ID
  async deleteLecturer(req, res) {
    try {
      const { id } = req.params;
      const deletedLecturer = await lecturerService.deleteLecturer(id);
      res.status(200).json({ message: 'Lecturer deleted successfully', deletedLecturer });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new LecturerController();