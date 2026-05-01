import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (ratingFilter) params.append('rating', ratingFilter);
      
      const res = await axios.get(`/api/reviews?${params.toString()}`);
      setReviews(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/reviews/${id}`);
        toast.success('Review deleted successfully!');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < rating ? 'rating-stars' : 'text-muted'}`}
      />
    ));
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
                <a className="nav-link active" href="/admin/reviews">
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
              <h1 className="h2">Manage Reviews</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <select 
                  className="form-select me-2"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
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
                {reviews.map((review) => (
                  <div key={review.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="card-title text-salon-primary">{review.service_name}</h6>
                          <small className="text-muted">{formatDate(review.created_at)}</small>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-user text-salon-primary me-2"></i>
                            <span>{review.customer_name}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-calendar text-salon-primary me-2"></i>
                            <span>Service on {formatDate(review.booking_date)}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-2">Rating:</span>
                            <div className="rating-stars">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div className="mb-3">
                            <p className="card-text">{review.comment}</p>
                          </div>
                        )}
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteReview(review.id)}
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

            {!loading && reviews.length === 0 && (
              <div className="text-center py-5">
                <i className="fas fa-star display-4 text-muted mb-3"></i>
                <h4 className="text-muted">No reviews found</h4>
                <p className="text-muted">No reviews match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
