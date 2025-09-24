import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Select, Alert } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHistory } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import api from '../services/api';
import { getUserProfile } from '../services/api';
import LabSheduleCalendar from '../components/LabSheduleCalendar';
import ScheduleHistory from '../components/ScheduleHistory';

const { Option } = Select;

export default function ScheduleLabs() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [labs, setLabs] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshBookings, setRefreshBookings] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile. Please try again.');
      }
    };

    fetchUserProfile();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await api.get('/labs');
      setLabs(response.data);
    } catch (error) {
      console.error('Error fetching labs:', error);
      setError(error.response?.data?.message || 'Failed to load labs. Please try again.');
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showEditModal = (booking, labId) => {
    setSelectedBooking({ ...booking, labId, bookingId: booking.bookingId || booking._id });
    setIsEditModalOpen(true);
    console.log(booking.date)
    let parsedDate = null;
    if (booking.date) {
      parsedDate = moment(booking.date, 'ddd, D MMM YYYY', true);
      if (!parsedDate.isValid()) {
        console.error('Invalid date format:', booking.date);
        parsedDate = null;
      }
    }

    editForm.setFieldsValue({
      bookForDept: booking.bookForDept,
      bookForBatch: booking.bookForBatch,
      bookForCourse: booking.bookForCourse,
      reason: booking.reason,
      date: parsedDate,
      duration: {
        from: booking.duration ? booking.duration.split(' - ')[0] : '',
        to: booking.duration ? booking.duration.split(' - ')[1] : '',
      },
      additionalRequirements: booking.additionalRequirements || '',
    });
  };

  const showDeleteModal = (booking, labId) => {
    setSelectedBooking({ ...booking, labId, bookingId: booking.bookingId || booking._id });
    setIsDeleteModalOpen(true);
  };

  const handleTimeInput = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9:]/g, '');
    const currentLength = value.length;

    if (currentLength > 5) return;

    let digits = value.replace(':', '');
    if (digits.length > 4) digits = digits.slice(0, 4);

    if (digits.length > 2) {
      value = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else {
      value = digits;
    }

    addForm.setFieldsValue({
      duration: { ...addForm.getFieldValue('duration'), [fieldName]: value },
    });

    if (value.length === 5) {
      const [hours, minutes] = value.split(':').map(Number);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (timeStr < '08:00' || timeStr > '20:00' || hours > 23 || minutes > 59) {
        addForm.setFields([
          {
            name: ['duration', fieldName],
            errors: ['Time must be between 08:00 and 20:00'],
          },
        ]);
      } else {
        addForm.setFields([
          { name: ['duration', fieldName], errors: [] },
        ]);
      }
    }
  };

  const handleEditTimeInput = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9:]/g, '');
    const currentLength = value.length;

    if (currentLength > 5) return;

    let digits = value.replace(':', '');
    if (digits.length > 4) digits = digits.slice(0, 4);

    if (digits.length > 2) {
      value = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else {
      value = digits;
    }

    editForm.setFieldsValue({
      duration: { ...editForm.getFieldValue('duration'), [fieldName]: value },
    });

    if (value.length === 5) {
      const [hours, minutes] = value.split(':').map(Number);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (timeStr < '08:00' || timeStr > '20:00' || hours > 23 || minutes > 59) {
        editForm.setFields([
          {
            name: ['duration', fieldName],
            errors: ['Time must be between 08:00 and 20:00'],
          },
        ]);
      } else {
        editForm.setFields([
          { name: ['duration', fieldName], errors: [] },
        ]);
      }
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        console.log('Raw date from DatePicker:', values.date);
        const rawDate = new Date(values.date);
        const selectedDate = rawDate.toISOString();
        console.log('Formatted selectedDate:', selectedDate);

        const fromTime = values.duration.from;
        const toTime = values.duration.to;

        if (fromTime >= toTime) {
          setError('Start time must be before end time');
          return;
        }

        const newBooking = {
          bookBy: user.id,
          bookForDept: values.bookForDept,
          bookForBatch: values.bookForBatch,
          bookForCourse: values.bookForCourse,
          reason: values.reason,
          date: selectedDate,
          duration: {
            from: fromTime,
            to: toTime,
          },
          additionalRequirements: values.additionalRequirements || undefined,
        };

        console.log('Payload being sent:', newBooking);

        try {
          const response = await api.post(`/labs/${values.labId}/bookings`, newBooking);
          console.log('Booking created successfully:', response.data);
          setIsAddModalOpen(false);
          addForm.resetFields();
          setError(null);
          setSuccess('Booking request is sent.');
          fetchLabs();
          setRefreshBookings(true);
        } catch (error) {
          console.error('Error creating booking:', error.response || error);
          const errorMessage = error.response?.data?.error || 'Failed to create booking. Please try again.';
          setError(errorMessage);
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
        console.log('Raw date from DatePicker:', values.date);
        const rawDate = new Date(values.date);
        const selectedDate = rawDate.toISOString();
        console.log('Formatted selectedDate:', selectedDate);

        const fromTime = values.duration.from;
        const toTime = values.duration.to;

        if (fromTime >= toTime) {
          setError('Start time must be before end time');
          return;
        }

        const updatedBooking = {
          bookBy: selectedBooking.bookBy || user.id,
          bookForDept: values.bookForDept,
          bookForBatch: values.bookForBatch,
          bookForCourse: values.bookForCourse,
          reason: values.reason,
          date: selectedDate,
          duration: {
            from: fromTime,
            to: toTime,
          },
          additionalRequirements: values.additionalRequirements || undefined,
          status: selectedBooking.status || 'pending',
        };

        console.log('Payload being sent:', updatedBooking);

        try {
          const response = await api.put(`/labs/${selectedBooking.labId}/bookings/${selectedBooking.bookingId}`, updatedBooking);
          console.log('Update response:', response.data);
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedBooking(null);
          setError(null);
          setSuccess('Booking is rescheduled successfully!');
          fetchLabs();
          setRefreshBookings(true);
        } catch (error) {
          console.error('Error updating booking:', error);
          console.log('Server response:', error.response?.data);
          const errorMessage = error.response?.data?.error || 'Failed to update booking. Please try again.';
          setError(errorMessage);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/labs/${selectedBooking.labId}/bookings/${selectedBooking.bookingId}`);
      setIsDeleteModalOpen(false);
      setSelectedBooking(null);
      setError(null);
      setSuccess('Booking deleted successfully!');
      fetchLabs();
      setRefreshBookings(true);
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError(error.response?.data?.message || 'Failed to delete booking. Please try again.');
    }
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedBooking(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedBooking(null);
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
    <div className="schedule-labs-container" style={{ padding: '20px' }}>
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Schedule Labs</h2>
          <p>View and manage lab schedules here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={showAddModal}
          style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          size="large"
        >
          Schedule Lab
        </Button>
        <Button
          type="default"
          icon={<FontAwesomeIcon icon={faHistory} />}
          onClick={toggleView}
          size="large"
        >
          {showHistory ? 'All Schedules' : 'Browse History'}
        </Button>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
      {success && <Alert message={success} type="success" showIcon style={{ marginBottom: '10px' }} />}

      {showHistory ? (
        <ScheduleHistory onEdit={showEditModal} onDelete={showDeleteModal} refreshBookings={refreshBookings} />
      ) : (
        <LabSheduleCalendar onEdit={showEditModal} onDelete={showDeleteModal} />
      )}

      <Modal
        title="Schedule Lab"
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        centered
        okText="Schedule"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Lab"
            name="labId"
            rules={[{ required: true, message: 'Please select a lab' }]}
          >
            <Select placeholder="Select a lab" size="large">
              {labs.map((lab) => (
                <Option key={lab._id} value={lab._id}>
                  {lab.lab_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="For which department"
            name="bookForDept"
            rules={[{ required: true, message: 'Please enter the department' }]}
          >
            <Input placeholder="Enter department" size="large" />
          </Form.Item>

          <Form.Item
            label="For which batch"
            name="bookForBatch"
            rules={[{ required: true, message: 'Please enter the batch' }]}
          >
            <Input placeholder="Enter batch (e.g., 2023)" size="large" />
          </Form.Item>

          <Form.Item
            label="For which course"
            name="bookForCourse"
            rules={[{ required: true, message: 'Please enter the course' }]}
          >
            <Input placeholder="Enter course (e.g., CS101)" size="large" />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter the reason' }]}
          >
            <Input placeholder="Enter reason for booking" size="large" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select the date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => addForm.setFieldsValue({ date })}
            />
          </Form.Item>

          <Form.Item
            label="Start Time (HH:mm, 08:00 - 20:00)"
            name={['duration', 'from']}
            rules={[{ required: true, message: 'Please enter the start time' }]}
          >
            <Input
              placeholder="e.g., 09:00"
              size="large"
              maxLength={5}
              onChange={(e) => handleTimeInput(e, 'from')}
            />
          </Form.Item>

          <Form.Item
            label="End Time (HH:mm, 08:00 - 20:00)"
            name={['duration', 'to']}
            rules={[{ required: true, message: 'Please enter the end time' }]}
          >
            <Input
              placeholder="e.g., 10:00"
              size="large"
              maxLength={5}
              onChange={(e) => handleTimeInput(e, 'to')}
            />
          </Form.Item>

          <Form.Item label="Additional Requirements" name="additionalRequirements">
            <Input placeholder="Enter additional requirements (optional)" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reschedule Lab"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        centered
        okText="Reschedule"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Department"
            name="bookForDept"
            rules={[{ required: true, message: 'Please enter the department' }]}
          >
            <Input placeholder="Enter department" size="large" />
          </Form.Item>

          <Form.Item
            label="Batch"
            name="bookForBatch"
            rules={[{ required: true, message: 'Please enter the batch' }]}
          >
            <Input placeholder="Enter batch (e.g., 2023)" size="large" />
          </Form.Item>

          <Form.Item
            label="Course"
            name="bookForCourse"
            rules={[{ required: true, message: 'Please enter the course' }]}
          >
            <Input placeholder="Enter course (e.g., CS101)" size="large" />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter the reason' }]}
          >
            <Input placeholder="Enter reason for booking" size="large" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select the date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              onChange={(date) => editForm.setFieldsValue({ date })}
            />
          </Form.Item>

          <Form.Item
            label="Start Time (HH:mm, 08:00 - 20:00)"
            name={['duration', 'from']}
            rules={[{ required: true, message: 'Please enter the start time' }]}
          >
            <Input
              placeholder="e.g., 09:00"
              size="large"
              maxLength={5}
              onChange={(e) => handleEditTimeInput(e, 'from')}
            />
          </Form.Item>

          <Form.Item
            label="End Time (HH:mm, 08:00 - 20:00)"
            name={['duration', 'to']}
            rules={[{ required: true, message: 'Please enter the end time' }]}
          >
            <Input
              placeholder="e.g., 10:00"
              size="large"
              maxLength={5}
              onChange={(e) => handleEditTimeInput(e, 'to')}
            />
          </Form.Item>

          <Form.Item label="Additional Requirements" name="additionalRequirements">
            <Input placeholder="Enter additional requirements (optional)" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cancel Lab Booking"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        centered
        okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
      >
        <p>Are you sure you want to cancel this lab booking?</p>
      </Modal>
    </div>
  );
}