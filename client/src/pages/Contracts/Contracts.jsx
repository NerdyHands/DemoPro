import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { contractApi, customerApi } from '../../services/contractsApi';
import './Contracts.css';

const Contracts = () => {
  const location = useLocation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  
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
    fetchContracts();
    if (customerIdFromUrl) {
      fetchCustomer();
    }
  }, [customerIdFromUrl, fetchCustomer]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContracts();
      setContracts(response.contracts || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts. Please try again.');
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
      case 'Signed':
        return 'signed';
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'Draft':
        return ['Sent'];
      case 'Sent':
        return ['Signed', 'Cancelled'];
      case 'Signed':
        return ['Active'];
      case 'Active':
        return ['Completed', 'Cancelled'];
      case 'Completed':
        return []; // Final state
      case 'Cancelled':
        return ['Draft']; // Allow restart
      default:
        return ['Sent'];
    }
  };

  const updateContractStatus = async (contractId, newStatus) => {
    try {
      setUpdatingStatus(contractId);
      await contractApi.updateContract(contractId, { status: newStatus });
      
      // Update the local state
      setContracts(prevContracts => 
        prevContracts.map(contract => 
          contract._id === contractId 
            ? { ...contract, status: newStatus }
            : contract
        )
      );
    } catch (err) {
      console.error('Error updating contract status:', err);
      setError('Failed to update contract status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDownloadPdf = async (contractId) => {
    try {
      setDownloadingPdf(contractId);
      await contractApi.downloadPdf(contractId);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    // If filtering by customer ID, only show contracts for that customer
    if (customerIdFromUrl) {
      const contractCustomerId = (contract.customer && (contract.customer._id || contract.customer.id)) || contract.customerId;
      if (contractCustomerId !== customerIdFromUrl) {
        return false;
      }
    }
    
    // Then apply search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      contract.title?.toLowerCase().includes(searchLower) ||
      contract.contractNumber?.toLowerCase().includes(searchLower) ||
      contract.customer?.firstName?.toLowerCase().includes(searchLower) ||
      contract.customer?.lastName?.toLowerCase().includes(searchLower) ||
      contract.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Layout>
        <div className="contracts-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading contracts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contracts-container">
        <div className="contracts-header">
          <div className="contracts-title-section">
            <h1 className="contracts-title">
              {customer ? `Contracts for ${customer.firstName} ${customer.lastName}` : 'Contracts'}
            </h1>
            <p className="contracts-subtitle">
              {customer ? `Manage contracts for this customer` : 'Manage your service contracts'}
            </p>
            {customer && (
              <div className="customer-filter-info">
                <Link to="/contracts" className="clear-filter-btn">
                  ← View All Contracts
                </Link>
              </div>
            )}
          </div>
          <Link to={customerIdFromUrl ? `/contracts/new?customerId=${customerIdFromUrl}` : "/contracts/new"} className="create-contract-btn">
            <span className="btn-icon">+</span>
            Create Contract
          </Link>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="contracts-content">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredContracts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h2>No contracts found</h2>
                <p>
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first contract.'}
                </p>
                {!searchTerm && (
                  <Link to="/contracts/new" className="create-first-btn">
                    Create Your First Contract
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="contracts-grid">
              {filteredContracts.map((contract) => (
                <div key={contract._id} className="contract-card">
                  <div className="contract-header">
                    <div className="contract-number">
                      {contract.contractNumber}
                    </div>
                    <div className="status-section">
                      <div className={`status-badge status-${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </div>
                      {getNextStatusOptions(contract.status).length > 0 && (
                        <div className="status-actions">
                          {getNextStatusOptions(contract.status).map(nextStatus => (
                            <button
                              key={nextStatus}
                              onClick={() => updateContractStatus(contract._id, nextStatus)}
                              className={`status-btn status-btn-${nextStatus.toLowerCase()}`}
                              disabled={updatingStatus === contract._id}
                              title={`Mark as ${nextStatus}`}
                            >
                              {nextStatus === 'Sent' && '📤'}
                              {nextStatus === 'Signed' && '✍️'}
                              {nextStatus === 'Active' && '🟢'}
                              {nextStatus === 'Completed' && '✅'}
                              {nextStatus === 'Cancelled' && '❌'}
                              {nextStatus === 'Draft' && '📝'}
                            </button>
                          ))}
                        </div>
                      )}
                      {contract.status === 'Completed' && (
                        <div className="status-message">
                          <small>Contract completed</small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="contract-info">
                    <h3 className="contract-title">{contract.title}</h3>
                    {contract.customer && (
                      <p className="contract-customer">
                        {contract.customer.firstName} {contract.customer.lastName}
                      </p>
                    )}
                    {contract.description && (
                      <p className="contract-description">{contract.description}</p>
                    )}
                  </div>

                  <div className="contract-details">
                    <div className="contract-amount">
                      <span className="amount-label">Total:</span>
                      <span className="amount-value">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                    <div className="contract-date">
                      <span className="date-label">Created:</span>
                      <span className="date-value">{formatDate(contract.createdAt)}</span>
                    </div>
                    {contract.startDate && (
                      <div className="contract-start">
                        <span className="start-label">Start Date:</span>
                        <span className="start-value">{formatDate(contract.startDate)}</span>
                      </div>
                    )}
                    {contract.endDate && (
                      <div className="contract-end">
                        <span className="end-label">End Date:</span>
                        <span className="end-value">{formatDate(contract.endDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="contract-actions">
                    <Link 
                      to={`/contracts/${contract._id}`} 
                      className="view-btn"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/contracts/edit/${contract._id}`} 
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                    <Link 
                      to={`/prework-inspection/${contract._id}`} 
                      className="edit-btn"
                      title="Start a pre-work inspection for this contract"
                    >
                      Start Pre-Work Inspection
                    </Link>
                    <button
                      onClick={() => handleDownloadPdf(contract._id)}
                      className="pdf-btn"
                      disabled={downloadingPdf === contract._id}
                    >
                      {downloadingPdf === contract._id ? 'Downloading...' : '📄 PDF'}
                    </button>
                    {contract.customerId && (
                      <Link 
                        to={`/estimates?customerId=${contract.customerId}`} 
                        className="view-customer-estimates-btn"
                      >
                        View Customer Estimates
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Contracts;
