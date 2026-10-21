import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { clientReportApi, contractApi } from '../../services/contractsApi';

const PreWorkInspections = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState('');

  const fetchContracts = useCallback(async () => {
    try {
      const res = await contractApi.getContracts();
      setContracts(res.contracts || []);
    } catch (err) {
      // optional
    }
  }, []);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clientReportApi.getReports();
      const all = res.data || [];
      const prework = all.filter(r => r.reportType === 'Pre-Work Inspection' || (Array.isArray(r.tasks) && r.tasks.length > 0 && (!Array.isArray(r.lineItems) || r.lineItems.length === 0)));
      setInspections(prework);
    } catch (err) {
      console.error('Error fetching pre-work inspections:', err);
      setError('Failed to load pre-work inspections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchInspections();
  }, [fetchContracts, fetchInspections]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const filtered = inspections.filter(r => {
    const text = `${r.title || ''} ${r.reportNumber || ''} ${r.customerName || ''} ${r.propertyAddress || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleDelete = async (report) => {
    const confirmMsg = `Delete pre-work inspection ${report.reportNumber || report._id}?\nThis cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await clientReportApi.deleteReport(report._id);
      setInspections(prev => prev.filter(r => r._id !== report._id));
    } catch (err) {
      console.error('Failed to delete report', err);
      alert('Failed to delete report. Only Draft reports can be deleted.');
    }
  };

  return (
    <Layout>
      <div className="contracts-container">
        <div className="contracts-header">
          <div className="contracts-title-section">
            <h1 className="contracts-title">Pre-Work Inspections</h1>
            <p className="contracts-subtitle">Manage pre-work inspections prior to estimates</p>
          </div>
          <Link to="/contracts" className="create-contract-btn">
            <span className="btn-icon">+</span>
            Start from Contract
          </Link>
        </div>

        {error && (
          <div className="error-container"><p className="error-message">{error}</p></div>
        )}

        <div className="contracts-content">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search inspections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-content"><p>Loading...</p></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h2>No pre-work inspections found</h2>
                <p>Start one from a contract.</p>
              </div>
            </div>
          ) : (
            <div className="contracts-grid">
              {filtered.map((report) => (
                <div key={report._id} className="contract-card">
                  <div className="contract-header">
                    <div className="contract-number">{report.reportNumber || 'Pre-Work'}</div>
                    <div className="status-section">
                      <div className={`status-badge status-${(report.status || 'Draft').toLowerCase().replace(/\s+/g,'-')}`}>
                        {report.status || 'Draft'}
                      </div>
                    </div>
                  </div>

                  <div className="contract-info">
                    <h3 className="contract-title">{report.title || 'Pre-Work Inspection'}</h3>
                    <p className="contract-customer">{report.customerName || '—'}</p>
                    {report.propertyAddress && (
                      <p className="contract-description">{report.propertyAddress}</p>
                    )}
                  </div>

                  <div className="contract-details">
                    <div className="contract-amount">
                      <span className="amount-label">Tasks:</span>
                      <span className="amount-value">{Array.isArray(report.tasks) ? report.tasks.length : 0}</span>
                    </div>
                    <div className="contract-amount">
                      <span className="amount-label">Photos:</span>
                      <span className="amount-value">{Array.isArray(report.images) ? report.images.length : 0}</span>
                    </div>
                    <div className="contract-date">
                      <span className="date-label">Created:</span>
                      <span className="date-value">{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  <div className="contract-actions">
                    <button
                      onClick={() => navigate(`/client-reports/${report._id}`)}
                      className="view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/prework-inspection/edit?reportId=${report._id}`)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/prework-inspection/edit?reportId=${report._id}`)}
                      className="pdf-btn"
                      title="Generate PDF"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => handleDelete(report)}
                      className="delete-btn"
                      title="Delete pre-work inspection"
                    >
                      Delete
                    </button>
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

export default PreWorkInspections;


