import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { contractApi, amendmentApi, clientReportApi, estimateApi } from '../../services/contractsApi';
import { milestoneApi } from '../../services/jobApi';
import AmendmentsList from '../Amendments/AmendmentsList.jsx';
import './Contracts.css';

const ContractView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [contractSummary, setContractSummary] = useState(null);
  const [clientReports, setClientReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [creatingBoldsignDraft, setCreatingBoldsignDraft] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updatingDates, setUpdatingDates] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [status, setStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Signed contract upload states
  const [uploadingSignedContract, setUploadingSignedContract] = useState(false);
  
  // Payment receipt states
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [expandedReceipt, setExpandedReceipt] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    method: 'Cash',
    transactionId: '',
    notes: '',
    milestoneId: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

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

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContract(id);
      const contractData = response.contract;
      setContract(contractData);
      
      // Set initial date values
      if (contractData.startDate) {
        setStartDate(contractData.startDate.split('T')[0]); // Format for date input
      }
      if (contractData.endDate) {
        setEndDate(contractData.endDate.split('T')[0]); // Format for date input
      }
      
      // Set initial status value
      setStatus(contractData.status || 'Draft');
      
      // Fetch estimate if contract has estimateId and lineItems might need notes
      if (contractData.estimateId) {
        try {
          const estimateResponse = await estimateApi.getEstimate(contractData.estimateId);
          setEstimate(estimateResponse.estimate);
        } catch (err) {
          console.error('Error fetching estimate:', err);
          // Don't set error, estimate is optional
        }
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
  }, [id, fetchMilestones]);

  const fetchContractSummary = useCallback(async () => {
    try {
      const response = await amendmentApi.getContractSummary(id);
      setContractSummary(response.data);
    } catch (err) {
      console.error('Error fetching contract summary:', err);
      // Don't set error state, as this is optional data
    }
  }, [id]);

  const fetchClientReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const response = await clientReportApi.getReports({ contractId: id });
      setClientReports(response.data || []);
    } catch (err) {
      console.error('Error fetching client reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [id]);

  const handleCreateReport = () => {
    if (!contract) return;
    // Navigate to the inspection report input page
    navigate(`/inspection-report/${contract._id}`);
  };

  const handleCreatePreWorkInspection = () => {
    if (!contract) return;
    // Navigate to the pre-work inspection input page
    navigate(`/prework-inspection/${contract._id}`);
  };

  const handleDownloadReportPdf = async (reportId) => {
    try {
      await clientReportApi.downloadPdf(reportId);
    } catch (err) {
      console.error('Error downloading report PDF:', err);
      alert('Failed to download report PDF.');
    }
  };

  const handleDeleteReport = async (reportId, reportNumber, reportTitle) => {
    if (!window.confirm(
      `Are you sure you want to delete this report?\n\n` +
      `Report: ${reportNumber}\n` +
      `Title: ${reportTitle}\n\n` +
      `This action cannot be undone.`
    )) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete report');
      }

      alert('Report deleted successfully');
      // Refresh the reports list
      fetchClientReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleFinalizeReport = async (reportId, reportNumber, reportTitle) => {
    if (!window.confirm(
      `Are you sure you want to finalize this report?\n\n` +
      `Report: ${reportNumber}\n` +
      `Title: ${reportTitle}\n\n` +
      `Once finalized, the report can no longer be edited.`
    )) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/${reportId}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to finalize report');
      }

      alert('Report finalized successfully!');
      // Refresh the reports list
      fetchClientReports();
    } catch (err) {
      console.error('Error finalizing report:', err);
      alert('Failed to finalize report: ' + err.message);
    }
  };

  useEffect(() => {
    fetchContract();
    fetchContractSummary();
    fetchClientReports();
  }, [fetchContract, fetchContractSummary, fetchClientReports]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Check if dateString already includes time component
      let dateToFormat = dateString;
      if (!dateString.includes('T') && !dateString.includes(' ')) {
        // If it's just a date (YYYY-MM-DD), append time for UTC parsing
        dateToFormat = dateString + 'T00:00:00.000Z';
      }
      
      const date = new Date(dateToFormat);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    
    // If it's already a string, check if it looks like JSON
    if (typeof address === 'string') {
      // Try to parse if it looks like an object
      if (address.startsWith('{')) {
        try {
          const parsed = JSON.parse(address);
          return parsed.full || address;
        } catch (e) {
          // If JSON parsing fails, try regex extraction for the specific format
          const fullMatch = address.match(/full:\s*'([^']+)'/);
          if (fullMatch) {
            return fullMatch[1];
          }
          // If all parsing fails, return as-is
          return address;
        }
      }
      return address;
    }
    
    // If it's an object, extract the full property
    if (typeof address === 'object' && address !== null) {
      return address.full || JSON.stringify(address);
    }
    
    return 'N/A';
  };

  // Calculate total contract amount from line items
  const calculateContractTotal = useCallback(() => {
    if (!contract) return 0;
    if (contract.lineItems && contract.lineItems.length > 0) {
      return contract.lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }
    return contract.subtotal || contract.totalAmount || 0;
  }, [contract]);

  // Calculate payment totals from milestones
  const calculatePaymentTotals = useCallback(() => {
    if (!contract) return { totalPaid: 0, remainingBalance: 0, totalAmount: 0, paymentDetails: [] };
    
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
    
    const totalAmount = calculateContractTotal();
    const remainingBalance = totalAmount - totalPaid;
    
    return { totalPaid, remainingBalance, totalAmount, paymentDetails };
  }, [milestones, contract, calculateContractTotal]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!id || !contract?.customerId) {
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
          customerId: contract.customerId,
          title: 'Contract Payment',
          description: `Payment for contract ${contract.contractNumber || id}`,
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
      
      // Show success message
      alert('Payment recorded successfully!');
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.error || 'Failed to record payment. Please try again.');
      alert(err.response?.data?.error || 'Failed to record payment. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const downloadPdf = useCallback(async () => {
    try {
      setDownloadingPdf(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contracts/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${contract.contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  }, [id, contract]);

  const downloadFinalInvoice = useCallback(async () => {
    try {
      setDownloadingInvoice(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contracts/${id}/final-invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate Final Invoice PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `final_invoice_${contract.contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading Final Invoice PDF:', err);
      setError('Failed to download Final Invoice PDF. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  }, [id, contract]);

  const createBoldsignDraft = useCallback(async () => {
    try {
      setCreatingBoldsignDraft(true);
      const result = await contractApi.createBoldsignDraft(id);
      
      if (result.success && result.embedUrl) {
        // Open the embedded URL in a new window/tab
        window.open(result.embedUrl, '_blank', 'width=1200,height=800');
      } else {
        throw new Error('Failed to create draft: No embed URL returned');
      }
    } catch (err) {
      console.error('Error creating BoldSign draft:', err);
      setError('Failed to create BoldSign draft. Please try again.');
      alert('Failed to create BoldSign draft: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingBoldsignDraft(false);
    }
  }, [id]);


  const updateDates = async () => {
    try {
      setUpdatingDates(true);
      
      const updateData = {};
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      
      const response = await contractApi.updateContract(id, {
        ...contract,
        ...updateData
      });

      // Update local state
      setContract(response.contract);
      setEditingDates(false);
      setError(null);
    } catch (err) {
      console.error('Error updating dates:', err);
      setError('Failed to update project dates. Please try again.');
    } finally {
      setUpdatingDates(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const response = await contractApi.updateContract(id, {
        ...contract,
        status: newStatus || status
      });

      // Update local state
      setContract(response.contract);
      setStatus(response.contract.status);
      setEditingStatus(false);
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update project status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSignedContractUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    try {
      setUploadingSignedContract(true);
      const formData = new FormData();
      formData.append('signedContract', file);

      // Update contract with signed document
      await contractApi.updateContract(id, { 
        signatureStatus: 'Completed',
        signatureCompletedAt: new Date().toISOString()
      });
      
      // Refresh contract data
      await fetchContract();
      
      alert('Signed contract uploaded successfully!');
    } catch (err) {
      console.error('Error uploading signed contract:', err);
      alert('Failed to upload signed contract');
    } finally {
      setUploadingSignedContract(false);
      // Reset file input
      event.target.value = '';
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="contract-view-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading contract...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="contract-view-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/contracts')} className="btn btn-secondary">
              Back to Contracts
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!contract) {
    return (
      <Layout>
        <div className="contract-view-container">
          <div className="error-container">
            <p className="error-message">Contract not found</p>
            <button onClick={() => navigate('/contracts')} className="btn btn-secondary">
              Back to Contracts
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contract-view-container">
        <div className="contract-view-header">
          <div className="contract-view-title-section">
            <h1 className="contract-view-title">{contract.title}</h1>
            <p className="contract-view-subtitle">Contract Details</p>
          </div>
          <div className="contract-view-actions">
            <Link to="/contracts" className="btn btn-secondary">
              Back to Contracts
            </Link>
            <button 
              onClick={downloadPdf} 
              className="btn btn-info"
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Generating PDF...' : 'Download Contract PDF'}
            </button>
            <button 
              onClick={downloadFinalInvoice} 
              className="btn btn-success"
              disabled={downloadingInvoice}
              style={{ 
                backgroundColor: '#08a171', 
                borderColor: '#08a171',
                color: 'white'
              }}
            >
              {downloadingInvoice ? 'Generating Invoice...' : 'Download Final Invoice'}
            </button>
            <button 
              onClick={createBoldsignDraft} 
              className="btn btn-warning"
              disabled={creatingBoldsignDraft}
              style={{ 
                backgroundColor: '#f39c12', 
                borderColor: '#f39c12',
                color: 'white'
              }}
            >
              {creatingBoldsignDraft ? 'Creating Draft...' : 'Push to BoldSign as Draft'}
            </button>
            <Link to={`/contracts/edit/${contract._id}`} className="btn btn-primary">
              Edit Contract
            </Link>
          </div>
        </div>

        <div className="contract-view-content">
          {/* Improved Contract Header */}
          <div className="contract-professional-header" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                  {contract.title}
                </h1>
                <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                  Residential Demolition Contract
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 20px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Contract #</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{contract.contractNumber || 'N/A'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Contract Date</div>
                <div style={{ fontSize: '15px', fontWeight: '600' }}>
                  {contract.startDate ? formatDate(contract.startDate) : formatDate(contract.createdAt)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Client</div>
                <div style={{ fontSize: '15px', fontWeight: '600' }}>
                  {contract.clientName || contract.customerName || (contract.customer ? `${contract.customer.firstName} ${contract.customer.lastName}` : 'N/A')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                  {contractSummary && contractSummary.amendmentCount > 0 ? 'Current Total' : 'Total Amount'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                  {contractSummary && contractSummary.amendmentCount > 0 
                    ? formatCurrency(contractSummary.currentTotal || 0)
                    : formatCurrency(calculateContractTotal())
                  }
                </div>
                {contractSummary && contractSummary.amendmentCount > 0 && (
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    Original: {formatCurrency(contractSummary.originalAmount || 0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="contract-parties-section">
            <div className="parties-grid">
              <div className="party-info client-info">
                <h3>CLIENT INFORMATION</h3>
                <div className="party-details">
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{contract.clientName || contract.customerName || (contract.customer ? `${contract.customer.firstName} ${contract.customer.lastName}` : 'N/A')}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{contract.clientEmail || contract.customerEmail || (contract.customer ? contract.customer.email : 'N/A')}</span>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{contract.clientPhone || contract.customerPhone || (contract.customer ? contract.customer.phone : 'N/A')}</span>
                  </div>
                  <div className="detail-row">
                    <label>Property Address:</label>
                    <span>{formatAddress(contract.clientAddress || contract.customerAddress || contract.propertyAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="contract-section">
            <h3>PROJECT DETAILS</h3>
            <div className="project-details-grid">
              <div className="detail-item">
                <label>Project Title:</label>
                <span>{contract.title || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Contract Status:</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {['Draft', 'Sent', 'Signed', 'Active', 'Completed', 'Cancelled'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => updateStatus(statusOption)}
                      disabled={updatingStatus}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: contract.status === statusOption ? '2px solid #667eea' : '1px solid #ddd',
                        background: contract.status === statusOption ? '#667eea' : '#fff',
                        color: contract.status === statusOption ? '#fff' : '#333',
                        fontWeight: contract.status === statusOption ? '600' : '400',
                        cursor: updatingStatus ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '13px'
                      }}
                      onMouseEnter={(e) => {
                        if (contract.status !== statusOption && !updatingStatus) {
                          e.target.style.background = '#f5f5f5';
                          e.target.style.borderColor = '#999';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (contract.status !== statusOption) {
                          e.target.style.background = '#fff';
                          e.target.style.borderColor = '#ddd';
                        }
                      }}
                    >
                      {statusOption}
                    </button>
                  ))}
                  {updatingStatus && <span style={{ fontSize: '13px', color: '#666' }}>Updating...</span>}
                </div>
              </div>
              <div className="detail-item" style={{ display: 'none' }}>
                <label>Project Status (old):</label>
                {editingStatus ? (
                  <div className="status-edit-group">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-input status-select"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                ) : (
                  <span className={`status-badge status-${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <label>Project Start Date:</label>
                {editingDates ? (
                  <div className="date-edit-group">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-input date-input"
                    />
                    <small className="detail-help-text">Work is scheduled to commence on or around this date</small>
                  </div>
                ) : (
                  <span>{contract.startDate ? formatDate(contract.startDate) : 'TBD'}</span>
                )}
              </div>
              <div className="detail-item">
                <label>Projected Completion Date:</label>
                {editingDates ? (
                  <div className="date-edit-group">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-input date-input"
                    />
                    <small className="detail-help-text">Estimated project completion date</small>
                  </div>
                ) : (
                  <span>{contract.endDate ? formatDate(contract.endDate) : 'TBD'}</span>
                )}
              </div>
              <div className="detail-item date-actions">
                {editingDates ? (
                  <div className="date-action-buttons">
                    <button
                      onClick={updateDates}
                      className="btn btn-primary btn-sm"
                      disabled={updatingDates}
                    >
                      {updatingDates ? 'Saving...' : 'Save Dates'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDates(false);
                        // Reset to original values
                        if (contract.startDate) {
                          setStartDate(contract.startDate.split('T')[0]);
                        }
                        if (contract.endDate) {
                          setEndDate(contract.endDate.split('T')[0]);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      disabled={updatingDates}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDates(true)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Edit Dates
                  </button>
                )}
              </div>
              <div className="detail-item status-actions">
                 {editingStatus ? (
                   <div className="status-action-buttons">
                     <button
                       onClick={updateStatus}
                       className="btn btn-primary btn-sm"
                       disabled={updatingStatus}
                     >
                       {updatingStatus ? 'Saving...' : 'Save Status'}
                     </button>
                     <button
                       onClick={() => {
                         setEditingStatus(false);
                         // Reset to original value
                         setStatus(contract.status || 'Draft');
                       }}
                       className="btn btn-secondary btn-sm"
                       disabled={updatingStatus}
                     >
                       Cancel
                     </button>
                   </div>
                 ) : (
                   <button
                     onClick={() => setEditingStatus(true)}
                     className="btn btn-outline-primary btn-sm"
                   >
                     Edit Status
                   </button>
                 )}
               </div>
            </div>
          </div>

          {/* Related Estimate */}
          {contract.estimateId && (
            <div className="contract-section">
              <h3>RELATED ESTIMATE</h3>
              <div className="estimate-links">
                <p className="estimate-info">
                  This contract is based on estimate: <strong>{contract.estimateId}</strong>
                </p>
                <div className="estimate-actions">
                  <Link 
                    to={`/estimates/edit/${contract.estimateId}`} 
                    className="btn btn-info btn-sm"
                  >
                    Update Estimate
                  </Link>
                  <Link 
                    to={`/estimates/${contract.estimateId}`} 
                    className="btn btn-secondary btn-sm"
                  >
                    View Estimate
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Payment Schedule */}
          <div className="contract-section">
            <h3>Payment Schedule</h3>
            {contract.paymentSchedule && contract.paymentSchedule.length > 0 ? (
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #08a171',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '10px'
              }}>
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
                          Milestone
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                          Description
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                          Amount
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                          Percentage
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.paymentSchedule.map((item, idx) => {
                        const amount = item.amount || 0;
                        const totalAmount = contract.totalAmount || contract.subtotal || 0;
                        const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
                        const status = item.status || 'Pending';
                        
                        return (
                          <tr 
                            key={idx}
                            style={{ 
                              backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderBottom: '1px solid #e9ecef'
                            }}
                          >
                            <td style={{ padding: '12px', fontSize: '13px', color: '#333', fontWeight: '600' }}>
                              {item.title || 'Payment Milestone'}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                              {item.description || 'N/A'}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', color: '#08a171', textAlign: 'right' }}>
                              {formatCurrency(amount)}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#666', textAlign: 'right' }}>
                              {percentage}%
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: status === 'Completed' ? '#d4edda' :
                                           status === 'In Progress' ? '#fff3cd' :
                                           status === 'Pending' ? '#cce5ff' :
                                           status === 'Overdue' ? '#f8d7da' : '#e9ecef',
                                color: status === 'Completed' ? '#155724' :
                                       status === 'In Progress' ? '#856404' :
                                       status === 'Pending' ? '#004085' :
                                       status === 'Overdue' ? '#721c24' : '#6c757d'
                              }}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Payment Schedule Summary */}
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#fff',
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
                      {formatCurrency(contract.paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      Contract Amount:
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {formatCurrency(calculateContractTotal())}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '200px' }}>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      Difference:
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: Math.abs(contract.paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateContractTotal()) < 0.01 ? '#28a745' : '#dc3545'
                    }}>
                      {formatCurrency(contract.paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateContractTotal())}
                    </div>
                    {Math.abs(contract.paymentSchedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) - calculateContractTotal()) < 0.01 ? (
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
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginTop: '10px'
              }}>
                <p style={{ margin: 0, marginBottom: '10px' }}>
                  No payment schedule has been set for this contract.
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                  Payment schedule can be configured when editing the contract.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {contract.description && (
            <div className="contract-section">
              <h3>Description</h3>
              <p>{contract.description}</p>
            </div>
          )}


          {/* Line Items */}
          {contract.lineItems && contract.lineItems.length > 0 && (
            <div className="contract-section">
              <h3>Scope of Work & Pricing</h3>
              <div className="line-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.lineItems.map((item, index) => {
                      // Merge notes from estimate if contract doesn't have notes
                      let notesToDisplay = item.notes || [];
                      if ((!notesToDisplay || notesToDisplay.length === 0) && estimate && estimate.lineItems && estimate.lineItems[index]) {
                        notesToDisplay = estimate.lineItems[index].notes || [];
                      }
                      
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{index + 1}</td>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.unitPrice)}</td>
                            <td>{formatCurrency(item.totalPrice)}</td>
                          </tr>
                          {notesToDisplay && notesToDisplay.length > 0 && notesToDisplay.some(note => note && note.trim()) && (
                            <tr>
                              <td colSpan="5" style={{ padding: 0, borderTop: 'none' }}>
                                <div className="line-item-view-notes">
                                  <strong>Notes:</strong>
                                  <ul className="line-item-notes-list-view">
                                    {notesToDisplay.map((note, noteIndex) => (
                                      note && note.trim() && (
                                        <li key={noteIndex}>{note}</li>
                                      )
                                    ))}
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                                 <div className="line-items-summary">
                   <div className="summary-item">
                     <label>Total Contract Amount:</label>
                     <span>{formatCurrency(calculateContractTotal())}</span>
                   </div>
                 </div>
                 
                 <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                   <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                     <strong>Note:</strong> Payment schedule and milestones are shown in the Payment Schedule section below. 
                     To modify payment milestones, please edit the contract.
                   </p>
                 </div>
              </div>
            </div>
          )}

          {/* Payment Receipt Section */}
          <div className="contract-section">
            <h3>Payment Receipt</h3>
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
                            {formatCurrency(totalAmount)}
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
                            {formatCurrency(totalPaid)}
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
                            {formatCurrency(remainingBalance)}
                          </div>
                        </div>
                      </div>
                      
                      {paymentDetails.length > 0 ? (
                        <div>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: '#333', 
                            marginBottom: '15px',
                            marginTop: '20px'
                          }}>
                            Payment History
                          </h4>
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
                                        {payment.date ? formatDate(payment.date) : 'N/A'}
                                      </td>
                                      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                                        {payment.method}
                                      </td>
                                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', color: '#28a745', textAlign: 'right' }}>
                                        {formatCurrency(payment.amount)}
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

          {/* Book Payment Section */}
          <div className="contract-section">
            <h3>Book Payment</h3>
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
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                    Record New Payment
                  </h4>
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

          {/* Signed Contract Upload Section */}
          <div className="contract-section">
            <h3>Contract Signature</h3>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Upload Signed Contract (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleSignedContractUpload}
                  disabled={uploadingSignedContract}
                  style={{
                    padding: '10px',
                    border: '2px dashed #ccc',
                    borderRadius: '6px',
                    width: '100%',
                    cursor: uploadingSignedContract ? 'not-allowed' : 'pointer',
                    background: '#fff'
                  }}
                />
                {uploadingSignedContract && (
                  <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>Uploading...</p>
                )}
                <p style={{ marginTop: '8px', color: '#666', fontSize: '13px', margin: '8px 0 0 0' }}>
                  Max file size: 10MB. Only PDF files are accepted.
                </p>
              </div>
              {contract.signatureStatus === 'Completed' && (
                <div style={{ 
                  padding: '12px', 
                  background: '#e8f5e9', 
                  borderRadius: '6px',
                  border: '1px solid #4CAF50',
                  marginTop: '12px'
                }}>
                  <p style={{ margin: 0, color: '#2e7d32', fontWeight: '600' }}>
                    ✓ Contract Signed
                  </p>
                  {contract.signatureCompletedAt && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                      Signed on: {formatDate(contract.signatureCompletedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {contract.notes && (
            <div className="contract-section">
              <h3>Notes</h3>
              <p>{contract.notes}</p>
            </div>
          )}

          {/* Contract Amendments */}
          <div className="contract-section">
            <AmendmentsList contractId={contract._id} onAmendmentChange={fetchContractSummary} />
          </div>

          {/* Pre-Work Inspections */}
          <div className="contract-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Pre-Work Inspections</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Document initial conditions and existing issues before work begins
                </p>
              </div>
              <button
                onClick={handleCreatePreWorkInspection}
                className="btn btn-primary"
                style={{ 
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                + Create Pre-Work Inspection
              </button>
            </div>

            {loadingReports ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading inspections...
              </div>
            ) : (() => {
              const preWorkReports = clientReports.filter(r =>
                r.reportType === 'Pre-Work Inspection' ||
                (Array.isArray(r.tasks) && r.tasks.length > 0 && (!Array.isArray(r.lineItems) || r.lineItems.length === 0))
              );
              if (preWorkReports.length === 0) {
                return (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <p style={{ margin: 0, color: '#666' }}>
                  No pre-work inspections have been created for this contract yet.
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#999' }}>
                  Click "Create Pre-Work Inspection" to document conditions before work begins.
                </p>
              </div>
                );
              }
              return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {preWorkReports
                  .map((report) => (
                    <div
                      key={report._id}
                      style={{
                        padding: '16px',
                        background: '#fff',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '15px', 
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            PRE-WORK
                          </span>
                          {report.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          Report #{report.reportNumber} • Created: {formatDate(report.createdAt)}
                        </div>
                        {report.propertyAddress && (
                          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                            📍 {report.propertyAddress}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Status Badge */}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: report.status === 'Draft' ? '#fff3cd' : 
                                     report.status === 'In Review' ? '#cce5ff' :
                                     report.status === 'Approved' ? '#d4edda' :
                                     report.status === 'Sent to Client' ? '#d1ecf1' : '#e9ecef',
                          color: report.status === 'Draft' ? '#856404' :
                                 report.status === 'In Review' ? '#004085' :
                                 report.status === 'Approved' ? '#155724' :
                                 report.status === 'Sent to Client' ? '#0c5460' : '#6c757d'
                        }}>
                          {report.status}
                        </span>
                        
                        <button
                          onClick={() => navigate(`/client-reports/${report._id}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          👁️ View
                        </button>
                        
                        {(report.status === 'Draft' || report.status === 'In Review') && (
                          <>
                            <button
                              onClick={() => navigate(`/prework-inspection/edit?reportId=${report._id}`)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleFinalizeReport(report._id, report.reportNumber, report.title)}
                              className="btn btn-success btn-sm"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              ✅ Finalize
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report._id, report.reportNumber, report.title)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDownloadReportPdf(report._id)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              );
            })()}
          </div>

          {/* Client Reports / Final Reports */}
          <div className="contract-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Final Reports (After-Work)</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Client-facing completion reports with photos and task details
                </p>
              </div>
              <button
                onClick={handleCreateReport}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                + Create Inspection Report
              </button>
            </div>

            {loadingReports ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading reports...
              </div>
            ) : (() => {
              const finalReports = clientReports.filter(r =>
                r.reportType !== 'Pre-Work Inspection' && Array.isArray(r.lineItems) && r.lineItems.length > 0
              );
              if (finalReports.length === 0) {
                return (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <p style={{ margin: 0, color: '#666' }}>
                  No final reports have been created for this contract yet.
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#999' }}>
                  Click "Create Report" to generate a client-facing completion report.
                </p>
              </div>
                );
              }
              return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {finalReports
                  .map((report) => (
                  <div
                    key={report._id}
                    style={{
                      padding: '16px',
                      background: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                        {report.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        Report #{report.reportNumber} • Created: {formatDate(report.createdAt)}
                      </div>
                      {report.propertyAddress && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                          📍 {report.propertyAddress}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Status Badge */}
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: report.status === 'Draft' ? '#fff3cd' : 
                                   report.status === 'In Review' ? '#cce5ff' :
                                   report.status === 'Approved' ? '#d4edda' :
                                   report.status === 'Sent to Client' ? '#d1ecf1' : '#e9ecef',
                        color: report.status === 'Draft' ? '#856404' :
                               report.status === 'In Review' ? '#004085' :
                               report.status === 'Approved' ? '#155724' :
                               report.status === 'Sent to Client' ? '#0c5460' : '#6c757d'
                      }}>
                        {report.status}
                      </span>
                      
                      <button
                        onClick={() => navigate(`/client-reports/${report._id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        👁️ View
                      </button>
                      
                      {(report.status === 'Draft' || report.status === 'In Review') && (
                        <>
                          <button
                            onClick={() => navigate(`/inspection-report/edit?reportId=${report._id}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleFinalizeReport(report._id, report.reportNumber, report.title)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            ✅ Finalize
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report._id, report.reportNumber, report.title)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDownloadReportPdf(report._id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        📄 Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>

          {/* Metadata */}
          <div className="contract-section">
            <h3>Additional Information</h3>
            <div className="contract-metadata">
              <div className="metadata-item">
                <label>Created:</label>
                <span>{formatDate(contract.createdAt)}</span>
              </div>
              {contract.updatedAt && contract.updatedAt !== contract.createdAt && (
                <div className="metadata-item">
                  <label>Last Updated:</label>
                  <span>{formatDate(contract.updatedAt)}</span>
                </div>
              )}
              {contract.projectId && (
                <div className="metadata-item">
                  <label>Project ID:</label>
                  <span>{contract.projectId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContractView;
