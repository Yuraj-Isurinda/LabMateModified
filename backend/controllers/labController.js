const labService = require('../services/labService');

class LabController {
  async createLab(req, res) {
    try {
      const lab = await labService.createLab(req.body);
      res.status(201).json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLabById(req, res) {
    try {
      const lab = await labService.getLabById(req.params.id);
      if (!lab) throw new Error('Lab not found');
      res.json(lab);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllLabs(req, res) {
    try {
      const labs = await labService.getAllLabs();
      res.json(labs);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateLab(req, res) {
    try {
      const lab = await labService.updateLab(req.params.id, req.body);
      if (!lab) throw new Error('Lab not found');
      res.json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteLab(req, res) {
    try {
      const lab = await labService.deleteLab(req.params.id);
      if (!lab) throw new Error('Lab not found');
      res.json({ message: 'Lab deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createBooking(req, res) {
    try {
      const lab = await labService.createBooking(req.params.labId, req.body, req.user.id);
      res.status(201).json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async acceptBooking(req, res) {
    try {
      const lab = await labService.acceptBooking(req.params.labId, req.params.bookingId, req.user.id);
      res.json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateBooking(req, res) {
    try {
      const lab = await labService.updateBooking(req.params.labId, req.params.bookingId, req.body);
      res.json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async updateBookingStatus(req, res) {
    try {
      const { labId, bookingId } = req.params;
      const { status } = req.body;
      const lab = await labService.updateBookingStatus(labId, bookingId, status);
      res.json(lab);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getBooking(req, res) {
    try {
      const booking = await labService.getBooking(req.params.labId, req.params.bookingId);
      res.json(booking);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async cancelBooking(req, res) {
    try {
      const lab = await labService.cancelBooking(req.params.labId, req.params.bookingId);
      res.json({ message: 'Booking cancelled successfully', lab });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new LabController();