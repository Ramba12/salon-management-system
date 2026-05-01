import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import BookingForm from '../components/BookingForm';

const Services = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const res = await axios.get(`/api/services?${params.toString()}`);
      setServices(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedCategory]);

  const categories = [...new Set(services.map(service => service.category))];

  const handleBookService = (service) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      return;
    }
    setSelectedService(service);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedService(null);
    toast.success('Booking created successfully!');
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-salon-primary">Our Services</h1>
            <p className="lead">Professional salon services tailored to your needs</p>
          </div>

          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Services Grid */}
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
                  <div className="card h-100 border-0 shadow-sm card-hover">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title text-salon-primary">{service.name}</h5>
                        <span className="badge bg-salon-light text-salon-primary">
                          {service.category}
                        </span>
                      </div>
                      
                      <p className="card-text text-muted mb-3">
                        {service.description}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="h4 text-salon-primary">${service.price}</span>
                          <small className="text-muted ms-1">per service</small>
                        </div>
                        <div className="text-end">
                          <i className="fas fa-clock text-muted me-1"></i>
                          <span className="text-muted">{service.duration} min</span>
                        </div>
                      </div>
                      
                      <button
                        className="btn salon-primary w-100"
                        onClick={() => handleBookService(service)}
                      >
                        <i className="fas fa-calendar-plus me-2"></i>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-search display-4 text-muted mb-3"></i>
              <h4 className="text-muted">No services found</h4>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          onClose={() => {
            setShowBookingForm(false);
            setSelectedService(null);
          }}
          onBookingSuccess={handleBookingSuccess}
          preselectedService={selectedService}
        />
      )}
    </div>
  );
};

export default Services;
