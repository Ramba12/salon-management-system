import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-salon-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 d-md-block sidebar">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link active" to="/admin">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/services">
                  <i className="fas fa-cut me-2"></i>
                  Services
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/bookings">
                  <i className="fas fa-calendar-check me-2"></i>
                  Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                  <i className="fas fa-users me-2"></i>
                  Users
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/staff">
                  <i className="fas fa-user-tie me-2"></i>
                  Staff
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/reviews">
                  <i className="fas fa-star me-2"></i>
                  Reviews
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/transactions">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Transactions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="main-content">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Admin Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-users stats-icon text-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Total Users</h6>
                        <h4 className="mb-0">{stats.users?.total_users || 0}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-cut stats-icon text-success"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Services</h6>
                        <h4 className="mb-0">{stats.services?.active_services || 0}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-calendar-check stats-icon text-warning"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Bookings</h6>
                        <h4 className="mb-0">{stats.bookings?.total_bookings || 0}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-star stats-icon text-info"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Reviews</h6>
                        <h4 className="mb-0">{stats.reviews?.total_reviews || 0}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mt-md-4 mt-lg-0">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-dollar-sign stats-icon text-danger"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Revenue</h6>
                        <h4 className="mb-0">${stats.bookings?.total_revenue || 0}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <Link to="/admin/services" className="btn salon-primary w-100">
                          <i className="fas fa-plus me-2"></i>
                          Add New Service
                        </Link>
                      </div>
                      <div className="col-md-4">
                        <Link to="/admin/staff" className="btn salon-secondary w-100">
                          <i className="fas fa-user-plus me-2"></i>
                          Add Staff Member
                        </Link>
                      </div>
                      <div className="col-md-4">
                        <Link to="/admin/bookings" className="btn btn-outline-primary w-100">
                          <i className="fas fa-calendar me-2"></i>
                          Manage Bookings
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



