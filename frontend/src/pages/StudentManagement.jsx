import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Input, Form, Table, message, Typography, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const { Title, Text } = Typography;

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching students...');
      const response = await api.get('/students');
      console.log('Full API Response:', response);

      const fetchedStudents = Array.isArray(response.data)
        ? response.data.map((student) => ({
            reg_num: student.reg_num || 'Unknown Reg Number',
            name: student.name || 'Unknown Name',
            email: student.email || 'N/A',
            department: student.department || 'N/A',
            semester: student.semester || 0,
            batch: student.batch || 'N/A',
            reg_date: student.reg_date || 'N/A',
            id: student._id,
          }))
        : [];

      console.log('Processed students:', fetchedStudents);
      setStudents(fetchedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.log('Server response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load students.');
      setStudents([]);
    } finally {
      console.log('Fetching students completed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search keyword
  useEffect(() => {
    const filtered = students.filter((student) => {
      if (!student || !student.name) return false;
      return student.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
    setFilteredStudents(filtered);
  }, [students, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Show modals
  const showModal = () => {
    setIsModalOpen(true);
  };

  const showEditModal = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      reg_num: student.reg_num,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      batch: student.batch,
    });
    handleCancel();
  };

  const showDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showViewModal = (student) => {
    setSelectedStudent(student);
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
        const updatedStudent = {
          reg_num: values.reg_num,
          name: values.name,
          email: values.email,
          department: values.department,
          semester: Number(values.semester),
          batch: values.batch,
        };
        console.log('Updating student with data:', updatedStudent);
        try {
          await api.put(`/students/${selectedStudent.id}`, updatedStudent);
          await fetchStudents();
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedStudent(null);
          message.success('Student updated successfully!');
        } catch (error) {
          console.error('Error updating student:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to update student. Please try again.'
          );
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      await fetchStudents();
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      message.success('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to delete student. Please try again.'
      );
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        const newStudent = {
          reg_num: values.reg_num,
          name: values.name,
          email: values.email,
          department: values.department,
          semester: Number(values.semester),
          batch: values.batch,
          password: values.password,
        };
        console.log('Adding student with data:', newStudent);
        try {
          await api.post('/auth/register/student', newStudent);
          await fetchStudents();
          setIsAddModalOpen(false);
          addForm.resetFields();
          message.success('Student added successfully!');
        } catch (error) {
          console.error('Error adding student:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to add student. Please try again.'
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
    setSelectedStudent(null);
    handleCancel();
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedStudent(null);
    handleCancel();
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedStudent(null);
  };

  // Toggle between Card and Table view
  const handleViewToggle = (checked) => {
    setViewMode(checked ? 'table' : 'card');
  };

  // Table columns for Table View
  const columns = [
    {
      title: 'Reg Number',
      dataIndex: 'reg_num',
      key: 'reg_num',
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
    <div className="student-management-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Student Management</h2>
          <p>Manage all students here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Input
          placeholder="Search students by name"
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
          />
          <Button
            type="primary"
            icon={<FontAwesomeIcon icon={faPlus} />}
            onClick={showAddModal}
            style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
            size="large"
          >
            Add Student
          </Button>
        </div>
      </div>

      {loading && <p>Loading students...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]} className="student-cards">
          {filteredStudents.map((student, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={student.id || index}>
              <Card
                onClick={() => showViewModal(student)}
                title={student.name}
                hoverable
                style={{ width: '100%' }}
                className="student-card"
                extra={
                  <>
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faPenToSquare} />}
                      style={{ color: '#5581e9' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEditModal(student);
                      }}
                    />
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(student);
                      }}
                    />
                  </>
                }
              >
                <p><strong>Reg Number:</strong> {student.reg_num}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Department:</strong> {student.department}</p>
                <p><strong>Semester:</strong> {student.semester}</p>
                <p><strong>Batch:</strong> {student.batch}</p>
                <p><strong>Registered:</strong> {new Date(student.reg_date).toLocaleDateString()}</p>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Student Details"
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
        <p>Are you sure you want to delete this student?</p>
      </Modal>

      <Modal
        title="Edit Student"
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
            label="Registration Number"
            name="reg_num"
            rules={[{ required: true, message: 'Please enter the registration number' }]}
          >
            <Input placeholder="Enter registration number (e.g., S001)" size="large" />
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
            label="Semester"
            name="semester"
            rules={[{ required: true, message: 'Please enter the semester' }]}
          >
            <Input type="number" placeholder="Enter semester (e.g., 3)" min={1} max={8} size="large" />
          </Form.Item>

          <Form.Item
            label="Batch"
            name="batch"
            rules={[{ required: true, message: 'Please enter the batch' }]}
          >
            <Input placeholder="Enter batch (e.g., 2023)" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Student"
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
            label="Registration Number"
            name="reg_num"
            rules={[{ required: true, message: 'Please enter the registration number' }]}
          >
            <Input placeholder="Enter registration number (e.g., S001)" size="large" />
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
            label="Semester"
            name="semester"
            rules={[{ required: true, message: 'Please enter the semester' }]}
          >
            <Input type="number" placeholder="Enter semester (e.g., 3)" min={1} max={8} size="large" />
          </Form.Item>

          <Form.Item
            label="Batch"
            name="batch"
            rules={[{ required: true, message: 'Please enter the batch' }]}
          >
            <Input placeholder="Enter batch (e.g., 2023)" size="large" />
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
        title="Student Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedStudent && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Registration Number:</strong> {selectedStudent.reg_num}</p>
            <p><strong>Name:</strong> {selectedStudent.name}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Department:</strong> {selectedStudent.department}</p>
            <p><strong>Semester:</strong> {selectedStudent.semester}</p>
            <p><strong>Batch:</strong> {selectedStudent.batch}</p>
            <p><strong>Registered Date:</strong> {new Date(selectedStudent.reg_date).toLocaleDateString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}