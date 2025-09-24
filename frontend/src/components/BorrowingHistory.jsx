import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert, Typography, Input, Col, Card } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { getEquipment, getUserProfile } from '../services/api';
import { Empty } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

const BorrowingHistory = ({ onEdit, onDelete, refreshBookings }) => {
  const [user, setUser] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

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

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEquipment();
      if (user) {
        const userBorrowings = response.data.flatMap((item) =>
          item.borrowings
            .filter((borrowing) => borrowing.borrowed_by._id === user.id)
            .map((borrowing) => ({
              equipmentId: item._id,
              equipmentName: item.name,
              _id: borrowing._id, // Standardized to _id
              num_of_items: borrowing.num_of_items,
              borrow_date: new Date(borrowing.borrow_date).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              return_date: borrowing.return_date
                ? new Date(borrowing.return_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not Returned',
              status: borrowing.status,
            }))
        );
        setBorrowings(userBorrowings);
        setFilteredBorrowings(userBorrowings);
        console.log('User Borrowings:', userBorrowings); // Debug log
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load borrowings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch equipment and filter borrowings by the logged-in user
  useEffect(() => {
    

    if (user) {
      fetchEquipment();
    }
  }, [user]);

  useEffect(() => {
    if (refreshBookings) {
      fetchEquipment();
    }
  }, [refreshBookings]);

  // Filter borrowings based on search keyword
  useEffect(() => {
    const filtered = borrowings.filter((borrowing) => {
      const searchLower = searchKeyword.toLowerCase();
      return (
        borrowing.equipmentName.toLowerCase().includes(searchLower) ||
        borrowing.borrow_date.toLowerCase().includes(searchLower) ||
        (borrowing.status && borrowing.status.toLowerCase().includes(searchLower))
      );
    });
    setFilteredBorrowings(filtered);
  }, [searchKeyword, borrowings]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  // Show View Details modal
  const showViewModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsViewModalOpen(true);
  };

  // Handle modal close
  const handleViewCancel = () => {
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
      dataIndex: 'borrow_date',
      key: 'borrow_date',
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
            onClick={() => onEdit(record, record.equipmentId)}
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          >
            Edit
          </Button>
          <Button
            type="danger"
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => onDelete(record, record.equipmentId)}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="borrowing-history">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2} style={{ margin: 0 }}>Your Borrowing History</Title>
        <Search
          placeholder="Search by equipment name, borrow date, or status"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
          size="large"
        />
      </div>

      {loading && <Alert message="Loading borrowings..." type="info" showIcon />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}

      {filteredBorrowings.length === 0 && !loading && !error ? (
        <Col span={24}>
          <Card style={{ width: '100%' }} className="no-equipment-card">
            <Empty description="No borrowings found" style={{ textAlign: 'center' }} />
          </Card>
        </Col>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredBorrowings}
          rowKey={(record) => record._id} // Updated to _id
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Borrowing Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedBorrowing && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Equipment Name:</strong> {selectedBorrowing.equipmentName}</p>
            <p><strong>Number of Items:</strong> {selectedBorrowing.num_of_items}</p>
            <p><strong>Borrow Date:</strong> {selectedBorrowing.borrow_date}</p>
            <p><strong>Return Date:</strong> {selectedBorrowing.return_date}</p>
            <p><strong>Status:</strong> {selectedBorrowing.status || 'None'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BorrowingHistory;