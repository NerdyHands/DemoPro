import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { amendmentApi } from '../../services/contractsApi';
import './Amendments.css';

const AmendmentsList = ({ contractId, showCreateButton = true, onAmendmentChange }) => {
  const [amendments, setAmendments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAmendments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await amendmentApi.getContractAmendments(contractId);
      setAmendments(response.data || []);
    } catch (err) {
      console.error('Error loading amendments:', err);
      setError('Failed to load amendments');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const loadSummary = useCallback(async () => {
    try {
      const response = await amendmentApi.getContractSummary(contractId);
      setSummary(response.data);
      // Call the parent callback if provided
      if (onAmendmentChange) {
        onAmendmentChange();
      }
    } catch (err) {
      console.error('Error loading contract summary:', err);
    }
  }, [contractId, onAmendmentChange]);

  useEffect(() => {
    if (contractId) {
      loadAmendments();
      loadSummary();
    }
  }, [contractId, loadAmendments, loadSummary]);

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
      month: 'short',
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

  if (loading) {
    return (
      <div className="amendments-list">
        <h3>Contract Amendments</h3>
        <div className="loading">Loading amendments...</div>
      </div>
    );
  }

  return (
    <div className="amendments-list">
      <div className="section-header">
        <div>
          <h3>Contract Amendments</h3>
          {summary && summary.amendmentCount > 0 && (
            <div className="summary-info" style={{ marginTop: '12px' }}>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                <strong>Original Amount:</strong> {formatCurrency(summary.originalAmount)}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                <strong>Total Amendments:</strong> {formatCurrency(summary.amendmentsTotal)}
                {summary.amendmentsTotal >= 0 ? ' increase' : ' decrease'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '16px', color: '#1a1a1a', fontWeight: '600' }}>
                <strong>Current Total:</strong> {formatCurrency(summary.currentTotal)}
              </p>
            </div>
          )}
        </div>
        {showCreateButton && (
          <Link 
            to={`/amendments/create?contractId=${contractId}`} 
            className="btn btn-primary"
          >
            + Create Amendment
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {amendments.length === 0 ? (
        <div className="no-amendments">
          <p>No amendments have been created for this contract.</p>
        </div>
      ) : (
        <div className="amendments-table">
          <table>
            <thead>
              <tr>
                <th>Amendment #</th>
                <th>Title</th>
                <th>Effective Date</th>
                <th>Status</th>
                <th>Cost Change</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {amendments.map((amendment) => (
                <tr key={amendment._id}>
                  <td>
                    <Link to={`/amendments/${amendment._id}`}>
                      {amendment.amendmentNumber}
                    </Link>
                  </td>
                  <td>{amendment.title}</td>
                  <td>{formatDate(amendment.effectiveDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(amendment.status)}`}>
                      {amendment.status}
                    </span>
                  </td>
                  <td>
                    <span className={amendment.totalCostChange >= 0 ? 'positive' : 'negative'}>
                      {amendment.totalCostChange >= 0 ? '+' : ''}
                      {formatCurrency(amendment.totalCostChange)}
                    </span>
                  </td>
                  <td>{formatDate(amendment.createdAt)}</td>
                  <td>
                    <Link 
                      to={`/amendments/${amendment._id}`} 
                      className="btn btn-small btn-primary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmendmentsList;

