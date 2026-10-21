import React, { useState, useEffect } from 'react';
import './UserDetails.css';

const UserDetails = ({ user, userType, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userActivity, setUserActivity] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserDetails();
    }
  }, [user]);

  const loadUserDetails = async () => {
    // setLoading(true);
    try {
      // In a real app, you would fetch detailed user data here
      // For now, we'll simulate the data
      const mockActivity = [
        {
          id: 1,
          type: 'login',
          description: 'User logged in',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          ip: '192.168.1.100'
        },
        {
          id: 2,
          type: 'project_created',
          description: 'Created new project: Kitchen Renovation',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          projectId: 'PRJ-001'
        },
        {
          id: 3,
          type: 'quote_requested',
          description: 'Requested quote for bathroom remodel',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          quoteId: 'QT-001'
        }
      ];

      const mockProjects = [
        {
          id: 'PRJ-001',
          name: 'Kitchen Renovation',
          status: 'In Progress',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          budget: 25000,
          progress: 65
        },
        {
          id: 'PRJ-002',
          name: 'Bathroom Remodel',
          status: 'Planning',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-05-15'),
          budget: 15000,
          progress: 20
        }
      ];

      setUserActivity(mockActivity);
      setUserProjects(mockProjects);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      // setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#28A745',
      'inactive': '#DC3545',
      'pending': '#FFC107',
      'suspended': '#6C757D'
    };
    return colors[status] || '#6C757D';
  };

  const getUserTypeIcon = (type) => {
    const icons = {
      'admin': '👑',
      'waitlist': '⚠️',
      'client': '👤'
    };
    return icons[type] || '👤';
  };

  const getActivityIcon = (type) => {
    const icons = {
      'login': '🔐',
      'project_created': '📋',
      'quote_requested': '💰',
      'profile_updated': '✏️',
      'payment_made': '💳'
    };
    return icons[type] || '📝';
  };

  if (!user) return null;

  return (
    <div className="user-details-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <div className="user-header">
            <div className="user-avatar">
              <span className="avatar-icon">{getUserTypeIcon(userType)}</span>
            </div>
            <div className="user-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-type">{userType.charAt(0).toUpperCase() + userType.slice(1)} User</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="user-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
            <button 
              className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projects
            </button>
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="user-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <h3>{userProjects.length}</h3>
                      <p>Total Projects</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <h3>{formatCurrency(userProjects.reduce((sum, p) => sum + p.budget, 0))}</h3>
                      <p>Total Budget</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <h3>{formatDate(user.createdAt)}</h3>
                      <p>Member Since</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔐</div>
                    <div className="stat-content">
                      <h3>{formatDate(user.lastLogin)}</h3>
                      <p>Last Login</p>
                    </div>
                  </div>
                </div>

                <div className="user-details-section">
                  <h3>Personal Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Full Name:</label>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Company:</label>
                      <span>{user.company || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(user.isActive ? 'active' : 'inactive') }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>User Type:</label>
                      <span className="user-type-badge">{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="user-actions">
                  <button className="btn btn-primary" onClick={() => onEdit(user)}>
                    Edit User
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('activity')}>
                    View Activity
                  </button>
                  <button className="btn btn-danger" onClick={() => onDelete(user)}>
                    Delete User
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-tab">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {userActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="activity-content">
                        <p className="activity-description">{activity.description}</p>
                        <p className="activity-time">{formatDate(activity.timestamp)}</p>
                        {activity.ip && <p className="activity-meta">IP: {activity.ip}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="projects-tab">
                <h3>User Projects</h3>
                <div className="projects-list">
                  {userProjects.map(project => (
                    <div key={project.id} className="project-item">
                      <div className="project-header">
                        <h4>{project.name}</h4>
                        <span 
                          className="project-status"
                          style={{ backgroundColor: getStatusColor(project.status.toLowerCase()) }}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="project-details">
                        <div className="project-meta">
                          <span>Budget: {formatCurrency(project.budget)}</span>
                          <span>Start: {formatDate(project.startDate)}</span>
                          <span>End: {formatDate(project.endDate)}</span>
                        </div>
                        <div className="project-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span>{project.progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-tab">
                <h3>Account Settings</h3>
                <div className="settings-section">
                  <h4>Account Status</h4>
                  <div className="setting-item">
                    <label>Account Status:</label>
                    <select defaultValue={user.isActive ? 'active' : 'inactive'}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>User Type:</label>
                    <select defaultValue={userType}>
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                      <option value="waitlist">Waitlist</option>
                    </select>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Security</h4>
                  <div className="setting-item">
                    <label>Two-Factor Authentication:</label>
                    <button className="btn btn-small btn-secondary">Enable 2FA</button>
                  </div>
                  <div className="setting-item">
                    <label>Password Reset:</label>
                    <button className="btn btn-small btn-secondary">Send Reset Link</button>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary">Save Changes</button>
                  <button className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
