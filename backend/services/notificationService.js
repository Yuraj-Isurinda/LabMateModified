const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');

class NotificationService {
  async createNotification(title, msg, toUsers) {
    const to = toUsers.map(userId => ({ user: userId, seen: false }));
    return await Notification.create({ title, msg, to, date: new Date() });
  }

  async markAsSeen(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    const recipient = notification.to.find(r => r.user.toString() === userId);
    if (!recipient) throw new Error('User not found in notification recipients');

    recipient.seen = true;
    return await notification.save();
  }

  async getUserNotifications(userId) {
    return await Notification.find({ 'to.user': userId })
      .populate('to.user', 'email role')
      .sort({ date: -1 });
  }

  async notifyLabBookingCreated(bookingData, lab) {
    const tos = await User.find({ role: 'to' });
    const toIds = tos.map(to => to._id);
    return await this.createNotification(
      'New Lab Booking Request',
      `New booking request for ${lab.lab_name} on ${new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} from ${bookingData.duration.from} to ${bookingData.duration.to}`,
      toIds
    );
  }

  async notifyLabBookingStatus(bookingData, lab, requesterId, status) {
    // Notification for the requester
    await this.createNotification(
      `Lab Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your booking for ${lab.lab_name} on ${new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} from ${bookingData.duration.from} to ${bookingData.duration.to} has been ${status}`,
      [requesterId]
    );

    // If the booking is accepted, notify students in the batch
    if (status === 'accepted') {
      const students = await Student.find({ batch: bookingData.bookForBatch });
      const studentUserIds = await Promise.all(
        students.map(async s => {
          const user = await User.findOne({ profile: s._id });
          return user ? user._id : null;
        })
      );

      // Filter out any null values (in case a user isn't found)
      const validStudentUserIds = studentUserIds.filter(id => id !== null);

      if (validStudentUserIds.length > 0) {
        await this.createNotification(
          'Lab Session Scheduled',
          `A lab session has been scheduled for your batch (${bookingData.bookForBatch}) in ${lab.lab_name} on ${new Date(bookingData.date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })} from ${bookingData.duration.from} to ${bookingData.duration.to} for ${bookingData.bookForCourse}`,
          validStudentUserIds
        );
      }
    }
  }

  async notifyBorrowRequestCreated(equipment, borrowingData, requesterId) {
    const tos = await User.find({ role: 'to' });
    const toIds = tos.map(to => to._id);
    return await this.createNotification(
      'New Equipment Borrow Request',
      `New borrow request for ${equipment.name} (${borrowingData.num_of_items} items) on ${new Date(borrowingData.borrow_date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`,
      toIds
    );
  }

  async notifyBorrowRequestStatus(equipment, borrowingData, requesterId, status) {
    // Notification for the requester
    await this.createNotification(
      `Equipment Borrow Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your request to borrow ${equipment.name} (${borrowingData.num_of_items} items) on ${new Date(borrowingData.borrow_date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} has been ${status}${borrowingData.return_date ? ` (to be returned by ${new Date(borrowingData.return_date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })})` : ''}`,
      [requesterId]
    );

    // If the borrowing request is accepted, notify students in the batch (if applicable)
    if (status === 'accepted' && borrowingData.bookForBatch) {
      const students = await Student.find({ batch: borrowingData.bookForBatch });
      const studentUserIds = await Promise.all(
        students.map(async s => {
          const user = await User.findOne({ profile: s._id });
          return user ? user._id : null;
        })
      );

      // Filter out any null values (in case a user isn't found)
      const validStudentUserIds = studentUserIds.filter(id => id !== null);

      if (validStudentUserIds.length > 0) {
        await this.createNotification(
          'Equipment Borrowed for Your Batch',
          `Equipment ${equipment.name} (${borrowingData.num_of_items} items) has been borrowed for your batch (${borrowingData.bookForBatch}) on ${new Date(borrowingData.borrow_date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}${borrowingData.return_date ? ` and will be returned by ${new Date(borrowingData.return_date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}` : ''}${borrowingData.purpose ? ` for the purpose: ${borrowingData.purpose}` : ''}`,
          validStudentUserIds
        );
      }
    }
  }
}

module.exports = new NotificationService();