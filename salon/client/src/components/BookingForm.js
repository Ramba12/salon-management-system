import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookingForm = ({ onClose, onBookingSuccess, preselectedService }) => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_id: preselectedService?.id || '',
    staff_id: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchStaff();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/staff');
      setStaff(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.staff_id) {
        delete payload.staff_id; // omit when no preference
      }
      await axios.post('/api/bookings', payload);
      toast.success('Booking created successfully!');
      onBookingSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Book New Appointment</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="service_id" className="form-label">Service *</label>
                    <select
                      className="form-select"
                      id="service_id"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price} ({service.duration} min)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="staff_id" className="form-label">Preferred Stylist (Optional)</label>
                    <select
                      className="form-select"
                      id="staff_id"
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleInputChange}
                    >
                      <option value="">No preference</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="booking_date" className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="booking_date"
                      name="booking_date"
                      value={formData.booking_date}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="booking_time" className="form-label">Time *</label>
                    <select
                      className="form-select"
                      id="booking_time"
                      name="booking_time"
                      value={formData.booking_time}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select time</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = 9 + i; // 9 AM to 8 PM
                        return (
                          <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                            {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Special Requests or Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requests or notes for your appointment..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
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
                    Booking...
                  </>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
