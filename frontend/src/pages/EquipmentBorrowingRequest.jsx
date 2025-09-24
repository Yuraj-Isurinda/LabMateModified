import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const EquipmentBorrowingRequest = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  // Fetch pending equipment borrowing requests
  const fetchPendingBorrowings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/equipment');
      console.log('Borrowing requests:', response.data);
      const pendingBorrowings = response.data
        .flatMap((equipment) =>
          equipment.borrowings
            .filter((borrowing) => borrowing.status === 'pending')
            .map((borrowing) => ({
              equipmentId: equipment._id,
              equipmentName: equipment.name,
              borrowingId: borrowing._id,
              borrowDate: new Date(borrowing.borrow_date).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              numOfItems: borrowing.num_of_items,
              returnDate: borrowing.return_date
                ? new Date(borrowing.return_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not Returned',
              borrowedBy: borrowing.borrowed_by?.name || 'Unknown',
              purpose: borrowing.purpose || 'Not specified',
            }))
        );
      setBorrowings(pendingBorrowings);
    } catch (error) {
      console.error('Error fetching pending borrowings:', error);
      message.error('Failed to load borrowing requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBorrowings();
  }, []);

  // Show modals
  const showAcceptModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsAcceptModalOpen(true);
  };

  const showRejectModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsRejectModalOpen(true);
  };

  const showViewModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsViewModalOpen(true);
  };

  // Handle modal actions
  const handleAcceptOk = async () => {
    if (!selectedBorrowing) return;
    try {
      const response = await api.put(`/equipment/${selectedBorrowing.equipmentId}/borrowings/${selectedBorrowing.borrowingId}/status`, {
        status: 'accepted',
      });
      console.log('Accept response:', response.data);
      message.success('Borrowing request accepted successfully!');
      setIsAcceptModalOpen(false);
      setSelectedBorrowing(null);
      fetchPendingBorrowings(); // Refresh the table
    } catch (error) {
      console.error('Error accepting borrowing:', error);
      message.error('Failed to accept borrowing request. Please try again.');
    }
  };

  const handleRejectOk = async () => {
    if (!selectedBorrowing) return;
    try {
      await api.put(`/equipment/${selectedBorrowing.equipmentId}/borrowings/${selectedBorrowing.borrowingId}/status`, {
        status: 'rejected',
      });
      message.success('Borrowing request rejected successfully!');
      setIsRejectModalOpen(false);
      setSelectedBorrowing(null);
      fetchPendingBorrowings(); // Refresh the table
    } catch (error) {
      console.error('Error rejecting borrowing:', error);
      message.error('Failed to reject borrowing request. Please try again.');
    }
  };

  const handleModalCancel = () => {
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedBorrowing(null);
  };

  // Table columns
  const columns = [
    {
      title: 'Equipment Name',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: 'Borrow Date',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
    },
    {
      title: 'Number of Items',
      dataIndex: 'numOfItems',
      key: 'numOfItems',
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
    <div className="equipment-borrowing-requests" style={{ padding: '20px' }}>
      <h2>Equipment Borrowing Requests</h2>
      <Table
        columns={columns}
        dataSource={borrowings}
        rowKey={(record) => record.borrowingId}
        loading={loading}
        locale={{ emptyText: 'No pending borrowing requests found.' }}
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
        <p>
          Are you sure you want to accept this borrowing request for <strong>{selectedBorrowing?.equipmentName}</strong> on{' '}
          <strong>{selectedBorrowing?.borrowDate}</strong> for <strong>{selectedBorrowing?.numOfItems}</strong> items?
        </p>
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
        <p>
          Are you sure you want to reject this borrowing request for <strong>{selectedBorrowing?.equipmentName}</strong> on{' '}
          <strong>{selectedBorrowing?.borrowDate}</strong> for <strong>{selectedBorrowing?.numOfItems}</strong> items?
        </p>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Borrowing Request Details"
        open={isViewModalOpen}
        onOk={handleModalCancel}
        onCancel={handleModalCancel}
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedBorrowing && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Equipment Name:</strong> {selectedBorrowing.equipmentName}</p>
            <p><strong>Borrow Date:</strong> {selectedBorrowing.borrowDate}</p>
            <p><strong>Number of Items:</strong> {selectedBorrowing.numOfItems}</p>
            <p><strong>Return Date:</strong> {selectedBorrowing.returnDate}</p>
            <p><strong>Borrowed By:</strong> {selectedBorrowing.borrowedBy}</p>
            <p><strong>Purpose:</strong> {selectedBorrowing.purpose}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentBorrowingRequest;