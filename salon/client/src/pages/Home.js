import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-salon-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-salon-primary mb-4">
                Welcome to Our Salon
              </h1>
              <p className="lead mb-4">
                Book your favorite salon services with ease. From haircuts to spa treatments, 
                we provide professional services tailored to your needs.
              </p>
              <div className="d-flex gap-3">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register" className="btn salon-primary btn-lg">
                      Get Started
                    </Link>
                    <Link to="/services" className="btn salon-secondary btn-lg">
                      View Services
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn salon-primary btn-lg">
                      My Dashboard
                    </Link>
                    <Link to="/bookings" className="btn salon-secondary btn-lg">
                      Book Appointment
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <i className="fas fa-cut display-1 text-salon-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="display-5 fw-bold text-salon-primary">Why Choose Us?</h2>
              <p className="lead">Professional salon services at your convenience</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-calendar-check stats-icon text-salon-primary mb-3"></i>
                  <h5 className="card-title">Easy Booking</h5>
                  <p className="card-text">
                    Book your appointments online with our simple and intuitive booking system.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-star stats-icon text-salon-primary mb-3"></i>
                  <h5 className="card-title">Quality Service</h5>
                  <p className="card-text">
                    Professional stylists and high-quality products for the best salon experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-clock stats-icon text-salon-primary mb-3"></i>
                  <h5 className="card-title">Flexible Timing</h5>
                  <p className="card-text">
                    Choose from available time slots that fit your schedule perfectly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-salon-light py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="display-5 fw-bold text-salon-primary">Our Services</h2>
              <p className="lead">Professional salon services for all your beauty needs</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-cut stats-icon text-salon-primary mb-3"></i>
                  <h6 className="card-title">Haircut & Styling</h6>
                  <p className="card-text small">Professional haircuts and styling services</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-palette stats-icon text-salon-primary mb-3"></i>
                  <h6 className="card-title">Hair Coloring</h6>
                  <p className="card-text small">Expert hair coloring and highlights</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-spa stats-icon text-salon-primary mb-3"></i>
                  <h6 className="card-title">Spa Treatments</h6>
                  <p className="card-text small">Relaxing spa and facial treatments</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm card-hover">
                <div className="card-body text-center p-4">
                  <i className="fas fa-hand-paper stats-icon text-salon-primary mb-3"></i>
                  <h6 className="card-title">Manicure & Pedicure</h6>
                  <p className="card-text small">Beautiful nail care services</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/services" className="btn salon-primary btn-lg">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h2 className="display-5 fw-bold text-salon-primary mb-4">
                  Ready to Book Your Appointment?
                </h2>
                <p className="lead mb-4">
                  Join thousands of satisfied customers who trust us with their beauty needs.
                </p>
                <Link to="/register" className="btn salon-primary btn-lg me-3">
                  Create Account
                </Link>
                <Link to="/login" className="btn salon-secondary btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;









