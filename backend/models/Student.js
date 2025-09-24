const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  reg_num: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  batch: { type: String, required: true },
  reg_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);