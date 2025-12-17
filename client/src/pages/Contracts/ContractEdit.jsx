import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { contractApi, customerApi, estimateApi } from '../../services/contractsApi';
import { milestoneApi } from '../../services/jobApi';
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
    depositAmount: 0,
    drawScheduleType: 'regular'
  });

  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: []
    }
  ]);

  const [downPaymentPercentage, setDownPaymentPercentage] = useState(30);
  // eslint-disable-next-line no-unused-vars
  const [depositType, setDepositType] = useState('percentage'); // 'percentage' or 'dollar' - setter not used but depositType is used in useEffect
  const [customDepositAmount, setCustomDepositAmount] = useState(0);

  const [customers, setCustomers] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedReceipt, setExpandedReceipt] = useState(null);
  const [success, setSuccess] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    method: 'Cash',
    transactionId: '',
    notes: '',
    milestoneId: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  
  // Payment schedule state
  const [paymentSchedule, setPaymentSchedule] = useState([
    {
      id: 1,
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
      type: 'Payment',
      status: 'Pending'
    }
  ]);

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
          total: item.totalPrice || 0,
          notes: item.notes || []
        })));
      }
    } catch (err) {
      console.error('Error fetching estimate for pre-population:', err);
    }
  }, [getDefaultNotes]);

  const fetchMilestones = useCallback(async (contractId) => {
    try {
      setLoadingMilestones(true);
      const response = await milestoneApi.getContractMilestones(contractId, { type: 'Payment' });
      setMilestones(response.milestones || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      // Don't set error, just log it - milestones are optional
    } finally {
      setLoadingMilestones(false);
    }
  }, []);

  // Pre-fill payment schedule based on draw schedule type
  const prefillPaymentSchedule = useCallback((scheduleType, totalAmount, depositAmount = 0, startDate = '', endDate = '') => {
    const total = totalAmount || 0;
    let schedule = [];

    if (scheduleType === 'demolition') {
      // Demolition schedule: 4 milestones
      schedule = [
        {
          id: 1,
          title: 'Deposit/ Before Work Begins',
          description: 'Initial deposit required before work begins',
          amount: total * 0.15,
          dueDate: startDate || '',
          type: 'Payment',
          status: 'Pending'
        },
        {
          id: 2,
          title: 'Structure Disassembly Completion',
          description: 'Primary demo complete - structure disassembly finished',
          amount: total * 0.45,
          dueDate: '',
          type: 'Payment',
          status: 'Pending'
        },
        {
          id: 3,
          title: 'Debris Removal and Disposal',
          description: 'All debris removed and disposed of',
          amount: total * 0.30,
          dueDate: '',
          type: 'Payment',
          status: 'Pending'
        },
        {
          id: 4,
          title: 'Final Site Clean and Client Sign-off',
          description: 'Final site clean completed and client approval received',
          amount: total * 0.10,
          dueDate: endDate || '',
          type: 'Payment',
          status: 'Pending'
        }
      ];
    } else {
      // Regular schedule: 2 milestones
      const deposit = depositAmount || (total * 0.3);
      const final = total - deposit;
      
      schedule = [
        {
          id: 1,
          title: 'Deposit/ Before Work Begins',
          description: 'Deposit required before work begins',
          amount: deposit,
          dueDate: startDate || '',
          type: 'Payment',
          status: 'Pending'
        },
        {
          id: 2,
          title: 'Final Payment Upon Completion',
          description: 'Final payment due upon project completion and client satisfaction',
          amount: final,
          dueDate: endDate || '',
          type: 'Payment',
          status: 'Pending'
        }
      ];
    }

    return schedule;
  }, []);

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
        depositAmount: contract.depositAmount !== undefined && contract.depositAmount !== null ? contract.depositAmount : 0,
        drawScheduleType: contract.drawScheduleType || 'regular'
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
          total: item.totalPrice || 0,
          notes: item.notes || []
        })));
      }

      // Load payment schedule if it exists, otherwise pre-fill based on draw schedule type
      if (contract.paymentSchedule && contract.paymentSchedule.length > 0) {
        setPaymentSchedule(contract.paymentSchedule.map((item, index) => ({
          id: index + 1,
          title: item.title || '',
          description: item.description || '',
          amount: item.amount || 0,
          dueDate: item.dueDate || '',
          type: item.type || 'Payment',
          status: item.status || 'Pending'
        })));
      } else {
        // Pre-fill payment schedule based on draw schedule type if not already set
        const scheduleType = contract.drawScheduleType || 'regular';
        const totalAmount = contract.totalAmount || 0;
        const depositAmount = contract.depositAmount || 0;
        const startDate = contract.startDate ? contract.startDate.split('T')[0] : '';
        const endDate = contract.endDate ? contract.endDate.split('T')[0] : '';
        const prefillSchedule = prefillPaymentSchedule(scheduleType, totalAmount, depositAmount, startDate, endDate);
        setPaymentSchedule(prefillSchedule);
      }
      
      // Fetch milestones for payment tracking
      if (id) {
        fetchMilestones(id);
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, getDefaultNotes, fetchMilestones, prefillPaymentSchedule]);

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

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!id || !formData.customerId) {
      setError('Contract ID and Customer ID are required to record payment');
      return;
    }

    try {
      setSubmittingPayment(true);
      setError(null);

      // Find or create a payment milestone
      let paymentMilestone = milestones.find(m => m.type === 'Payment' && m.payment?.paymentStatus !== 'Paid');
      
      if (!paymentMilestone) {
        // Create a new payment milestone
        const { remainingBalance, totalAmount } = calculatePaymentTotals();
        const milestoneData = {
          contractId: id,
          customerId: formData.customerId,
          title: 'Contract Payment',
          description: `Payment for contract ${formData.contractNumber || id}`,
          type: 'Payment',
          status: 'Pending',
          priority: 'High',
          payment: {
            amount: remainingBalance > 0 ? remainingBalance : totalAmount,
            currency: 'USD',
            paymentStatus: 'Pending'
          }
        };
        
        const createResponse = await milestoneApi.createMilestone(milestoneData);
        paymentMilestone = createResponse.milestone;
      }

      // Add payment to milestone
      const paymentData = {
        amount: parseFloat(paymentFormData.amount),
        method: paymentFormData.method,
        transactionId: paymentFormData.transactionId || undefined,
        notes: paymentFormData.notes || undefined
      };

      await milestoneApi.addPayment(paymentMilestone._id, paymentData);
      
      // Refresh milestones
      await fetchMilestones(id);
      
      // Reset form
      setShowPaymentForm(false);
      setPaymentFormData({
        amount: '',
        method: 'Cash',
        transactionId: '',
        notes: '',
        milestoneId: ''
      });
      
      setSuccess('Payment recorded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.error || 'Failed to record payment. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Calculate payment totals from milestones
  const calculatePaymentTotals = useCallback(() => {
    let totalPaid = 0;
    const paymentDetails = [];
    
    if (milestones && milestones.length > 0) {
      milestones.forEach(milestone => {
        if (milestone.type === 'Payment' && milestone.payment) {
          let milestonePaid = 0;
          // If there are partial payments, sum them
          if (milestone.payment.partialPayments && milestone.payment.partialPayments.length > 0) {
            milestonePaid = milestone.payment.partialPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          } else if (milestone.payment.paymentStatus === 'Paid' && milestone.payment.amount) {
            milestonePaid = milestone.payment.amount;
          }
          
          if (milestonePaid > 0) {
            totalPaid += milestonePaid;
            // Collect all partial payments with their receipts
            if (milestone.payment.partialPayments && milestone.payment.partialPayments.length > 0) {
              milestone.payment.partialPayments.forEach((partialPayment, paymentIndex) => {
                if (partialPayment.amount > 0) {
                  // Debug: Log receipt URL
                  console.log('Payment receipt URL:', partialPayment.receiptUrl, 'for payment:', partialPayment);
                  paymentDetails.push({
                    description: milestone.title || 'Payment',
                    amount: partialPayment.amount,
                    date: partialPayment.date || milestone.updatedAt,
                    method: partialPayment.method || 'N/A',
                    transactionId: partialPayment.transactionId,
                    notes: partialPayment.notes,
                    receiptUrl: partialPayment.receiptUrl || null,
                    milestoneId: milestone._id,
                    paymentIndex: paymentIndex
                  });
                }
              });
            } else {
              paymentDetails.push({
                description: milestone.title || 'Payment',
                amount: milestonePaid,
                date: milestone.payment.paidDate || milestone.updatedAt,
                method: milestone.payment.paymentMethod || 'N/A'
              });
            }
          }
        }
      });
    }
    
    const totalAmount = parseFloat(formData.totalAmount) || calculateTotal();
    const remainingBalance = totalAmount - totalPaid;
    
    return { totalPaid, remainingBalance, totalAmount, paymentDetails };
  }, [milestones, formData.totalAmount, calculateTotal]);

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
      total: 0,
      notes: []
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
      total: 0,
      notes: []
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

  const addNoteToLineItem = (lineItemId) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === lineItemId) {
        return {
          ...item,
          notes: [...(item.notes || []), '']
        };
      }
      return item;
    }));
  };

  const updateLineItemNote = (lineItemId, noteIndex, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === lineItemId) {
        const updatedNotes = [...(item.notes || [])];
        updatedNotes[noteIndex] = value;
        return {
          ...item,
          notes: updatedNotes
        };
      }
      return item;
    }));
  };

  const removeLineItemNote = (lineItemId, noteIndex) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === lineItemId) {
        const updatedNotes = [...(item.notes || [])];
        updatedNotes.splice(noteIndex, 1);
        return {
          ...item,
          notes: updatedNotes
        };
      }
      return item;
    }));
  };


  // Payment Schedule Functions
  const handlePaymentScheduleChange = (id, field, value) => {
    setPaymentSchedule(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addPaymentScheduleItem = () => {
    const newId = Math.max(...paymentSchedule.map(item => item.id), 0) + 1;
    setPaymentSchedule(prev => [...prev, {
      id: newId,
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
      type: 'Payment',
      status: 'Pending'
    }]);
  };

  const removePaymentScheduleItem = (id) => {
    if (paymentSchedule.length > 1) {
      setPaymentSchedule(prev => prev.filter(item => item.id !== id));
    }
  };

  const movePaymentScheduleUp = (id) => {
    const index = paymentSchedule.findIndex(item => item.id === id);
    if (index > 0) {
      const newSchedule = [...paymentSchedule];
      [newSchedule[index - 1], newSchedule[index]] = [newSchedule[index], newSchedule[index - 1]];
      setPaymentSchedule(newSchedule);
    }
  };

  const movePaymentScheduleDown = (id) => {
    const index = paymentSchedule.findIndex(item => item.id === id);
    if (index < paymentSchedule.length - 1) {
      const newSchedule = [...paymentSchedule];
      [newSchedule[index], newSchedule[index + 1]] = [newSchedule[index + 1], newSchedule[index]];
      setPaymentSchedule(newSchedule);
    }
  };

  const balancePaymentScheduleItem = (id) => {
    const contractTotal = calculateTotal();
    // Calculate sum of all other milestones (excluding the one being balanced)
    const otherMilestonesTotal = paymentSchedule
      .filter(item => item.id !== id)
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    // Calculate the balance needed for this milestone
    const balanceAmount = Math.max(0, contractTotal - otherMilestonesTotal);
    
    // Update the milestone amount
    handlePaymentScheduleChange(id, 'amount', balanceAmount);
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
        depositAmount: parseFloat(formData.depositAmount) || 0,
        drawScheduleType: formData.drawScheduleType || 'regular',
        lineItems: lineItems.filter(item => item.description.trim() && item.quantity > 0).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total,
          notes: (item.notes || []).filter(note => note && note.trim())
        })),
        paymentSchedule: paymentSchedule.filter(item => item.title.trim()).map(item => ({
          title: item.title,
          description: item.description,
          amount: item.amount,
          dueDate: item.dueDate,
          type: item.type,
          status: item.status
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
                    
                    <div className="line-item-notes-section">
                      <div className="line-item-notes-header">
                        <label className="line-item-label">Notes</label>
                        <button
                          type="button"
                          onClick={() => addNoteToLineItem(item.id)}
                          className="btn btn-secondary btn-sm"
                          title="Add Note"
                        >
                          + Add Note
                        </button>
                      </div>
                      {(item.notes || []).length > 0 && (
                        <div className="line-item-notes-list">
                          {(item.notes || []).map((note, noteIndex) => (
                            <div key={noteIndex} className="line-item-note-row">
                              <input
                                type="text"
                                value={note}
                                onChange={(e) => updateLineItemNote(item.id, noteIndex, e.target.value)}
                                className="form-input line-item-note-input"
                                placeholder="Enter note"
                              />
                              <button
                                type="button"
                                onClick={() => removeLineItemNote(item.id, noteIndex)}
                                className="btn btn-icon btn-danger btn-sm"
                                title="Remove Note"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
              <label htmlFor="drawScheduleType" className="form-label">
                Draw Schedule Type
              </label>
              <div className="deposit-type-selection" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="drawScheduleType"
                    value="regular"
                    checked={formData.drawScheduleType === 'regular'}
                    onChange={(e) => {
                      const newScheduleType = e.target.value;
                      setFormData(prev => ({ ...prev, drawScheduleType: newScheduleType }));
                      // Pre-fill payment schedule when type changes
                      const newSchedule = prefillPaymentSchedule(newScheduleType, calculateTotal(), formData.depositAmount, formData.startDate, formData.endDate);
                      setPaymentSchedule(newSchedule);
                    }}
                  />
                  Regular (Upfront Deposit + Final Payment)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="drawScheduleType"
                    value="demolition"
                    checked={formData.drawScheduleType === 'demolition'}
                    onChange={(e) => {
                      const newScheduleType = e.target.value;
                      setFormData(prev => ({ ...prev, drawScheduleType: newScheduleType }));
                      // Pre-fill payment schedule when type changes
                      const newSchedule = prefillPaymentSchedule(newScheduleType, calculateTotal(), formData.depositAmount, formData.startDate, formData.endDate);
                      setPaymentSchedule(newSchedule);
                    }}
                  />
                  Demolition (Multi-Milestone Schedule)
                </label>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                {formData.drawScheduleType === 'regular' 
                  ? 'Payment schedule: Deposit before work begins, then final payment upon completion.'
                  : 'Payment schedule: Multiple milestone-based payments (Deposit, Disassembly, Debris Removal, Final Clean).'}
              </div>
            </div>

            {/* Payment Schedule Section */}
            <div className="line-items-section" style={{ marginTop: '30px' }}>
              <div className="line-items-header">
                <h3 className="line-items-title">Payment Schedule</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newSchedule = prefillPaymentSchedule(formData.drawScheduleType, calculateTotal(), formData.depositAmount, formData.startDate, formData.endDate);
                      setPaymentSchedule(newSchedule);
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Refresh payment schedule based on current draw schedule type and amounts"
                  >
                    🔄 Refresh from Draw Schedule
                  </button>
                  <button
                    type="button"
                    onClick={addPaymentScheduleItem}
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Payment Milestone
                  </button>
                </div>
              </div>

              <div className="line-items-table-new">
                {paymentSchedule.map((item, index) => (
                  <div key={item.id} className="line-item-card">
                    <div className="line-item-description-row">
                      <label className="line-item-label">Milestone Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handlePaymentScheduleChange(item.id, 'title', e.target.value)}
                        className="form-input line-item-textarea"
                        placeholder="e.g., Deposit, Disassembly, Final Payment"
                      />
                    </div>
                    
                    <div className="line-item-description-row" style={{ marginTop: '10px' }}>
                      <label className="line-item-label">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handlePaymentScheduleChange(item.id, 'description', e.target.value)}
                        className="form-input line-item-textarea"
                        placeholder="Payment milestone description"
                        rows="2"
                      />
                    </div>
                    
                    <div className="line-item-details-row">
                      <div className="line-item-field">
                        <label className="line-item-label">Amount</label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handlePaymentScheduleChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="form-input line-item-input"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="line-item-field">
                        <label className="line-item-label">Due Date</label>
                        <input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => handlePaymentScheduleChange(item.id, 'dueDate', e.target.value)}
                          className="form-input line-item-input"
                        />
                      </div>
                      
                      <div className="line-item-field">
                        <label className="line-item-label">Status</label>
                        <select
                          value={item.status}
                          onChange={(e) => handlePaymentScheduleChange(item.id, 'status', e.target.value)}
                          className="form-input line-item-input"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="line-item-actions-row">
                      <button
                        type="button"
                        onClick={() => balancePaymentScheduleItem(item.id)}
                        className="btn btn-secondary btn-sm"
                        title="Set amount to balance remaining contract total"
                      >
                        Balance
                      </button>
                      <button
                        type="button"
                        onClick={() => movePaymentScheduleUp(item.id)}
                        className="btn btn-icon"
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => movePaymentScheduleDown(item.id)}
                        className="btn btn-icon"
                        disabled={index === paymentSchedule.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      {paymentSchedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePaymentScheduleItem(item.id)}
                          className="btn btn-icon btn-danger"
                          title="Delete"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Payment Schedule Total */}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    Payment Schedule Total:
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    ${paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    Contract Amount:
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    ${calculateTotal().toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '200px' }}>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    Difference:
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: Math.abs(paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateTotal()) < 0.01 ? '#28a745' : '#dc3545'
                  }}>
                    ${(paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateTotal()).toFixed(2)}
                  </div>
                  {Math.abs(paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateTotal()) < 0.01 ? (
                    <div style={{ fontSize: '12px', color: '#28a745', fontWeight: '500' }}>
                      ✓ Totals Match
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#dc3545', fontWeight: '500' }}>
                      ⚠ Totals Do Not Match
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt Section - Only show when editing an existing contract */}
            {isEditing && (
              <div className="form-group" style={{ marginTop: '30px', marginBottom: '30px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #08a171'
                }}>
                  Payment Receipt
                </h2>
                
                {loadingMilestones ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading payment information...
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #08a171',
                    borderRadius: '8px',
                    padding: '20px',
                    marginTop: '10px'
                  }}>
                    {(() => {
                      const { totalPaid, remainingBalance, totalAmount, paymentDetails } = calculatePaymentTotals();
                      
                      return (
                        <>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '20px',
                            marginBottom: '20px'
                          }}>
                            <div style={{
                              backgroundColor: '#fff',
                              padding: '15px',
                              borderRadius: '6px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                Total Contract Amount
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            
                            <div style={{
                              backgroundColor: '#d4edda',
                              padding: '15px',
                              borderRadius: '6px',
                              border: '1px solid #28a745'
                            }}>
                              <div style={{ fontSize: '12px', color: '#155724', marginBottom: '5px' }}>
                                Amount Paid to Date
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#155724' }}>
                                ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            
                            <div style={{
                              backgroundColor: remainingBalance > 0 ? '#fff3cd' : '#d1ecf1',
                              padding: '15px',
                              borderRadius: '6px',
                              border: `1px solid ${remainingBalance > 0 ? '#ffc107' : '#17a2b8'}`
                            }}>
                              <div style={{ 
                                fontSize: '12px', 
                                color: remainingBalance > 0 ? '#856404' : '#0c5460', 
                                marginBottom: '5px' 
                              }}>
                                Remaining Balance
                              </div>
                              <div style={{ 
                                fontSize: '20px', 
                                fontWeight: 'bold', 
                                color: remainingBalance > 0 ? '#856404' : '#0c5460' 
                              }}>
                                ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                          
                          {paymentDetails.length > 0 ? (
                            <div>
                              <h3 style={{ 
                                fontSize: '16px', 
                                fontWeight: 'bold', 
                                color: '#333', 
                                marginBottom: '15px',
                                marginTop: '20px'
                              }}>
                                Payment History
                              </h3>
                              <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid #e9ecef'
                              }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#08a171', color: '#fff' }}>
                                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                        Description
                                      </th>
                                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                        Date
                                      </th>
                                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                        Method
                                      </th>
                                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                                        Amount
                                      </th>
                                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                                        Receipt
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paymentDetails.map((payment, idx) => (
                                      <React.Fragment key={idx}>
                                        <tr 
                                          style={{ 
                                            backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                                            borderBottom: '1px solid #e9ecef'
                                          }}
                                        >
                                          <td style={{ padding: '12px', fontSize: '13px', color: '#333' }}>
                                            {payment.description}
                                          </td>
                                          <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                                            {payment.date ? new Date(payment.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            }) : 'N/A'}
                                          </td>
                                          <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                                            {payment.method}
                                          </td>
                                          <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', color: '#28a745', textAlign: 'right' }}>
                                            ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                          <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {payment.receiptUrl ? (
                                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedReceipt(expandedReceipt === idx ? null : idx);
                                                  }}
                                                  style={{
                                                    backgroundColor: '#08a171',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                  }}
                                                >
                                                  {expandedReceipt === idx ? '📄 Hide Receipt' : '📄 View Receipt'}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={async () => {
                                                    try {
                                                      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                                      const pdfUrl = `${apiUrl}${payment.receiptUrl}`;
                                                      
                                                      // Load PDF.js from CDN if not already loaded
                                                      if (!window.pdfjsLib) {
                                                        const script = document.createElement('script');
                                                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                                                        document.head.appendChild(script);
                                                        
                                                        await new Promise((resolve, reject) => {
                                                          script.onload = resolve;
                                                          script.onerror = reject;
                                                          setTimeout(() => reject(new Error('PDF.js load timeout')), 10000);
                                                        });
                                                        
                                                        // Set worker
                                                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                                                      }
                                                      
                                                      // Fetch the PDF
                                                      const response = await fetch(pdfUrl);
                                                      const arrayBuffer = await response.arrayBuffer();
                                                      
                                                      // Load PDF
                                                      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                                                      const page = await pdf.getPage(1);
                                                      
                                                      // Set up canvas
                                                      const viewport = page.getViewport({ scale: 2.0 });
                                                      const canvas = document.createElement('canvas');
                                                      const context = canvas.getContext('2d');
                                                      canvas.height = viewport.height;
                                                      canvas.width = viewport.width;
                                                      
                                                      // Render PDF page to canvas
                                                      await page.render({
                                                        canvasContext: context,
                                                        viewport: viewport
                                                      }).promise;
                                                      
                                                      // Convert canvas to PNG and download
                                                      canvas.toBlob((blob) => {
                                                        const url = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        const dateStr = payment.date ? new Date(payment.date).toISOString().split('T')[0] : 'payment';
                                                        link.download = `receipt_${dateStr}.png`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(url);
                                                      }, 'image/png');
                                                    } catch (error) {
                                                      console.error('Error converting PDF to PNG:', error);
                                                      alert('Failed to convert receipt to PNG. Please try opening in a new tab instead.');
                                                    }
                                                  }}
                                                  style={{
                                                    backgroundColor: '#17a2b8',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                  }}
                                                >
                                                  📥 Download PNG
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  try {
                                                    if (!payment.milestoneId || payment.paymentIndex === undefined) {
                                                      alert('Unable to generate receipt: Missing payment information');
                                                      return;
                                                    }
                                                    
                                                    const response = await milestoneApi.generateReceipt(payment.milestoneId, payment.paymentIndex);
                                                    if (response.success) {
                                                      alert('Receipt generated successfully!');
                                                      // Refresh milestones to get updated receipt URL
                                                      await fetchMilestones(id);
                                                    } else {
                                                      alert('Failed to generate receipt: ' + (response.error || 'Unknown error'));
                                                    }
                                                  } catch (err) {
                                                    console.error('Error generating receipt:', err);
                                                    alert('Failed to generate receipt: ' + (err.response?.data?.error || err.message || 'Unknown error'));
                                                  }
                                                }}
                                                style={{
                                                  backgroundColor: '#17a2b8',
                                                  color: '#fff',
                                                  border: 'none',
                                                  padding: '6px 12px',
                                                  borderRadius: '4px',
                                                  fontSize: '12px',
                                                  cursor: 'pointer',
                                                  fontWeight: 'bold'
                                                }}
                                              >
                                                📄 Generate Receipt
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                        {expandedReceipt === idx && payment.receiptUrl && (
                                        <tr>
                                          <td colSpan="5" style={{ padding: '0', backgroundColor: '#fff' }}>
                                            <div style={{
                                              border: '2px solid #08a171',
                                              borderRadius: '8px',
                                              margin: '10px',
                                              padding: '10px',
                                              backgroundColor: '#f8f9fa'
                                            }}>
                                              <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '10px'
                                              }}>
                                                <h5 style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                                                  Payment Receipt
                                                </h5>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                                      window.open(`${apiUrl}${payment.receiptUrl}`, '_blank');
                                                    }}
                                                    style={{
                                                      backgroundColor: '#6c757d',
                                                      color: '#fff',
                                                      border: 'none',
                                                      padding: '4px 8px',
                                                      borderRadius: '4px',
                                                      fontSize: '11px',
                                                      cursor: 'pointer'
                                                    }}
                                                  >
                                                    Open in New Tab
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={async () => {
                                                      try {
                                                        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                                        const pdfUrl = `${apiUrl}${payment.receiptUrl}`;
                                                        
                                                        // Load PDF.js from CDN if not already loaded
                                                        if (!window.pdfjsLib) {
                                                          const script = document.createElement('script');
                                                          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                                                          document.head.appendChild(script);
                                                          
                                                          await new Promise((resolve, reject) => {
                                                            script.onload = resolve;
                                                            script.onerror = reject;
                                                            setTimeout(() => reject(new Error('PDF.js load timeout')), 10000);
                                                          });
                                                          
                                                          // Set worker
                                                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                                                        }
                                                        
                                                        // Fetch the PDF
                                                        const response = await fetch(pdfUrl);
                                                        const arrayBuffer = await response.arrayBuffer();
                                                        
                                                        // Load PDF
                                                        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                                                        const page = await pdf.getPage(1);
                                                        
                                                        // Set up canvas
                                                        const viewport = page.getViewport({ scale: 2.0 });
                                                        const canvas = document.createElement('canvas');
                                                        const context = canvas.getContext('2d');
                                                        canvas.height = viewport.height;
                                                        canvas.width = viewport.width;
                                                        
                                                        // Render PDF page to canvas
                                                        await page.render({
                                                          canvasContext: context,
                                                          viewport: viewport
                                                        }).promise;
                                                        
                                                        // Convert canvas to PNG and download
                                                        canvas.toBlob((blob) => {
                                                          const url = URL.createObjectURL(blob);
                                                          const link = document.createElement('a');
                                                          link.href = url;
                                                          const dateStr = payment.date ? new Date(payment.date).toISOString().split('T')[0] : 'payment';
                                                          link.download = `receipt_${dateStr}.png`;
                                                          document.body.appendChild(link);
                                                          link.click();
                                                          document.body.removeChild(link);
                                                          URL.revokeObjectURL(url);
                                                        }, 'image/png');
                                                      } catch (error) {
                                                        console.error('Error converting PDF to PNG:', error);
                                                        alert('Failed to convert receipt to PNG. Please try opening in a new tab instead.');
                                                      }
                                                    }}
                                                    style={{
                                                      backgroundColor: '#17a2b8',
                                                      color: '#fff',
                                                      border: 'none',
                                                      padding: '4px 8px',
                                                      borderRadius: '4px',
                                                      fontSize: '11px',
                                                      cursor: 'pointer'
                                                    }}
                                                  >
                                                    📥 Download PNG
                                                  </button>
                                                </div>
                                              </div>
                                              <iframe
                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${payment.receiptUrl}`}
                                                style={{
                                                  width: '100%',
                                                  height: '600px',
                                                  border: '1px solid #ddd',
                                                  borderRadius: '4px'
                                                }}
                                                title={`Receipt for payment ${idx + 1}`}
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              padding: '20px',
                              textAlign: 'center',
                              color: '#666',
                              backgroundColor: '#fff',
                              borderRadius: '6px',
                              border: '1px solid #e9ecef',
                              marginTop: '20px'
                            }}>
                              No payments recorded to date.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Book Payment Section - Only show when editing an existing contract */}
            {isEditing && (
              <div className="form-group" style={{ marginTop: '30px', marginBottom: '30px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #08a171'
                }}>
                  Book Payment
                </h2>
                
                {!showPaymentForm ? (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #08a171',
                    borderRadius: '8px',
                    padding: '20px',
                    marginTop: '10px',
                    textAlign: 'center'
                  }}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                      Record a new payment for this contract
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(true)}
                      style={{
                        backgroundColor: '#08a171',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      + Record Payment
                    </button>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #08a171',
                    borderRadius: '8px',
                    padding: '20px',
                    marginTop: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                        Record New Payment
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setPaymentFormData({
                            amount: '',
                            method: 'Cash',
                            transactionId: '',
                            notes: '',
                            milestoneId: ''
                          });
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          fontSize: '24px',
                          color: '#666',
                          cursor: 'pointer',
                          padding: '0',
                          width: '30px',
                          height: '30px'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleSubmitPayment}>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                          Payment Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                          Payment Method *
                        </label>
                        <select
                          value={paymentFormData.method}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, method: e.target.value }))}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                          }}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Check">Check</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Stripe">Stripe</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                          Transaction ID / Reference
                        </label>
                        <input
                          type="text"
                          value={paymentFormData.transactionId}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                          }}
                          placeholder="Optional transaction reference"
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                          Notes
                        </label>
                        <textarea
                          value={paymentFormData.notes}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px',
                            minHeight: '80px'
                          }}
                          placeholder="Optional payment notes"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                          type="submit"
                          disabled={submittingPayment}
                          style={{
                            backgroundColor: '#08a171',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: submittingPayment ? 'not-allowed' : 'pointer',
                            opacity: submittingPayment ? 0.6 : 1,
                            flex: 1
                          }}
                        >
                          {submittingPayment ? 'Recording Payment...' : 'Record Payment'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPaymentForm(false);
                            setPaymentFormData({
                              amount: '',
                              method: 'Cash',
                              transactionId: '',
                              notes: '',
                              milestoneId: ''
                            });
                          }}
                          style={{
                            backgroundColor: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

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
