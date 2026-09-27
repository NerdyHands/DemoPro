import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { customerApi, estimateApi } from '../../services/contractsApi';
import '../../components/BidBoardLayout/BidBoardLayout.css';
import './Customers.css';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customersWithEstimates, setCustomersWithEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({
    active: true,
    inactive: true,
    noEstimates: true
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const [customersResponse, estimatesResponse] = await Promise.all([
        customerApi.getCustomers(),
        estimateApi.getEstimates().catch(() => ({ estimates: [] }))
      ]);
      
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
      
      // Add last estimate date to each customer and sort by last estimate
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
      
      // Sort by last estimate date (most recent first), then by name
      customersWithEstimateInfo.sort((a, b) => {
        if (a.lastEstimateDate && b.lastEstimateDate) {
          return b.lastEstimateDate - a.lastEstimateDate;
        }
        if (a.lastEstimateDate && !b.lastEstimateDate) return -1;
        if (!a.lastEstimateDate && b.lastEstimateDate) return 1;
        const nameA = (a.businessName || `${a.firstName || ''} ${a.lastName || ''}`).trim().toLowerCase();
        const nameB = (b.businessName || `${b.firstName || ''} ${b.lastName || ''}`).trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setCustomers(customersData);
      setCustomersWithEstimates(customersWithEstimateInfo);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (customerId) => {
    try {
      await customerApi.deleteCustomer(customerId);
      setCustomers(customers.filter(customer => customer._id !== customerId));
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer. Please try again.');
    }
  };

  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleCreateEstimate = (customer) => {
    // Navigate to estimate creation page with customer pre-selected
    navigate(`/estimates/new?customerId=${customer._id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const filteredCustomers = customersWithEstimates.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
    const displayName = hasBusinessName 
      ? customer.businessName 
      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    
    const matchesSearch = displayName.toLowerCase().includes(searchLower) ||
           customer.email?.toLowerCase().includes(searchLower) ||
           customer.businessName?.toLowerCase().includes(searchLower) ||
           customer.firstName?.toLowerCase().includes(searchLower) ||
           customer.lastName?.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    // Filter by status
    const hasEstimates = customer.estimateCount > 0;
    if (hasEstimates && !selectedStatuses.active) return false;
    if (!hasEstimates && !selectedStatuses.noEstimates) return false;
    
    return true;
  });

  const getStatusCounts = () => {
    const active = customersWithEstimates.filter(c => c.estimateCount > 0).length;
    const noEstimates = customersWithEstimates.filter(c => c.estimateCount === 0).length;
    const totalValue = customersWithEstimates.reduce((sum, c) => {
      if (c.lastEstimate && c.lastEstimate.totalAmount) {
        return sum + (c.lastEstimate.totalAmount || 0);
      }
      return sum;
    }, 0);
    
    return { active, noEstimates, total: customersWithEstimates.length, totalValue };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="customers-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="bid-board-container">
        <div className="bid-board-header">
          <div className="bid-board-title-section">
            <h1 className="bid-board-title">Customers</h1>
            <p className="bid-board-subtitle">Manage your customer relationships</p>
          </div>
          <div className="bid-board-actions">
            <Link to="/customers/new" className="bid-board-import-btn">
              <span>+</span>
              Add Customer
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="bid-board-search-filter">
          <div className="bid-board-search">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="bid-board-search-icon">🔍</div>
          </div>
          <button className="bid-board-filter-btn">
            <span>⚙️</span>
            Filter
          </button>
          <div className="bid-board-sort-dropdown">
            <span>Last Estimate Date</span>
            <span>☰</span>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="bid-board-empty-state">
            <h2>No customers found</h2>
            <p>
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
            </p>
            {!searchTerm && (
              <Link to="/customers/new" className="bid-board-import-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Add Your First Customer
              </Link>
            )}
          </div>
        ) : (
          <div className="bid-board-status-sections">
            {/* Active Customers (with estimates) */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input
                  type="checkbox"
                  checked={selectedStatuses.active}
                  onChange={(e) => setSelectedStatuses(prev => ({ ...prev, active: e.target.checked }))}
                />
                <span className="bid-board-status-title">Active Customers</span>
                <span className="bid-board-status-count">{statusCounts.active}</span>
                <span className="bid-board-status-value">({formatCurrency(statusCounts.totalValue)})</span>
              </div>
              <div className="bid-board-cards-container">
                {filteredCustomers
                  .filter(c => c.estimateCount > 0)
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <div className="bid-board-card-checkbox">
                            <input type="checkbox" />
                          </div>
                          <div className="bid-board-card-content">
                            <div className="bid-board-card-label">CUSTOMER</div>
                            <div className="bid-board-card-title">{displayName}</div>
                            <div className="bid-board-card-value">
                              <strong>Bid Value:</strong> {customer.lastEstimate 
                                ? formatCurrency(customer.lastEstimate.totalAmount || 0)
                                : '$0'}
                            </div>
                            {customer.email && (
                              <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {customer.email}
                              </div>
                            )}
                            <div className="bid-board-card-meta">
                              <div className="bid-board-card-due-date">
                                {customer.lastEstimateDate 
                                  ? `Last Estimate: ${formatDate(customer.lastEstimateDate)}`
                                  : 'No estimates'}
                              </div>
                              <div className="bid-board-card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleCreateEstimate(customer)}
                                  className="bid-board-card-btn bid-board-card-btn-primary"
                                >
                                  Create Estimate
                                </button>
                                <Link
                                  to={`/customers/edit/${customer._id}`}
                                  className="bid-board-card-btn bid-board-card-btn-secondary"
                                  style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                  Edit
                                </Link>
                                <Link
                                  to={`/estimates?customerId=${customer._id}`}
                                  className="bid-board-card-btn bid-board-card-btn-secondary"
                                  style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                  View Estimates
                                </Link>
                                <button
                                  onClick={() => confirmDelete(customer)}
                                  className="bid-board-card-btn"
                                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          <svg className="bid-board-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Customers without estimates */}
            <div className="bid-board-status-section">
              <div className="bid-board-status-header">
                <input
                  type="checkbox"
                  checked={selectedStatuses.noEstimates}
                  onChange={(e) => setSelectedStatuses(prev => ({ ...prev, noEstimates: e.target.checked }))}
                />
                <span className="bid-board-status-title">No Estimates</span>
                <span className="bid-board-status-count">{statusCounts.noEstimates}</span>
                <span className="bid-board-status-value">($0)</span>
              </div>
              <div className="bid-board-cards-container">
                {filteredCustomers
                  .filter(c => c.estimateCount === 0)
                  .map((customer) => {
                    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
                    const displayName = hasBusinessName 
                      ? customer.businessName 
                      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                    
                    return (
                      <div key={customer._id} className="bid-board-card">
                        <div className="bid-board-card-header">
                          <div className="bid-board-card-checkbox">
                            <input type="checkbox" />
                          </div>
                          <div className="bid-board-card-content">
                            <div className="bid-board-card-label">CUSTOMER</div>
                            <div className="bid-board-card-title">{displayName}</div>
                            <div className="bid-board-card-value">
                              <strong>Bid Value:</strong> $0
                            </div>
                            {customer.email && (
                              <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {customer.email}
                              </div>
                            )}
                            <div className="bid-board-card-meta">
                              <div className="bid-board-card-due-date">
                                Created: {formatDate(customer.createdAt)}
                              </div>
                              <div className="bid-board-card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleCreateEstimate(customer)}
                                  className="bid-board-card-btn bid-board-card-btn-primary"
                                >
                                  Create Estimate
                                </button>
                                <Link
                                  to={`/customers/edit/${customer._id}`}
                                  className="bid-board-card-btn bid-board-card-btn-secondary"
                                  style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                  Edit
                                </Link>
                                <Link
                                  to={`/contracts?customerId=${customer._id}`}
                                  className="bid-board-card-btn bid-board-card-btn-secondary"
                                  style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                  View Contracts
                                </Link>
                                <button
                                  onClick={() => confirmDelete(customer)}
                                  className="bid-board-card-btn"
                                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          <svg className="bid-board-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (() => {
        const hasBusinessName = customerToDelete.businessName && customerToDelete.businessName.trim().length > 0;
        const displayName = hasBusinessName 
          ? customerToDelete.businessName 
          : `${customerToDelete.firstName || ''} ${customerToDelete.lastName || ''}`.trim();
        
        return (
          <div className="modal-overlay" onClick={() => {
            setShowDeleteModal(false);
            setCustomerToDelete(null);
          }}>
            <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Customer</h2>
              <p>
                Are you sure you want to delete <strong>{displayName}</strong>? 
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => handleDelete(customerToDelete._id)}
                  className="confirm-btn"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCustomerToDelete(null);
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </Layout>
  );
};

export default Customers;
