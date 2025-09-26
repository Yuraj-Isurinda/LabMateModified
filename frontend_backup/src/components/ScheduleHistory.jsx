import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert, Typography, Input, Col, Card } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { getLabs, getUserProfile } from '../services/api';
import { Empty } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

const ScheduleHistory = ({ onEdit, onDelete, refreshBookings }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch the current user's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfile();
        setUser(response);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLabs();
      if (user) {
        const userBookings = response.data.flatMap((lab) =>
          lab.bookings
            .filter((booking) => booking.bookBy._id === user.id)
            .map((booking) => ({
              labId: lab._id,
              labName: lab.lab_name,
              bookingId: booking._id,
              bookBy: booking.bookBy._id, // Include bookBy for editing
              date: new Date(booking.date).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              duration: `${booking.duration.from} - ${booking.duration.to}`,
              bookForDept: booking.bookForDept,
              bookForBatch: booking.bookForBatch,
              bookForCourse: booking.bookForCourse,
              reason: booking.reason,
              additionalRequirements: booking.additionalRequirements,
              status: booking.status,
            }))
        );
        setBookings(userBookings);
        setFilteredBookings(userBookings);
        console.log('User Bookings:', userBookings);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Fetch labs and filter bookings by the logged-in user
  useEffect(() => {
    

    if (user) {
      fetchLabs();
    }
  }, [user]);

  useEffect(() => {
    if (refreshBookings) {
      fetchLabs();
    }
  }, [refreshBookings]);

  // Filter bookings based on search keyword
  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const searchLower = searchKeyword.toLowerCase();
      return (
        booking.labName.toLowerCase().includes(searchLower) ||
        booking.date.toLowerCase().includes(searchLower) ||
        (booking.status && booking.status.toLowerCase().includes(searchLower))
      );
    });
    setFilteredBookings(filtered);
  }, [searchKeyword, bookings]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  // Show View Details modal
  const showViewModal = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle modal close
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };

  // Table columns (subset of details)
  const columns = [
    {
      title: 'Lab Name',
      dataIndex: 'labName',
      key: 'labName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status || 'None',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            type="primary"
            icon={<FontAwesomeIcon icon={faEye} />}
            onClick={() => showViewModal(record)}
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<FontAwesomeIcon icon={faPenToSquare} />}
            onClick={() => onEdit(record, record.labId)}
            disabled={record.status !== "pending"} 
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          >
            Reschedule
          </Button>
          <Button
            type="danger"
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => onDelete(record, record.labId)}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="schedule-history">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2} style={{ margin: 0 }}>Your Scheduling History</Title>
        <Search
          placeholder="Search by lab name, date, or status"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
          size="large"
        />
      </div>

      {loading && <Alert message="Loading bookings..." type="info" showIcon />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}

      {filteredBookings.length === 0 && !loading && !error ? (
        <Col span={24}>
          <Card style={{ width: '100%' }} className="no-equipment-card">
            <Empty description="No bookings found" style={{ textAlign: 'center' }} />
          </Card>
        </Col>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey={(record) => record.bookingId}
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Booking Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedBooking && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Lab Name:</strong> {selectedBooking.labName}</p>
            <p><strong>Date:</strong> {selectedBooking.date}</p>
            <p><strong>Time:</strong> {selectedBooking.duration}</p>
            <p><strong>Department:</strong> {selectedBooking.bookForDept}</p>
            <p><strong>Batch:</strong> {selectedBooking.bookForBatch}</p>
            <p><strong>Course:</strong> {selectedBooking.bookForCourse}</p>
            <p><strong>Reason:</strong> {selectedBooking.reason}</p>
            <p><strong>Additional Requirements:</strong> {selectedBooking.additionalRequirements || 'None'}</p>
            <p><strong>Status:</strong> {selectedBooking.status || 'None'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScheduleHistory;