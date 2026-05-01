import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 400); // debounce for the search field
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [roleFilter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await axios.put(`/api/admin/users/${id}`, { role });
      toast.success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin: 'badge bg-danger',
      staff: 'badge bg-warning',
      customer: 'badge bg-primary'
    };
    return roleClasses[role] || 'badge bg-secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
                <a className="nav-link active" href="/admin/users">
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
            <div className="d-flex flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2 me-3">Manage Users</h1>
              <div className="btn-toolbar mb-2 mb-md-0 d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control me-2"
                  style={{ width: 220 }}
                  placeholder="Search name or email..."
                  value={search}
                  ref={searchRef}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="form-select me-2"
                  style={{ width: 160 }}
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-salon-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {users.map((user) => (
                  <div key={user.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title text-salon-primary">{user.name}</h5>
                          <span className={getRoleBadge(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-envelope text-salon-primary me-2"></i>
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-phone text-salon-primary me-2"></i>
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="d-flex align-items-center">
                            <i className="fas fa-calendar text-salon-primary me-2"></i>
                            <span>Joined {formatDate(user.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-wrap">
                          {user.role !== 'admin' && (
                            <select 
                              className="form-select form-select-sm"
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                            >
                              <option value="customer">Customer</option>
                              <option value="staff">Staff</option>
                            </select>
                          )}
                          {user.role !== 'admin' && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteUser(user.id)}
                            >
                              <i className="fas fa-trash me-1"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="text-center py-5">
                <i className="fas fa-users display-4 text-muted mb-3"></i>
                <h4 className="text-muted">No users found</h4>
                <p className="text-muted">No users match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
