import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { amendmentApi, contractApi } from '../../services/contractsApi';
import './Amendments.css';

const AmendmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  
  // Get contractId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const contractIdFromUrl = urlParams.get('contractId');

  const [formData, setFormData] = useState({
    contractId: contractIdFromUrl || '',
    title: '',
    description: '',
    reason: '',
    effectiveDate: '',
    status: 'Draft',
    notes: ''
  });

  const [lineItemChanges, setLineItemChanges] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contractLineItemsLoaded, setContractLineItemsLoaded] = useState(false);

  // Fetch contract details
  const fetchContract = useCallback(async (contractId) => {
    try {
      const response = await contractApi.getContract(contractId);
      const contractData = response.contract || response.data;
      setContract(contractData);
      
      // If creating new amendment (not editing) and contract has line items, pre-populate them
      if (!isEditing && contractData && contractData.lineItems && contractData.lineItems.length > 0 && !contractLineItemsLoaded) {
        const preloadedLineItems = contractData.lineItems.map((item, idx) => ({
          id: idx + 1,
          lineItemNumber: item.lineItemNumber || `${idx + 1}`,
          changeType: 'modified',
          included: false, // Checkbox to include this item
          original: {
            description: item.description || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || (item.quantity * item.unitPrice) || 0
          },
          updated: {
            description: item.description || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || (item.quantity * item.unitPrice) || 0
          }
        }));
        setLineItemChanges(preloadedLineItems);
        setContractLineItemsLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract details');
    }
  }, [isEditing, contractLineItemsLoaded]);

  // Load contract on mount or when contractId changes
  useEffect(() => {
    if (formData.contractId && !isEditing) {
      fetchContract(formData.contractId);
    }
  }, [formData.contractId, fetchContract, isEditing]);

  // Load amendment data if editing
  useEffect(() => {
    const loadAmendment = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const response = await amendmentApi.getAmendment(id);
          const amendment = response.amendment || response.data;
          
          setFormData({
            contractId: amendment.contractId?._id || amendment.contractId,
            title: amendment.title,
            description: amendment.description,
            reason: amendment.reason,
            effectiveDate: amendment.effectiveDate ? amendment.effectiveDate.substring(0, 10) : '',
            status: amendment.status,
            notes: amendment.notes || ''
          });

          if (amendment.lineItemChanges && amendment.lineItemChanges.length > 0) {
            setLineItemChanges(amendment.lineItemChanges.map((change, idx) => ({
              id: idx + 1,
              ...change
            })));
          }
        } catch (err) {
          console.error('Error loading amendment:', err);
          setError('Failed to load amendment');
        } finally {
          setLoading(false);
        }
      }
    };

    loadAmendment();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateLineItemTotal = (quantity, unitPrice) => {
    return Number(quantity) * Number(unitPrice);
  };

  const handleLineItemChange = (index, field, value, section = 'updated') => {
    const updatedChanges = [...lineItemChanges];
    const change = { ...updatedChanges[index] };
    
    if (field === 'lineItemNumber' || field === 'changeType' || field === 'included') {
      change[field] = value;
    } else {
      change[section] = { ...change[section], [field]: value };
      
      // Recalculate total if quantity or unitPrice changed
      if (field === 'quantity' || field === 'unitPrice') {
        change[section].totalPrice = calculateLineItemTotal(
          change[section].quantity,
          change[section].unitPrice
        );
      }
    }
    
    updatedChanges[index] = change;
    setLineItemChanges(updatedChanges);
  };

  const handleToggleInclude = (index) => {
    const updatedChanges = [...lineItemChanges];
    updatedChanges[index].included = !updatedChanges[index].included;
    setLineItemChanges(updatedChanges);
  };

  const addLineItemChange = () => {
    setLineItemChanges([...lineItemChanges, {
      id: lineItemChanges.length + 1,
      lineItemNumber: '',
      changeType: 'added',
      original: { description: '', quantity: 0, unitPrice: 0, totalPrice: 0 },
      updated: { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    }]);
  };

  const removeLineItemChange = (index) => {
    setLineItemChanges(lineItemChanges.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.contractId) {
      setError('Please select a contract');
      return;
    }

    if (lineItemChanges.length === 0) {
      setError('Please add at least one line item change');
      return;
    }

    // Filter out line items that aren't included (when checkbox exists)
    const includedLineItems = lineItemChanges.filter(change => {
      // If this is from contract pre-load and has an 'included' checkbox, only include if checked
      if (change.hasOwnProperty('included')) {
        return change.included;
      }
      // For manually added items, include if they have content
      if (change.changeType === 'added' || change.changeType === 'modified') {
        return change.updated.description.trim() !== '';
      } else if (change.changeType === 'removed') {
        return change.original.description.trim() !== '';
      }
      return false;
    });

    if (includedLineItems.length === 0) {
      setError('Please select at least one line item to include in the amendment');
      return;
    }

    const validLineItemChanges = includedLineItems;

    try {
      setLoading(true);

      const amendmentData = {
        ...formData,
        lineItemChanges: validLineItemChanges.map(change => ({
          lineItemNumber: change.lineItemNumber,
          changeType: change.changeType,
          original: change.changeType !== 'added' ? change.original : undefined,
          updated: change.changeType !== 'removed' ? change.updated : undefined
        }))
      };

      if (isEditing) {
        await amendmentApi.updateAmendment(id, amendmentData);
        setSuccess('Amendment updated successfully!');
      } else {
        await amendmentApi.createAmendment(amendmentData);
        setSuccess('Amendment created successfully!');
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/contracts/${formData.contractId}`);
      }, 1500);

    } catch (err) {
      console.error('Error saving amendment:', err);
      setError(err.response?.data?.error || 'Failed to save amendment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="admin-content">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-content">
        <div className="section-header">
          <h2 className="section-title">
            {isEditing ? 'Edit Contract Amendment' : 'Create Contract Amendment'}
          </h2>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {contract && (
          <div className="info-box">
            <h3>Contract Information</h3>
            <p><strong>Contract Number:</strong> {contract.contractNumber}</p>
            <p><strong>Title:</strong> {contract.title}</p>
            <p><strong>Current Amount:</strong> ${Number(contract.totalAmount || 0).toFixed(2)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="amendment-form">
          <div className="form-section">
            <h3>Amendment Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Amendment Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Additional Work Request"
              />
            </div>

            <div className="form-group">
              <label htmlFor="effectiveDate">Effective Date *</label>
              <input
                type="date"
                id="effectiveDate"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Amendment *</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Explain why this amendment is necessary"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Detailed description of the changes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes or comments"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Line Item Changes</h3>
              <button type="button" className="btn btn-primary" onClick={addLineItemChange}>
                + Add New Line Item
              </button>
            </div>

            {!isEditing && contractLineItemsLoaded && lineItemChanges.length > 0 && (
              <div className="info-box" style={{marginBottom: '20px'}}>
                <p>✅ <strong>{lineItemChanges.length} existing line items loaded from contract.</strong></p>
                <p>Check the boxes below to include/modify items in this amendment, or add new items using the button above.</p>
              </div>
            )}

            {lineItemChanges.map((change, index) => (
              <div key={change.id} className={`line-item-change ${change.hasOwnProperty('included') && !change.included ? 'not-included' : ''}`}>
                <div className="line-item-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {change.hasOwnProperty('included') && (
                      <label style={{display: 'flex', alignItems: 'center', margin: 0, cursor: 'pointer'}}>
                        <input
                          type="checkbox"
                          checked={change.included}
                          onChange={() => handleToggleInclude(index)}
                          style={{marginRight: '8px', width: '20px', height: '20px', cursor: 'pointer'}}
                        />
                        <span style={{fontWeight: 'bold'}}>Include in Amendment</span>
                      </label>
                    )}
                    <h4 style={{margin: 0}}>Line Item #{change.lineItemNumber || (index + 1)}</h4>
                  </div>
                  {(!change.hasOwnProperty('included') || isEditing) && lineItemChanges.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-small"
                      onClick={() => removeLineItemChange(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Line Item Number *</label>
                    <input
                      type="text"
                      value={change.lineItemNumber}
                      onChange={(e) => handleLineItemChange(index, 'lineItemNumber', e.target.value)}
                      required={change.included !== false}
                      placeholder="e.g., 1, 2, 3.1"
                      disabled={change.hasOwnProperty('included') && !change.included}
                    />
                  </div>

                  <div className="form-group">
                    <label>Change Type *</label>
                    <select
                      value={change.changeType}
                      onChange={(e) => handleLineItemChange(index, 'changeType', e.target.value)}
                      required={change.included !== false}
                      disabled={change.hasOwnProperty('included') && !change.included}
                    >
                      <option value="added">New Item</option>
                      <option value="modified">Modified Item</option>
                      <option value="removed">Removed Item</option>
                    </select>
                  </div>
                </div>

                {(change.changeType === 'modified' || change.changeType === 'removed') && (
                  <div className="original-section">
                    <h5>Original Line Item</h5>
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={change.original.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'original')}
                        required={change.included !== false}
                        placeholder="Original description"
                        disabled={change.hasOwnProperty('included') && !change.included}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantity *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={change.original.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value, 'original')}
                          required={change.included !== false}
                          disabled={change.hasOwnProperty('included') && !change.included}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={change.original.unitPrice}
                          onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value, 'original')}
                          required={change.included !== false}
                          disabled={change.hasOwnProperty('included') && !change.included}
                        />
                      </div>
                      <div className="form-group">
                        <label>Total</label>
                        <input
                          type="text"
                          value={`$${Number(change.original.totalPrice).toFixed(2)}`}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(change.changeType === 'added' || change.changeType === 'modified') && (
                  <div className="updated-section">
                    <h5>{change.changeType === 'modified' ? 'Updated Line Item' : 'New Line Item'}</h5>
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={change.updated.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'updated')}
                        required={change.included !== false}
                        placeholder="Item description"
                        disabled={change.hasOwnProperty('included') && !change.included}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantity *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={change.updated.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value, 'updated')}
                          required={change.included !== false}
                          disabled={change.hasOwnProperty('included') && !change.included}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={change.updated.unitPrice}
                          onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value, 'updated')}
                          required={change.included !== false}
                          disabled={change.hasOwnProperty('included') && !change.included}
                        />
                      </div>
                      <div className="form-group">
                        <label>Total</label>
                        <input
                          type="text"
                          value={`$${Number(change.updated.totalPrice).toFixed(2)}`}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Amendment' : 'Create Amendment')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AmendmentEdit;

