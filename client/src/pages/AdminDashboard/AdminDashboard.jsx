import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import JobQueue from '../../components/JobQueue/JobQueue.jsx';
import MilestoneTracker from '../../components/MilestoneTracker/MilestoneTracker.jsx';
import UserDetails from '../../components/UserDetails/UserDetails.jsx';
import apiService from '../../services/api.jsx';

// Edit User Form Component
const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    company: user.company || '',
    role: user.role || 'client',
    isActive: user.isActive !== undefined ? user.isActive : true,
    isWaitlisted: user.isWaitlisted || false,
    waitlistReason: user.waitlistReason || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...user,
      ...formData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-user-form">
      <div className="form-group">
        <label className="label">First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="form-group">
        <label className="label">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="form-group">
        <label className="label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="form-group">
        <label className="label">Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label className="label">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input-field"
        >
          <option value="client">Client</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="inspector">Inspector</option>
        </select>
      </div>

      <div className="form-group">
        <label className="label">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="checkbox-field"
          />
          Active User
        </label>
      </div>

      <div className="form-group">
        <label className="label">
          <input
            type="checkbox"
            name="isWaitlisted"
            checked={formData.isWaitlisted}
            onChange={handleChange}
            className="checkbox-field"
          />
          Waitlisted User
        </label>
      </div>

      {formData.isWaitlisted && (
        <div className="form-group">
          <label className="label">Waitlist Reason</label>
          <textarea
            name="waitlistReason"
            value={formData.waitlistReason}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Reason for waitlisting this user..."
          />
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    admin: { total: 0, recent: 0, active: 0, percentage: 0 },
            waitlist: { total: 0, recent: 0, active: 0, percentage: 0 },
    client: { total: 0, recent: 0, active: 0, percentage: 0 },
    total: 0
  });
  const [usersByType, setUsersByType] = useState({
    admin: [],
    waitlist: [],
    client: []
  });
  const [selectedUserType, setSelectedUserType] = useState('admin');
  const [generalStats, setGeneralStats] = useState({
    totalProjects: 0,
    totalReports: 0,
    totalQuotes: 0,
    pendingApprovals: 0,
    totalQuoteValue: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [picraProcessing, setPicraProcessing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setLoadingProgress(0);
      
      // Load admin statistics and data with individual error handling
      const loadDataWithErrorHandling = async (promise, name, progress) => {
        try {
          const data = await promise;
          setLoadingProgress(progress);
          return { success: true, data, name };
        } catch (error) {
          console.error(`❌ Failed to load ${name}:`, error);
          setLoadingProgress(progress);
          return { success: false, error: error.message, name, data: null };
        }
      };

      // Load all data in parallel with individual error handling
      const results = await Promise.all([
        loadDataWithErrorHandling(apiService.getUserStats(), 'user stats', 16),
        loadDataWithErrorHandling(apiService.getProjects(), 'projects', 32),
        loadDataWithErrorHandling(apiService.getReports(), 'reports', 48),
        loadDataWithErrorHandling(apiService.getQuotes(), 'quotes', 64),
        loadDataWithErrorHandling(apiService.getPendingApprovalQuotes(), 'pending quotes', 80),
        loadDataWithErrorHandling(apiService.getPICRAProcessingStats(), 'PICRA stats', 96)
      ]);

      // Extract data from results
      const userStatsResult = results[0];
      const projectsResult = results[1];
      const reportsResult = results[2];
      const quotesResult = results[3];
      const pendingQuotesResult = results[4];
      const picraResult = results[5];

      // Check for critical failures (authentication errors)
      const authErrors = results.filter(r => r.error && (
        r.error.includes('Authentication') || 
        r.error.includes('401') || 
        r.error.includes('403') ||
        r.error.includes('Access denied')
      ));

      if (authErrors.length > 0) {
        const authError = authErrors[0];
        setError(`Authentication error: ${authError.error}. Please sign in again.`);
        // Clear auth and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }

      // Collect failed requests for error message
      const failedRequests = results.filter(r => !r.success);
      if (failedRequests.length > 0) {
        const failedNames = failedRequests.map(r => r.name).join(', ');
        console.warn(`⚠️ Some data failed to load: ${failedNames}`);
        // Don't set error if only some requests failed - show partial data
        if (failedRequests.length === results.length) {
          // All requests failed
          setError(`Failed to load admin data. Errors: ${failedNames}. Please check your connection and try again.`);
          return;
        }
      }

      // Set user statistics (with fallback)
      if (userStatsResult.success) {
        setUserStats(userStatsResult.data);
      } else {
        setUserStats({ admin: { total: 0 }, waitlist: { total: 0 }, client: { total: 0 }, total: 0 });
      }

      // Ensure data is in the correct format
      const projectsData = projectsResult.success ? projectsResult.data : null;
      const reportsData = reportsResult.success ? reportsResult.data : null;
      const quotesData = quotesResult.success ? quotesResult.data : null;
      const pendingQuotesData = pendingQuotesResult.success ? pendingQuotesResult.data : null;
      const picraData = picraResult.success ? picraResult.data : null;

      const projectsArray = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);
      const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData?.reports || []);

      // Calculate general statistics with fallbacks
      const totalProjects = projectsArray.length;
      const totalReports = reportsArray.length;
      const totalQuotes = quotesData?.quotes ? quotesData.quotes.length : 0;
      const pendingApprovals = pendingQuotesData?.quotes ? pendingQuotesData.quotes.length : 0;
      const totalQuoteValue = quotesData?.quotes ? quotesData.quotes.reduce((sum, quote) => sum + (quote.total || 0), 0) : 0;

      setGeneralStats({
        totalProjects,
        totalReports,
        totalQuotes,
        pendingApprovals,
        totalQuoteValue
      });

      // Get recent projects (last 5)
      const recentProjectsData = projectsArray
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
      setRecentProjects(recentProjectsData);

      // Set quotes data with fallbacks
      setQuotes(quotesData?.quotes || []);
      setPendingQuotes(pendingQuotesData?.quotes || []);
      setPicraProcessing(picraData || []);

      console.log('✅ AdminDashboard - Data loaded successfully');

    } catch (err) {
      console.error('❌ Failed to load admin data:', err);
      const errorMessage = err.message || 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Network')) {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
        setError('Authentication failed. Please sign in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } else {
        setError(`Failed to load admin data: ${errorMessage}. Please try again.`);
      }
    } finally {
      setLoadingProgress(100);
      setTimeout(() => setLoading(false), 200);
    }
  }, []);

  const loadUsersByType = useCallback(async (type) => {
    try {
      const response = await apiService.getUsersByType(type, { limit: 10 });
      setUsersByType(prev => ({
        ...prev,
        [type]: response.users || []
      }));
    } catch (err) {
      console.error(`Failed to load ${type} users:`, err);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersByType(selectedUserType);
    }
  }, [activeTab, selectedUserType, loadUsersByType]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'Active':
      case 'approved':
      case 'completed':
        return '#4CAF50';
      case 'inactive':
      case 'Inactive':
      case 'rejected':
      case 'failed':
        return '#f44336';
      case 'pending':
      case 'Pending':
      case 'processing':
        return '#FFC107';
      case 'sent':
        return '#2196F3';
      case 'draft':
        return '#9E9E9E';
      default:
        return '#888888';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Fix date parsing to prevent "one day off" issue by using UTC parsing
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleSendQuote = async (quoteId) => {
    try {
      await apiService.sendQuote(quoteId);
      loadAdminData(); // Reload data
      alert('Quote sent successfully!');
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Failed to send quote. Please try again.');
    }
  };

  const handleUpdateApproval = async (quoteId, status) => {
    try {
      await apiService.updateQuoteApproval(quoteId, status);
      loadAdminData(); // Reload data
      alert(`Quote ${status} successfully!`);
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update approval. Please try again.');
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'admin':
        return '👑';
              case 'waitlist':
          return '⚠️';
      case 'client':
        return '👤';
      default:
        return '👤';
    }
  };

  // User Management Functions
  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      role: user.role || 'client',
      isActive: user.isActive !== undefined ? user.isActive : true,
      isWaitlisted: user.isWaitlisted || false
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleUserRowClick = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      await apiService.updateUserProfile(userData);
      setShowEditModal(false);
      setEditingUser(null);
      loadUsersByType(selectedUserType); // Reload the current user type
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await apiService.deleteUser(userToDelete._id || userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsersByType(selectedUserType); // Reload the current user type
      loadAdminData(); // Reload admin stats
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Handler for clicking on user type cards
  const handleUserTypeCardClick = (userType) => {
    setSelectedUserType(userType);
    setActiveTab('users');
  };

  // Quick Action Handlers
  const handleCreateQuote = () => {
    navigate('/admin/quotes/new');
  };

  const handleSendQuoteAction = () => {
    // Show modal with draft quotes
    setShowSendQuoteModal(true);
  };

  const handleApproveQuote = () => {
    // Switch to pending approval tab
    setActiveTab('pending');
  };

  const handleGenerateReport = () => {
    // Navigate to pipeline dashboard which has reporting
    navigate('/admin/pipeline');
  };

  const handleCloseSendQuoteModal = () => {
    setShowSendQuoteModal(false);
  };



  if (loading) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p>Loading admin dashboard... {loadingProgress}%</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadAdminData}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-left">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">System overview and user management</p>
          </div>
          <div className="header-right">
            <Link to="/admin/pipeline" className="btn btn-secondary">
              Pipeline Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users by Type
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            Quotes ({quotes.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({pendingQuotes.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'picra' ? 'active' : ''}`}
            onClick={() => setActiveTab('picra')}
          >
            PICRA Processing
          </button>
          <button 
            className={`tab-btn ${activeTab === 'job-queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('job-queue')}
          >
            Job Queue
          </button>
          <button 
            className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            Milestones
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* User Type Statistics */}
            <div className="user-type-stats">
              <h2 className="section-title">Users by Type</h2>
              <div className="user-type-grid">
                {/* Admin Users */}
                <div 
                  className="user-type-card admin" 
                  onClick={() => handleUserTypeCardClick('admin')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-type-header">
                    <div className="user-type-icon">👑</div>
                    <div className="user-type-info">
                      <h3>Admin Users</h3>
                      <p className="user-type-description">System administrators and managers</p>
                    </div>
                  </div>
                  <div className="user-type-metrics">
                    <div className="metric">
                      <span className="metric-number">{userStats.admin.total}</span>
                      <span className="metric-label">Total</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.admin.recent}</span>
                      <span className="metric-label">New (30d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.admin.active}</span>
                      <span className="metric-label">Active (7d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.admin.percentage}%</span>
                      <span className="metric-label">of Total</span>
                    </div>
                  </div>
                </div>

                {/* Waitlist Users */}
                <div 
                  className="user-type-card waitlist" 
                  onClick={() => handleUserTypeCardClick('waitlist')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-type-header">
                    <div className="user-type-icon">⚠️</div>
                    <div className="user-type-info">
                      <h3>Waitlist Users</h3>
                      <p className="user-type-description">Users under monitoring</p>
                    </div>
                  </div>
                  <div className="user-type-metrics">
                    <div className="metric">
                      <span className="metric-number">{userStats.waitlist.total}</span>
                      <span className="metric-label">Total</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.waitlist.recent}</span>
                      <span className="metric-label">New (30d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.waitlist.active}</span>
                      <span className="metric-label">Active (7d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.waitlist.percentage}%</span>
                      <span className="metric-label">of Total</span>
                    </div>
                  </div>
                </div>

                {/* Client Users */}
                <div 
                  className="user-type-card client" 
                  onClick={() => handleUserTypeCardClick('client')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-type-header">
                    <div className="user-type-icon">👤</div>
                    <div className="user-type-info">
                      <h3>Client Users</h3>
                      <p className="user-type-description">Regular customers and clients</p>
                    </div>
                  </div>
                  <div className="user-type-metrics">
                    <div className="metric">
                      <span className="metric-number">{userStats.client.total}</span>
                      <span className="metric-label">Total</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.client.recent}</span>
                      <span className="metric-label">New (30d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.client.active}</span>
                      <span className="metric-label">Active (7d)</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{userStats.client.percentage}%</span>
                      <span className="metric-label">of Total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon projects-icon">📋</div>
                <div className="stat-content">
                  <h3 className="stat-number">{generalStats.totalProjects}</h3>
                  <p className="stat-label">Total Projects</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon reports-icon">📊</div>
                <div className="stat-content">
                  <h3 className="stat-number">{generalStats.totalReports}</h3>
                  <p className="stat-label">Total Reports</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon quotes-icon">💰</div>
                <div className="stat-content">
                  <h3 className="stat-number">{generalStats.totalQuotes}</h3>
                  <p className="stat-label">Total Quotes</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending-icon">⏳</div>
                <div className="stat-content">
                  <h3 className="stat-number">{generalStats.pendingApprovals}</h3>
                  <p className="stat-label">Pending Approvals</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon value-icon">💵</div>
                <div className="stat-content">
                  <h3 className="stat-number">{formatCurrency(generalStats.totalQuoteValue)}</h3>
                  <p className="stat-label">Total Quote Value</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="admin-sections">
              {/* Recent Projects */}
              <div className="admin-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Projects</h2>
                  <button className="btn btn-secondary view-all-btn">View All</button>
                </div>
                
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProjects.map(project => (
                        <tr key={project.id || project._id}>
                          <td>{project.name}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(project.status) }}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td>{formatDate(project.deadline)}</td>
                          <td>{formatDate(project.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users by Type Tab */}
        {activeTab === 'users' && (
          <div className="users-by-type-section">
            <div className="section-header">
              <h2 className="section-title">Users by Type</h2>
              <div className="user-type-selector">
                <button 
                  className={`type-btn ${selectedUserType === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedUserType('admin')}
                >
                  👑 Admin ({userStats.admin.total})
                </button>
                <button 
                  className={`type-btn ${selectedUserType === 'waitlist' ? 'active' : ''}`}
                  onClick={() => setSelectedUserType('waitlist')}
                >
                  ⚠️ Waitlist ({userStats.waitlist.total})
                </button>
                <button 
                  className={`type-btn ${selectedUserType === 'client' ? 'active' : ''}`}
                  onClick={() => setSelectedUserType('client')}
                >
                  👤 Client ({userStats.client.total})
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersByType[selectedUserType].map(user => (
                    <tr 
                      key={user.id || user._id}
                      className="user-row"
                      onClick={() => handleUserRowClick(user)}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = ''}
                    >
                      <td>
                        <div className="user-info">
                          <span className="user-icon">{getUserTypeIcon(selectedUserType)}</span>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.company || '-'}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(user.isActive ? 'active' : 'inactive') }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn btn-small btn-primary"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">All Quotes</h2>
              <button className="btn btn-primary">Create New Quote</button>
            </div>
            
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map(quote => (
                    <tr key={quote.id || quote._id}>
                      <td>{quote.quoteNumber}</td>
                      <td>
                        <div>
                          <div>{quote.customer?.name}</div>
                          <div className="text-muted">{quote.customer?.email}</div>
                        </div>
                      </td>
                      <td>{quote.projectId?.name}</td>
                      <td>{formatCurrency(quote.total)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(quote.status) }}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(quote.approval?.status) }}
                        >
                          {quote.approval?.status}
                        </span>
                      </td>
                      <td>{formatDate(quote.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          {quote.status === 'draft' && (
                            <button 
                              className="btn btn-small btn-primary"
                              onClick={() => handleSendQuote(quote.id || quote._id)}
                            >
                              Send
                            </button>
                          )}
                          <button className="btn btn-small btn-secondary">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Approval Tab */}
        {activeTab === 'pending' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">Pending Approvals</h2>
            </div>
            
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Sent Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQuotes.map(quote => (
                    <tr key={quote.id || quote._id}>
                      <td>{quote.quoteNumber}</td>
                      <td>
                        <div>
                          <div>{quote.customer?.name}</div>
                          <div className="text-muted">{quote.customer?.email}</div>
                        </div>
                      </td>
                      <td>{quote.projectId?.name}</td>
                      <td>{formatCurrency(quote.total)}</td>
                      <td>{formatDate(quote.approval?.requestedAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-small btn-success"
                            onClick={() => handleUpdateApproval(quote.id || quote._id, 'approved')}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleUpdateApproval(quote.id || quote._id, 'rejected')}
                          >
                            Reject
                          </button>
                          <button className="btn btn-small btn-secondary">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PICRA Processing Tab */}
        {activeTab === 'picra' && (
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">PICRA Processing Overview</h2>
            </div>
            
            <div className="picra-stats">
              <div className="stat-item">
                <h3>Total Records</h3>
                <p>{picraProcessing.totalRecords || 0}</p>
              </div>
              <div className="stat-item">
                <h3>Completed</h3>
                <p>{picraProcessing.completedRecords || 0}</p>
              </div>
              <div className="stat-item">
                <h3>Success Rate</h3>
                <p>{picraProcessing.successRate || 0}%</p>
              </div>
              <div className="stat-item">
                <h3>Total Value</h3>
                <p>{formatCurrency(picraProcessing.totalEstimatedCost || 0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Queue Tab */}
        {activeTab === 'job-queue' && (
          <div className="admin-section">
            <JobQueue />
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="admin-section">
            <MilestoneTracker />
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={handleCreateQuote}>
              <span className="action-icon">➕</span>
              <span className="action-text">Create Quote</span>
            </button>
            <button className="action-btn" onClick={handleSendQuoteAction}>
              <span className="action-icon">📧</span>
              <span className="action-text">Send Quote</span>
            </button>
            <button className="action-btn" onClick={handleApproveQuote}>
              <span className="action-icon">✅</span>
              <span className="action-text">Approve Quote</span>
            </button>
            <button className="action-btn" onClick={handleGenerateReport}>
              <span className="action-icon">📊</span>
              <span className="action-text">Generate Report</span>
            </button>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit User</h3>
                <button className="modal-close" onClick={handleCancelEdit}>×</button>
              </div>
              <div className="modal-body">
                <EditUserForm 
                  user={editingUser}
                  onSave={handleSaveUser}
                  onCancel={handleCancelEdit}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && userToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Delete User</h3>
                <button className="modal-close" onClick={handleCancelDelete}>×</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
                <div className="user-delete-info">
                  <p><strong>Name:</strong> {userToDelete.firstName} {userToDelete.lastName}</p>
                  <p><strong>Email:</strong> {userToDelete.email}</p>
                  <p><strong>Role:</strong> {userToDelete.role}</p>
                </div>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <UserDetails
            user={selectedUser}
            userType={selectedUserType}
            onClose={handleCloseUserDetails}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}

        {/* Send Quote Modal */}
        {showSendQuoteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Send Quote</h3>
                <button className="modal-close" onClick={handleCloseSendQuoteModal}>×</button>
              </div>
              <div className="modal-body">
                <p>Select a draft quote to send to the customer:</p>
                {quotes.filter(q => q.status === 'draft').length === 0 ? (
                  <div className="empty-state">
                    <p>No draft quotes available to send.</p>
                    <button className="btn btn-primary" onClick={handleCreateQuote}>
                      Create New Quote
                    </button>
                  </div>
                ) : (
                  <div className="quote-list">
                    {quotes.filter(q => q.status === 'draft').map(quote => (
                      <div key={quote.id || quote._id} className="quote-item">
                        <div className="quote-info">
                          <h4>Quote #{quote.quoteNumber}</h4>
                          <p className="quote-customer">{quote.customer?.name || 'Unknown Customer'}</p>
                          <p className="quote-amount">{formatCurrency(quote.total)}</p>
                        </div>
                        <div className="quote-actions">
                          <button 
                            className="btn btn-small btn-primary"
                            onClick={() => {
                              handleSendQuote(quote.id || quote._id);
                              handleCloseSendQuoteModal();
                            }}
                          >
                            Send
                          </button>
                          <Link 
                            to={`/admin/quotes/${quote.id || quote._id}`}
                            className="btn btn-small btn-secondary"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseSendQuoteModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard; 
