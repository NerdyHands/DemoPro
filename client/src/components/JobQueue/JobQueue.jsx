import React, { useState, useEffect, useCallback } from 'react';
import { jobApi, technicianApi } from '../../services/jobApi';
import '../BidBoardLayout/BidBoardLayout.css';
import './JobQueue.css';

const JobQueue = () => {
  const [queueData, setQueueData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  // const [selectedJob, setSelectedJob] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningJobId, setAssigningJobId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTechnician: '',
    overdue: false
  });

  const loadQueueData = useCallback(async () => {
    try {
      setLoading(true);
      const [queueResponse, jobsResponse, techniciansResponse] = await Promise.all([
        jobApi.getJobQueue(),
        jobApi.getJobs(filters),
        technicianApi.getTechnicians({ isActive: true, limit: 100 })
      ]);
      
      setQueueData(queueResponse.queue);
      setJobs(jobsResponse.jobs || []);
      setTechnicians(techniciansResponse.technicians || []);
      setError(null);
    } catch (err) {
      console.error('Error loading queue data:', err);
      setError('Failed to load job queue data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  const handleAssignTechnician = async (jobId, technicianId) => {
    try {
      await jobApi.assignTechnician(jobId, technicianId);
      setShowAssignModal(false);
      setAssigningJobId(null);
      await loadQueueData(); // Refresh data
    } catch (err) {
      console.error('Error assigning technician:', err);
      setError('Failed to assign technician');
    }
  };

  // const handleStatusUpdate = async (jobId, status) => {
  //   try {
  //     await jobApi.updateJobStatus(jobId, status);
  //     await loadQueueData(); // Refresh data
  //   } catch (err) {
  //     console.error('Error updating job status:', err);
  //     setError('Failed to update job status');
  //   }
  // };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#FFC107',
      'Assigned': '#17A2B8',
      'In Progress': '#007BFF',
      'On Hold': '#6C757D',
      'Completed': '#28A745',
      'Cancelled': '#DC3545',
      'Needs Review': '#FD7E14'
    };
    return colors[status] || '#6C757D';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#28A745',
      'Medium': '#FFC107',
      'High': '#FD7E14',
      'Critical': '#DC3545'
    };
    return colors[priority] || '#6C757D';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const OverviewTab = () => (
    <div className="queue-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Status Distribution</h3>
          <div className="status-stats">
            {queueData?.statusCounts && Object.entries(queueData.statusCounts).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
                  {status}
                </span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3>Priority Distribution</h3>
          <div className="priority-stats">
            {queueData?.priorityCounts && Object.entries(queueData.priorityCounts).map(([priority, count]) => (
              <div key={priority} className="priority-item">
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(priority) }}>
                  {priority}
                </span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="queue-sections">
        <div className="queue-section">
          <h3>🚨 Unassigned Jobs ({queueData?.unassignedJobs?.length || 0})</h3>
          <div className="job-list">
            {queueData?.unassignedJobs?.map(job => (
              <div key={job._id} className="job-item">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p>{job.customer?.firstName} {job.customer?.lastName}</p>
                  <div className="job-meta">
                    <span className="priority" style={{ color: getPriorityColor(job.priority) }}>
                      {job.priority}
                    </span>
                    <span className="due-date">Due: {formatDate(job.endDate)}</span>
                  </div>
                </div>
                <div className="job-actions">
                  <button 
                    className="assign-btn"
                    onClick={() => {
                      setAssigningJobId(job._id);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="queue-section">
          <h3>⏰ Overdue Jobs ({queueData?.overdueJobs?.length || 0})</h3>
          <div className="job-list">
            {queueData?.overdueJobs?.map(job => (
              <div key={job._id} className="job-item overdue">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p>{job.customer?.firstName} {job.customer?.lastName}</p>
                  <p>Assigned to: {job.assignedTechnician?.firstName} {job.assignedTechnician?.lastName}</p>
                  <div className="job-meta">
                    <span className="overdue-days">
                      {job.daysUntilDue < 0 ? `${Math.abs(job.daysUntilDue)} days overdue` : 'Due today'}
                    </span>
                  </div>
                </div>
                <div className="job-actions">
                  <button 
                    className="status-btn"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="queue-section">
          <h3>✅ Recent Completions ({queueData?.recentCompletions?.length || 0})</h3>
          <div className="job-list">
            {queueData?.recentCompletions?.map(job => (
              <div key={job._id} className="job-item completed">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p>{job.customer?.firstName} {job.customer?.lastName}</p>
                  <p>Completed by: {job.assignedTechnician?.firstName} {job.assignedTechnician?.lastName}</p>
                  <div className="job-meta">
                    <span className="completion-date">
                      Completed: {formatDate(job.timeline?.completedDate)}
                    </span>
                    {job.totalActualCost > 0 && (
                      <span className="cost">
                        Cost: ${job.totalActualCost.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getJobsByStatus = (status) => {
    return jobs.filter(j => j.status === status);
  };

  const getStatusCounts = () => {
    const counts = { Pending: 0, Assigned: 0, 'In Progress': 0, 'On Hold': 0, Completed: 0, Cancelled: 0 };
    jobs.forEach(job => {
      if (counts.hasOwnProperty(job.status)) {
        counts[job.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'N/A';
    }
  };

  const JobStatusSection = ({ status, statusLabel }) => {
    const statusJobs = getJobsByStatus(status);
    const count = statusCounts[status] || 0;
    
    return (
      <div className="bid-board-status-section">
        <div className="bid-board-status-header">
          <input type="checkbox" defaultChecked />
          <span className="bid-board-status-title">{statusLabel}</span>
          <span className="bid-board-status-count">{count}</span>
          <span className="bid-board-status-value">($0)</span>
        </div>
        <div className="bid-board-cards-container">
          {statusJobs.length === 0 ? (
            <div className="bid-board-empty-state">No jobs</div>
          ) : (
            statusJobs.map((job) => {
              const customerName = job.customer
                ? `${job.customer.firstName || ''} ${job.customer.lastName || ''}`.trim()
                : 'Unknown Customer';
              
              return (
                <div key={job._id} className="bid-board-card">
                  <div className="bid-board-card-header">
                    <div className="bid-board-card-checkbox">
                      <input type="checkbox" />
                    </div>
                    <div className="bid-board-card-content">
                      <div className="bid-board-card-label">JOB</div>
                      <div className="bid-board-card-title">{job.title || job.jobId}</div>
                      <div className="bid-board-card-value">
                        <strong>Customer:</strong> {customerName}
                      </div>
                      {job.priority && (
                        <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: getPriorityColor(job.priority) }}>
                          Priority: {job.priority}
                        </div>
                      )}
                      {job.assignedTechnician && (
                        <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          Assigned to: {job.assignedTechnician.firstName} {job.assignedTechnician.lastName}
                        </div>
                      )}
                      {job.progress?.percentage !== undefined && (
                        <div className="bid-board-card-value" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          Progress: {job.progress.percentage}%
                        </div>
                      )}
                      <div className="bid-board-card-meta">
                        <div className="bid-board-card-due-date">
                          {job.endDate 
                            ? `DUE ${formatDateShort(job.endDate).toUpperCase()}${job.isOverdue ? ' ⚠️ OVERDUE' : ''}`
                            : 'NO DUE DATE'}
                        </div>
                        <div className="bid-board-card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {!job.assignedTechnician && (
                            <button
                              onClick={() => {
                                setAssigningJobId(job._id);
                                setShowAssignModal(true);
                              }}
                              className="bid-board-card-btn bid-board-card-btn-primary"
                            >
                              Assign
                            </button>
                          )}
                          <button className="bid-board-card-btn bid-board-card-btn-secondary">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                    <svg className="bid-board-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const AllJobsTab = () => (
    <div className="bid-board-container">
      <div className="bid-board-search-filter">
        <div className="bid-board-search">
          <input
            type="text"
            placeholder="Search jobs..."
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <div className="bid-board-search-icon">🔍</div>
        </div>
        <button className="bid-board-filter-btn">
          <span>⚙️</span>
          Filter
        </button>
        <div className="bid-board-sort-dropdown">
          <span>Job Due Date</span>
          <span>☰</span>
        </div>
      </div>

      <div className="bid-board-status-sections">
        <JobStatusSection status="Pending" statusLabel="Pending" />
        <JobStatusSection status="Assigned" statusLabel="Assigned" />
        <JobStatusSection status="In Progress" statusLabel="In Progress" />
        <JobStatusSection status="On Hold" statusLabel="On Hold" />
        <div className="bid-board-status-separator"></div>
        <JobStatusSection status="Completed" statusLabel="Completed" />
        <JobStatusSection status="Cancelled" statusLabel="Cancelled" />
      </div>
    </div>
  );

  const AssignmentModal = () => {
    const [availableTechnicians, setAvailableTechnicians] = useState([]);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);

    useEffect(() => {
      if (showAssignModal && assigningJobId) {
        const loadAvailableTechnicians = async () => {
          setLoadingTechnicians(true);
          try {
            const job = jobs.find(j => j._id === assigningJobId);
            const response = await technicianApi.getAvailableTechnicians(
              job?.skillsRequired || [],
              job?.location?.address,
              job?.priority === 'Critical' ? 'high' : 'normal'
            );
            setAvailableTechnicians(response.technicians || []);
          } catch (err) {
            console.error('Error loading available technicians:', err);
          } finally {
            setLoadingTechnicians(false);
          }
        };
        loadAvailableTechnicians();
      }
    }, []);

    if (!showAssignModal) return null;

    const job = jobs.find(j => j._id === assigningJobId);

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Assign Technician</h3>
            <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="job-summary">
              <h4>{job?.title}</h4>
              <p>Customer: {job?.customer?.firstName} {job?.customer?.lastName}</p>
              <p>Priority: {job?.priority}</p>
              {job?.skillsRequired?.length > 0 && (
                <p>Required Skills: {job.skillsRequired.join(', ')}</p>
              )}
            </div>

            {loadingTechnicians ? (
              <div className="loading">Loading available technicians...</div>
            ) : (
              <div className="technician-list">
                <h4>Available Technicians ({availableTechnicians.length})</h4>
                {availableTechnicians.map(tech => (
                  <div key={tech._id} className="technician-option">
                    <div className="tech-info">
                      <strong>{tech.firstName} {tech.lastName}</strong>
                      <div className="tech-details">
                        <span>Specializations: {tech.specializations.join(', ')}</span>
                        <span>Current Jobs: {tech.currentJobCount}/5</span>
                        <span>Rating: {tech.rating.average.toFixed(1)} ⭐</span>
                        {tech.skillMatch < 1 && (
                          <span className="skill-match">
                            Skill Match: {Math.round(tech.skillMatch * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="assign-tech-btn"
                      onClick={() => handleAssignTechnician(assigningJobId, tech._id)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {availableTechnicians.length === 0 && (
                  <p>No available technicians found for this job.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="job-queue">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-queue">
      <div className="bid-board-container">
        <div className="bid-board-header">
          <div className="bid-board-title-section">
            <h1 className="bid-board-title">Job Queue</h1>
            <p className="bid-board-subtitle">Manage jobs and assignments</p>
          </div>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="queue-tabs" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0', display: 'flex', gap: '1rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              borderBottom: activeTab === 'overview' ? '2px solid #20b2aa' : '2px solid transparent',
              color: activeTab === 'overview' ? '#20b2aa' : '#666',
              fontWeight: activeTab === 'overview' ? 600 : 400
            }}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all-jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-jobs')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              borderBottom: activeTab === 'all-jobs' ? '2px solid #20b2aa' : '2px solid transparent',
              color: activeTab === 'all-jobs' ? '#20b2aa' : '#666',
              fontWeight: activeTab === 'all-jobs' ? 600 : 400
            }}
          >
            All Jobs
          </button>
        </div>

        <div className="queue-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'all-jobs' && <AllJobsTab />}
        </div>

        <AssignmentModal />
      </div>
    </div>
  );
};

export default JobQueue;
