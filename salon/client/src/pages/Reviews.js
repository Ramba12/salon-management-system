import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const Reviews = () => {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [showWrite, setShowWrite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [writeForm, setWriteForm] = useState({ booking_id: '', rating: 1, comment: '' });
  const [editForm, setEditForm] = useState({ rating: 1, comment: '' });
  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState([]); // For write form

  // Fetch reviews based on role
  useEffect(() => {
    if (!authLoading && user) {
      fetchReviews();
    }
    // eslint-disable-next-line
  }, [user, authLoading, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let res;
      if (user.role === 'admin') {
        const params = new URLSearchParams();
        if (ratingFilter) params.append('rating', ratingFilter);
        res = await axios.get(`/api/reviews?${params.toString()}`);
      } else {
        res = await axios.get('/api/reviews/my-reviews');
      }
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
      <i key={index} className={`fas fa-star ${index < rating ? 'rating-stars' : 'text-muted'}`} />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch eligible bookings for writing a review (client)
  const fetchBookings = async () => {
    if (user?.role !== 'admin') {
      try {
        const res = await axios.get('/api/bookings/my-bookings?status=completed');
        // filter bookings which haven't been reviewed (assume review creation endpoint handles duplicate prevention)
        setBookings(res.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch bookings for review');
      }
    }
  };

  const handleOpenWrite = () => {
    setWriteForm({ booking_id: '', rating: 1, comment: '' });
    setShowWrite(true);
    fetchBookings();
  };

  const handleWriteReview = async (e) => {
    e.preventDefault();
    setWriting(true);
    try {
      await axios.post('/api/reviews', writeForm);
      toast.success('Review created!');
      setShowWrite(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create review');
    } finally {
      setWriting(false);
    }
  };

  const handleOpenEdit = (review) => {
    setEditReview(review);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
    setShowEdit(true);
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await axios.put(`/api/reviews/${editReview.id}`, editForm);
      toast.success('Review updated!');
      setShowEdit(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setEditing(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-5"><div className="spinner-border text-salon-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2 text-salon-primary">{user?.role === 'admin' ? 'All Reviews' : 'My Reviews'}</h1>
            {user?.role !== 'admin' && (
              <button className="btn salon-primary" onClick={handleOpenWrite}>
              <i className="fas fa-plus me-2"></i>
              Write Review
            </button>
            )}
            {user?.role === 'admin' && (
              <select 
                className="form-select ms-3"
                style={{width: '160px', maxWidth: '50vw'}}
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            )}
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-salon-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="row g-4">
              {reviews.map((review) => (
                <div key={review.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="card-title text-salon-primary">{review.service_name}</h6>
                        <small className="text-muted">{formatDate(review.created_at)}</small>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="d-flex align-items-center mb-2"><i className="fas fa-user text-salon-primary me-2"></i> <span>{review.customer_name}</span></div>
                      )}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2">Rating:</span>
                          <div className="rating-stars">{renderStars(review.rating)}</div>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-calendar text-salon-primary me-2"></i>
                          <span className="text-muted">Service on {formatDate(review.booking_date)}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <div className="mb-3">
                          <p className="card-text">{review.comment}</p>
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        {user?.role !== 'admin' && review.customer_id === user?.id && (
                          <>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenEdit(review)}>
                              <i className="fas fa-edit me-1"></i> Edit
                        </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(review.id)}>
                              <i className="fas fa-trash me-1"></i> Delete
                        </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-star display-4 text-muted mb-3"></i>
              <h4 className="text-muted">{user?.role === 'admin' ? 'No reviews found' : 'No reviews yet'}</h4>
              <p className="text-muted">
                {user?.role === 'admin' ? 'No reviews match your current filter criteria.' : 'Complete a service to leave your first review!'}
              </p>
              {user?.role !== 'admin' && (
              <button className="btn salon-primary">
                Browse Services
              </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <Modal show={showWrite} onHide={() => setShowWrite(false)}>
        <Form onSubmit={handleWriteReview}>
          <Modal.Header closeButton>
            <Modal.Title>Write a Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select Booking</Form.Label>
              <Form.Select required value={writeForm.booking_id} onChange={e => setWriteForm(f => ({...f, booking_id: e.target.value}))}>
                <option value="">Select...</option>
                {bookings.map(b => <option value={b.id} key={b.id}>{b.service_name} on {formatDate(b.booking_date)}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select value={writeForm.rating} onChange={e => setWriteForm(f => ({...f, rating: e.target.value}))} required>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" rows={3} minLength={10} maxLength={1000} value={writeForm.comment} onChange={e => setWriteForm(f => ({...f, comment: e.target.value}))} required/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowWrite(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={writing}>{writing ? 'Submitting...' : 'Submit'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Review Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Form onSubmit={handleEditReview}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select value={editForm.rating} onChange={e => setEditForm(f => ({...f, rating: e.target.value}))} required>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" rows={3} minLength={10} maxLength={1000} value={editForm.comment} onChange={e => setEditForm(f => ({...f, comment: e.target.value}))} required/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={editing}>{editing ? 'Saving...' : 'Save Changes'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Reviews;



