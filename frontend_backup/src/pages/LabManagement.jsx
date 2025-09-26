import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Input, Form, Select, Table, Alert, Switch, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const { Option } = Select;

export default function LabManagement() {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [technicalOfficers, setTechnicalOfficers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch labs from API
  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get('/labs/');
      console.log('Labs fetched:', response.data);
      const fetchedLabs = Array.isArray(response.data)
        ? response.data.map((lab) => ({
            name: lab.lab_name,
            lab_type: lab.lab_type,
            max_capacity: lab.max_capacity,
            allocated_TO: lab.allocated_TO,
            id: lab._id,
          }))
        : [];
      setLabs(fetchedLabs);
    } catch (error) {
      console.error('Error fetching labs:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to load labs. Please try again.'
      );
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch technical officers from API
  const fetchTechnicalOfficers = async () => {
    try {
      const response = await api.get('/to/');
      console.log('Technical Officers fetched:', response.data);
      const fetchedTOs = Array.isArray(response.data)
        ? response.data.map((to) => ({
            id: to._id,
            NIC: to.NIC,
            name: to.name,
            email: to.email,
          }))
        : [];
      setTechnicalOfficers(fetchedTOs);
    } catch (error) {
      console.error('Error fetching technical officers:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to load technical officers. Please try again.'
      );
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchTechnicalOfficers();
  }, []);

  // Filter labs based on search keyword
  useEffect(() => {
    const filtered = labs.filter((lab) => {
      if (!lab || !lab.name) return false;
      return lab.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
    setFilteredLabs(filtered);
  }, [labs, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Show modals
  const showModal = () => {
    setIsModalOpen(true);
  };

  const showEditModal = (lab) => {
    setSelectedLab(lab);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      name: lab.name,
      lab_type: lab.lab_type,
      max_capacity: lab.max_capacity,
      allocated_TO: lab.allocated_TO ? lab.allocated_TO._id : null,
    });
    handleCancel();
  };

  const showDeleteModal = (lab) => {
    setSelectedLab(lab);
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
    addForm.resetFields();
  };

  const showViewModal = (lab) => {
    setSelectedLab(lab);
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
        const updatedLab = {
          lab_name: values.name,
          lab_type: values.lab_type,
          max_capacity: Number(values.max_capacity),
          allocated_TO: values.allocated_TO,
        };
        console.log('Updating lab with data:', updatedLab);
        try {
          await api.put(`/labs/${selectedLab.id}`, updatedLab);
          await fetchLabs();
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedLab(null);
          setSuccess('Lab updated successfully!');
        } catch (error) {
          console.error('Error updating lab:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to update lab. Please try again.'
          );
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/labs/${selectedLab.id}`);
      await fetchLabs();
      setIsDeleteModalOpen(false);
      setSelectedLab(null);
      setSuccess('Lab deleted successfully!');
    } catch (error) {
      console.error('Error deleting lab:', error);
      console.log('Server response:', error.response?.data);
      setError(
        error.response?.data?.message || 'Failed to delete lab. Please try again.'
      );
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        const newLab = {
          lab_name: values.name,
          lab_type: values.lab_type,
          max_capacity: Number(values.max_capacity),
          allocated_TO: values.allocated_TO,
        };
        console.log('Adding lab with data:', newLab);
        try {
          await api.post('/labs/', newLab);
          await fetchLabs();
          setIsAddModalOpen(false);
          addForm.resetFields();
          setSuccess('Lab added successfully!');
        } catch (error) {
          console.error('Error adding lab:', error);
          console.log('Server response:', error.response?.data);
          setError(
            error.response?.data?.message || 'Failed to add lab. Please try again.'
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
    setSelectedLab(null);
    handleCancel();
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedLab(null);
    handleCancel();
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setSelectedLab(null);
  };

  // Toggle between Card and Table view
  const handleViewToggle = (checked) => {
    setViewMode(checked ? 'table' : 'card');
  };

  // Table columns for Table View
  const columns = [
    {
      title: 'Lab Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lab Type',
      dataIndex: 'lab_type',
      key: 'lab_type',
    },
    {
      title: 'Max Capacity',
      dataIndex: 'max_capacity',
      key: 'max_capacity',
    },
    {
      title: 'Technical Officer',
      dataIndex: 'allocated_TO',
      key: 'allocated_TO',
      render: (to) => to?.name || 'Not Assigned',
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
    <div className="lab-management-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Lab Management</h2>
          <p>Control all the labs in here</p>
        </div>
      </div>

      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Input
          placeholder="Search labs by name"
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
            Add Lab
          </Button>
        </div>
      </div>

      {loading && <Alert message="Loading labs..." type="info" showIcon />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
      {success && <Alert message={success} type="success" showIcon style={{ marginBottom: '10px' }} />}

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]} className="lab-cards">
          {filteredLabs.map((lab, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={lab.id || index}>
              <Card
                onClick={() => showViewModal(lab)}
                title={lab.name}
                hoverable
                style={{ width: '100%' }}
                className="lab-card"
                extra={
                  <>
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faPenToSquare} />}
                      style={{ color: '#5581e9' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEditModal(lab);
                      }}
                    />
                    <Button
                      type="text"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(lab);
                      }}
                    />
                  </>
                }
              >
                <p><strong>Max Capacity:</strong> {lab.max_capacity}</p>
                <p><strong>Type:</strong> {lab.lab_type}</p>
                <p><strong>TO:</strong> {lab.allocated_TO?.name || 'Not Assigned'}</p>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredLabs}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Lab Details"
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
        <p>Are you sure you want to delete this lab?</p>
      </Modal>

      <Modal
        title="Edit Lab"
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
            label="Lab Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the lab name' }]}
          >
            <Input placeholder="Enter lab name" size="large" />
          </Form.Item>

          <Form.Item
            label="Lab Type"
            name="lab_type"
            rules={[{ required: true, message: 'Please select the lab type' }]}
          >
            <Select placeholder="Select lab type" size="large">
              <Option value="Hardware">Hardware</Option>
              <Option value="Software">Software</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Max Capacity"
            name="max_capacity"
            rules={[{ required: true, message: 'Please enter the max capacity' }]}
          >
            <Input type="number" placeholder="Enter max capacity" min={1} size="large" />
          </Form.Item>

          <Form.Item
            label="Technical Officer"
            name="allocated_TO"
            rules={[{ required: true, message: 'Please select a technical officer' }]}
          >
            <Select placeholder="Select technical officer" size="large">
              {technicalOfficers.map((to) => (
                <Option key={to.id} value={to.id}>
                  {to.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Lab"
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
            label="Lab Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the lab name' }]}
          >
            <Input placeholder="Enter lab name" size="large" />
          </Form.Item>

          <Form.Item
            label="Lab Type"
            name="lab_type"
            rules={[{ required: true, message: 'Please select the lab type' }]}
          >
            <Select placeholder="Select lab type" size="large">
              <Option value="Hardware">Hardware</Option>
              <Option value="Software">Software</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Max Capacity"
            name="max_capacity"
            rules={[{ required: true, message: 'Please enter the max capacity' }]}
          >
            <Input type="number" placeholder="Enter max capacity" min={1} size="large" />
          </Form.Item>

          <Form.Item
            label="Technical Officer"
            name="allocated_TO"
            rules={[{ required: true, message: 'Please select a technical officer' }]}
          >
            <Select placeholder="Select technical officer" size="large">
              {technicalOfficers.map((to) => (
                <Option key={to.id} value={to.id}>
                  {to.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Lab Details"
        open={isViewModalOpen}
        onOk={handleViewCancel}
        onCancel={handleViewCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedLab && (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Lab Name:</strong> {selectedLab.name}</p>
            <p><strong>Lab Type:</strong> {selectedLab.lab_type}</p>
            <p><strong>Max Capacity:</strong> {selectedLab.max_capacity}</p>
            <p><strong>Technical Officer:</strong> {selectedLab.allocated_TO?.name || 'Not Assigned'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}