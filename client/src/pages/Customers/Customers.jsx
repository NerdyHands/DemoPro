import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { customerApi } from '../../services/contractsApi';
import './Customers.css';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerApi.getCustomers();
      setCustomers(response.customers || []);
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

  const handleCreateContract = (customer) => {
    // Contract creation can optionally take a customerId without estimate
    navigate(`/contracts/new?customerId=${customer._id}`);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
    const displayName = hasBusinessName 
      ? customer.businessName 
      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    
    return displayName.toLowerCase().includes(searchLower) ||
           customer.email?.toLowerCase().includes(searchLower) ||
           customer.businessName?.toLowerCase().includes(searchLower) ||
           customer.firstName?.toLowerCase().includes(searchLower) ||
           customer.lastName?.toLowerCase().includes(searchLower);
  });

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
      <div className="customers-container">
        <div className="customers-header">
          <div className="customers-title-section">
            <h1 className="customers-title">Customers</h1>
            <p className="customers-subtitle">Manage your customer relationships</p>
          </div>
          <Link to="/customers/new" className="create-customer-btn">
            <span className="btn-icon">+</span>
            Add Customer
          </Link>
        </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="customers-content">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No customers found</h2>
              <p>
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
              </p>
              {!searchTerm && (
                <Link to="/customers/new" className="create-first-btn">
                  Add Your First Customer
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map((customer) => {
              const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
              const displayName = hasBusinessName 
                ? customer.businessName 
                : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
              const avatarInitials = hasBusinessName
                ? customer.businessName.substring(0, 2).toUpperCase()
                : `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase();
              
              return (
              <div key={customer._id} className="customer-card">
                <div className="customer-header">
                  <div className="customer-avatar">
                    {avatarInitials}
                  </div>
                  <div className="customer-info">
                    <h3 className="customer-name">
                      {displayName}
                    </h3>
                    <p className="customer-email">{customer.email}</p>
                  </div>
                </div>
                
                <div className="customer-details">
                  {customer.phone && (
                    <div className="customer-detail">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{customer.phone}</span>
                    </div>
                  )}
                  {customer.address?.full && (
                    <div className="customer-detail">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{customer.address.full}</span>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="customer-detail">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{customer.notes}</span>
                    </div>
                  )}
                </div>

                <div className="customer-actions">
                  <Link 
                    to={`/customers/edit/${customer._id}`} 
                    className="edit-btn"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleCreateEstimate(customer)}
                    className="estimate-btn"
                  >
                    Create Estimate
                  </button>
                  <button
                    onClick={() => handleCreateContract(customer)}
                    className="contract-btn"
                  >
                    Create Contract
                  </button>
                  <Link
                    to={`/estimates?customerId=${customer._id}`}
                    className="view-estimates-btn"
                  >
                    View Estimates
                  </Link>
                  <Link
                    to={`/contracts?customerId=${customer._id}`}
                    className="view-contracts-btn"
                  >
                    View Contracts
                  </Link>
                  <button
                    onClick={() => confirmDelete(customer)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
              );
            })}
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
      </div>
    </Layout>
  );
};

export default Customers;
