import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { amendmentApi } from '../../services/contractsApi';
import './Amendments.css';

const AmendmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [amendment, setAmendment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAmendment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await amendmentApi.getAmendment(id);
      setAmendment(response.amendment || response.data);
    } catch (err) {
      console.error('Error loading amendment:', err);
      setError('Failed to load amendment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAmendment();
  }, [loadAmendment]);

  const handleDownloadPdf = async () => {
    try {
      setActionLoading(true);
      await amendmentApi.downloadPdf(id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this amendment?')) {
      return;
    }

    try {
      setActionLoading(true);
      await amendmentApi.approveAmendment(id);
      alert('Amendment approved successfully!');
      loadAmendment(); // Reload to get updated status
    } catch (err) {
      console.error('Error approving amendment:', err);
      alert('Failed to approve amendment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) {
      return;
    }

    try {
      setActionLoading(true);
      await amendmentApi.rejectAmendment(id, null, reason);
      alert('Amendment rejected successfully!');
      loadAmendment(); // Reload to get updated status
    } catch (err) {
      console.error('Error rejecting amendment:', err);
      alert('Failed to reject amendment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this amendment? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await amendmentApi.deleteAmendment(id);
      alert('Amendment deleted successfully!');
      navigate(`/contracts/${amendment.contractId?._id || amendment.contractId}`);
    } catch (err) {
      console.error('Error deleting amendment:', err);
      alert(err.response?.data?.error || 'Failed to delete amendment');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Draft': 'status-draft',
      'Pending Approval': 'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  const getChangeTypeLabel = (changeType) => {
    const typeMap = {
      'added': 'NEW ITEM',
      'modified': 'MODIFIED',
      'removed': 'REMOVED'
    };
    return typeMap[changeType] || changeType;
  };

  const getChangeTypeClass = (changeType) => {
    const classMap = {
      'added': 'change-added',
      'modified': 'change-modified',
      'removed': 'change-removed'
    };
    return classMap[changeType] || '';
  };

  if (loading) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="loading">Loading amendment...</div>
        </div>
      </Layout>
    );
  }

  if (error || !amendment) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="error-message">{error || 'Amendment not found'}</div>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">Amendment {amendment.amendmentNumber}</h2>
            <span className={`status-badge ${getStatusBadgeClass(amendment.status)}`}>
              {amendment.status}
            </span>
          </div>
          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={handleDownloadPdf}
              disabled={actionLoading}
            >
              Download PDF
            </button>
            {amendment.status === 'Draft' && (
              <>
                <Link 
                  to={`/amendments/edit/${amendment._id}`} 
                  className="btn btn-secondary"
                >
                  Edit
                </Link>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  Delete
                </button>
              </>
            )}
            {(amendment.status === 'Draft' || amendment.status === 'Pending Approval') && (
              <>
                <button 
                  className="btn btn-success" 
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Contract Information</h3>
            <div className="detail-item">
              <span className="detail-label">Contract Number:</span>
              <span className="detail-value">
                <Link to={`/contracts/${amendment.contractId?._id || amendment.contractId}`}>
                  {amendment.contractNumber}
                </Link>
              </span>
            </div>
            {amendment.contractId?.title && (
              <div className="detail-item">
                <span className="detail-label">Contract Title:</span>
                <span className="detail-value">{amendment.contractId.title}</span>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h3>Client Information</h3>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{amendment.clientName}</span>
            </div>
            {amendment.clientAddress && (
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{amendment.clientAddress}</span>
              </div>
            )}
            {amendment.customer?.email && (
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{amendment.customer.email}</span>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h3>Amendment Details</h3>
            <div className="detail-item">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{amendment.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Effective Date:</span>
              <span className="detail-value">{formatDate(amendment.effectiveDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{formatDate(amendment.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Reason for Amendment</h3>
          <p className="info-text">{amendment.reason}</p>
        </div>

        <div className="info-section">
          <h3>Description</h3>
          <p className="info-text">{amendment.description}</p>
        </div>

        {amendment.notes && (
          <div className="info-section">
            <h3>Additional Notes</h3>
            <p className="info-text">{amendment.notes}</p>
          </div>
        )}

        <div className="line-items-section">
          <h3>Line Item Changes</h3>
          {amendment.lineItemChanges && amendment.lineItemChanges.length > 0 ? (
            amendment.lineItemChanges.map((change, index) => (
              <div key={index} className={`line-item-change-view ${getChangeTypeClass(change.changeType)}`}>
                <div className="change-header">
                  <h4>
                    Line Item {change.lineItemNumber} - 
                    <span className={`change-type-badge ${getChangeTypeClass(change.changeType)}`}>
                      {getChangeTypeLabel(change.changeType)}
                    </span>
                  </h4>
                  <span className={`cost-impact ${change.costImpact >= 0 ? 'positive' : 'negative'}`}>
                    {change.costImpact >= 0 ? '+' : ''}{formatCurrency(change.costImpact)}
                  </span>
                </div>

                {(change.changeType === 'modified' || change.changeType === 'removed') && change.original && (
                  <div className="item-details original">
                    <h5>Original:</h5>
                    <p className="description">{change.original.description}</p>
                    <div className="item-pricing">
                      <span>Qty: {change.original.quantity}</span>
                      <span>Unit Price: {formatCurrency(change.original.unitPrice)}</span>
                      <span>Total: {formatCurrency(change.original.totalPrice)}</span>
                    </div>
                  </div>
                )}

                {(change.changeType === 'added' || change.changeType === 'modified') && change.updated && (
                  <div className="item-details updated">
                    <h5>{change.changeType === 'modified' ? 'Updated:' : 'New Item:'}</h5>
                    <p className="description">{change.updated.description}</p>
                    <div className="item-pricing">
                      <span>Qty: {change.updated.quantity}</span>
                      <span>Unit Price: {formatCurrency(change.updated.unitPrice)}</span>
                      <span>Total: {formatCurrency(change.updated.totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-data">No line item changes found</p>
          )}
        </div>

        <div className="financial-summary">
          <h3>Financial Summary</h3>
          <div className="summary-grid">
            <div className="summary-row">
              <span className="summary-label">Original Contract Amount:</span>
              <span className="summary-value">{formatCurrency(amendment.originalContractAmount)}</span>
            </div>
            <div className="summary-row added">
              <span className="summary-label">Added Items:</span>
              <span className="summary-value">+{formatCurrency(amendment.addedItemsTotal)}</span>
            </div>
            <div className="summary-row removed">
              <span className="summary-label">Removed Items:</span>
              <span className="summary-value">{formatCurrency(amendment.removedItemsTotal)}</span>
            </div>
            <div className="summary-row modified">
              <span className="summary-label">Modified Items Impact:</span>
              <span className="summary-value">
                {amendment.modifiedItemsImpact >= 0 ? '+' : ''}
                {formatCurrency(amendment.modifiedItemsImpact)}
              </span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total Change:</span>
              <span className={`summary-value ${amendment.totalCostChange >= 0 ? 'positive' : 'negative'}`}>
                {amendment.totalCostChange >= 0 ? '+' : ''}
                {formatCurrency(amendment.totalCostChange)}
              </span>
            </div>
            <div className="summary-row grand-total">
              <span className="summary-label">New Contract Amount:</span>
              <span className="summary-value">{formatCurrency(amendment.newContractAmount)}</span>
            </div>
          </div>
        </div>

        {amendment.approvalStatus && (
          <div className="approval-section">
            <h3>Approval Information</h3>
            {amendment.approvalStatus.approvedBy && (
              <>
                <p><strong>Approved By:</strong> {amendment.approvalStatus.approvedBy}</p>
                <p><strong>Approved At:</strong> {formatDate(amendment.approvalStatus.approvedAt)}</p>
              </>
            )}
            {amendment.approvalStatus.rejectedBy && (
              <>
                <p><strong>Rejected By:</strong> {amendment.approvalStatus.rejectedBy}</p>
                <p><strong>Rejected At:</strong> {formatDate(amendment.approvalStatus.rejectedAt)}</p>
                <p><strong>Rejection Reason:</strong> {amendment.approvalStatus.rejectionReason}</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AmendmentView;

