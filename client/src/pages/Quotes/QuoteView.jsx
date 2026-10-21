import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';

const QuoteView = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiService.getQuote(id);
        setQuote(res || null);
      } catch (err) {
        setError('Failed to load quote');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (loading) {
    return (
      <Layout>
        <div className="admin-content"><p>Loading quote...</p></div>
      </Layout>
    );
  }
  if (error || !quote) {
    return (
      <Layout>
        <div className="admin-content"><p className="error-message">{error || 'Quote not found'}</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="section-header">
          <h2 className="section-title">Quote {quote.quoteNumber}</h2>
          <div>
            <Link className="btn" to={`/admin/quotes/edit/${quote._id}`}>Edit</Link>
            <Link className="btn btn-secondary" to="/admin/quotes">Back to Quotes</Link>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <h3>Customer</h3>
            <p>{quote.customer?.name}</p>
            <p className="text-muted">{quote.customer?.email}</p>
          </div>
          <div>
            <h3>Status</h3>
            <p>{quote.status}</p>
            <p>Approval: {quote.approval?.status}</p>
          </div>
          <div>
            <h3>Totals</h3>
            <p>Subtotal: {formatCurrency(quote.subtotal)}</p>
            <p>Tax: {formatCurrency(quote.tax)}</p>
            <p>Total: {formatCurrency(quote.total)}</p>
          </div>
        </div>

        <h3>Items</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.quoteItems?.map((item) => (
                <tr key={item.itemNumber}>
                  <td>{item.itemNumber}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default QuoteView;



