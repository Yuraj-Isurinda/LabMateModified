import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHistory } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import api from '../services/api';
import EquipmentBookCalendar from '../components/EquipmentBookCalendar';
import BorrowingHistory from '../components/BorrowingHistory';

const { Option } = Select;

export default function BookEquipment() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showHistory, setShowHistory] = useState(false);
  const [refreshBookings, setRefreshBookings] = useState(false);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError(error.response?.data?.message || 'Failed to load equipment. Please try again.');
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showEditModal = (borrowing, equipmentId) => {
    setSelectedBorrowing({ ...borrowing, equipmentId });
    setIsEditModalOpen(true);

    let parsedBorrowDate = null;
    let parsedReturnDate = null;
    if (borrowing.borrow_date) {
      parsedBorrowDate = moment(borrowing.borrow_date, 'YYYY-MM-DD', true);
      console.log(parsedBorrowDate)
      if (!parsedBorrowDate.isValid()) {
        console.error('Invalid borrow date format:', borrowing.borrow_date);
        parsedBorrowDate = null;
      }
    }
    if (borrowing.return_date) {
      parsedReturnDate = moment(borrowing.return_date, 'YYYY-MM-DD', true);
      if (!parsedReturnDate.isValid()) {
        console.error('Invalid return date format:', borrowing.return_date);
        parsedReturnDate = null;
      }
    }

    

    editForm.setFieldsValue({
      num_of_items: borrowing.num_of_items,
      borrow_date: parsedBorrowDate,
      return_date: parsedReturnDate,
    });
  };

  const showDeleteModal = (borrowing, equipmentId) => {
    const borrowingWithId = { ...borrowing, equipmentId };
    console.log('Borrowing passed to delete:', borrowingWithId);
    setSelectedBorrowing(borrowingWithId);
    setIsDeleteModalOpen(true);
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        console.log('Raw borrow date from DatePicker:', values.borrow_date);
        const rawBorrowDate = new Date(values.borrow_date);
        const selectedBorrowDate = rawBorrowDate.toISOString();
        const rawReturnDate = values.return_date ? new Date(values.return_date) : null;
        const selectedReturnDate = rawReturnDate ? rawReturnDate.toISOString() : null;

        console.log('Formatted selectedBorrowDate:', selectedBorrowDate);
        console.log('Formatted selectedReturnDate:', selectedReturnDate);

        const newBorrowing = {
          num_of_items: Number(values.num_of_items),
          borrow_date: selectedBorrowDate,
          return_date: selectedReturnDate,
        };

        console.log('Payload being sent:', newBorrowing);

        try {
          await api.post(`/equipment/${values.equipmentId}/borrow`, newBorrowing);
          setIsAddModalOpen(false);
          addForm.resetFields();
          setError(null);
          fetchEquipment();
          setRefreshBookings(true);
        } catch (error) {
          console.error('Error creating borrowing:', error);
          setError(error.response?.data?.error || 'Failed to create borrowing. Please try again.');
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleEditOk = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        console.log('Raw borrow date from DatePicker:', values.borrow_date);
        const rawBorrowDate = new Date(values.borrow_date);
        const selectedBorrowDate = rawBorrowDate.toISOString();
        const rawReturnDate = values.return_date ? new Date(values.return_date) : null;
        const selectedReturnDate = rawReturnDate ? rawReturnDate.toISOString() : null;

        console.log('Formatted selectedBorrowDate:', selectedBorrowDate);
        console.log('Formatted selectedReturnDate:', selectedReturnDate);

        const updatedBorrowing = {
          num_of_items: Number(values.num_of_items),
          borrow_date: selectedBorrowDate,
          return_date: selectedReturnDate,
        };

        console.log('Payload being sent:', updatedBorrowing);

        try {
          await api.put(`/equipment/${selectedBorrowing.equipmentId}/borrowings/${selectedBorrowing._id}`, updatedBorrowing);
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedBorrowing(null);
          setError(null);
          fetchEquipment();
          setRefreshBookings(true);
        } catch (error) {
          console.error('Error updating borrowing:', error);
          setError(error.response?.data?.message || 'Number of item limit exceeded. Try again with decreasing number of items!');
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      if (!selectedBorrowing || !selectedBorrowing._id) {
        throw new Error('No valid borrowing ID found');
      }

      const url = `/equipment/${selectedBorrowing.equipmentId}/borrowings/${selectedBorrowing._id}`;
      console.log('Delete URL:', url);
      await api.delete(url);
      setIsDeleteModalOpen(false);
      setSelectedBorrowing(null);
      setError(null);
      fetchEquipment();
      setRefreshBookings(true);
    } catch (error) {
      console.error('Error deleting borrowing:', error);
      setError(error.response?.data?.message || 'Failed to delete borrowing. Please try again.');
    }
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedBorrowing(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedBorrowing(null);
  };

  const toggleView = () => {
    setShowHistory(!showHistory);
  };

  useEffect(() => {
      if (refreshBookings) {
        setRefreshBookings(false);
      }
    }, [refreshBookings]);

  return (
    <div className="book-equipment-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Book Equipment</h2>
          <p>View and manage equipment bookings here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', gap: '10px' }}>
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={showAddModal}
          style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          size="large"
        >
          Book Equipment
        </Button>
        <Button
          type="default"
          icon={<FontAwesomeIcon icon={faHistory} />}
          onClick={toggleView}
          size="large"
        >
          {showHistory ? 'All Bookings' : 'Browse History'}
        </Button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showHistory ? (
        <BorrowingHistory onEdit={showEditModal} onDelete={showDeleteModal} refreshBookings={refreshBookings}/>
      ) : (
        <EquipmentBookCalendar onEdit={showEditModal} onDelete={showDeleteModal} />
      )}

      <Modal
        title="Book Equipment"
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        centered
        okText="Book"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Equipment"
            name="equipmentId"
            rules={[{ required: true, message: 'Please select equipment' }]}
          >
            <Select placeholder="Select equipment" size="large">
              {equipment.map((item) => (
                <Option key={item._id} value={item._id}>
                  {item.name} ({item.quantity} available)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Number of Items"
            name="num_of_items"
            rules={[{ required: true, message: 'Please enter number of items' }]}
          >
            <Input type="number" placeholder="Enter number of items" min={1} size="large" />
          </Form.Item>

          <Form.Item
            label="Borrow Date"
            name="borrow_date"
            rules={[{ required: true, message: 'Please select borrow date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => addForm.setFieldsValue({ borrow_date: date })}
            />
          </Form.Item>

          <Form.Item
            label="Return Date (Optional)"
            name="return_date"
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => addForm.setFieldsValue({ return_date: date })}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Equipment Booking"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        centered
        okText="Update"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Number of Items"
            name="num_of_items"
            rules={[{ required: true, message: 'Please enter number of items' }]}
          >
            <Input type="number" placeholder="Enter number of items" min={1} size="large" />
          </Form.Item>

          <Form.Item
            label="Borrow Date"
            name="borrow_date"
            rules={[{ required: true, message: 'Please select borrow date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => editForm.setFieldsValue({ borrow_date: date })}
            />
          </Form.Item>

          <Form.Item
            label="Return Date (Optional)"
            name="return_date"
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => editForm.setFieldsValue({ return_date: date })}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cancel Equipment Booking"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        centered
        okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
      >
        <p>Are you sure you want to cancel this equipment booking?</p>
      </Modal>
    </div>
  );
}