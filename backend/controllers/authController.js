const authService = require('../services/authService');

class AuthController {
  async registerLecturer(req, res) {
    try {
      const token = await authService.registerLecturer(req.body);
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async registerAdmin(req, res) {
    try {
      const token = await authService.registerAdmin(req.body);
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async registerStudent(req, res) {
    try {
      const token = await authService.registerStudent(req.body);
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async registerTO(req, res) {
    try {
      const token = await authService.registerTO(req.body);
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAdminById(req, res) {
    try {
      const admin = await authService.getAdminById(req.params.id);
      if (!admin) throw new Error('Admin not found');
      res.json(admin);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getLecturerById(req, res) {
    try {
      const admin = await authService.getLecturerById(req.params.id);
      if (!admin) throw new Error('Lecturer not found');
      res.json(admin);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getStudentById(req, res) {
    try {
      const admin = await authService.getStudentById(req.params.id);
      if (!admin) throw new Error('Student not found');
      res.json(admin);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getToById(req, res) {
    try {
      const admin = await authService.getToById(req.params.id);
      if (!admin) throw new Error('TO not found');
      res.json(admin);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();