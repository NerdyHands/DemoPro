import axios from 'axios';

// API base URL - adjust based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const downloadBlobAsFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const downloadEndpoint = async (endpoint, filename) => {
  const response = await api.get(endpoint, { responseType: 'blob' });
  downloadBlobAsFile(new Blob([response.data]), filename);
  return { success: true };
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Contracts API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Contracts API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.error('❌ Authentication failed - redirecting to login');
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.includes('/auth') && 
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/signup')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Customer API functions
export const customerApi = {
  // Get all customers
  getCustomers: async () => {
    const response = await api.get('/api/customers');
    return response.data;
  },

  // Get customer by ID
  getCustomer: async (id) => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await api.post('/api/customers', customerData);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/api/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  },
};

// Estimate API functions
export const estimateApi = {
  // Get all estimates
  getEstimates: async () => {
    const response = await api.get('/api/estimates');
    return response.data;
  },

  // Get estimates for current user (customer portal)
  getMyEstimates: async () => {
    const response = await api.get('/api/estimates/mine');
    return response.data;
  },

  // Get estimate by ID
  getEstimate: async (id) => {
    const response = await api.get(`/api/estimates/${id}`);
    return response.data;
  },

  // Create new estimate
  createEstimate: async (estimateData) => {
    const response = await api.post('/api/estimates', estimateData);
    return response.data;
  },

  // Update estimate
  updateEstimate: async (id, estimateData) => {
    const response = await api.put(`/api/estimates/${id}`, estimateData);
    return response.data;
  },

  // Delete estimate
  deleteEstimate: async (id) => {
    const response = await api.delete(`/api/estimates/${id}`);
    return response.data;
  },

  // Download estimate PDF (server endpoint expected at /api/estimates/:id/pdf)
  downloadPdf: async (id) => {
    return await downloadEndpoint(`/api/estimates/${id}/pdf`, `estimate-${id}.pdf`);
  },

  // Download estimate DOCX
  downloadDocx: async (id) => {
    return await downloadEndpoint(`/api/estimates/${id}/docx`, `estimate-${id}.docx`);
  },

  // Create Google Doc for estimate
  createGoogleDoc: async (id, payload = {}) => {
    const response = await api.post(`/api/estimates/${id}/google-doc`, payload);
    return response.data;
  },
};

// Contract API functions
export const contractApi = {
  // Get all contracts
  getContracts: async () => {
    const response = await api.get('/api/contracts');
    return response.data;
  },

  // Get contracts for current user (customer portal)
  getMyContracts: async () => {
    const response = await api.get('/api/contracts/mine');
    return response.data;
  },

  // Get contract by ID
  getContract: async (id) => {
    const response = await api.get(`/api/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  createContract: async (contractData) => {
    const response = await api.post('/api/contracts', contractData);
    return response.data;
  },

  // Update contract
  updateContract: async (id, contractData) => {
    const response = await api.put(`/api/contracts/${id}`, contractData);
    return response.data;
  },

  // Delete contract
  deleteContract: async (id) => {
    const response = await api.delete(`/api/contracts/${id}`);
    return response.data;
  },

  // Download contract PDF
  downloadPdf: async (id) => {
    return await downloadEndpoint(`/api/contracts/${id}/pdf`, `contract-${id}.pdf`);
  },

  // Download contract DOCX
  downloadDocx: async (id) => {
    return await downloadEndpoint(`/api/contracts/${id}/docx`, `contract-${id}.docx`);
  },

  // Create Google Doc for contract
  createGoogleDoc: async (id, payload = {}) => {
    const response = await api.post(`/api/contracts/${id}/google-doc`, payload);
    return response.data;
  },

  // Final invoice exports
  downloadFinalInvoicePdf: async (id) => {
    return await downloadEndpoint(`/api/contracts/${id}/final-invoice`, `final-invoice-${id}.pdf`);
  },

  downloadFinalInvoiceDocx: async (id) => {
    return await downloadEndpoint(`/api/contracts/${id}/final-invoice/docx`, `final-invoice-${id}.docx`);
  },

  createFinalInvoiceGoogleDoc: async (id, payload = {}) => {
    const response = await api.post(`/api/contracts/${id}/final-invoice/google-doc`, payload);
    return response.data;
  },

  // BoldSign Integration
  sendForSignature: async (contractId, contractorInfo = {}) => {
    const response = await api.post(`/api/contracts/${contractId}/send-for-signature`, contractorInfo);
    return response.data;
  },

  createBoldsignDraft: async (contractId, contractorInfo = {}) => {
    const response = await api.post(`/api/contracts/${contractId}/create-boldsign-draft`, contractorInfo);
    return response.data;
  },

  getSignatureStatus: async (contractId) => {
    const response = await api.get(`/api/contracts/${contractId}/signature-status`);
    return response.data;
  },

  downloadSignedDocument: async (contractId) => {
    const response = await api.get(`/api/contracts/${contractId}/signed-document`, {
      responseType: 'blob'
    });
    return response.data;
  },

  resendSignature: async (contractId, signerEmail) => {
    const response = await api.post(`/api/contracts/${contractId}/resend-signature`, { signerEmail });
    return response.data;
  },

  cancelSignature: async (contractId) => {
    const response = await api.post(`/api/contracts/${contractId}/cancel-signature`);
    return response.data;
  },
};

// Amendment API functions
export const amendmentApi = {
  // Get all amendments
  getAmendments: async () => {
    const response = await api.get('/api/amendments');
    return response.data;
  },

  // Get amendments for a specific contract
  getContractAmendments: async (contractId) => {
    const response = await api.get(`/api/amendments/contract/${contractId}`);
    return response.data;
  },

  // Get contract summary with amendments
  getContractSummary: async (contractId) => {
    const response = await api.get(`/api/amendments/contract/${contractId}/summary`);
    return response.data;
  },

  // Get amendment by ID
  getAmendment: async (id) => {
    const response = await api.get(`/api/amendments/${id}`);
    return response.data;
  },

  // Create new amendment
  createAmendment: async (amendmentData) => {
    const response = await api.post('/api/amendments', amendmentData);
    return response.data;
  },

  // Update amendment
  updateAmendment: async (id, amendmentData) => {
    const response = await api.put(`/api/amendments/${id}`, amendmentData);
    return response.data;
  },

  // Delete amendment
  deleteAmendment: async (id) => {
    const response = await api.delete(`/api/amendments/${id}`);
    return response.data;
  },

  // Approve amendment
  approveAmendment: async (id, approvedBy) => {
    const response = await api.post(`/api/amendments/${id}/approve`, { approvedBy });
    return response.data;
  },

  // Reject amendment
  rejectAmendment: async (id, rejectedBy, rejectionReason) => {
    const response = await api.post(`/api/amendments/${id}/reject`, { rejectedBy, rejectionReason });
    return response.data;
  },

  // Download amendment PDF
  downloadPdf: async (id) => {
    return await downloadEndpoint(`/api/amendments/${id}/pdf`, `amendment-${id}.pdf`);
  },

  downloadDocx: async (id) => {
    return await downloadEndpoint(`/api/amendments/${id}/docx`, `amendment-${id}.docx`);
  },

  createGoogleDoc: async (id, payload = {}) => {
    const response = await api.post(`/api/amendments/${id}/google-doc`, payload);
    return response.data;
  },
};

// Job API functions
export const jobApi = {
  // Get all jobs
  getJobs: async () => {
    const response = await api.get('/api/jobs');
    return response.data;
  },

  // Get job by ID
  getJob: async (id) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await api.post('/api/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/api/jobs/${id}`);
    return response.data;
  },
};

// Client Report API functions
export const clientReportApi = {
  // Get all reports
  getReports: async (params = {}) => {
    const response = await api.get('/api/client-reports', { params });
    return response.data;
  },

  // Get report by ID
  getReport: async (id) => {
    const response = await api.get(`/api/client-reports/${id}`);
    return response.data;
  },

  // Create new report
  createReport: async (reportData) => {
    const response = await api.post('/api/client-reports', reportData);
    return response.data;
  },

  // Create report from job
  createReportFromJob: async (jobId, additionalData = {}) => {
    const response = await api.post(`/api/client-reports/from-job/${jobId}`, additionalData);
    return response.data;
  },

  // Update report
  updateReport: async (id, reportData) => {
    const response = await api.put(`/api/client-reports/${id}`, reportData);
    return response.data;
  },

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/api/client-reports/${id}`);
    return response.data;
  },

  // Upload images to report
  uploadImages: async (id, files, captions = [], categories = [], taskNumbers = []) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });
    
    captions.forEach(caption => {
      formData.append('captions[]', caption);
    });
    
    categories.forEach(category => {
      formData.append('categories[]', category);
    });
    
    taskNumbers.forEach(taskNumber => {
      formData.append('taskNumbers[]', taskNumber);
    });

    const response = await api.post(`/api/client-reports/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download report PDF
  downloadPdf: async (id) => {
    return await downloadEndpoint(`/api/client-reports/${id}/pdf`, `client-report-${id}.pdf`);
  },

  downloadDocx: async (id) => {
    return await downloadEndpoint(`/api/client-reports/${id}/docx`, `client-report-${id}.docx`);
  },

  createGoogleDoc: async (id, payload = {}) => {
    const response = await api.post(`/api/client-reports/${id}/google-doc`, payload);
    return response.data;
  },

  // Send report to client
  sendToClient: async (id) => {
    const response = await api.post(`/api/client-reports/${id}/send`);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (id, taskNumber, status) => {
    const response = await api.put(`/api/client-reports/${id}/tasks/${taskNumber}`, { status });
    return response.data;
  },
};

export default api;
