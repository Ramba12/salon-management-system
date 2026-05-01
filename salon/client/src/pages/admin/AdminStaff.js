import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    bio: '',
    is_active: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/admin/staff');
      setStaff(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStaff) {
        await axios.put(`/api/admin/staff/${editingStaff.id}`, formData);
        toast.success('Staff member updated successfully!');
      } else {
        await axios.post('/api/admin/staff', formData);
        toast.success('Staff member created successfully!');
      }
      
      setShowModal(false);
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience: '',
        bio: '',
        is_active: true
      });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      specialty: staffMember.specialty,
      experience: staffMember.experience,
      bio: staffMember.bio,
      is_active: staffMember.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`/api/admin/staff/${id}`);
        toast.success('Staff member deleted successfully!');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff member');
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
                <a className="nav-link" href="/admin/services">
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
                <a className="nav-link active" href="/admin/staff">
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
              <h1 className="h2">Manage Staff</h1>
              <button 
                className="btn salon-primary"
                onClick={() => {
                  setEditingStaff(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    specialty: '',
                    experience: '',
                    bio: '',
                    is_active: true
                  });
                  setShowModal(true);
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Staff
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
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title text-salon-primary">{staffMember.name}</h5>
                          <span className={`badge ${staffMember.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {staffMember.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-envelope text-salon-primary me-2"></i>
                            <span>{staffMember.email}</span>
                          </div>
                          {staffMember.phone && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-phone text-salon-primary me-2"></i>
                              <span>{staffMember.phone}</span>
                            </div>
                          )}
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-briefcase text-salon-primary me-2"></i>
                            <span>{staffMember.specialty}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-calendar text-salon-primary me-2"></i>
                            <span>{staffMember.experience} years experience</span>
                          </div>
                        </div>
                        
                        {staffMember.bio && (
                          <div className="mb-3">
                            <p className="card-text text-muted small">{staffMember.bio}</p>
                          </div>
                        )}
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(staffMember)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(staffMember.id)}
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

      {/* Staff Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                        <label htmlFor="name" className="form-label">Full Name</label>
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
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="specialty" className="form-label">Specialty</label>
                        <input
                          type="text"
                          className="form-control"
                          id="specialty"
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="experience" className="form-label">Years of Experience</label>
                        <input
                          type="number"
                          className="form-control"
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
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
                            Active Staff Member
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Brief description of the staff member's background and expertise..."
                    ></textarea>
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
                      editingStaff ? 'Update Staff Member' : 'Create Staff Member'
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

export default AdminStaff;
