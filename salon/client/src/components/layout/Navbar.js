import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark salon-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-cut me-2"></i>
          Salon Management
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/services" onClick={() => setIsOpen(false)}>
                Services
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bookings" onClick={() => setIsOpen(false)}>
                    My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reviews" onClick={() => setIsOpen(false)}>
                    Reviews
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/transactions" onClick={() => setIsOpen(false)}>
                    My Transactions
                  </Link>
                </li>

                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle"
                      to="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Admin
                    </Link>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" to="/admin" onClick={() => setIsOpen(false)}>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/services" onClick={() => setIsOpen(false)}>
                          Services
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/bookings" onClick={() => setIsOpen(false)}>
                          Bookings
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/users" onClick={() => setIsOpen(false)}>
                          Users
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/staff" onClick={() => setIsOpen(false)}>
                          Staff
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/reviews" onClick={() => setIsOpen(false)}>
                          Reviews
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/transactions" onClick={() => setIsOpen(false)}>
                          Transactions
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-1"></i>
                    {user?.name}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-user-cog me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



