import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import BookingForm from '../components/BookingForm';
const PAGE_SIZE = 12;

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'customer') {
      setLoading(true);
      fetchBookings(page);
    } else if (user) {
      // Redirect admins/staff to admin bookings page
      navigate('/admin/bookings', { replace: true });
      setLoading(false);
    }
  }, [user, page]);

  const fetchBookings = async (pageToLoad = 1) => {
    try {
      const res = await axios.get(`/api/bookings/my-bookings?limit=${PAGE_SIZE}&page=${pageToLoad}` , { timeout: 10000 });
      setBookings(res.data.data);
      setHasMore(res.data.hasMore);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setPage(1);
    fetchBookings(1);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.patch(`/api/bookings/${bookingId}/cancel`, null, { timeout: 10000 });
      toast.success('Booking cancelled successfully');
      handleBookingSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to cancel booking'
      );
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

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2 text-salon-primary">My Bookings</h1>
            <button 
              className="btn salon-primary"
              onClick={() => setShowBookingForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              New Booking
            </button>
          </div>

          {authLoading || loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-salon-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bookings.length > 0 ? (
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
                          <i className="fas fa-calendar text-salon-primary me-2"></i>
                          <span>{formatDate(booking.booking_date)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-clock text-salon-primary me-2"></i>
                          <span>{booking.booking_time}</span>
                        </div>
                        {booking.staff_name && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-user text-salon-primary me-2"></i>
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
                      
                      <div className="d-flex gap-2">
                        {['pending', 'approved'].includes(booking.status) && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(booking.id)}>
                            Cancel
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button className="btn btn-sm salon-secondary">
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times display-4 text-muted mb-3"></i>
              <h4 className="text-muted">No bookings found</h4>
              <p className="text-muted">Start by booking your first appointment!</p>
              <button 
                className="btn salon-primary"
                onClick={() => setShowBookingForm(true)}
              >
                Book Appointment
              </button>
            </div>
          )}
          {!loading && bookings.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-muted">Page {page}</span>
              <button
                className="btn btn-outline-secondary"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
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

export default Bookings;
