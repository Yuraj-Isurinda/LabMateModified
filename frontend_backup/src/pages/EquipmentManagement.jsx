import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Input, Form, Upload, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Empty } from 'antd';
import api from '../services/api';

const { Dragger } = Upload;

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);

  // Fetch equipment from API (unchanged)
  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/equipment/');
      console.log('Equipment fetched:', response.data);
      const fetchedEquipment = Array.isArray(response.data)
        ? response.data.map((item) => ({
            item_num: item.item_num,
            name: item.name,
            quantity: item.quantity,
            img_url: item.img_url,
            id: item._id,
          }))
        : [];
      setEquipment(fetchedEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError(error.response?.data?.message || 'Failed to load equipment. Please try again.');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Filter equipment (unchanged)
  useEffect(() => {
    const filtered = equipment.filter((item) => {
      if (!item || !item.name) return false;
      return item.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
    setFilteredEquipment(filtered);
  }, [equipment, searchKeyword]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Upload props (unchanged)
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const editUploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    fileList: editFileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      setEditFileList([file]);
      return false;
    },
    onRemove: () => {
      setEditFileList([]);
    },
  };

  // Show modals (updated)
  const showModal = (item) => {
    setSelectedEquipment(item);
    setIsModalOpen(true);
  };

  const showEditModal = (item) => {
    setSelectedEquipment(item); // Set the selected equipment
    setEditFileList(item.img_url ? [{ uid: '-1', name: 'current-image', status: 'done', url: item.img_url }] : []);
    editForm.setFieldsValue({
      item_num: item.item_num,
      name: item.name,
      quantity: item.quantity,
      img_url: item.img_url,
      id: item.id,
    });
    setIsEditModalOpen(true); // Open the edit modal
    // Removed handleCancel() to prevent resetting selectedEquipment prematurely
  };

  const showDeleteModal = (item) => {
    setSelectedEquipment(item); // Set the selected equipment
    setIsDeleteModalOpen(true); // Open the delete modal
    setIsModalOpen(false); // Close the details modal if open
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
    setFileList([]);
    addForm.resetFields();
  };

  // Handle modal actions (unchanged except for clarity)
  const handleOk = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleEditOk = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        const formData = new FormData();
        formData.append('item_num', values.item_num);
        formData.append('name', values.name);
        formData.append('quantity', Number(values.quantity));
        if (editFileList.length > 0 && editFileList[0].uid !== '-1') {
          formData.append('image', editFileList[0]);
        }

        try {
          await api.put(`/equipment/${selectedEquipment.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await fetchEquipment();
          setIsEditModalOpen(false);
          editForm.resetFields();
          setEditFileList([]);
          setSelectedEquipment(null);
          message.success('Equipment updated successfully');
        } catch (error) {
          console.error('Error updating equipment:', error);
          setError(error.response?.data?.message || 'Failed to update equipment.');
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDeleteOk = async () => {
    try {
      await api.delete(`/equipment/${selectedEquipment.id}`);
      await fetchEquipment();
      setIsDeleteModalOpen(false);
      setSelectedEquipment(null);
      message.success('Equipment deleted successfully');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setError(error.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  const handleAddOk = () => {
    addForm
      .validateFields()
      .then(async (values) => {
        const formData = new FormData();
        formData.append('item_num', values.item_num);
        formData.append('name', values.name);
        formData.append('quantity', Number(values.quantity));
        if (fileList.length > 0) {
          formData.append('image', fileList[0]);
        }

        try {
          await api.post('/equipment/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await fetchEquipment();
          setIsAddModalOpen(false);
          addForm.resetFields();
          setFileList([]);
          message.success('Equipment added successfully');
        } catch (error) {
          console.error('Error adding equipment:', error);
          setError(error.response?.data?.message || 'Failed to add equipment.');
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setEditFileList([]);
    setSelectedEquipment(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
    setFileList([]);
  };

  return (
    <div className="equipment-management-container">
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>Equipment Management</h2>
          <p>Control all the equipment in here</p>
        </div>
      </div>

      <div className="controls">
        <Input
          placeholder="Search equipment by name"
          value={searchKeyword}
          onChange={handleSearchChange}
          style={{ width: '100%' }}
          allowClear
          size="large"
        />
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={showAddModal}
          style={{ backgroundColor: '#5581e9', borderColor: '#5581e9' }}
          size="large"
        >
          Add Equipment
        </Button>
      </div>

      {loading && <p>Loading equipment...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Row gutter={[16, 16]} className="equipment-cards">
        {filteredEquipment.length === 0 && !loading && !error && (
          <Col span={24}>
            <Card style={{ width: '100%' }} className="no-equipment-card">
              <Empty description="No equipment found" style={{ textAlign: 'center' }} />
            </Card>
          </Col>
        )}
        {filteredEquipment.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id || index}>
            <Card
              onClick={() => showModal(item)}
              title={item.name}
              hoverable
              style={{ width: '100%' }}
              className="equipment-card"
              extra={
                <>
                  <Button
                    type="text"
                    icon={<FontAwesomeIcon icon={faPenToSquare} />}
                    style={{ color: '#5581e9' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showEditModal(item);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    style={{ color: '#ff4d4f' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteModal(item);
                    }}
                  />
                </>
              }
            >
              <p><strong>Item Number:</strong> {item.item_num}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              {item.img_url && (
                <img
                  src={`http://localhost:8000${item.img_url}`}
                  alt={item.name}
                  style={{ height: '100%', width: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Equipment Details"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { backgroundColor: '#5581e9', borderColor: '#5581e9' } }}
        width={600}
      >
        {selectedEquipment ? (
          <div style={{ lineHeight: '2' }}>
            <p><strong>Item Number:</strong> {selectedEquipment.item_num}</p>
            <p><strong>Equipment Name:</strong> {selectedEquipment.name}</p>
            <p><strong>Quantity:</strong> {selectedEquipment.quantity}</p>
            {selectedEquipment.img_url ? (
              <div>
                <p><strong>Image:</strong></p>
                <img
                  src={`http://localhost:8000${selectedEquipment.img_url}`}
                  alt={selectedEquipment.name}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
                />
              </div>
            ) : (
              <p><strong>Image:</strong> No image available</p>
            )}
          </div>
        ) : (
          <p>No equipment selected.</p>
        )}
      </Modal>

      <Modal
        title="Do you want to delete?"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        centered
        okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
      >
        <p>Are you sure you want to delete this equipment?</p>
      </Modal>

      <Modal
        title={`Edit Equipment`} // Fallback to empty string if undefined
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
            label="Item Number"
            name="item_num"
            rules={[{ required: true, message: 'Please enter the item number' }]}
          >
            <Input placeholder="Enter item number" size="large" />
          </Form.Item>
          <Form.Item
            label="Equipment Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the equipment name' }]}
          >
            <Input placeholder="Enter equipment name" size="large" />
          </Form.Item>
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter the quantity' }]}
          >
            <Input type="number" placeholder="Enter quantity" min={1} size="large" />
          </Form.Item>
          <Form.Item label="Image">
            <Dragger {...editUploadProps}>
              <p className="ant-upload-drag-icon">
                <FontAwesomeIcon icon={faUpload} />
              </p>
              <p className="ant-upload-text">Click or drag image to upload</p>
              <p className="ant-upload-hint">Upload a single image file</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Equipment"
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
            label="Item Number"
            name="item_num"
            rules={[{ required: true, message: 'Please enter the item number' }]}
          >
            <Input placeholder="Enter item number" size="large" />
          </Form.Item>
          <Form.Item
            label="Equipment Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the equipment name' }]}
          >
            <Input placeholder="Enter equipment name" size="large" />
          </Form.Item>
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter the quantity' }]}
          >
            <Input type="number" placeholder="Enter quantity" min={1} size="large" />
          </Form.Item>
          <Form.Item label="Image">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <FontAwesomeIcon icon={faUpload} />
              </p>
              <p className="ant-upload-text">Click or drag image to upload</p>
              <p className="ant-upload-hint">Upload a single image file</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}