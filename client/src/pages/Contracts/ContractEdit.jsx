import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { contractApi, customerApi, estimateApi } from '../../services/contractsApi';
import './Contracts.css';

const ContractEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  
  // Get estimateId and customerId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const estimateIdFromUrl = urlParams.get('estimateId');
  const customerIdFromUrl = urlParams.get('customerId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyAddress: '',
    customerId: customerIdFromUrl || '',
    estimateId: estimateIdFromUrl || '',
    contractNumber: '',
    startDate: '',
    endDate: '',
    totalAmount: '',
    status: 'Draft',
    terms: '',
    notes: '',
    clientName: '',
    clientAddress: '',
    depositAmount: 0
  });

  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]);

  const [downPaymentPercentage, setDownPaymentPercentage] = useState(30);
  const [depositType, setDepositType] = useState('percentage'); // 'percentage' or 'dollar'
  const [customDepositAmount, setCustomDepositAmount] = useState(0);

  const [customers, setCustomers] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Default notes for PICRA repair contracts
  const getDefaultNotes = useCallback(() => `1. SCOPE OF WORK
The contractor agrees to perform residential repair services at the client's property as outlined in the PICRA document and detailed in the written price estimate. All work will be completed in a professional manner consistent with industry standards and in accordance with the agreed-upon inspection report items.

2. QUALITY STANDARDS
2.1 Materials: All work will be performed using high-quality, professional-grade materials.
2.2 Techniques: Repairs will be done using industry-standard techniques and professional application methods.
2.3 Surface Preparation: Proper surface preparation including cleaning, sanding, and priming as necessary.

3. PAYMENT TERMS
3.1 Total Contract Amount: The total contract amount is as specified in the line items above.
3.2 Deposit Requirement: Unless waived, a deposit of 25% is required upon contract signing to secure project scheduling and ensure material allocation.
3.3 Final Payment: Unless agreed upon otherwise, the remaining balance is due immediately upon project completion and client satisfaction.
3.4 Accepted Payment Methods: We accept electronic card payments through our secure Stripe payment system, as well as personal or business checks made payable to the contractor.

4. PROJECT TIMELINE
4.1 Project Start Date: Work is scheduled to commence on the start date specified above.
4.2 Timeline Considerations: Project completion dates are subject to weather conditions, material availability, and any unforeseen circumstances.
4.3 Weather Delays: Repair work may be delayed due to weather conditions to ensure quality results.

5. CHANGE ORDERS AND MODIFICATIONS
5.1 Change Order Requirements: Any modifications to the scope of work, cost, materials, or timeline must be detailed in a written change order signed by both parties before work begins.
5.2 Change Order Process: Change orders must include detailed description, timeline impact, adjusted cost, additional materials, and signatures of both parties.

6. PERMITS AND COMPLIANCE
6.1 Permits and Inspections: The contractor will obtain and pay for all required permits and inspections necessary for the completion of this project.
6.2 Code Compliance: All work performed under this contract will comply with the Virginia Uniform Statewide Building Code and any applicable local building codes.

7. LIABILITY AND INSURANCE
7.1 Insurance Coverage: Contractor maintains comprehensive general liability insurance with minimum coverage of $1,000,000.
7.2 Contractor Liability: The contractor agrees to indemnify and hold the client harmless against any claims or damages resulting from contractor negligence.
7.3 Client Acknowledgment: The client acknowledges that renovation work may involve inherent risks and agrees to hold the contractor harmless for pre-existing conditions.
7.4 Virginia Contractor Transaction Recovery Fund: The Virginia Contractor Transaction Recovery Fund may provide recovery for losses suffered by homeowners due to poor workmanship or failure to perform by licensed contractors. For information about filing a claim, contact the Virginia Department of Professional and Occupational Regulation (DPOR) at (804) 367-8511 or visit www.dpor.virginia.gov.

8. CONTRACT TERMINATION
8.1 Termination Notice: Either party may terminate this contract by providing three (3) days written notice to the other party.
8.2 Termination by Client: If the client terminates the contract after work has begun, any deposit will be forfeited.

9. DISPUTE RESOLUTION
9.1 Good Faith Negotiation: Any disputes arising from this contract will first be addressed through direct, good-faith negotiation between the parties.
9.2 Mediation Process: If direct negotiation fails to resolve the dispute, the matter will be submitted to professional mediation.

10. GOVERNING LAW
This contract shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia. Any legal proceedings related to this contract shall be conducted in Virginia courts.

11. ENTIRE AGREEMENT
This document represents the complete and entire agreement between the parties and supersedes all prior negotiations, discussions, or agreements, whether written or verbal. Only written modifications signed by both parties constitute binding amendments to this contract. Verbal agreements or modifications are not enforceable.`, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customerApi.getCustomers();
      setCustomers(response.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }, []);

  const fetchEstimates = useCallback(async () => {
    try {
      const response = await estimateApi.getEstimates();
      setEstimates(response.estimates || []);
    } catch (err) {
      console.error('Error fetching estimates:', err);
    }
  }, []);

  const populateFromEstimate = useCallback(async (estimateId) => {
    try {
      const response = await estimateApi.getEstimate(estimateId);
      const estimate = response.estimate;
      
      // Also get customer info for customer name (if not in estimate)
      let customerInfo = {};
      if (estimate.customerId) {
        try {
          const customerResponse = await customerApi.getCustomer(estimate.customerId);
          customerInfo = customerResponse.customer || {};
        } catch (err) {
          console.error('Error fetching customer info:', err);
        }
      }
    
      const clientName = customerInfo.firstName && customerInfo.lastName ? 
        `${customerInfo.firstName} ${customerInfo.lastName}` : '';
      
      // Use clientAddress from estimate (user may have edited it)
      // Fall back to customer address if not set in estimate
      let clientAddress = estimate.clientAddress || '';
      if (!clientAddress && customerInfo.address) {
        if (typeof customerInfo.address === 'string') {
          clientAddress = customerInfo.address;
        } else if (customerInfo.address.full) {
          clientAddress = customerInfo.address.full;
        } else if (customerInfo.address.street) {
          clientAddress = customerInfo.address.street;
        } else {
          clientAddress = JSON.stringify(customerInfo.address);
        }
      }
    
      // Generate a temporary contract number
      const tempContractNumber = `CON-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-TEMP`;
      
      setFormData(prev => ({
        ...prev,
        title: estimate.title ? `Contract for ${estimate.title}` : '',
        description: estimate.description || '',
        propertyAddress: estimate.propertyAddress || '',
        customerId: estimate.customerId || '',
        estimateId: estimateId,
        contractNumber: tempContractNumber,
        totalAmount: estimate.totalAmount || '',
        startDate: new Date().toISOString().split('T')[0], // Today's date
        endDate: estimate.validUntil ? estimate.validUntil.split('T')[0] : '',
        clientName: clientName,
        clientAddress: clientAddress,
        terms: getDefaultNotes(),
        notes: ''
      }));

      // Load line items from estimate
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
      console.error('Error fetching estimate for pre-population:', err);
    }
  }, [getDefaultNotes]);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContract(id);
      const contract = response.contract;
      
      // Extract customer ID from either populated customer object or customerId field
      const extractedCustomerId = contract.customer?._id || contract.customer?.id || contract.customerId || '';
      
      // Get customer info for customer name and address
      let customerInfo = {};
      if (extractedCustomerId) {
        try {
          const customerResponse = await customerApi.getCustomer(extractedCustomerId);
          customerInfo = customerResponse.customer || {};
        } catch (err) {
          console.error('Error fetching customer info:', err);
        }
      }
      
      setFormData({
        title: contract.title || '',
        description: contract.description || '',
        propertyAddress: contract.propertyAddress || '',
        customerId: extractedCustomerId,
        estimateId: contract.estimateId || '',
        contractNumber: contract.contractNumber || '',
        startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
        endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
        totalAmount: contract.totalAmount || '',
        status: contract.status || 'Draft',
        terms: contract.terms || getDefaultNotes(),
        notes: contract.notes || '',
        clientName: contract.clientName || (customerInfo.firstName && customerInfo.lastName ? 
          `${customerInfo.firstName} ${customerInfo.lastName}` : ''),
        clientAddress: contract.clientAddress || (() => {
          if (customerInfo.address) {
            if (typeof customerInfo.address === 'string') {
              return customerInfo.address;
            } else if (customerInfo.address.full) {
              return customerInfo.address.full;
            } else if (customerInfo.address.street) {
              return customerInfo.address.street;
            } else {
              return JSON.stringify(customerInfo.address);
            }
          }
          return '';
        })(),
        depositAmount: contract.depositAmount || 0
      });

             // Set downpayment percentage and custom amount based on deposit amount
       if (contract.depositAmount && contract.totalAmount) {
         const percentage = (contract.depositAmount / contract.totalAmount) * 100;
         setDownPaymentPercentage(Math.round(percentage));
         setCustomDepositAmount(contract.depositAmount);
       }

      // Load line items if they exist
      if (contract.lineItems && contract.lineItems.length > 0) {
        setLineItems(contract.lineItems.map((item, index) => ({
          id: index + 1,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          total: item.totalPrice || 0
        })));
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, getDefaultNotes]);

  useEffect(() => {
    fetchCustomers();
    fetchEstimates();
    if (isEditing) {
      fetchContract();
    } else if (estimateIdFromUrl) {
      // Pre-populate form with estimate data
      populateFromEstimate(estimateIdFromUrl);
    } else if (customerIdFromUrl) {
      // Pre-populate customer info if customer ID is provided
      updateCustomerInfo(customerIdFromUrl);
    }
  }, [id, estimateIdFromUrl, customerIdFromUrl, isEditing, fetchCustomers, fetchEstimates, fetchContract, populateFromEstimate]);

  // Additional effect to ensure customer info is loaded when estimateId changes
  useEffect(() => {
    if (estimateIdFromUrl && !isEditing) {
      populateFromEstimate(estimateIdFromUrl);
    }
  }, [estimateIdFromUrl, isEditing, populateFromEstimate]);

  // Initialize contract number and terms for new contracts
  useEffect(() => {
    if (!isEditing && !formData.contractNumber) {
      const tempContractNumber = `CON-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-TEMP`;
      setFormData(prev => ({
        ...prev,
        contractNumber: tempContractNumber,
        terms: prev.terms || getDefaultNotes(),
        notes: prev.notes || ''
      }));
    }
  }, [isEditing, formData.contractNumber, getDefaultNotes]);

  const calculateTotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  }, [lineItems]);

  // Update deposit amount when percentage, total, or deposit type changes
  useEffect(() => {
    const total = calculateTotal();
    let depositAmount;
    
    if (depositType === 'percentage') {
      depositAmount = total * (downPaymentPercentage / 100);
    } else {
      depositAmount = customDepositAmount;
    }
    
    setFormData(prev => ({
      ...prev,
      depositAmount: depositAmount
    }));
  }, [downPaymentPercentage, lineItems, depositType, customDepositAmount, calculateTotal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If customer is changed, update customer name and address
    if (name === 'customerId' && value) {
      updateCustomerInfo(value);
    }
  };

  const updateCustomerInfo = async (customerId) => {
    try {
      const customerResponse = await customerApi.getCustomer(customerId);
      const customerInfo = customerResponse.customer || {};
      
      const clientName = customerInfo.firstName && customerInfo.lastName ? 
        `${customerInfo.firstName} ${customerInfo.lastName}` : '';
      
      // Handle different possible address formats
      let clientAddress = '';
      if (customerInfo.address) {
        if (typeof customerInfo.address === 'string') {
          clientAddress = customerInfo.address;
        } else if (customerInfo.address.full) {
          clientAddress = customerInfo.address.full;
        } else if (customerInfo.address.street) {
          clientAddress = customerInfo.address.street;
        } else {
          clientAddress = JSON.stringify(customerInfo.address);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        clientName: clientName,
        clientAddress: clientAddress
      }));
    } catch (err) {
      console.error('Error fetching customer info:', err);
    }
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.customerId) {
      setError('Customer is required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.clientName.trim()) {
      setError('Client name is required');
      return false;
    }
    if (!formData.clientAddress.trim()) {
      setError('Client address is required');
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

      // Helper function to convert date string to ISO with noon time to avoid timezone issues
      const dateToISO = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return undefined;
        // Set time to noon to avoid timezone shifting the date
        return `${dateStr}T12:00:00.000Z`;
      };

      const contractData = {
        title: formData.title,
        description: formData.description,
        propertyAddress: formData.propertyAddress || undefined,
        customerId: formData.customerId,
        estimateId: formData.estimateId || undefined,
        contractNumber: formData.contractNumber || undefined,
        startDate: dateToISO(formData.startDate),
        endDate: dateToISO(formData.endDate),
        totalAmount: calculateTotal(),
        status: formData.status,
        terms: formData.terms || getDefaultNotes(), // Always include default terms
        notes: formData.notes && formData.notes.trim() !== '' ? formData.notes : undefined,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        depositAmount: formData.depositAmount || 0,
        lineItems: lineItems.filter(item => item.description.trim() && item.quantity > 0).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total
        }))
      };

      if (isEditing) {
        await contractApi.updateContract(id, contractData);
        setSuccess('Contract updated successfully!');
      } else {
        await contractApi.createContract(contractData);
        setSuccess('Contract created successfully!');
        
        // If this contract was created from an estimate, update the estimate status
        if (estimateIdFromUrl) {
          try {
            await estimateApi.updateEstimate(estimateIdFromUrl, { status: 'Approved' });
          } catch (err) {
            console.error('Error updating estimate status:', err);
            // Don't show error to user since contract was created successfully
          }
        }
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/contracts');
      }, 1500);
    } catch (err) {
      console.error('Error saving contract:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Failed to save contract. Please try again.';
      const errorDetails = err.response?.data?.details;
      if (errorDetails) {
        console.error('Validation errors:', errorDetails);
        setError(`${errorMessage}: ${errorDetails.map(d => d.msg).join(', ')}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/contracts');
  };

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="contract-edit-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading contract data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contract-edit-container">
        <div className="contract-edit-header">
          <h1 className="contract-edit-title">
            {isEditing ? 'Edit Contract' : 'Create New Contract'}
          </h1>
          <p className="contract-edit-subtitle">
            {isEditing ? 'Update contract information' : 'Create a new contract'}
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

        <div className="contract-edit-content">
          <form onSubmit={handleSubmit} className="contract-form">
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
                  placeholder="Enter contract title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contractNumber" className="form-label">
                  Contract Number
                </label>
                <input
                  type="text"
                  id="contractNumber"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter contract number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerId" className="form-label">
                  Customer *
                </label>
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
                      {customer.firstName} {customer.lastName} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estimateId" className="form-label">
                  Related Estimate
                </label>
                <select
                  id="estimateId"
                  name="estimateId"
                  value={formData.estimateId}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select an estimate (optional)</option>
                  {estimates.map(estimate => (
                    <option key={estimate._id} value={estimate._id}>
                      {estimate.title} - {estimate.estimateNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Name and Address - pre-filled from customer selection but editable */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientName" className="form-label">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter client name"
                  required
                />
                <small className="form-help-text">Pre-filled from selected customer; edit if needed</small>
              </div>

              <div className="form-group">
                <label htmlFor="clientAddress" className="form-label">
                  Client Address *
                </label>
                <input
                  type="text"
                  id="clientAddress"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter client mailing address"
                  required
                />
                <small className="form-help-text">Client's mailing address (editable)</small>
              </div>
            </div>

            <div className="form-row">
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
                <small className="form-help-text">The physical location where work will be performed</small>
              </div>

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
                  placeholder="Enter contract description"
                  rows="3"
                />
              </div>
            </div>

                         <div className="form-row">
               <div className="form-group">
                 <label htmlFor="startDate" className="form-label">
                   Project Start Date *
                 </label>
                 <input
                   type="date"
                   id="startDate"
                   name="startDate"
                   value={formData.startDate}
                   onChange={handleInputChange}
                   className="form-input"
                   required
                 />
                 <small className="form-help-text">Work is scheduled to commence on or around this date</small>
               </div>

               <div className="form-group">
                 <label htmlFor="endDate" className="form-label">
                   Projected Completion Date
                 </label>
                 <input
                   type="date"
                   id="endDate"
                   name="endDate"
                   value={formData.endDate}
                   onChange={handleInputChange}
                   className="form-input"
                 />
                 <small className="form-help-text">Estimated project completion date</small>
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
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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

            {/* Line Items Section */}
            <div className="line-items-section">
              <div className="line-items-header">
                <h3 className="line-items-title">Scope of Work & Pricing</h3>
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
                 <div className="summary-row">
                   <span className="summary-label">Deposit Required:</span>
                   <div className="deposit-type-selector">
                     <label>
                       <input
                         type="radio"
                         name="depositType"
                         value="percentage"
                         checked={depositType === 'percentage'}
                         onChange={(e) => setDepositType(e.target.value)}
                       />
                       Percentage
                     </label>
                     <label>
                       <input
                         type="radio"
                         name="depositType"
                         value="dollar"
                         checked={depositType === 'dollar'}
                         onChange={(e) => setDepositType(e.target.value)}
                       />
                       Dollar Amount
                     </label>
                   </div>
                 </div>
                 <div className="summary-row">
                   {depositType === 'percentage' ? (
                     <div className="deposit-slider-container">
                       <div className="deposit-slider-group">
                         <input
                           type="range"
                           min="0"
                           max="100"
                           value={downPaymentPercentage}
                           onChange={(e) => setDownPaymentPercentage(parseFloat(e.target.value))}
                           className="deposit-slider"
                         />
                         <div className="deposit-slider-labels">
                           <span className="slider-value">{downPaymentPercentage}%</span>
                           <span className="slider-amount">${(calculateTotal() * (downPaymentPercentage / 100)).toFixed(2)}</span>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="deposit-dollar-input">
                       <input
                         type="number"
                         value={customDepositAmount}
                         onChange={(e) => setCustomDepositAmount(parseFloat(e.target.value) || 0)}
                         className="form-input"
                         min="0"
                         step="0.01"
                         placeholder="0.00"
                       />
                       <span className="deposit-percentage">
                         ({customDepositAmount && calculateTotal() ? 
                           Math.round((customDepositAmount / calculateTotal()) * 100) : 0}%)
                       </span>
                     </div>
                   )}
                   <span className="summary-value">${formData.depositAmount.toFixed(2)}</span>
                 </div>
               </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Additional Notes
                <span className="form-help-text" style={{ marginLeft: '10px', fontWeight: 'normal' }}>
                  (Optional - For brief additional notes, max 1000 characters)
                </span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter brief additional notes (e.g., special instructions, client preferences)"
                rows="3"
                maxLength="1000"
              />
            </div>
            
            <div className="form-info-box">
              <strong>ℹ️ Note:</strong> Standard contract terms and conditions will be automatically included in the generated PDF.
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
                {loading ? 'Saving...' : (isEditing ? 'Update Contract' : 'Create Contract')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ContractEdit;
