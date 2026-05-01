import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import BookingForm from '../components/BookingForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings?limit=5&page=1');
      setBookings(res.data.data.slice(0, 5)); // Show only recent 5 bookings
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    fetchMyBookings();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge bg-warning',
      approved: 'badge bg-success',
      completed: 'badge bg-info',
      cancelled: 'badge bg-danger'
    };
    return statusClasses[status] || 'badge bg-secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 d-md-block sidebar">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">
                  <i className="fas fa-calendar-check me-2"></i>
                  My Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reviews">
                  <i className="fas fa-star me-2"></i>
                  Reviews
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transactions">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  My Transactions
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  <i className="fas fa-user-cog me-2"></i>
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="main-content">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <button 
                  className="btn salon-primary me-2"
                  onClick={() => setShowBookingForm(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  New Booking
                </button>
                <Link to="/bookings" className="btn btn-outline-primary">
                  <i className="fas fa-calendar me-2"></i>
                  View All
                </Link>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info">
                  <h4 className="alert-heading">
                    <i className="fas fa-heart me-2"></i>
                    Welcome back, {user?.name}!
                  </h4>
                  <p className="mb-0">
                    Manage your appointments and discover our latest services.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-calendar-check stats-icon text-salon-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Total Bookings</h6>
                        <h4 className="mb-0">{bookings.length}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-star stats-icon text-salon-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Reviews Given</h6>
                        <h4 className="mb-0">0</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-clock stats-icon text-salon-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="card-title mb-0">Upcoming</h6>
                        <h4 className="mb-0">
                          {bookings.filter(b => b.status === 'approved').length}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Recent Bookings</h5>
                    <Link to="/bookings" className="btn btn-sm salon-primary">
                      View All
                    </Link>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-salon-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : bookings.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Service</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map((booking) => (
                              <tr key={booking.id}>
                                <td>{booking.service_name}</td>
                                <td>{formatDate(booking.booking_date)}</td>
                                <td>{formatTime(booking.booking_time)}</td>
                                <td>
                                  <span className={getStatusBadge(booking.status)}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </td>
                                <td>${booking.total_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-calendar-times display-4 text-muted mb-3"></i>
                        <h5 className="text-muted">No bookings yet</h5>
                        <p className="text-muted">Start by booking your first appointment!</p>
                        <button 
                          className="btn salon-primary"
                          onClick={() => setShowBookingForm(true)}
                        >
                          Book Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          onClose={() => setShowBookingForm(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
