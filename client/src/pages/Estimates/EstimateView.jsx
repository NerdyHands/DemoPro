import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi } from '../../services/contractsApi';
import './Estimates.css';

const getCustomerDisplayName = (customer) => {
  if (!customer) return 'N/A';
  const personName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  if (personName) {
    return personName;
  }
  if (customer.businessName) {
    return customer.businessName;
  }
  if (customer.company) {
    return customer.company;
  }
  return customer.email || 'Customer';
};

const EstimateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchEstimate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await estimateApi.getEstimate(id);
      setEstimate(response.estimate);
    } catch (err) {
      console.error('Error fetching estimate:', err);
      setError('Failed to load estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await estimateApi.downloadPdf(id);
    } catch (err) {
      console.error('Error downloading estimate PDF:', err);
      alert('Failed to download estimate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const tryFormat = (dateValue) => {
      if (!dateValue || Number.isNaN(dateValue.getTime())) {
        return null;
      }
      return dateValue.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    };
  
    let date = null;
    if (value instanceof Date) {
      date = value;
    } else {
      date = new Date(value);
    }
  
    let formatted = tryFormat(date);
    if (formatted) {
      return formatted;
    }
  
    // Fallback for date strings without timezone information
    try {
      const fallbackDate = new Date(`${value}T12:00:00.000Z`);
      formatted = tryFormat(fallbackDate);
      if (formatted) {
        return formatted;
      }
    } catch {
      // ignore
    }
  
    return typeof value === 'string' ? value : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Sent':
        return 'info';
      case 'Expired':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="estimate-view-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading estimate...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="estimate-view-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/estimates')} className="btn btn-secondary">
              Back to Estimates
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!estimate) {
    return (
      <Layout>
        <div className="estimate-view-container">
          <div className="error-container">
            <p className="error-message">Estimate not found</p>
            <button onClick={() => navigate('/estimates')} className="btn btn-secondary">
              Back to Estimates
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="estimate-view-container">
        <div className="estimate-view-header">
          <div className="estimate-view-title-section">
            <h1 className="estimate-view-title">{estimate.title}</h1>
            <p className="estimate-view-subtitle">Estimate Details</p>
          </div>
          <div className="estimate-view-actions">
            <Link to="/estimates" className="btn btn-secondary">
              Back to Estimates
            </Link>
            <Link to={`/estimates/edit/${estimate._id}`} className="btn btn-secondary">
              Edit Estimate
            </Link>
            <button onClick={handleDownloadPdf} className="btn btn-secondary" disabled={downloading}>
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
            <Link to={`/contracts/new?estimateId=${estimate._id}`} className="btn btn-primary">
              Create Contract
            </Link>
          </div>
        </div>

        <div className="estimate-view-content">
          {/* Estimate Header Info */}
          <div className="estimate-header-info">
            <div className="estimate-header-row">
              <div className="estimate-info-item">
                <label>Estimate Number:</label>
                <span>{estimate.estimateNumber || 'N/A'}</span>
              </div>
              <div className="estimate-info-item">
                <label>Status:</label>
                <span className={`status-badge status-${getStatusColor(estimate.status)}`}>
                  {estimate.status}
                </span>
              </div>
            <div className="estimate-info-item">
              <label>Date:</label>
              <span>{formatDate(estimate.createdAt)}</span>
            </div>
            </div>
            <div className="estimate-header-row">
              <div className="estimate-info-item">
                <label>Customer:</label>
                <span>
                  {estimate.customer ? getCustomerDisplayName(estimate.customer) : 'N/A'}
                </span>
              </div>
              <div className="estimate-info-item">
                <label>Valid Until:</label>
                <span>{estimate.validUntil ? formatDate(estimate.validUntil) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {estimate.description && (
            <div className="estimate-section">
              <h3>Description</h3>
              <p>{estimate.description}</p>
            </div>
          )}

          {/* Line Items */}
          {estimate.lineItems && estimate.lineItems.length > 0 && (
            <div className="estimate-section">
              <h3>Line Items</h3>
              <div className="line-items-view-table">
                <div className="line-items-view-header">
                  <div className="line-item-view-col description-col">Description</div>
                  <div className="line-item-view-col quantity-col">Quantity</div>
                  <div className="line-item-view-col price-col">Unit Price</div>
                  <div className="line-item-view-col total-col">Total</div>
                </div>
                {estimate.lineItems.map((item, index) => (
                  <div key={index}>
                    <div className="line-item-view-row">
                      <div className="line-item-view-col description-col" data-label="Description">
                        {item.description}
                      </div>
                      <div className="line-item-view-col quantity-col" data-label="Quantity">
                        {item.quantity}
                      </div>
                      <div className="line-item-view-col price-col" data-label="Unit Price">
                        {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="line-item-view-col total-col" data-label="Total">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                    {item.notes && item.notes.length > 0 && (
                      <div className="line-item-view-notes">
                        <strong>Notes:</strong>
                        <ul className="line-item-notes-list-view">
                          {item.notes.map((note, noteIndex) => (
                            note && (
                              <li key={noteIndex}>{note}</li>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="line-items-view-summary">
                <div className="summary-row">
                  <span className="summary-label">Total Amount:</span>
                  <span className="summary-value">{formatCurrency(estimate.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {estimate.notes && (
            <div className="estimate-section">
              <h3>Notes</h3>
              <p>{estimate.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="estimate-section">
            <h3>Additional Information</h3>
            <div className="estimate-metadata">
              <div className="metadata-item">
                <label>Created:</label>
                <span>{formatDate(estimate.createdAt)}</span>
              </div>
              {estimate.updatedAt && estimate.updatedAt !== estimate.createdAt && (
                <div className="metadata-item">
                  <label>Last Updated:</label>
                  <span>{formatDate(estimate.updatedAt)}</span>
                </div>
              )}
              {estimate.projectId && (
                <div className="metadata-item">
                  <label>Project ID:</label>
                  <span>{estimate.projectId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EstimateView;
