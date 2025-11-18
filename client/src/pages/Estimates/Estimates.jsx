import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi, customerApi } from '../../services/contractsApi';
import './Estimates.css';

const Estimates = () => {
  const location = useLocation();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedEstimateId, setExpandedEstimateId] = useState(null);
  
  // Get customerId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const customerIdFromUrl = urlParams.get('customerId');

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await customerApi.getCustomer(customerIdFromUrl);
      setCustomer(response.customer);
    } catch (err) {
      console.error('Error fetching customer:', err);
    }
  }, [customerIdFromUrl]);

  useEffect(() => {
    fetchEstimates();
    if (customerIdFromUrl) {
      fetchCustomer();
    }
  }, [customerIdFromUrl, fetchCustomer]);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const response = await estimateApi.getEstimates();
      
      const estimatesData = response.estimates || [];
      setEstimates(estimatesData);
      setError(null);
    } catch (err) {
      console.error('❌ [Estimates] Error fetching estimates:', err);
      setError('Failed to load estimates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the date string properly
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Use UTC to avoid timezone shifting dates
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Sent':
        return 'info';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Expired':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'Draft':
        return ['Sent'];
      case 'Sent':
        return ['Approved', 'Rejected'];
      case 'Approved':
        return []; // Final state - create contract instead
      case 'Rejected':
        return ['Draft']; // Allow resubmission
      default:
        return ['Sent'];
    }
  };

  const updateEstimateStatus = async (estimateId, newStatus) => {
    try {
      setUpdatingStatus(estimateId);
      await estimateApi.updateEstimate(estimateId, { status: newStatus });
      
      // Update the local state
      setEstimates(prevEstimates => 
        prevEstimates.map(estimate => 
          estimate._id === estimateId 
            ? { ...estimate, status: newStatus }
            : estimate
        )
      );
    } catch (err) {
      console.error('Error updating estimate status:', err);
      setError('Failed to update estimate status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    // If filtering by customer ID, only show estimates for that customer
    if (customerIdFromUrl) {
      const estimateCustomerId = (estimate.customer && (estimate.customer._id || estimate.customer.id)) || estimate.customerId;
      if (estimateCustomerId !== customerIdFromUrl) {
        return false;
      }
    }
    
    // Then apply search filter
    const term = searchTerm.toLowerCase();
    return (
      estimate.title?.toLowerCase().includes(term) ||
      estimate.customer?.firstName?.toLowerCase().includes(term) ||
      estimate.customer?.lastName?.toLowerCase().includes(term) ||
      estimate.estimateNumber?.toLowerCase().includes(term)
    );
  });

  const toggleDetails = (estimateId) => {
    setExpandedEstimateId(prev => (prev === estimateId ? null : estimateId));
  };

  if (loading) {
    return (
      <Layout>
        <div className="estimates-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading estimates...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="estimates-container">
      <div className="estimates-header">
        <div className="estimates-title-section">
          <h1 className="estimates-title">
            {customer ? `Estimates for ${customer.firstName} ${customer.lastName}` : 'Estimates'}
          </h1>
          <p className="estimates-subtitle">
            {customer ? `Manage estimates for this customer` : 'Manage project estimates and quotes'}
          </p>
          {customer && (
            <div className="customer-filter-info">
              <Link to="/estimates" className="clear-filter-btn">
                ← View All Estimates
              </Link>
            </div>
          )}
        </div>
        <Link to={customerIdFromUrl ? `/estimates/new?customerId=${customerIdFromUrl}` : "/estimates/new"} className="create-estimate-btn">
          <span className="btn-icon">+</span>
          Create Estimate
        </Link>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="estimates-content">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredEstimates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No estimates found</h2>
              <p>
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first estimate.'}
              </p>
              {!searchTerm && (
                <Link to="/estimates/new" className="create-first-btn">
                  Create Your First Estimate
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="estimates-grid">
            {filteredEstimates.map((estimate) => (
              <div key={estimate._id} className="estimate-card">
                <div className="estimate-header">
                  <div className="estimate-number">
                    {estimate.estimateNumber}
                  </div>
                  <div className="status-section">
                    <div className={`status-badge status-${getStatusColor(estimate.status)}`}>
                      {estimate.status}
                    </div>
                    {getNextStatusOptions(estimate.status).length > 0 && (
                      <div className="status-actions">
                        {getNextStatusOptions(estimate.status).map(nextStatus => (
                          <button
                            key={nextStatus}
                            onClick={() => updateEstimateStatus(estimate._id, nextStatus)}
                            className={`status-btn status-btn-${nextStatus.toLowerCase()}`}
                            disabled={updatingStatus === estimate._id}
                            title={`Mark as ${nextStatus}`}
                          >
                            {nextStatus === 'Sent' && '📤'}
                            {nextStatus === 'Approved' && '✅'}
                            {nextStatus === 'Rejected' && '❌'}
                            {nextStatus === 'Draft' && '📝'}
                          </button>
                        ))}
                      </div>
                    )}
                    {estimate.status === 'Approved' && (
                      <div className="status-message">
                        <small>Ready to create contract</small>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="estimate-info">
                  <h3 className="estimate-title">{estimate.title}</h3>
                  {estimate.customer ? (
                    <p className="estimate-customer">
                      {estimate.customer.firstName || 'Unknown'} {estimate.customer.lastName || 'Customer'}
                    </p>
                  ) : (
                    <p className="estimate-customer estimate-customer-missing">
                      Customer information not available
                    </p>
                  )}
                  {estimate.description && (
                    <p className="estimate-description">{estimate.description}</p>
                  )}
                </div>

                <div className="estimate-details">
                  <div className="estimate-amount">
                    <span className="amount-label">Total:</span>
                    <span className="amount-value">{formatCurrency(estimate.totalAmount)}</span>
                  </div>
                  <div className="estimate-date">
                    <span className="date-label">Created:</span>
                    <span className="date-value">{formatDate(estimate.createdAt)}</span>
                  </div>
                  {estimate.validUntil && (
                    <div className="estimate-validity">
                      <span className="validity-label">Valid Until:</span>
                      <span className="validity-value">{formatDate(estimate.validUntil)}</span>
                    </div>
                  )}
                </div>

                <div className="estimate-actions">
                  <button
                    type="button"
                    className={`details-btn${expandedEstimateId === estimate._id ? ' details-btn-active' : ''}`}
                    onClick={() => toggleDetails(estimate._id)}
                    aria-expanded={expandedEstimateId === estimate._id}
                  >
                    {expandedEstimateId === estimate._id ? 'Hide Details' : 'Details'}
                  </button>
                  <Link 
                    to={`/estimates/${estimate._id}`} 
                    className="view-btn"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/estimates/edit/${estimate._id}`} 
                    className="edit-btn"
                  >
                    Edit
                  </Link>
                  <Link 
                    to={`/contracts/new?estimateId=${estimate._id}`} 
                    className="contract-btn"
                  >
                    Create Contract
                  </Link>
                  {estimate.customerId && (
                    <Link 
                      to={`/contracts?customerId=${estimate.customerId}`} 
                      className="view-customer-contracts-btn"
                    >
                      View Customer Contracts
                    </Link>
                  )}
                </div>
                {expandedEstimateId === estimate._id && (
                  <div className="estimate-card-expanded">
                    <div className="expanded-section">
                      <h4>Line Items</h4>
                      {estimate.lineItems && estimate.lineItems.length > 0 ? (
                        <ul className="expanded-line-items">
                          {estimate.lineItems.map((item, idx) => (
                            <li key={idx} className="expanded-line-item">
                              <div className="line-item-header">
                                <span className="line-item-amount">{formatCurrency(item.totalPrice)}</span>
                                <span className="line-item-meta">
                                  Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                              <p className="line-item-description">{item.description}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty-line-items">No line items recorded.</p>
                      )}
                    </div>
                    {(estimate.notes || estimate.clientAddress || estimate.propertyAddress) && (
                      <div className="expanded-section">
                        <h4>Additional Info</h4>
                        {estimate.propertyAddress && (
                          <p><strong>Property:</strong> {estimate.propertyAddress}</p>
                        )}
                        {estimate.clientAddress && (
                          <p><strong>Client:</strong> {estimate.clientAddress}</p>
                        )}
                        {estimate.notes && (
                          <p className="expanded-notes"><strong>Notes:</strong> {estimate.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Estimates;
