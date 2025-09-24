// toController.js
const toService = require('../services/toService'); // Adjust the path to your toService

class ToController {
  // Get all technical officers
  async getAllTOs(req, res) {
    try {
      const technicalOfficers = await toService.getAllTOs();
      res.status(200).json(technicalOfficers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get a technical officer by ID
  async getTOById(req, res) {
    try {
      const { id } = req.params;
      const technicalOfficer = await toService.getTOById(id);
      res.status(200).json(technicalOfficer);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Update a technical officer by ID
  async updateTO(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTO = await toService.updateTO(id, updateData);
      res.status(200).json(updatedTO);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a technical officer by ID
  async deleteTO(req, res) {
    try {
      const { id } = req.params;
      const deletedTO = await toService.deleteTO(id);
      res.status(200).json({ message: 'Technical officer deleted successfully', deletedTO });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ToController();