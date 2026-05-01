import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await axios.get(`/api/bookings?${params.toString()}`);
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status });
      toast.success(`Booking ${status} successfully!`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`/api/bookings/${id}`);
        toast.success('Booking deleted successfully!');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleRecordPayment = async (booking) => {
    const paymentMethod = window.prompt('Enter payment method (cash, card, mpesa):', 'cash');
    if (!paymentMethod) return;
    
    try {
      await axios.post('/api/transactions', {
        booking_id: booking.id,
        customer_id: booking.customer_id,
        amount: booking.total_price,
        payment_method: paymentMethod.toLowerCase(),
        payment_status: 'completed',
        notes: `Payment for ${booking.service_name}`
      });
      toast.success('Payment recorded successfully!');
    } catch (error) {
      toast.error('Failed to record payment');
    }
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
                <a className="nav-link active" href="/admin/bookings">
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
              <li className="nav-item">
                <a className="nav-link" href="/admin/transactions">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Transactions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="main-content">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Manage Bookings</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <select 
                  className="form-select me-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                {bookings.map((booking) => (
                  <div key={booking.id} className="col-md-6 col-lg-4">
                    <div className="card booking-card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title text-salon-primary">{booking.service_name}</h5>
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-user text-salon-primary me-2"></i>
                            <span>{booking.customer_name}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-calendar text-salon-primary me-2"></i>
                            <span>{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-clock text-salon-primary me-2"></i>
                            <span>{formatTime(booking.booking_time)}</span>
                          </div>
                          {booking.staff_name && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-user-tie text-salon-primary me-2"></i>
                              <span>{booking.staff_name}</span>
                            </div>
                          )}
                          <div className="d-flex align-items-center">
                            <i className="fas fa-dollar-sign text-salon-primary me-2"></i>
                            <span className="fw-bold">${booking.total_price}</span>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-sticky-note me-1"></i>
                              {booking.notes}
                            </small>
                          </div>
                        )}
                        
                        <div className="d-flex gap-2 flex-wrap">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => updateBookingStatus(booking.id, 'approved')}
                              >
                                <i className="fas fa-check me-1"></i>
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'approved' && (
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                            >
                              <i className="fas fa-check-double me-1"></i>
                              Complete
                            </button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'approved') && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleRecordPayment(booking)}
                            >
                              <i className="fas fa-receipt me-1"></i>
                              Record Payment
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteBooking(booking.id)}
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

            {!loading && bookings.length === 0 && (
              <div className="text-center py-5">
                <i className="fas fa-calendar-times display-4 text-muted mb-3"></i>
                <h4 className="text-muted">No bookings found</h4>
                <p className="text-muted">No bookings match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
