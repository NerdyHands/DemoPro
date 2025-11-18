import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { estimateApi, customerApi } from '../../services/contractsApi';
import './Estimates.css';

const getCustomerDisplayName = (customer) => {
  if (!customer) return '';
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

const EstimateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const prefillFromPrework = location.state?.preworkLineItems || null;
  const fromPreworkId = location.state?.fromPreworkId || null;
  
  // Get customerId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const customerIdFromUrl = urlParams.get('customerId');
  
  // Check if we're creating from customer page (customer is hardcoded)
  const isFromCustomerPage = !!customerIdFromUrl;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyAddress: '',
    clientAddress: '',
    customerId: customerIdFromUrl || '',
    projectId: '',
    estimateNumber: '',
    validUntil: '',
    totalAmount: '',
    status: 'Draft',
    notes: ''
  });

  const [lineItems, setLineItems] = useState(() => {
    if (prefillFromPrework && Array.isArray(prefillFromPrework) && prefillFromPrework.length > 0) {
      return prefillFromPrework.map((li, idx) => ({
        id: idx + 1,
        description: li.description || '',
        quantity: li.quantity || 1,
        unitPrice: li.unitPrice || 0,
        total: li.total || 0
      }));
    }
    return [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }];
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const resolvedCustomerId = formData.customerId || customerIdFromUrl || '';

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customerApi.getCustomers();
      setCustomers(response.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }, []);

  const fetchEstimate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await estimateApi.getEstimate(id);
      const estimate = response.estimate;
      
      // Extract customer ID from either populated customer object or customerId field
      const extractedCustomerId = estimate.customer?._id || estimate.customer?.id || estimate.customerId || '';
      
      setFormData({
        title: estimate.title || '',
        description: estimate.description || '',
        propertyAddress: estimate.propertyAddress || '',
        clientAddress: estimate.clientAddress || '',
        customerId: extractedCustomerId,
        projectId: estimate.projectId || '',
        estimateNumber: estimate.estimateNumber || '',
        validUntil: estimate.validUntil ? estimate.validUntil.split('T')[0] : '',
        totalAmount: estimate.totalAmount || '',
        status: estimate.status || 'Draft',
        notes: estimate.notes || ''
      });
      
      // Load line items if they exist
      if (estimate.lineItems && estimate.lineItems.length > 0) {
        setLineItems(estimate.lineItems.map((item, index) => ({
          id: index + 1,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          total: item.totalPrice || 0
        })));
      }
    } catch (err) {
      console.error('Error fetching estimate:', err);
      setError('Failed to load estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomers();
    if (isEditing) {
      fetchEstimate();
    }
  }, [isEditing, fetchEstimate, fetchCustomers]);

  useEffect(() => {
    if (isFromCustomerPage && customerIdFromUrl && formData.customerId !== customerIdFromUrl) {
      setFormData(prev => ({
        ...prev,
        customerId: customerIdFromUrl
      }));
    }
  }, [isFromCustomerPage, customerIdFromUrl, formData.customerId]);

  // Set default title when creating from customer page
  useEffect(() => {
    if (!isEditing && isFromCustomerPage && customers.length > 0) {
      const selectedCustomer = customers.find(c => c._id === customerIdFromUrl);
      if (selectedCustomer && !formData.title) {
        setFormData(prev => ({
          ...prev,
          title: `Estimate `
        }));
      }
    }
  }, [isEditing, isFromCustomerPage, customers, customerIdFromUrl, formData.title]);

  // Auto-populate client address when customer is selected
  useEffect(() => {
    const activeCustomerId = formData.customerId || customerIdFromUrl;
    if (activeCustomerId && customers.length > 0 && !isEditing) {
      const selectedCustomer = customers.find(c => c._id === activeCustomerId);
      if (selectedCustomer && selectedCustomer.address && !formData.clientAddress) {
        let customerAddress = '';
        if (typeof selectedCustomer.address === 'string') {
          customerAddress = selectedCustomer.address;
        } else if (selectedCustomer.address.full) {
          customerAddress = selectedCustomer.address.full;
        } else if (selectedCustomer.address.street) {
          customerAddress = selectedCustomer.address.street;
        }
        
        if (customerAddress) {
          setFormData(prev => ({
            ...prev,
            clientAddress: customerAddress
          }));
        }
      }
    }
  }, [formData.customerId, customers, isEditing, formData.clientAddress, customerIdFromUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Calculate total for this line item
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems(prev => [...prev, {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const insertLineItemBelow = (id) => {
    const index = lineItems.findIndex(item => item.id === id);
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    const newLineItems = [...lineItems];
    newLineItems.splice(index + 1, 0, newItem);
    setLineItems(newLineItems);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const moveLineItemUp = (id) => {
    const index = lineItems.findIndex(item => item.id === id);
    if (index > 0) {
      const newLineItems = [...lineItems];
      [newLineItems[index - 1], newLineItems[index]] = [newLineItems[index], newLineItems[index - 1]];
      setLineItems(newLineItems);
    }
  };

  const moveLineItemDown = (id) => {
    const index = lineItems.findIndex(item => item.id === id);
    if (index < lineItems.length - 1) {
      const newLineItems = [...lineItems];
      [newLineItems[index], newLineItems[index + 1]] = [newLineItems[index + 1], newLineItems[index]];
      setLineItems(newLineItems);
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const validateForm = () => {
    const activeCustomerId = formData.customerId || customerIdFromUrl;
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!activeCustomerId) {
      setError('Customer is required');
      return false;
    }
    if (!formData.validUntil) {
      setError('Valid until date is required');
      return false;
    }
    
    // Validate line items
    for (let item of lineItems) {
      if (!item.description.trim()) {
        setError('All line items must have a description');
        return false;
      }
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0');
        return false;
      }
      if (item.unitPrice < 0) {
        setError('Unit price cannot be negative');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const activeCustomerId = formData.customerId || customerIdFromUrl;
      if (!activeCustomerId) {
        setError('Customer is required');
        setLoading(false);
        return;
      }

      // Helper function to convert date string to ISO with noon time to avoid timezone issues
      const dateToISO = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return undefined;
        // Set time to noon to avoid timezone shifting the date
        return `${dateStr}T12:00:00.000Z`;
      };

      // Prepare estimate data with line items and calculated total
      const estimateData = {
        title: formData.title,
        description: formData.description,
        propertyAddress: formData.propertyAddress || undefined,
        clientAddress: formData.clientAddress || undefined,
        customer: activeCustomerId,
        projectId: formData.projectId || undefined,
        validUntil: dateToISO(formData.validUntil),
        status: formData.status,
        notes: formData.notes,
        lineItems: lineItems.filter(item => item.description.trim() && item.quantity > 0).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total
        })),
        totalAmount: calculateTotal()
      };

      if (isEditing) {
        await estimateApi.updateEstimate(id, estimateData);
        setSuccess('Estimate updated successfully!');
      } else {
        const response = await estimateApi.createEstimate(estimateData);
        const createdEstimate = response.estimate;
        setSuccess(`Estimate created successfully! Estimate number: ${createdEstimate.estimateNumber}`);
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/estimates');
      }, 1500);
    } catch (err) {
      console.error('Error saving estimate:', err);
      setError(err.response?.data?.error || 'Failed to save estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/estimates');
  };

  const currentCustomer = customers.find(c => c._id === resolvedCustomerId);

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="estimate-edit-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading estimate data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="estimate-edit-container">
        <div className="estimate-edit-header">
          {isFromCustomerPage && !isEditing && (
            <div className="back-to-customer">
              <Link to={`/customers/edit/${customerIdFromUrl}`} className="back-link">
                ← Back to Customer
              </Link>
            </div>
          )}
          <h1 className="estimate-edit-title">
            {isEditing ? 'Edit Estimate' : 'Create New Estimate'}
            {!isEditing && fromPreworkId && (
              <span className="customer-context"> (from Pre-Work Inspection)</span>
            )}
            {isFromCustomerPage && !isEditing && (
              <span className="customer-context">
                {currentCustomer ? ` for ${getCustomerDisplayName(currentCustomer)}` : ''}
              </span>
            )}
          </h1>
          <p className="estimate-edit-subtitle">
            {isEditing ? 'Update estimate information' : 
             isFromCustomerPage ? 'Create a new estimate for this customer' : 'Create a new estimate'}
          </p>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        {success && (
          <div className="success-container">
            <p className="success-message">{success}</p>
          </div>
        )}

        <div className="estimate-edit-content">
          <form onSubmit={handleSubmit} className="estimate-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter estimate title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimateNumber" className="form-label">
                  Estimate Number
                </label>
                <input
                  type="text"
                  id="estimateNumber"
                  name="estimateNumber"
                  value={formData.estimateNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Auto-generated (e.g., EST-20241201-0001)"
                  readOnly={!isEditing}
                  title={!isEditing ? "Estimate number is automatically generated" : ""}
                />
                {!isEditing && (
                  <small className="form-help-text">
                    Estimate number will be automatically generated when saved
                  </small>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerId" className="form-label">
                  Customer *
                </label>
                {isFromCustomerPage ? (
                  <div className="customer-display">
                    {currentCustomer ? (
                      <div className="selected-customer-info">
                        <strong>{getCustomerDisplayName(currentCustomer)}</strong>
                        <span className="customer-email">({currentCustomer.email})</span>
                        {currentCustomer.phone && (
                          <span className="customer-phone"> - {currentCustomer.phone}</span>
                        )}
                      </div>
                    ) : (
                      <div className="loading-customer">Loading customer information...</div>
                    )}
                  </div>
                ) : (
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {getCustomerDisplayName(customer)} - {customer.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="validUntil" className="form-label">
                  Valid Until *
                </label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Total Amount
                </label>
                <div className="total-amount-display">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter estimate description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="propertyAddress" className="form-label">
                  Property Address
                </label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter property address (work site)"
                />
                <small className="form-help-text">
                  The physical location where work will be performed
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clientAddress" className="form-label">
                Client Address
              </label>
              <input
                type="text"
                id="clientAddress"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter client mailing address"
              />
              <small className="form-help-text">
                Client's mailing address (auto-populated from customer, can be edited). This flows through to contracts and invoices.
              </small>
            </div>

            {/* Line Items Section */}
            <div className="line-items-section">
              <div className="line-items-header">
                <h3 className="line-items-title">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="btn btn-secondary btn-sm"
                >
                  + Add Item
                </button>
              </div>

              <div className="line-items-table-new">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="line-item-card">
                    <div className="line-item-description-row">
                      <label className="line-item-label">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        className="form-input line-item-textarea"
                        placeholder="Item description"
                        rows="3"
                      />
                    </div>
                    
                    <div className="line-item-details-row">
                      <div className="line-item-field">
                        <label className="line-item-label">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="form-input line-item-input"
                          min="1"
                          step="1"
                        />
                      </div>
                      
                      <div className="line-item-field">
                        <label className="line-item-label">Unit Price</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="form-input line-item-input"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="line-item-field">
                        <label className="line-item-label">Total</label>
                        <div className="line-item-total">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="line-item-actions-row">
                      <button
                        type="button"
                        onClick={() => moveLineItemUp(item.id)}
                        className="btn btn-icon"
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLineItemDown(item.id)}
                        className="btn btn-icon"
                        disabled={index === lineItems.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => insertLineItemBelow(item.id)}
                        className="btn btn-icon btn-add"
                        title="Add Row Below"
                      >
                        +
                      </button>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="btn btn-icon btn-danger"
                          title="Delete Row"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="line-items-summary">
                <div className="summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter additional notes"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Estimate' : 'Create Estimate')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EstimateEdit;
