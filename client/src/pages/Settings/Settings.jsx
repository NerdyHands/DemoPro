import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  
  // Helper functions for user type display
  const getUserType = (user) => {
    if (user.role === 'admin') return 'admin';
    if (user.isWaitlisted) return 'waitlist';
    return 'client';
  };

  const getUserTypeLabel = (user) => {
    const type = getUserType(user);
    switch (type) {
      case 'admin': return 'Admin User';
      case 'waitlist': return 'Waitlist User';
      case 'client': return 'Client User';
      default: return 'Unknown';
    }
  };

  const getUserTypeIcon = (user) => {
    const type = getUserType(user);
    switch (type) {
      case 'admin': return '👑';
      case 'waitlist': return '⚠️';
      case 'client': return '👤';
      default: return '❓';
    }
  };

  const getUserTypeClass = (user) => {
    const type = getUserType(user);
    return `user-type-${type}`;
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    role: 'client',
    preferences: {
      notifications: {
        email: true,
        push: true
      },
      theme: 'light'
    }
  });

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      console.log('🔍 [Settings] Loading user profile...');
      const response = await apiService.getUserProfile();
      
      // Handle different response formats
      let userData = response;
      if (response && response.user) {
        userData = response.user;
      }
      
      console.log('✅ [Settings] User profile loaded:', userData);
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        company: userData.company || '',
        phone: userData.phone || '',
        role: userData.role || 'client',
        preferences: {
          notifications: {
            email: userData.preferences?.notifications?.email ?? true,
            push: userData.preferences?.notifications?.push ?? true
          },
          theme: userData.preferences?.theme || 'light'
        }
      });
      
      // Update localStorage with current user data
      localStorage.setItem('userProfile', JSON.stringify(userData));
      
    } catch (error) {
      console.error('❌ [Settings] Failed to load user profile:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        navigate('/login');
        return;
      }
      
      setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    loadUserProfile();
  }, [navigate, loadUserProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested preferences
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [section]: {
            ...prev.preferences[section],
            [field]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any existing messages when user starts editing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('💾 [Settings] Updating user profile:', formData);
      
      const response = await apiService.updateUserProfile(formData);
      console.log('✅ [Settings] Profile update response:', response);
      
      // Handle different response formats
      let updatedUser = response;
      if (response && response.user) {
        updatedUser = response.user;
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local state and localStorage
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      }
      
      // Reload user data to ensure consistency
      setTimeout(() => {
        loadUserProfile();
      }, 1000);
      
    } catch (error) {
      console.error('❌ [Settings] Failed to update profile:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        navigate('/login');
        return;
      }
      
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('currentProjectId');
    
    // Clear any other stored data
    localStorage.removeItem('picraProcessingData');
    localStorage.removeItem('fileUploads');
    
    // Navigate to login page
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="settings-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-content">
        <div className="settings-header-section">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and profile information</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-card">
          {/* Admin Indicator */}
          {user && user.role === 'admin' && (
            <div className="admin-indicator">
              <span className="admin-badge">👑 Admin User</span>
              <p className="admin-note">You have administrative privileges and can access the admin dashboard.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form">
            {/* Personal Information Section */}
            <div className="settings-section">
              <h2 className="section-title">Personal Information</h2>
              <p className="section-description">
                Fields marked with <span className="badge-editable">✓ Saved</span> are stored in the database. 
                Fields marked with <span className="badge-readonly">🔒 Read-only</span> cannot be changed.
              </p>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="label">
                    First Name <span className="badge-editable">✓ Saved</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field editable-field"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="label">
                    Last Name <span className="badge-editable">✓ Saved</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field editable-field"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">
                  Email Address <span className="badge-readonly">🔒 Read-only</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field readonly-field"
                  placeholder="Enter your email address"
                  required
                  disabled
                />
                <small className="field-note">Email cannot be changed after registration</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="label">
                  Phone Number <span className="badge-editable">✓ Saved</span> <span className="optional-tag">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field editable-field"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company" className="label">
                  Company <span className="badge-editable">✓ Saved</span> <span className="optional-tag">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field editable-field"
                  placeholder="Enter your company name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role" className="label">
                  Role <span className="badge-readonly">🔒 Read-only</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field readonly-field"
                  disabled
                >
                  <option value="client">Client</option>
                  <option value="inspector">Inspector</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <small className="field-note">Role can only be changed by administrators</small>
              </div>

              <div className="form-group">
                <label className="label">
                  User Type <span className="badge-readonly">🔒 Read-only</span>
                </label>
                <div className="user-type-display">
                  {user && (
                    <span className={`user-type-badge ${getUserTypeClass(user)}`}>
                      {getUserTypeIcon(user)} {getUserTypeLabel(user)}
                    </span>
                  )}
                </div>
                <small className="field-note">Your account classification based on role and status</small>
              </div>

              {/* Show waitlist reason if user is waitlisted */}
              {user && user.isWaitlisted && user.waitlistReason && (
                <div className="form-group">
                  <label className="label">
                    Waitlist Reason <span className="badge-readonly">🔒 Read-only</span>
                  </label>
                  <div className="waitlist-reason-display">
                    <span className="waitlist-reason-text">
                      ⚠️ {user.waitlistReason}
                    </span>
                  </div>
                  <small className="field-note">Reason for waitlist status - set by administrators</small>
                </div>
              )}
            </div>

            {/* Preferences Section */}
            <div className="settings-section">
              <h2 className="section-title">Preferences</h2>
              <p className="section-description">
                Your preferences are <span className="badge-editable">✓ Saved</span> to the database and will persist across sessions.
              </p>
              
              <div className="form-group">
                <label className="label">
                  Theme <span className="badge-editable">✓ Saved</span>
                </label>
                <select
                  name="preferences.theme"
                  value={formData.preferences.theme}
                  onChange={handleChange}
                  className="input-field editable-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System Default)</option>
                </select>
                <small className="field-note">Choose your preferred theme for the application</small>
              </div>

              <div className="form-group">
                <label className="label">
                  Notifications <span className="badge-editable">✓ Saved</span>
                </label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      name="preferences.notifications.email"
                      checked={formData.preferences.notifications.email}
                      onChange={handleChange}
                    />
                    <span className="checkbox-label">Email notifications for project updates</span>
                  </label>
                  
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      name="preferences.notifications.push"
                      checked={formData.preferences.notifications.push}
                      onChange={handleChange}
                    />
                    <span className="checkbox-label">Push notifications for real-time updates</span>
                  </label>
                </div>
                <small className="field-note">Manage how you receive notifications about your projects</small>
              </div>
            </div>

            {/* Account Actions Section */}
            <div className="settings-section">
              <h2 className="section-title">Account Actions</h2>
              
              <div className="action-buttons">
                <button 
                  type="submit" 
                  className="btn btn-primary save-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 
