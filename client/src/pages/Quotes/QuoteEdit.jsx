import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0, totalPrice: 0, itemNumber: '' });

const QuoteEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === undefined;
  const [form, setForm] = useState({
    projectId: '',
    picraProcessingId: '',
    customer: { name: '', email: '' },
    title: '',
    validUntil: '',
    quoteItems: [emptyItem()],
    tax: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!isNew) {
        try {
          setLoading(true);
          const res = await apiService.getQuote(id);
          if (res) {
            setForm({
              projectId: res.projectId?._id || '',
              picraProcessingId: res.picraProcessingId?._id || '',
              customer: res.customer || { name: '', email: '' },
              title: res.title || '',
              validUntil: res.validUntil ? res.validUntil.substring(0,10) : '',
              quoteItems: res.quoteItems?.length ? res.quoteItems : [emptyItem()],
              tax: res.tax || 0,
            });
          }
        } catch (err) {
          setError('Failed to load quote');
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id, isNew]);

  const calcTotals = (items, tax) => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
    return { subtotal, total: subtotal + (Number(tax) || 0) };
  };

  const updateItem = (index, key, value) => {
    const items = [...form.quoteItems];
    const updated = { ...items[index], [key]: value };
    if (key === 'quantity' || key === 'unitPrice') {
      const qty = Number(key === 'quantity' ? value : updated.quantity || 0);
      const unit = Number(key === 'unitPrice' ? value : updated.unitPrice || 0);
      updated.totalPrice = qty * unit;
    }
    items[index] = updated;
    setForm({ ...form, quoteItems: items });
  };

  const addItem = () => setForm({ ...form, quoteItems: [...form.quoteItems, emptyItem()] });
  const removeItem = (index) => setForm({ ...form, quoteItems: form.quoteItems.filter((_, i) => i !== index) });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = { ...form };
      if (isNew) {
        await apiService.createQuote(payload);
      } else {
        await apiService.updateQuote(id, payload);
      }
      navigate('/admin/quotes');
    } catch (err) {
      setError('Failed to save quote');
    }
  };

  const { subtotal, total } = calcTotals(form.quoteItems, form.tax);

  if (loading) {
    return (
      <Layout>
        <div className="admin-content"><p>Loading...</p></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="section-header">
          <h2 className="section-title">{isNew ? 'Create Quote' : 'Edit Quote'}</h2>
          <Link to="/admin/quotes" className="btn btn-secondary">Back</Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="label">Customer Name</label>
            <input className="input-field" value={form.customer.name} onChange={e => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })} required />
          </div>

          <div className="form-group">
            <label className="label">Customer Email</label>
            <input type="email" className="input-field" value={form.customer.email} onChange={e => setForm({ ...form, customer: { ...form.customer, email: e.target.value } })} required />
          </div>

          <div className="form-group">
            <label className="label">Valid Until</label>
            <input type="date" className="input-field" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="label">Tax</label>
            <input type="number" step="0.01" className="input-field" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} />
          </div>

          <h3>Items</h3>
          {form.quoteItems.map((item, index) => (
            <div key={index} className="item-row">
              <input className="input-field" placeholder="Description" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
              <input type="number" className="input-field" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
              <input type="number" step="0.01" className="input-field" placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', e.target.value)} />
              <span>{(Number(item.totalPrice) || 0).toFixed(2)}</span>
              <button type="button" className="btn btn-secondary" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={addItem}>Add Item</button>

          <div className="totals">
            <div>Subtotal: {subtotal.toFixed(2)}</div>
            <div>Tax: {Number(form.tax || 0).toFixed(2)}</div>
            <div><strong>Total: {(total).toFixed(2)}</strong></div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default QuoteEdit;



