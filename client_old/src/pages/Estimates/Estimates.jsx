import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi, customerApi } from '../../services/contractsApi';
import '../../components/BidBoardLayout/BidBoardLayout.css';
import './Estimates.css';

const Estimates = () => {
  const location = useLocation();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [draggedEstimateId, setDraggedEstimateId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({
    Draft: true,
    Sent: true,
    Approved: true,
    Rejected: true,
    Expired: true
  });
  
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

  const getStatusCounts = () => {
    const counts = { Draft: 0, Sent: 0, Approved: 0, Rejected: 0, Expired: 0 };
    const values = { Draft: 0, Sent: 0, Approved: 0, Rejected: 0, Expired: 0 };
    
    estimates.forEach(estimate => {
      const status = estimate.status || 'Draft';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
        values[status] += estimate.totalAmount || 0;
      }
    });
    
    return { counts, values };
  };

  const statusCounts = getStatusCounts();

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
    const matchesSearch = (
      estimate.title?.toLowerCase().includes(term) ||
      estimate.customer?.firstName?.toLowerCase().includes(term) ||
      estimate.customer?.lastName?.toLowerCase().includes(term) ||
      estimate.estimateNumber?.toLowerCase().includes(term)
    );
    
    if (!matchesSearch) return false;
    
    // Filter by selected statuses
    const status = estimate.status || 'Draft';
    return selectedStatuses[status] !== false;
  });

  const getEstimatesByStatus = (status) => {
    return filteredEstimates.filter(e => (e.status || 'Draft') === status);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleDragStart = (e, estimateId) => {
    // Don't start drag if clicking on a button or link
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
      e.preventDefault();
      return;
    }
    
    setDraggedEstimateId(estimateId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', estimateId);
    // Add a visual feedback class
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedEstimateId(null);
    setDragOverStatus(null);
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the container itself, not a child
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStatus(null);

    const estimateId = e.dataTransfer.getData('text/plain') || draggedEstimateId;
    
    if (!estimateId) return;

    const estimate = estimates.find(e => e._id === estimateId);
    if (!estimate || estimate.status === targetStatus) {
      setDraggedEstimateId(null);
      return;
    }

    // Update the estimate status
    await updateEstimateStatus(estimateId, targetStatus);
    setDraggedEstimateId(null);
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

  const EstimateStatusSection = ({ status, statusLabel }) => {
    const statusEstimates = getEstimatesByStatus(status);
    const count = statusCounts.counts[status] || 0;
    const value = statusCounts.values[status] || 0;
    const isDragOver = dragOverStatus === status;
    
    return (
      <div 
        className="bid-board-status-section"
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
        style={{
          backgroundColor: isDragOver ? '#e8f5f0' : 'transparent',
          border: isDragOver ? '2px dashed #20b2aa' : 'none',
          borderRadius: isDragOver ? '8px' : '0',
          transition: 'all 0.2s ease'
        }}
      >
        <div className="bid-board-status-header">
          <input
            type="checkbox"
            checked={selectedStatuses[status] !== false}
            onChange={(e) => setSelectedStatuses(prev => ({ ...prev, [status]: e.target.checked }))}
          />
          <span className="bid-board-status-title">{statusLabel}</span>
          <span className="bid-board-status-count">{count}</span>
          <span className="bid-board-status-value">({formatCurrency(value)})</span>
        </div>
        <div className="bid-board-cards-container">
          {statusEstimates.length === 0 ? (
            <div className="bid-board-empty-state">No estimates</div>
          ) : (
            statusEstimates.map((estimate) => {
              const customerName = estimate.customer
                ? `${estimate.customer.firstName || ''} ${estimate.customer.lastName || ''}`.trim()
                : 'Unknown Customer';
              
              return (
                <div 
                  key={estimate._id} 
                  className="bid-board-card"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, estimate._id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    cursor: 'move',
                    opacity: draggedEstimateId === estimate._id ? 0.5 : 1
                  }}
                >
                  <div className="bid-board-card-header">
                    <div className="bid-board-card-checkbox">
                      <input type="checkbox" />
                    </div>
                    <div className="bid-board-card-content">
                      <div className="bid-board-card-label">PLANHUB</div>
                      <div className="bid-board-card-title">{estimate.title || estimate.estimateNumber}</div>
                      <div className="bid-board-card-value">
                        <strong>Bid Value:</strong> {formatCurrency(estimate.totalAmount || 0)}
                      </div>
                      {customerName && customerName !== 'Unknown Customer' && (
                        <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {customerName}
                        </div>
                      )}
                      <div className="bid-board-card-meta">
                        <div className="bid-board-card-due-date">
                          {estimate.validUntil 
                            ? `DUE ${formatDateShort(estimate.validUntil).toUpperCase()}`
                            : estimate.createdAt
                            ? `CREATED ${formatDateShort(estimate.createdAt).toUpperCase()}`
                            : 'NO DATE'}
                        </div>
                        <div className="bid-board-card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {estimate.status === 'Draft' && (
                            <button
                              onClick={() => updateEstimateStatus(estimate._id, 'Sent')}
                              className="bid-board-card-btn bid-board-card-btn-primary"
                              disabled={updatingStatus === estimate._id}
                            >
                              Send Estimate
                            </button>
                          )}
                          {estimate.status === 'Approved' && (
                            <Link
                              to={`/contracts/new?estimateId=${estimate._id}`}
                              className="bid-board-card-btn bid-board-card-btn-primary"
                              style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                              Create Contract
                            </Link>
                          )}
                          <Link
                            to={`/estimates/${estimate._id}`}
                            className="bid-board-card-btn bid-board-card-btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            View
                          </Link>
                          <Link
                            to={`/estimates/edit/${estimate._id}`}
                            className="bid-board-card-btn bid-board-card-btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            Edit
                          </Link>
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
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="bid-board-container">
        <div className="bid-board-header">
          <div className="bid-board-title-section">
            <h1 className="bid-board-title">
              {customer ? `Estimates for ${customer.firstName} ${customer.lastName}` : 'Estimates'}
            </h1>
            <p className="bid-board-subtitle">
              {customer ? `Manage estimates for this customer` : 'Manage project estimates and quotes'}
            </p>
            {customer && (
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/estimates" className="bid-board-feature-needed" style={{ color: '#20b2aa', textDecoration: 'none' }}>
                  ← View All Estimates
                </Link>
              </div>
            )}
          </div>
          <div className="bid-board-actions">
            <Link 
              to={customerIdFromUrl ? `/estimates/new?customerId=${customerIdFromUrl}` : "/estimates/new"} 
              className="bid-board-import-btn"
            >
              <span>+</span>
              Create Estimate
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
            <span>Estimate Due Date</span>
            <span>☰</span>
          </div>
        </div>

        {filteredEstimates.length === 0 ? (
          <div className="bid-board-empty-state">
            <h2>No estimates found</h2>
            <p>
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first estimate.'}
            </p>
            {!searchTerm && (
              <Link to="/estimates/new" className="bid-board-import-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Create Your First Estimate
              </Link>
            )}
          </div>
        ) : (
          <div className="bid-board-status-sections">
            <EstimateStatusSection status="Draft" statusLabel="Draft" />
            <EstimateStatusSection status="Sent" statusLabel="Sent" />
            <EstimateStatusSection status="Approved" statusLabel="Approved" />
            <EstimateStatusSection status="Rejected" statusLabel="Rejected" />
            <div className="bid-board-status-separator"></div>
            <EstimateStatusSection status="Expired" statusLabel="Expired" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Estimates;
