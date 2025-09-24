const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seen: { type: Boolean, default: false }
});

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  msg: { type: String, required: true },
  to: [recipientSchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);