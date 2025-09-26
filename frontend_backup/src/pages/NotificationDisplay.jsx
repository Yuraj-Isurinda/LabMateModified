import React, { useState, useEffect } from 'react';
import { List, Card, message, Typography, Col } from 'antd';
import { Empty } from 'antd';
import api from '../services/api';

const { Title, Text } = Typography;

const NotificationDisplay = () => {
  const [newNotifications, setNewNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications for the logged-in user
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch notifications using the GET /notifications route
      const response = await api.get('/notifications');
      const notifications = response.data;

      // Filter notifications for the logged-in user and format them
      const userNotifications = notifications.map((notification) => {
        const recipient = notification.to.find(
          (r) => r.user._id.toString() === notification.to[0].user._id // Assuming the user is in the recipients
        );
        if (!recipient) return null; // Skip notifications not intended for this user
        return {
          _id: notification._id,
          title: notification.title,
          msg: notification.msg,
          date: new Date(notification.date).toLocaleString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          seen: recipient.seen,
        };
      }).filter((notification) => notification !== null);

      // Separate new (unseen) and recent (seen) notifications
      const unseenNotifications = userNotifications.filter((n) => !n.seen);
      const seenNotifications = userNotifications.filter((n) => n.seen);

      setNewNotifications(unseenNotifications);
      setRecentNotifications(seenNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mark unseen notifications as seen after they are displayed
  const markNotificationsAsSeen = async () => {
    try {
      // Mark all unseen notifications as seen using the PUT /notifications/:id/seen route
      for (const notification of newNotifications) {
        await api.put(`/notifications/${notification._id}/seen`);
      }
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
      message.error('Failed to mark notifications as seen.');
    }
  };

  // Fetch notifications on initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notifications as seen after they are displayed
  useEffect(() => {
    if (newNotifications.length > 0) {
      markNotificationsAsSeen();
    }
  }, [newNotifications]);

  return (
    <div className="notification-display" style={{ margin: '0 auto' }}>
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Notifications</h2>
          <p></p>
        </div>
      </div>

      {/* New Notifications Section */}
      <div style={{ marginBottom: '40px', marginTop: '20px' }}>
        <Title level={4}>New Notifications</Title>
        {newNotifications.length === 0 ? (
          <Col span={24}>
            <Card style={{ width: '100%' }} className="no-equipment-card">
              <Empty description="No New notifications" style={{ textAlign: 'center' }} />
            </Card>
          </Col>
        ) : (
          <List
            loading={loading}
            dataSource={newNotifications}
            renderItem={(notification) => (
              <List.Item>
                <Card
                  title={notification.title}
                  style={{ width: '100%', backgroundColor: '#e6f7ff' }}
                >
                  <p>{notification.msg}</p>
                  <Text type="secondary">{notification.date}</Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Recent Notifications Section */}
      <div>
        <Title level={4}>Recent Notifications</Title>
        {recentNotifications.length === 0 ? (
          <Col span={24}>
            <Card style={{ width: '100%' }} className="no-equipment-card">
              <Empty description="No Recent notifications" style={{ textAlign: 'center' }} />
            </Card>
          </Col>
        ) : (
          <List
            loading={loading}
            dataSource={recentNotifications}
            renderItem={(notification) => (
              <List.Item>
                <Card title={notification.title} style={{ width: '100%' }}>
                  <p>{notification.msg}</p>
                  <Text type="secondary">{notification.date}</Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationDisplay;