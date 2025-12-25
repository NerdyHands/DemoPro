import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { contractApi, customerApi } from '../../services/contractsApi';
import '../../components/BidBoardLayout/BidBoardLayout.css';
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
  const [draggedContractId, setDraggedContractId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({
    Draft: true,
    Sent: true,
    Signed: true,
    Active: true,
    Completed: true,
    Cancelled: true
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

  const getStatusCounts = () => {
    const counts = { Draft: 0, Sent: 0, Signed: 0, Active: 0, Completed: 0, Cancelled: 0 };
    const values = { Draft: 0, Sent: 0, Signed: 0, Active: 0, Completed: 0, Cancelled: 0 };
    
    contracts.forEach(contract => {
      const status = contract.status || 'Draft';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
        values[status] += contract.totalAmount || 0;
      }
    });
    
    return { counts, values };
  };

  const statusCounts = getStatusCounts();

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
    const matchesSearch = (
      contract.title?.toLowerCase().includes(searchLower) ||
      contract.contractNumber?.toLowerCase().includes(searchLower) ||
      contract.customer?.firstName?.toLowerCase().includes(searchLower) ||
      contract.customer?.lastName?.toLowerCase().includes(searchLower) ||
      contract.status?.toLowerCase().includes(searchLower)
    );
    
    if (!matchesSearch) return false;
    
    // Filter by selected statuses
    const status = contract.status || 'Draft';
    return selectedStatuses[status] !== false;
  });

  const getContractsByStatus = (status) => {
    return filteredContracts.filter(c => (c.status || 'Draft') === status);
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

  const handleDragStart = (e, contractId) => {
    // Don't start drag if clicking on a button or link
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
      e.preventDefault();
      return;
    }
    
    setDraggedContractId(contractId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', contractId);
    // Add a visual feedback class
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedContractId(null);
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

    const contractId = e.dataTransfer.getData('text/plain') || draggedContractId;
    
    if (!contractId) return;

    const contract = contracts.find(c => c._id === contractId);
    if (!contract || contract.status === targetStatus) {
      setDraggedContractId(null);
      return;
    }

    // Update the contract status
    await updateContractStatus(contractId, targetStatus);
    setDraggedContractId(null);
  };

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

  const ContractStatusSection = ({ status, statusLabel }) => {
    const statusContracts = getContractsByStatus(status);
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
          {statusContracts.length === 0 ? (
            <div className="bid-board-empty-state">No contracts</div>
          ) : (
            statusContracts.map((contract) => {
              const customerName = contract.customer
                ? `${contract.customer.firstName || ''} ${contract.customer.lastName || ''}`.trim()
                : 'Unknown Customer';
              
              return (
                <div 
                  key={contract._id} 
                  className="bid-board-card"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, contract._id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    cursor: 'move',
                    opacity: draggedContractId === contract._id ? 0.5 : 1
                  }}
                >
                  <div className="bid-board-card-header">
                    <div className="bid-board-card-checkbox">
                      <input type="checkbox" />
                    </div>
                    <div className="bid-board-card-content">
                      <div className="bid-board-card-label">PLANHUB</div>
                      <div className="bid-board-card-title">{contract.title || contract.contractNumber}</div>
                      <div className="bid-board-card-value">
                        <strong>Contract Value:</strong> {formatCurrency(contract.totalAmount || 0)}
                      </div>
                      {customerName && customerName !== 'Unknown Customer' && (
                        <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {customerName}
                        </div>
                      )}
                      <div className="bid-board-card-meta">
                        <div className="bid-board-card-due-date">
                          {contract.endDate 
                            ? `DUE ${formatDateShort(contract.endDate).toUpperCase()}`
                            : contract.startDate
                            ? `START ${formatDateShort(contract.startDate).toUpperCase()}`
                            : contract.createdAt
                            ? `CREATED ${formatDateShort(contract.createdAt).toUpperCase()}`
                            : 'NO DATE'}
                        </div>
                        <div className="bid-board-card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {contract.status === 'Draft' && (
                            <button
                              onClick={() => updateContractStatus(contract._id, 'Sent')}
                              className="bid-board-card-btn bid-board-card-btn-primary"
                              disabled={updatingStatus === contract._id}
                            >
                              Send Contract
                            </button>
                          )}
                          {contract.status === 'Signed' && (
                            <button
                              onClick={() => updateContractStatus(contract._id, 'Active')}
                              className="bid-board-card-btn bid-board-card-btn-primary"
                              disabled={updatingStatus === contract._id}
                            >
                              Activate
                            </button>
                          )}
                          <Link
                            to={`/contracts/${contract._id}`}
                            className="bid-board-card-btn bid-board-card-btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            View
                          </Link>
                          <Link
                            to={`/contracts/edit/${contract._id}`}
                            className="bid-board-card-btn bid-board-card-btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDownloadPdf(contract._id)}
                            className="bid-board-card-btn bid-board-card-btn-secondary"
                            disabled={downloadingPdf === contract._id}
                          >
                            {downloadingPdf === contract._id ? 'Downloading...' : 'PDF'}
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
              {customer ? `Contracts for ${customer.firstName} ${customer.lastName}` : 'Contracts'}
            </h1>
            <p className="bid-board-subtitle">
              {customer ? `Manage contracts for this customer` : 'Manage your service contracts'}
            </p>
            {customer && (
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/contracts" style={{ color: '#20b2aa', textDecoration: 'none' }}>
                  ← View All Contracts
                </Link>
              </div>
            )}
          </div>
          <div className="bid-board-actions">
            <Link 
              to={customerIdFromUrl ? `/contracts/new?customerId=${customerIdFromUrl}` : "/contracts/new"} 
              className="bid-board-import-btn"
            >
              <span>+</span>
              Create Contract
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
            <span>Contract End Date</span>
            <span>☰</span>
          </div>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="bid-board-empty-state">
            <h2>No contracts found</h2>
            <p>
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first contract.'}
            </p>
            {!searchTerm && (
              <Link to="/contracts/new" className="bid-board-import-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Create Your First Contract
              </Link>
            )}
          </div>
        ) : (
          <div className="bid-board-status-sections">
            <ContractStatusSection status="Draft" statusLabel="Draft" />
            <ContractStatusSection status="Sent" statusLabel="Sent" />
            <ContractStatusSection status="Signed" statusLabel="Signed" />
            <ContractStatusSection status="Active" statusLabel="Active" />
            <div className="bid-board-status-separator"></div>
            <ContractStatusSection status="Completed" statusLabel="Completed" />
            <ContractStatusSection status="Cancelled" statusLabel="Cancelled" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contracts;
