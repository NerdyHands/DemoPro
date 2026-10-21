import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';

const QuotesList = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const res = await apiService.getQuotes();
        const list = Array.isArray(res) ? res : (res?.quotes || []);
        setQuotes(list);
      } catch (err) {
        setError('Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };
    loadQuotes();
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (loading) {
    return (
      <Layout>
        <div className="admin-content"><p>Loading quotes...</p></div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="admin-content"><p className="error-message">{error}</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="section-header">
          <h2 className="section-title">Quotes</h2>
          <Link to="/admin/quotes/new" className="btn btn-primary">Create New Quote</Link>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q._id}>
                  <td>{q.quoteNumber}</td>
                  <td>
                    <div>
                      <div>{q.customer?.name}</div>
                      <div className="text-muted">{q.customer?.email}</div>
                    </div>
                  </td>
                  <td>{q.projectId?.name}</td>
                  <td>{formatCurrency(q.total)}</td>
                  <td>{q.status}</td>
                  <td>{q.approval?.status}</td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link className="btn btn-small btn-secondary" to={`/admin/quotes/${q._id}`}>View</Link>
                      <Link className="btn btn-small" to={`/admin/quotes/edit/${q._id}`}>Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default QuotesList;



