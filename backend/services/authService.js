const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const TO = require('../models/TO');

class AuthService {
  async registerLecturer({ email, password, lec_id, name, department, courses }) {
    const profile = await Lecturer.create({ lec_id, name, email, department, courses });
    return await this.createUser(email, password, 'lecturer', profile._id, 'Lecturer');
  }

  async registerAdmin({ email, password, admin_id, name }) {
    const profile = await Admin.create({ admin_id, name, email });
    return await this.createUser(email, password, 'admin', profile._id, 'Admin');
  }

  async registerStudent({ email, password, reg_num, name, department, semester, batch }) {
    const profile = await Student.create({ reg_num, name, email, department, semester, batch });
    return await this.createUser(email, password, 'student', profile._id, 'Student');
  }

  async registerTO({ email, password, NIC, name }) {
    const profile = await TO.create({ NIC, name, email });
    return await this.createUser(email, password, 'to', profile._id, 'TO');
  }

  async getAdminById(id) {
    return await Admin.findById(id);
  }
  
  async getLecturerById(id) {
    return await Lecturer.findById(id);
  }

  async getStudentById(id) {
    return await Student.findById(id);
  }

  async getToById(id) {
    return await TO.findById(id);
  }

  async createUser(email, password, role, profileId, roleModel) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User({
      email,
      password,
      role,
      profile: profileId,
      roleModel
    });
    await user.save();
    return this.generateToken(user);
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return this.generateToken(user);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, profile: user.profile },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
}

module.exports = new AuthService();