import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import UserDetails from '../../components/UserDetails/UserDetails.jsx';
import apiService from '../../services/api.jsx';
import { customerApi, estimateApi } from '../../services/contractsApi';
import '../../components/BidBoardLayout/BidBoardLayout.css';

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
  const [customersWithEstimates, setCustomersWithEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadCustomersAndEstimates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      const [customersResponse, estimatesResponse] = await Promise.all([
        customerApi.getCustomers().catch(() => ({ customers: [] })),
        estimateApi.getEstimates().catch(() => ({ estimates: [] }))
      ]);
      
      setLoadingProgress(50);
      
      const customersData = customersResponse.customers || [];
      const estimatesData = estimatesResponse.estimates || [];
      
      // Group estimates by customer
      const estimatesByCustomer = {};
      estimatesData.forEach(estimate => {
        const customerId = estimate.customerId || (estimate.customer?._id || estimate.customer?.id);
        if (customerId) {
          if (!estimatesByCustomer[customerId]) {
            estimatesByCustomer[customerId] = [];
          }
          estimatesByCustomer[customerId].push(estimate);
        }
      });
      
      setLoadingProgress(75);
      
      // Add last estimate date to each customer
      const customersWithEstimateInfo = customersData.map(customer => {
        const customerEstimates = estimatesByCustomer[customer._id] || [];
        const sortedEstimates = customerEstimates.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        const lastEstimate = sortedEstimates[0] || null;
        const lastEstimateDate = lastEstimate ? new Date(lastEstimate.createdAt) : null;
        
        return {
          ...customer,
          estimates: customerEstimates,
          lastEstimate,
          lastEstimateDate,
          estimateCount: customerEstimates.length
        };
      });
      
      setLoadingProgress(100);
      setCustomersWithEstimates(customersWithEstimateInfo);
    } catch (err) {
      console.error('Failed to load customers and estimates:', err);
      setError('Failed to load customers and estimates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomersAndEstimates();
  }, [loadCustomersAndEstimates]);

  // Function to get the estimate bin for a customer
  const getEstimateBin = useCallback((customer) => {
    if (!customer.lastEstimateDate || customer.estimateCount === 0) {
      return 'no-estimates';
    }
    
    const now = new Date();
    const daysSince = Math.floor((now - customer.lastEstimateDate) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 7) return '7-days';
    if (daysSince <= 14) return '14-days';
    if (daysSince <= 30) return '1-month';
    if (daysSince <= 90) return '3-months';
    return 'older';
  }, []);

  // Get counts for each bin
  const binCounts = useMemo(() => {
    const counts = {
      'all': customersWithEstimates.length,
      '7-days': 0,
      '14-days': 0,
      '1-month': 0,
      '3-months': 0,
      'no-estimates': 0,
      'older': 0
    };
    
    customersWithEstimates.forEach(customer => {
      const bin = getEstimateBin(customer);
      if (counts.hasOwnProperty(bin)) {
        counts[bin]++;
      }
    });
    
    return counts;
  }, [customersWithEstimates, getEstimateBin]);


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle various date formats
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      } 
      // If it's a string, try parsing it
      else if (typeof dateString === 'string') {
        // Try parsing as-is first
        date = new Date(dateString);
        
        // If invalid, try adding time component for date-only strings
        if (isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateString + 'T00:00:00.000Z');
        }
        
        // If still invalid, try ISO format
        if (isNaN(date.getTime())) {
          date = new Date(dateString);
        }
      } else {
        return 'N/A';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
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

  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      await apiService.updateUserProfile(userData);
      setShowEditModal(false);
      setEditingUser(null);
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




  if (loading) {
    return (
      <Layout>
        <div className="bid-board-container">
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
        <div className="bid-board-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => loadCustomersAndEstimates()}
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
      <div className="bid-board-container">
        <div className="bid-board-header">
          <div className="bid-board-title-section">
            <h1 className="bid-board-title">Admin Dashboard</h1>
            <p className="bid-board-subtitle">System overview and user management</p>
          </div>
          <div className="bid-board-actions">
            <Link to="/admin/pipeline" className="bid-board-import-btn" style={{ textDecoration: 'none' }}>
              Pipeline Dashboard
            </Link>
          </div>
        </div>

        {/* Customers by Last Estimate - Main Content */}
        <div className="users-by-type-section">
          <div className="section-header">
            <h2 className="section-title">Customers by Last Estimate</h2>
          </div>
            
          <div className="bid-board-status-sections">
            {/* 7 Days Section */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input type="checkbox" defaultChecked />
                <span className="bid-board-status-title">7 Days</span>
                <span className="bid-board-status-count">{binCounts['7-days']}</span>
              </div>
              <div className="bid-board-cards-container">
                {customersWithEstimates
                  .filter(customer => getEstimateBin(customer) === '7-days')
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <h4 className="bid-board-card-title">{displayName}</h4>
                        </div>
                        <div className="bid-board-card-body">
                          <p className="bid-board-card-text">{customer.email || '-'}</p>
                          <p className="bid-board-card-text">{customer.company || customer.businessName || '-'}</p>
                          <p className="bid-board-card-text">
                            Last Estimate: {customer.lastEstimateDate ? formatDate(customer.lastEstimateDate) : 'N/A'}
                          </p>
                          <p className="bid-board-card-text">Estimate Count: {customer.estimateCount || 0}</p>
                        </div>
                        <div className="bid-board-card-actions">
                          <Link
                            to={`/customers/edit/${customer._id}`}
                            className="bid-board-card-link"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                {binCounts['7-days'] === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No customers in this category
                  </div>
                )}
              </div>
            </div>

            {/* 14 Days Section */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input type="checkbox" defaultChecked />
                <span className="bid-board-status-title">14 Days</span>
                <span className="bid-board-status-count">{binCounts['14-days']}</span>
              </div>
              <div className="bid-board-cards-container">
                {customersWithEstimates
                  .filter(customer => getEstimateBin(customer) === '14-days')
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <h4 className="bid-board-card-title">{displayName}</h4>
                        </div>
                        <div className="bid-board-card-body">
                          <p className="bid-board-card-text">{customer.email || '-'}</p>
                          <p className="bid-board-card-text">{customer.company || customer.businessName || '-'}</p>
                          <p className="bid-board-card-text">
                            Last Estimate: {customer.lastEstimateDate ? formatDate(customer.lastEstimateDate) : 'N/A'}
                          </p>
                          <p className="bid-board-card-text">Estimate Count: {customer.estimateCount || 0}</p>
                        </div>
                        <div className="bid-board-card-actions">
                          <Link
                            to={`/customers/edit/${customer._id}`}
                            className="bid-board-card-link"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                {binCounts['14-days'] === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No customers in this category
                  </div>
                )}
              </div>
            </div>

            {/* 1 Month Section */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input type="checkbox" defaultChecked />
                <span className="bid-board-status-title">1 Month</span>
                <span className="bid-board-status-count">{binCounts['1-month']}</span>
              </div>
              <div className="bid-board-cards-container">
                {customersWithEstimates
                  .filter(customer => getEstimateBin(customer) === '1-month')
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <h4 className="bid-board-card-title">{displayName}</h4>
                        </div>
                        <div className="bid-board-card-body">
                          <p className="bid-board-card-text">{customer.email || '-'}</p>
                          <p className="bid-board-card-text">{customer.company || customer.businessName || '-'}</p>
                          <p className="bid-board-card-text">
                            Last Estimate: {customer.lastEstimateDate ? formatDate(customer.lastEstimateDate) : 'N/A'}
                          </p>
                          <p className="bid-board-card-text">Estimate Count: {customer.estimateCount || 0}</p>
                        </div>
                        <div className="bid-board-card-actions">
                          <Link
                            to={`/customers/edit/${customer._id}`}
                            className="bid-board-card-link"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                {binCounts['1-month'] === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No customers in this category
                  </div>
                )}
              </div>
            </div>

            {/* 3 Months Section */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input type="checkbox" defaultChecked />
                <span className="bid-board-status-title">3 Months</span>
                <span className="bid-board-status-count">{binCounts['3-months']}</span>
              </div>
              <div className="bid-board-cards-container">
                {customersWithEstimates
                  .filter(customer => getEstimateBin(customer) === '3-months')
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <h4 className="bid-board-card-title">{displayName}</h4>
                        </div>
                        <div className="bid-board-card-body">
                          <p className="bid-board-card-text">{customer.email || '-'}</p>
                          <p className="bid-board-card-text">{customer.company || customer.businessName || '-'}</p>
                          <p className="bid-board-card-text">
                            Last Estimate: {customer.lastEstimateDate ? formatDate(customer.lastEstimateDate) : 'N/A'}
                          </p>
                          <p className="bid-board-card-text">Estimate Count: {customer.estimateCount || 0}</p>
                        </div>
                        <div className="bid-board-card-actions">
                          <Link
                            to={`/customers/edit/${customer._id}`}
                            className="bid-board-card-link"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                {binCounts['3-months'] === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No customers in this category
                  </div>
                )}
              </div>
            </div>

            {/* No Estimates Section */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input type="checkbox" defaultChecked />
                <span className="bid-board-status-title">No Estimates</span>
                <span className="bid-board-status-count">{binCounts['no-estimates']}</span>
              </div>
              <div className="bid-board-cards-container">
                {customersWithEstimates
                  .filter(customer => getEstimateBin(customer) === 'no-estimates')
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <h4 className="bid-board-card-title">{displayName}</h4>
                        </div>
                        <div className="bid-board-card-body">
                          <p className="bid-board-card-text">{customer.email || '-'}</p>
                          <p className="bid-board-card-text">{customer.company || customer.businessName || '-'}</p>
                          <p className="bid-board-card-text">No estimates yet</p>
                        </div>
                        <div className="bid-board-card-actions">
                          <Link
                            to={`/customers/edit/${customer._id}`}
                            className="bid-board-card-link"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                {binCounts['no-estimates'] === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No customers in this category
                  </div>
                )}
              </div>
            </div>
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
            userType="client"
            onClose={handleCloseUserDetails}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard; 
