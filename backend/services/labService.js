const Lab = require('../models/Lab');
const notificationService = require('./notificationService');

class LabService {
  async createLab(labData) {
    return await Lab.create(labData);
  }

  async getLabById(id) {
    return await Lab.findById(id).populate('allocated_TO').populate('bookings.bookBy');
  }

  async getAllLabs() {
    return await Lab.find().populate('allocated_TO').populate('bookings.bookBy');
  }

  async updateLab(id, labData) {
    return await Lab.findByIdAndUpdate(id, labData, { new: true });
  }

  async deleteLab(id) {
    return await Lab.findByIdAndDelete(id);
  }

  async createBooking(labId, bookingData, requesterId) {
    const lab = await Lab.findById(labId);
    if (!lab) throw new Error('Lab not found');

    // Construct Date objects for overlap check
    const dateStr = new Date(bookingData.date).toISOString().split('T')[0]; // YYYY-MM-DD
    const newFrom = new Date(`${dateStr}T${bookingData.duration.from}:00Z`); // e.g., "2025-04-01T09:00:00Z"
    const newTo = new Date(`${dateStr}T${bookingData.duration.to}:00Z`);     // e.g., "2025-04-01T10:00:00Z"
    

    // Check for overlap with existing bookings
    const hasOverlap = lab.bookings.some(booking => {
        const bookingDateStr = new Date(booking.date).toISOString().split('T')[0]; // YYYY-MM-DD of existing booking
        const existingFrom = new Date(`${bookingDateStr}T${booking.duration.from}:00Z`);
        const existingTo = new Date(`${bookingDateStr}T${booking.duration.to}:00Z`);

        // Check if the dates match
        const isSameDate = dateStr === bookingDateStr;

        // If dates don't match, there can't be an overlap
        if (!isSameDate) return false;

        // Check for time overlap on the same date
        return newFrom < existingTo && newTo > existingFrom;
    });

    if (hasOverlap) throw new Error('Time slot already booked');

    bookingData.bookBy = requesterId;
    lab.bookings.push(bookingData);
    const updatedLab = await lab.save();

    await notificationService.notifyLabBookingCreated(bookingData, lab);

    return updatedLab;
}

  async acceptBooking(labId, bookingId, requesterId) {
    const lab = await Lab.findById(labId);
    if (!lab) throw new Error('Lab not found');

    const bookingIndex = lab.bookings.findIndex(b => b._id.toString() === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');

    const bookingData = lab.bookings[bookingIndex];
    await notificationService.notifyLabBookingAccepted(bookingData, lab, bookingData.bookBy);
    
    return lab;
  }
  
  async updateBooking(labId, bookingId, bookingData) {
    const lab = await Lab.findById(labId);
    if (!lab) throw new Error('Lab not found');

    const bookingIndex = lab.bookings.findIndex(b => b._id.toString() === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');

    // Update booking details
    lab.bookings[bookingIndex] = { ...lab.bookings[bookingIndex], ...bookingData };
    return await lab.save();
  }

  async updateBookingStatus(labId, bookingId, newStatus) {
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status value. Must be pending, accepted, or rejected');
    }

    try {
      // Find the lab
      const lab = await Lab.findById(labId);
      if (!lab) {
        throw new Error('Lab not found');
      }

      // Find the booking
      const bookingIndex = lab.bookings.findIndex(b => b._id.toString() === bookingId);
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }

      // Update the status
      lab.bookings[bookingIndex].status = newStatus;

      // Save the updated lab
      const updatedLab = await lab.save();

      // Send notification after successful update
      await notificationService.notifyLabBookingStatus(
        lab.bookings[bookingIndex], // bookingData
        lab, // lab
        lab.bookings[bookingIndex].bookBy, // requesterId
        newStatus // status
      );

      return updatedLab;
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  }

  async getBooking(labId, bookingId) {
    const lab = await Lab.findById(labId).populate('bookings.bookBy');
    if (!lab) throw new Error('Lab not found');

    const booking = lab.bookings.find(b => b._id.toString() === bookingId);
    if (!booking) throw new Error('Booking not found');
    
    return booking;
  }

  async cancelBooking(labId, bookingId) {
    const lab = await Lab.findById(labId);
    if (!lab) throw new Error('Lab not found');

    lab.bookings = lab.bookings.filter(b => b._id.toString() !== bookingId);
    return await lab.save();
  }
}

module.exports = new LabService();