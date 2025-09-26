import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Input, Form, Table, Alert, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function TOManagement() {
  const [technicalOfficers, setTechnicalOfficers] = useState([]);
  const [filteredTOs, setFilteredTOs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedTO, setSelectedTO] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch technical officers from API
  const fetchTechnicalOfficers = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get('/to');
      console.log('Technical Officers fetched:', response.data);
      const fetchedTOs = Array.isArray(response.data)
        ? response.data.map((to) => ({
            NIC: to.NIC || "Unknown NIC",
            name: to.name || "Unknown Name",
            email: to.email || "N/A",
            id: to._id,
          }))
        : [];
      setTechnicalOfficers(fetchedTOs);
    } catch (error) {
      console.error('Error fetching technical officers:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to load technical officers. Please try again.'
      );
      setTechnicalOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicalOfficers();
  }, []);

  // Filter technical officers based on search keyword
  useEffect(() => {
    const filtered = technicalOfficers.filter((to) => {
      if (!to || !to.name) return false;
      return to.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
    setFilteredTOs(filtered);
  }, [technicalOfficers, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Show modals
  const showModal = () => {
    setIsModalOpen(true);
  };

  const showEditModal = (to) => {
    setSelectedTO(to);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      NIC: to.NIC,
      name: to.name,
      email: to.email,
    });
    handleCancel();
  };

  const showDeleteModal = (to) => {
    setSelectedTO(to);
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showViewModal = (to) => {
    setSelectedTO(to);
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
        const updatedTO = {
          NIC: values.NIC,
          name: values.name,
          email: values.email,
        };
        console.log('Updating TO with data:', updatedTO);
        try {
          await api.put(`/to/${selectedTO.id}`, updatedTO);
          await fetchTechnicalOfficers();
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedTO(null);
          setSuccess('Technical Officer updated successfully!');
        } catch (error) {
          console.error('Error updating technical officer:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to update technical officer. Please try again.'
          );
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/to/${selectedTO.id}`);
      await fetchTechnicalOfficers();
      setIsDeleteModalOpen(false);
      setSelectedTO(null);
      setSuccess('Technical Officer deleted successfully!');
    } catch (error) {
      console.error('Error deleting technical officer:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to delete technical officer. Please try again.'
      );
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        const newTO = {
          NIC: values.NIC,
          name: values.name,
          email: values.email,
          password: values.password,
        };
        console.log('Adding TO with data:', newTO);
        try {
          await api.post('/auth/register/to', newTO);
          await fetchTechnicalOfficers();
          setIsAddModalOpen(false);
          addForm.resetFields();
          setSuccess('Technical Officer added successfully!');
        } catch (error) {
          console.error('Error adding technical officer:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to add technical officer. Please try again.'
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
    setSelectedTO(null);
    handleCancel();
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedTO(null);
    handleCancel();
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedTO(null);
  };

  // Toggle between Card and Table view
  const handleViewToggle = (checked) => {
    setViewMode(checked ? 'table' : 'card');
  };

  // Table columns for Table View
  const columns = [
    {
      title: 'NIC',
      dataIndex: 'NIC',
      key: 'NIC',
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
    <div className="to-management-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Technical Officer Management</h2>
          <p>Manage all technical officers here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Input
          placeholder="Search technical officers by name"
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
            Add Technical Officer
          </Button>
        </div>
      </div>

      {loading && <Alert message="Loading technical officers..." type="info" showIcon />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
      {success && <Alert message={success} type="success" showIcon style={{ marginBottom: '10px' }} />}

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]} className="to-cards">
          {filteredTOs.map((to, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={to.id || index}>
              <Card
                onClick={()=> showViewModal(to)}
                title={to.name}
                hoverable
                style={{ width: '100%' }}
                className="to-card"
                extra={
                  <>
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faPenToSquare} />}
                      style={{ color: '#5581e9' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEditModal(to);
                      }}
                    />
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(to);
                      }}
                    />
                  </>
                }
              >
                <p><strong>NIC:</strong> {to.NIC}</p>
                <p><strong>Email:</strong> {to.email}</p>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredTOs}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Technical Officer Details"
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
        <p>Are you sure you want to delete this technical officer?</p>
      </Modal>

      <Modal
        title="Edit Technical Officer"
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
            label="NIC"
            name="NIC"
            rules={[{ required: true, message: 'Please enter the NIC' }]}
          >
            <Input placeholder="Enter NIC" size="large" />
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
        </Form>
      </Modal>

      <Modal
        title="Add Technical Officer"
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
            label="NIC"
            name="NIC"
            rules={[{ required: true, message: 'Please enter the NIC' }]}
          >
            <Input placeholder="Enter NIC" size="large" />
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
        title="Technical Officer Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedTO && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>NIC:</strong> {selectedTO.NIC}</p>
            <p><strong>Name:</strong> {selectedTO.name}</p>
            <p><strong>Email:</strong> {selectedTO.email}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}