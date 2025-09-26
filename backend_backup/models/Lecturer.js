const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema({
  lec_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  courses: [{ type: String }]
});

module.exports = mongoose.model('Lecturer', lecturerSchema);