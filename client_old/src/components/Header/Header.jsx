import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (showUserMenu) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [showUserMenu]);

  const loadUserProfile = async () => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const parsedUser = JSON.parse(userProfile);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSignout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('currentProjectId');
    
    // Clear any other stored data
    localStorage.removeItem('picraProcessingData');
    localStorage.removeItem('fileUploads');
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
    
    // Navigate to login page
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Don't show header on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <span className="home-icon">🏠</span>
            <span className="logo-text">Mr Demo Pro</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/upload" 
            className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
          >
            Get New Quote
          </Link>
          <Link 
            to="/properties" 
            className={`nav-link ${isActive('/properties') ? 'active' : ''}`}
          >
            Properties
          </Link>
          {isAdmin && (
            <>
              <Link 
                to="/customers" 
                className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
              >
                Customers
              </Link>
              <Link 
                to="/estimates" 
                className={`nav-link ${isActive('/estimates') ? 'active' : ''}`}
              >
                Estimates
              </Link>
              <Link 
                to="/contracts" 
                className={`nav-link ${isActive('/contracts') ? 'active' : ''}`}
              >
                Contracts
              </Link>
              <Link 
                to="/prework-inspections" 
                className={`nav-link ${isActive('/prework-inspections') ? 'active' : ''}`}
              >
                Pre-Work Inspections
              </Link>
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin Dashboard
              </Link>
            </>
          )}
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            Settings
          </Link>
        </nav>

        {/* User Menu - Desktop */}
        <div className="user-menu-container" ref={userMenuRef}>
          {user && (
            <div className={`user-menu ${showUserMenu ? 'open' : ''}`}>
              <button 
                className="user-menu-btn"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  {isAdmin && <span className="admin-indicator-small">👑</span>}
                </span>
                <span className={`user-menu-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
              </button>
              
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-role">{user.role || 'User'}</div>
                </div>
                <div className="user-dropdown-divider"></div>
                <button 
                  className="signout-btn"
                  onClick={handleSignout}
                >
                  <span className="signout-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Navigation */}
        <nav className={`header-nav mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/upload" 
            className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get New Quote
          </Link>
          <Link 
            to="/properties" 
            className={`nav-link ${isActive('/properties') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Properties
          </Link>
          {isAdmin && (
            <>
              <Link 
                to="/customers" 
                className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Customers
              </Link>
              <Link 
                to="/estimates" 
                className={`nav-link ${isActive('/estimates') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Estimates
              </Link>
              <Link 
                to="/contracts" 
                className={`nav-link ${isActive('/contracts') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contracts
              </Link>
              <Link 
                to="/contracts" 
                className={`nav-link ${isActive('/contracts') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pre-Work Inspections
              </Link>
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            </>
          )}
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Settings
          </Link>
          
          {/* Mobile User Info and Signout */}
          {user && (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  </div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </div>
              <button 
                className="mobile-signout-btn"
                onClick={handleSignout}
              >
                <span className="signout-icon">🚪</span>
                Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 