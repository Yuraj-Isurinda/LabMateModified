const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  num_of_items: { type: Number, required: true },
  borrow_date: { type: Date, required: true },
  return_date: { type: Date },
  borrowed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  isNew: { 
    type: Boolean, 
    default: true 
  }
});

const equipmentSchema = new mongoose.Schema({
  item_num: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  img_url: { type: String },
  borrowings: [borrowingSchema]
});

module.exports = mongoose.model('Equipment', equipmentSchema);