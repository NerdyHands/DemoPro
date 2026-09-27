import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi } from '../../services/contractsApi';
import ExportMenu from '../../components/ExportMenu/ExportMenu.jsx';
import {
  HOUSE_DEMO_CATEGORIES,
  categoryIdFromLegacyNote,
} from '../../data/houseDemolitionTemplate.js';
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

  const handleDownloadDocx = async () => {
    try {
      setDownloading(true);
      await estimateApi.downloadDocx(id);
    } catch (err) {
      console.error('Error downloading estimate DOCX:', err);
      alert('Failed to download estimate DOCX.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateGoogleDoc = async () => {
    try {
      setDownloading(true);
      const result = await estimateApi.createGoogleDoc(id);
      if (result?.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Google Doc created, but no URL was returned.');
      }
    } catch (err) {
      console.error('Error creating Google Doc:', err);
      alert(err.response?.data?.error || 'Failed to create Google Doc.');
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

  const resolveItemCategory = (item) => item.category || categoryIdFromLegacyNote(item.notes);

  const groupedLineItems = () => {
    if (!estimate?.lineItems?.length) return [];

    if (estimate.templateType !== 'house_demolition') {
      return [{ id: 'all', label: null, items: estimate.lineItems }];
    }

    const groups = HOUSE_DEMO_CATEGORIES.map((category) => ({
      ...category,
      items: estimate.lineItems.filter((item) => resolveItemCategory(item) === category.id),
    })).filter((group) => group.items.length > 0);

    const uncategorized = estimate.lineItems.filter((item) => {
      const categoryId = resolveItemCategory(item);
      return !categoryId || !HOUSE_DEMO_CATEGORIES.some((c) => c.id === categoryId);
    });

    if (uncategorized.length > 0) {
      groups.push({ id: 'uncategorized', label: 'Other', items: uncategorized });
    }

    return groups;
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
            <p className="estimate-view-subtitle">
              {estimate.templateType === 'house_demolition' ? 'House Demolition Proposal' : 'Estimate Details'}
            </p>
            {estimate.templateType === 'house_demolition' && (
              <div className="estimate-house-demo-banner estimate-view-brand-banner">
                <img src="/logo.png" alt="Mr Demo Pro" className="estimate-house-demo-banner-logo" />
                <div>
                  <strong>Mr Demo Pro</strong>
                  <span>Castleton Real Estate, LLC dba Mr Demo Pro</span>
                </div>
              </div>
            )}
          </div>
          <div className="estimate-view-actions">
            <Link to="/estimates" className="btn btn-secondary">
              Back to Estimates
            </Link>
            <Link to={`/estimates/edit/${estimate._id}`} className="btn btn-secondary">
              Edit Estimate
            </Link>
            <ExportMenu
              label={downloading ? 'Generating…' : 'Export'}
              disabled={downloading}
              options={[
                { id: 'pdf', label: 'Download PDF', onSelect: handleDownloadPdf },
                { id: 'docx', label: 'Download DOCX', onSelect: handleDownloadDocx },
                { id: 'gdoc', label: 'Create Google Doc', onSelect: handleCreateGoogleDoc }
              ]}
            />
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
            {(estimate.propertyAddress || estimate.clientAddress) && (
              <div className="estimate-header-row">
                {estimate.propertyAddress && (
                  <div className="estimate-info-item">
                    <label>Property Address:</label>
                    <span>{estimate.propertyAddress}</span>
                  </div>
                )}
                {estimate.clientAddress && estimate.clientAddress !== estimate.propertyAddress && (
                  <div className="estimate-info-item">
                    <label>Client Address:</label>
                    <span>{estimate.clientAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {estimate.description && (
            <div className="estimate-section">
              <h3>{estimate.templateType === 'house_demolition' ? 'Scope of Work' : 'Description'}</h3>
              <p className="estimate-preline">{estimate.description}</p>
            </div>
          )}

          {/* Line Items */}
          {estimate.lineItems && estimate.lineItems.length > 0 && (
            <div className="estimate-section">
              <h3>Line Items</h3>
              {groupedLineItems().map((group) => (
                <div key={group.id} className="estimate-category-group">
                  {group.label && (
                    <h4 className="estimate-category-heading">{group.label}</h4>
                  )}
                  <div className="line-items-view-table">
                    <div className="line-items-view-header">
                      <div className="line-item-view-col description-col">Description</div>
                      <div className="line-item-view-col quantity-col">Quantity</div>
                      <div className="line-item-view-col price-col">Unit Price</div>
                      <div className="line-item-view-col total-col">Total</div>
                    </div>
                    {group.items.map((item, index) => (
                      <div key={`${group.id}-${index}`}>
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
                        {item.notes && item.notes.filter((note) => note && !/^Category:\s*/i.test(note)).length > 0 && (
                          <div className="line-item-view-notes">
                            <strong>Notes:</strong>
                            <ul className="line-item-notes-list-view">
                              {item.notes.filter((note) => note && !/^Category:\s*/i.test(note)).map((note, noteIndex) => (
                                <li key={noteIndex}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {estimate.templateType === 'house_demolition' && group.label && (
                    <div className="estimate-category-subtotal">
                      <span>{group.label} Subtotal:</span>
                      <strong>
                        {formatCurrency(group.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0))}
                      </strong>
                    </div>
                  )}
                </div>
              ))}
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
              <h3>{estimate.templateType === 'house_demolition' ? 'Terms, Exclusions & Payment Schedule' : 'Notes'}</h3>
              <p className="estimate-preline">{estimate.notes}</p>
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
