import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi, contractApi } from '../../services/contractsApi';

const MyDocuments = () => {
  const [estimates, setEstimates] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [estRes, conRes] = await Promise.all([
          estimateApi.getMyEstimates(),
          contractApi.getMyContracts()
        ]);
        setEstimates(estRes.estimates || []);
        setContracts(conRes.contracts || []);
      } catch (e) {
        setError('Failed to load your documents.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your documents...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-left">
            <h1 className="admin-title">My Documents</h1>
            <p className="admin-subtitle">View your estimates and contracts</p>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title">Estimates</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estimate #</th>
                  <th>Title</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map(e => (
                  <tr key={e._id}>
                    <td>{e.estimateNumber}</td>
                    <td>{e.title}</td>
                    <td>{formatCurrency(e.totalAmount)}</td>
                    <td>{e.status}</td>
                    <td>{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
                {estimates.length === 0 && (
                  <tr>
                    <td colSpan="5">No estimates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title">Contracts</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contract #</th>
                  <th>Title</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Start</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c._id}>
                    <td>{c.contractNumber}</td>
                    <td>{c.title}</td>
                    <td>{formatCurrency(c.totalAmount)}</td>
                    <td>{c.status}</td>
                    <td>{formatDate(c.startDate)}</td>
                  </tr>
                ))}
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan="5">No contracts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyDocuments;


