import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Input, Form, Table, message, Typography, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const { Title, Text } = Typography;

export default function LecturerManagement() {
  const [lecturers, setLecturers] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch lecturers from API
  const fetchLecturers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/lecturers');
      console.log('Lecturers fetched:', response.data);
      const fetchedLecturers = Array.isArray(response.data)
        ? response.data.map((lecturer) => ({
            lec_id: lecturer.lec_id || 'Unknown ID',
            name: lecturer.name || 'Unknown Name',
            email: lecturer.email || 'N/A',
            department: lecturer.department || 'N/A',
            courses: lecturer.courses || [],
            id: lecturer._id,
          }))
        : [];
      setLecturers(fetchedLecturers);
      setFilteredLecturers(fetchedLecturers);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      console.log('Error details:', error.message, error.response);
      let errorMessage = 'Failed to load lecturers. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection or server status.';
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  // Filter lecturers based on search keyword
  useEffect(() => {
    const filtered = lecturers.filter((lecturer) => {
      if (!lecturer || !lecturer.name) return false;
      return lecturer.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
    setFilteredLecturers(filtered);
  }, [lecturers, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Show modals
  const showModal = () => {
    setIsModalOpen(true);
  };

  const showEditModal = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      lec_id: lecturer.lec_id,
      name: lecturer.name,
      email: lecturer.email,
      department: lecturer.department,
      courses: lecturer.courses.join(', '),
    });
    handleCancel();
  };

  const showDeleteModal = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showViewModal = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsViewModalOpen(true);
  };

  // Handle modal actions
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleEditOk = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        const updatedLecturer = {
          lec_id: values.lec_id,
          name: values.name,
          email: values.email,
          department: values.department,
          courses: values.courses
            ? values.courses.split(',').map((course) => course.trim())
            : [],
        };
        console.log('Updating lecturer with data:', updatedLecturer);
        try {
          await api.put(`/lecturers/${selectedLecturer.id}`, updatedLecturer);
          await fetchLecturers();
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedLecturer(null);
          message.success('Lecturer updated successfully!');
        } catch (error) {
          console.error('Error updating lecturer:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to update lecturer. Please try again.'
          );
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/lecturers/${selectedLecturer.id}`);
      await fetchLecturers();
      setIsDeleteModalOpen(false);
      setSelectedLecturer(null);
      message.success('Lecturer deleted successfully!');
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to delete lecturer. Please try again.'
      );
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        const newLecturer = {
          lec_id: values.lec_id,
          name: values.name,
          email: values.email,
          department: values.department,
          courses: values.courses
            ? values.courses.split(',').map((course) => course.trim())
            : [],
          password: values.password,
        };
        console.log('Adding lecturer with data:', newLecturer);
        try {
          await api.post('/auth/register/lecturer', newLecturer);
          await fetchLecturers();
          setIsAddModalOpen(false);
          addForm.resetFields();
          message.success('Lecturer added successfully!');
        } catch (error) {
          console.error('Error adding lecturer:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to add lecturer. Please try again.'
          );
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedLecturer(null);
    handleCancel();
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedLecturer(null);
    handleCancel();
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedLecturer(null);
  };

  // Toggle between Card and Table view
  const handleViewToggle = (checked) => {
    setViewMode(checked ? 'table' : 'card');
  };

  // Table columns for Table View
  const columns = [
    {
      title: 'Lecturer ID',
      dataIndex: 'lec_id',
      key: 'lec_id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
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
            onClick={() => showEditModal(record)}
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          >
            Edit
          </Button>
          <Button
            type="danger"
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => showDeleteModal(record)}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="lecturer-management-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Lecturer Management</h2>
          <p>Manage all lecturers here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Input
          placeholder="Search lecturers by name"
          value={searchKeyword}
          onChange={handleSearchChange}
          style={{ width: '300px' }}
          allowClear
          size="large"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Switch
            checked={viewMode === 'table'}
            onChange={handleViewToggle}
            checkedChildren="Table View"
            unCheckedChildren="Card View"
            defaultChecked 
          />
          <Button
            type="primary"
            icon={<FontAwesomeIcon icon={faPlus} />}
            onClick={showAddModal}
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
            size="large"
          >
            Add Lecturer
          </Button>
        </div>
      </div>

      {loading && <p>Loading lecturers...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && filteredLecturers.length === 0 && (
        <p>No lecturers found.</p>
      )}

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]} className="lecturer-cards">
          {filteredLecturers.map((lecturer, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={lecturer.id || index}>
              <Card
                onClick={() => showViewModal(lecturer)}
                title={lecturer.name}
                hoverable
                style={{ width: '100%' }}
                className="lecturer-card"
                extra={
                  <>
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faPenToSquare} />}
                      style={{ color: '#5581e9' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEditModal(lecturer);
                      }}
                    />
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(lecturer);
                      }}
                    />
                  </>
                }
              >
                <p><strong>Lecturer ID:</strong> {lecturer.lec_id}</p>
                <p><strong>Email:</strong> {lecturer.email}</p>
                <p><strong>Department:</strong> {lecturer.department}</p>
                <p><strong>Courses:</strong> {lecturer.courses.join(', ') || 'None'}</p>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredLecturers}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Lecturer Details"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>

      <Modal
        title="Do you want to delete?"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        centered
        okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
      >
        <p>Are you sure you want to delete this lecturer?</p>
      </Modal>

      <Modal
        title="Edit Lecturer"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        centered
        okText="Save"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Lecturer ID"
            name="lec_id"
            rules={[{ required: true, message: 'Please enter the lecturer ID' }]}
          >
            <Input placeholder="Enter lecturer ID (e.g., L001)" size="large" />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" size="large" />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please enter the department' }]}
          >
            <Input placeholder="Enter department" size="large" />
          </Form.Item>

          <Form.Item
            label="Courses (comma-separated)"
            name="courses"
          >
            <Input placeholder="Enter courses (e.g., CS101, CS102)" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Lecturer"
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        centered
        okText="Add"
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        className="custom-modal"
        closeIcon={false}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Lecturer ID"
            name="lec_id"
            rules={[{ required: true, message: 'Please enter the lecturer ID' }]}
          >
            <Input placeholder="Enter lecturer ID (e.g., L001)" size="large" />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" size="large" />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please enter the department' }]}
          >
            <Input placeholder="Enter department" size="large" />
          </Form.Item>

          <Form.Item
            label="Courses (comma-separated)"
            name="courses"
          >
            <Input placeholder="Enter courses (e.g., CS101, CS102)" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter the password' },
              { min: 6, message: 'Password must be at least 6 characters long' },
            ]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Lecturer Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedLecturer && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Lecturer ID:</strong> {selectedLecturer.lec_id}</p>
            <p><strong>Name:</strong> {selectedLecturer.name}</p>
            <p><strong>Email:</strong> {selectedLecturer.email}</p>
            <p><strong>Department:</strong> {selectedLecturer.department}</p>
            <p><strong>Courses:</strong> {selectedLecturer.courses.join(', ') || 'None'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}