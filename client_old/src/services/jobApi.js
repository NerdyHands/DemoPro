import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Job API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Job API Error:', {
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

// Job API endpoints
export const jobApi = {
  // Get all jobs
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get job queue for dashboard
  getJobQueue: async () => {
    const response = await api.get('/jobs/queue');
    return response.data;
  },

  // Get specific job
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Assign technician to job
  assignTechnician: async (jobId, technicianId) => {
    const response = await api.post(`/jobs/${jobId}/assign`, { technicianId });
    return response.data;
  },

  // Update job status
  updateJobStatus: async (jobId, status, notes) => {
    const response = await api.put(`/jobs/${jobId}/status`, { status, notes });
    return response.data;
  },

  // Update job progress
  updateJobProgress: async (jobId, percentage, milestone, notes) => {
    const response = await api.put(`/jobs/${jobId}/progress`, { 
      percentage, 
      milestone, 
      notes 
    });
    return response.data;
  },
};

// Technician API endpoints
export const technicianApi = {
  // Get all technicians
  getTechnicians: async (params = {}) => {
    const response = await api.get('/technicians', { params });
    return response.data;
  },

  // Get available technicians
  getAvailableTechnicians: async (skills, location, urgency) => {
    const params = {};
    if (skills) params.skills = skills.join(',');
    if (location) params.location = location;
    if (urgency) params.urgency = urgency;
    
    const response = await api.get('/technicians/available', { params });
    return response.data;
  },

  // Get specific technician
  getTechnician: async (id) => {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
  },

  // Create new technician
  createTechnician: async (technicianData) => {
    const response = await api.post('/technicians', technicianData);
    return response.data;
  },

  // Update technician
  updateTechnician: async (id, technicianData) => {
    const response = await api.put(`/technicians/${id}`, technicianData);
    return response.data;
  },

  // Update technician availability
  updateAvailability: async (id, availability) => {
    const response = await api.put(`/technicians/${id}/availability`, { availability });
    return response.data;
  },

  // Add rating to technician
  addRating: async (id, rating, comments) => {
    const response = await api.post(`/technicians/${id}/rating`, { rating, comments });
    return response.data;
  },

  // Get technician jobs
  getTechnicianJobs: async (id, params = {}) => {
    const response = await api.get(`/technicians/${id}/jobs`, { params });
    return response.data;
  },
};

// Job Progress API endpoints
export const jobProgressApi = {
  // Get progress logs for a job
  getJobProgressLogs: async (jobId, params = {}) => {
    const response = await api.get(`/job-progress/job/${jobId}`, { params });
    return response.data;
  },

  // Create new progress log
  createProgressLog: async (progressData) => {
    const response = await api.post('/job-progress', progressData);
    return response.data;
  },

  // Update progress log
  updateProgressLog: async (id, progressData) => {
    const response = await api.put(`/job-progress/${id}`, progressData);
    return response.data;
  },

  // Upload images to progress log
  uploadProgressImages: async (progressId, files, descriptions = [], categories = []) => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    descriptions.forEach((desc, index) => {
      formData.append('descriptions', desc);
    });
    
    categories.forEach((cat, index) => {
      formData.append('categories', cat);
    });

    const response = await api.post(`/job-progress/${progressId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Resolve an issue
  resolveIssue: async (progressId, issueIndex, resolution) => {
    const response = await api.post(`/job-progress/${progressId}/issues/${issueIndex}/resolve`, {
      resolution
    });
    return response.data;
  },

  // Get technician progress logs
  getTechnicianProgressLogs: async (technicianId, params = {}) => {
    const response = await api.get(`/job-progress/technician/${technicianId}`, { params });
    return response.data;
  },
};

// Milestone API endpoints
export const milestoneApi = {
  // Get all milestones
  getMilestones: async (params = {}) => {
    const response = await api.get('/milestones', { params });
    return response.data;
  },

  // Get milestone dashboard data
  getMilestoneDashboard: async () => {
    const response = await api.get('/milestones/dashboard');
    return response.data;
  },

  // Get specific milestone
  getMilestone: async (id) => {
    const response = await api.get(`/milestones/${id}`);
    return response.data;
  },

  // Create new milestone
  createMilestone: async (milestoneData) => {
    const response = await api.post('/milestones', milestoneData);
    return response.data;
  },

  // Update milestone
  updateMilestone: async (id, milestoneData) => {
    const response = await api.put(`/milestones/${id}`, milestoneData);
    return response.data;
  },

  // Add payment to milestone
  addPayment: async (id, paymentData) => {
    const response = await api.post(`/milestones/${id}/payment`, paymentData);
    return response.data;
  },

  // Generate receipt for existing payment
  generateReceipt: async (milestoneId, paymentIndex) => {
    const response = await api.post(`/milestones/${milestoneId}/payment/${paymentIndex}/receipt`);
    return response.data;
  },

  // Add comment to milestone
  addComment: async (id, content, isInternal = false) => {
    const response = await api.post(`/milestones/${id}/comments`, { content, isInternal });
    return response.data;
  },

  // Get milestones for a contract
  getContractMilestones: async (contractId, params = {}) => {
    const response = await api.get(`/milestones/contract/${contractId}`, { params });
    return response.data;
  },
};

const apiServices = {
  jobApi,
  technicianApi,
  jobProgressApi,
  milestoneApi,
};

export default apiServices;


