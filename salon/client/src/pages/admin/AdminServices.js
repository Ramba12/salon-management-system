import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'general',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services/admin');
      setServices(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        await axios.put(`/api/services/${editingService.id}`, formData);
        toast.success('Service updated successfully!');
      } else {
        await axios.post('/api/services', formData);
        toast.success('Service created successfully!');
      }
      
      setShowModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: 'general',
        is_active: true
      });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      is_active: service.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`/api/services/${id}`);
        toast.success('Service deleted successfully!');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 d-md-block sidebar">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link" href="/admin">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/admin/services">
                  <i className="fas fa-cut me-2"></i>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/bookings">
                  <i className="fas fa-calendar-check me-2"></i>
                  Bookings
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/users">
                  <i className="fas fa-users me-2"></i>
                  Users
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/staff">
                  <i className="fas fa-user-tie me-2"></i>
                  Staff
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/reviews">
                  <i className="fas fa-star me-2"></i>
                  Reviews
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="main-content">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Manage Services</h1>
              <button 
                className="btn salon-primary"
                onClick={() => {
                  setEditingService(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    duration: '',
                    category: 'general',
                    is_active: true
                  });
                  setShowModal(true);
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Service
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-salon-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {services.map((service) => (
                  <div key={service.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title text-salon-primary">{service.name}</h5>
                          <span className={`badge ${service.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <p className="card-text text-muted mb-3">{service.description}</p>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="h5 text-salon-primary">${service.price}</span>
                            <small className="text-muted ms-1">per service</small>
                          </div>
                          <div className="text-end">
                            <i className="fas fa-clock text-muted me-1"></i>
                            <span className="text-muted">{service.duration} min</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="badge bg-salon-light text-salon-primary">
                            {service.category}
                          </span>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(service)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(service.id)}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Service Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                        >
                          <option value="general">General</option>
                          <option value="Hair">Hair</option>
                          <option value="Nails">Nails</option>
                          <option value="Skincare">Skincare</option>
                          <option value="Brows">Brows</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="duration" className="form-label">Duration (min)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="is_active">
                            Active Service
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn salon-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      editingService ? 'Update Service' : 'Create Service'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
