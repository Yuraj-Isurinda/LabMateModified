const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAsSeen(req, res) {
    try {
      const notification = await notificationService.markAsSeen(req.params.id, req.user.id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();