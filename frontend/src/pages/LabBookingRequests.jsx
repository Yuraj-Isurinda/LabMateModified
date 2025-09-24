import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const LabBookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch pending lab bookings
  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/labs');
      const pendingBookings = response.data
        .flatMap((lab) =>
          lab.bookings
            .filter((booking) => booking.status === 'pending')
            .map((booking) => ({
              labId: lab._id,
              labName: lab.lab_name,
              bookingId: booking._id,
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
              additionalRequirements: booking.additionalRequirements || 'None',
              bookBy: booking.bookBy?.email || 'Unknown',
            }))
        );
      setBookings(pendingBookings);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      message.error('Failed to load booking requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  // Show modals
  const showAcceptModal = (booking) => {
    setSelectedBooking(booking);
    setIsAcceptModalOpen(true);
  };

  const showRejectModal = (booking) => {
    setSelectedBooking(booking);
    setIsRejectModalOpen(true);
  };

  const showViewModal = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle modal actions
  const handleAcceptOk = async () => {
    if (!selectedBooking) return;
    try {
      await api.put(`/labs/${selectedBooking.labId}/bookings/${selectedBooking.bookingId}/status`, { status: 'accepted' });
      message.success('Booking accepted successfully!');
      setIsAcceptModalOpen(false);
      setSelectedBooking(null);
      fetchPendingBookings(); // Refresh the table
    } catch (error) {
      console.error('Error accepting booking:', error);
      message.error('Failed to accept booking. Please try again.');
    }
  };

  const handleRejectOk = async () => {
    if (!selectedBooking) return;
    try {
      await api.put(`/labs/${selectedBooking.labId}/bookings/${selectedBooking.bookingId}/status`, { status: 'rejected' });
      message.success('Booking rejected successfully!');
      setIsRejectModalOpen(false);
      setSelectedBooking(null);
      fetchPendingBookings(); // Refresh the table
    } catch (error) {
      console.error('Error rejecting booking:', error);
      message.error('Failed to reject booking. Please try again.');
    }
  };

  const handleModalCancel = () => {
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };

  // Table columns
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            type="primary"
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
            icon={<FontAwesomeIcon icon={faCheck} />}
            onClick={() => showAcceptModal(record)}
          >
            Accept
          </Button>
          <Button
            type="danger"
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
            icon={<FontAwesomeIcon icon={faTimes} />}
            onClick={() => showRejectModal(record)}
          >
            Reject
          </Button>
          <Button
            type="default"
            style={{ borderColor: '#5581e9', color: '#5581e9' }}
            icon={<FontAwesomeIcon icon={faEye} />}
            onClick={() => showViewModal(record)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="lab-booking-requests" >
      <div className="welcome-card" >
        <div className="welcome-text">
          <h2>Lab Booking Requests</h2>
          <p>Control all the labs in here</p>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey={(record) => record.bookingId}
        loading={loading}
        locale={{ emptyText: 'No pending booking requests found.' }}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: '20px' }}
      />

      {/* Accept Confirmation Modal */}
      <Modal
        title="Confirm Acceptance"
        open={isAcceptModalOpen}
        onOk={handleAcceptOk}
        onCancel={handleModalCancel}
        okText="Accept"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        cancelButtonProps={{ style: { borderColor: '#ff4d4f', color: '#ff4d4f' } }}
      >
        <p>Are you sure you want to accept this booking for <strong>{selectedBooking?.labName}</strong> on <strong>{selectedBooking?.date}</strong> from <strong>{selectedBooking?.duration}</strong>?</p>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        title="Confirm Rejection"
        open={isRejectModalOpen}
        onOk={handleRejectOk}
        onCancel={handleModalCancel}
        okText="Reject"
        okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
        cancelButtonProps={{ style: { borderColor: '#5581e9', color: '#5581e9' } }}
      >
        <p>Are you sure you want to reject this booking for <strong>{selectedBooking?.labName}</strong> on <strong>{selectedBooking?.date}</strong> from <strong>{selectedBooking?.duration}</strong>?</p>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Booking Details"
        open={isViewModalOpen}
        onOk={handleModalCancel}
        onCancel={handleModalCancel}
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
            <p><strong>Additional Requirements:</strong> {selectedBooking.additionalRequirements}</p>
            <p><strong>Booked By:</strong> {selectedBooking.bookBy}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabBookingRequests;