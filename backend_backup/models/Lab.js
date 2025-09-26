const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookForDept: { type: String, required: true },
  bookForBatch: { type: String, required: true },
  bookForCourse: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true }, // Still a Date object for the day
  duration: {
    from: { type: String, required: true }, // e.g., "09:00"
    to: { type: String, required: true },   // e.g., "10:00"
  },
  additionalRequirements: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

const labSchema = new mongoose.Schema({
  lab_name: { type: String, required: true, unique: true },
  lab_type: { type: String, required: true },
  max_capacity: { type: Number, required: true },
  allocated_TO: { type: mongoose.Schema.Types.ObjectId, ref: 'TO', required: true },
  bookings: [bookingSchema]
});

module.exports = mongoose.model('Lab', labSchema);