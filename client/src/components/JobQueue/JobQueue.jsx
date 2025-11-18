import React, { useState, useEffect, useCallback } from 'react';
import { jobApi, technicianApi } from '../../services/jobApi';
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

  const AllJobsTab = () => (
    <div className="all-jobs">
      <div className="jobs-filters">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <select 
          value={filters.assignedTechnician} 
          onChange={(e) => handleFilterChange('assignedTechnician', e.target.value)}
        >
          <option value="">All Technicians</option>
          {technicians.map(tech => (
            <option key={tech._id} value={tech._id}>
              {tech.firstName} {tech.lastName}
            </option>
          ))}
        </select>

        <label className="checkbox-filter">
          <input 
            type="checkbox" 
            checked={filters.overdue}
            onChange={(e) => handleFilterChange('overdue', e.target.checked)}
          />
          Overdue Only
        </label>
      </div>

      <div className="jobs-table">
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id} className={job.isOverdue ? 'overdue-row' : ''}>
                <td>
                  <div className="job-cell">
                    <strong>{job.title}</strong>
                    <br />
                    <small>{job.jobId}</small>
                  </div>
                </td>
                <td>
                  {job.customer?.firstName} {job.customer?.lastName}
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {job.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(job.priority) }}
                  >
                    {job.priority}
                  </span>
                </td>
                <td>
                  {job.assignedTechnician ? 
                    `${job.assignedTechnician.firstName} ${job.assignedTechnician.lastName}` : 
                    <button 
                      className="assign-btn small"
                      onClick={() => {
                        setAssigningJobId(job._id);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign
                    </button>
                  }
                </td>
                <td>
                  {formatDate(job.endDate)}
                  {job.isOverdue && <span className="overdue-indicator">⚠️</span>}
                </td>
                <td>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${job.progress?.percentage || 0}%` }}
                    ></div>
                    <span className="progress-text">{job.progress?.percentage || 0}%</span>
                  </div>
                </td>
                <td>
                  <div className="job-actions">
                    <button 
                      className="action-btn"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="queue-header">
        <h2>Job Queue Management</h2>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="queue-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all-jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-jobs')}
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
  );
};

export default JobQueue;
