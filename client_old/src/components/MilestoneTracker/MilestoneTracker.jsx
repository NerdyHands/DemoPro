import React, { useState, useEffect, useCallback } from 'react';
import { milestoneApi } from '../../services/jobApi';
import './MilestoneTracker.css';

const MilestoneTracker = ({ contractId, customerId, onClose }) => {
  const [milestones, setMilestones] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  // const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

  const loadMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (contractId) params.contractId = contractId;
      if (customerId) params.customerId = customerId;

      const response = await milestoneApi.getMilestones(params);
      setMilestones(response.milestones || []);
      setError(null);
    } catch (err) {
      console.error('Error loading milestones:', err);
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [contractId, customerId, filters]);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await milestoneApi.getMilestoneDashboard();
      setDashboardData(response);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    loadMilestones();
    if (!contractId && !customerId) {
      loadDashboardData();
    }
  }, [loadMilestones, loadDashboardData, contractId, customerId]);

  const handleStatusUpdate = async (milestoneId, status) => {
    try {
      await milestoneApi.updateMilestone(milestoneId, { status });
      await loadMilestones();
    } catch (err) {
      console.error('Error updating milestone status:', err);
      setError('Failed to update milestone status');
    }
  };

  const handleAddPayment = async (milestoneId, paymentData) => {
    try {
      await milestoneApi.addPayment(milestoneId, paymentData);
      await loadMilestones();
      setShowPaymentModal(false);
      setSelectedMilestone(null);
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Failed to add payment');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#FFC107',
      'In Progress': '#17A2B8',
      'Completed': '#28A745',
      'Overdue': '#DC3545',
      'Cancelled': '#6C757D',
      'On Hold': '#FD7E14'
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

  const OverviewTab = () => (
    <div className="milestone-overview">
      {dashboardData && (
        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Status Distribution</h3>
              {dashboardData.stats?.statusCounts?.map(item => (
                <div key={item._id} className="stat-item">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(item._id) }}
                  >
                    {item._id}
                  </span>
                  <span className="count">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="stat-card">
              <h3>Payment Status</h3>
              {dashboardData.stats?.paymentStats?.map(item => (
                <div key={item._id} className="stat-item">
                  <span className="payment-status">{item._id}</span>
                  <span className="count">{item.count}</span>
                  <span className="amount">{formatCurrency(item.totalAmount)}</span>
                </div>
              ))}
            </div>

            {dashboardData.stats?.overduePayments?.[0] && (
              <div className="stat-card alert">
                <h3>⚠️ Overdue Payments</h3>
                <div className="overdue-stats">
                  <div className="overdue-count">
                    {dashboardData.stats.overduePayments[0].count} payments
                  </div>
                  <div className="overdue-amount">
                    {formatCurrency(dashboardData.stats.overduePayments[0].totalAmount)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="milestone-sections">
            <div className="milestone-section">
              <h3>Recent Milestones</h3>
              <div className="milestone-list">
                {dashboardData.recentMilestones?.map(milestone => (
                  <div key={milestone._id} className="milestone-item">
                    <div className="milestone-info">
                      <h4>{milestone.title}</h4>
                      <p>{milestone.contractId?.contractNumber}</p>
                      <div className="milestone-meta">
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: milestone.type === 'Payment' ? '#007bff' : '#6c757d' }}
                        >
                          {milestone.type}
                        </span>
                        <span className="due-date">
                          {milestone.payment?.dueDate ? 
                            `Due: ${formatDate(milestone.payment.dueDate)}` :
                            `Due: ${formatDate(milestone.timeline?.plannedEndDate)}`
                          }
                        </span>
                      </div>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(milestone.status) }}
                    >
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="milestone-section">
              <h3>Overdue Milestones</h3>
              <div className="milestone-list">
                {dashboardData.overdueMilestones?.map(milestone => (
                  <div key={milestone._id} className="milestone-item overdue">
                    <div className="milestone-info">
                      <h4>{milestone.title}</h4>
                      <p>{milestone.contractId?.contractNumber}</p>
                      <div className="milestone-meta">
                        <span className="overdue-days">
                          {milestone.daysUntilDue < 0 ? 
                            `${Math.abs(milestone.daysUntilDue)} days overdue` : 
                            'Due today'
                          }
                        </span>
                        {milestone.type === 'Payment' && (
                          <span className="amount">
                            {formatCurrency(milestone.payment?.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="action-btn"
                      onClick={() => {
                        setSelectedMilestone(milestone);
                        if (milestone.type === 'Payment') {
                          setShowPaymentModal(true);
                        }
                      }}
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const MilestonesTab = () => (
    <div className="all-milestones">
      <div className="milestones-header">
        <div className="milestones-filters">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="On Hold">On Hold</option>
          </select>

          <select 
            value={filters.type} 
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Project Phase">Project Phase</option>
            <option value="Delivery">Delivery</option>
            <option value="Approval">Approval</option>
            <option value="Inspection">Inspection</option>
          </select>

          <select 
            value={filters.priority} 
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button 
          className="create-btn"
        >
          + Create Milestone
        </button>
      </div>

      <div className="milestones-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Contract</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Amount/Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map(milestone => (
              <tr key={milestone._id} className={milestone.isOverdue ? 'overdue-row' : ''}>
                <td>
                  <div className="milestone-cell">
                    <strong>{milestone.title}</strong>
                    <br />
                    <small>{milestone.description}</small>
                  </div>
                </td>
                <td>
                  {milestone.contractId?.contractNumber}
                </td>
                <td>
                  <span 
                    className="type-badge"
                    style={{ backgroundColor: milestone.type === 'Payment' ? '#007bff' : '#6c757d' }}
                  >
                    {milestone.type}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(milestone.status) }}
                  >
                    {milestone.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(milestone.priority) }}
                  >
                    {milestone.priority}
                  </span>
                </td>
                <td>
                  {milestone.payment?.dueDate ? 
                    formatDate(milestone.payment.dueDate) :
                    formatDate(milestone.timeline?.plannedEndDate)
                  }
                  {milestone.isOverdue && <span className="overdue-indicator">⚠️</span>}
                </td>
                <td>
                  {milestone.type === 'Payment' ? (
                    <div className="payment-info">
                      <div>{formatCurrency(milestone.payment?.amount)}</div>
                      <div className="payment-status">
                        {milestone.payment?.paymentStatus}
                        {milestone.totalPaid > 0 && (
                          <small>Paid: {formatCurrency(milestone.totalPaid)}</small>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="progress-info">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${milestone.progress?.percentage || 0}%` }}
                        ></div>
                      </div>
                      <small>{milestone.progress?.percentage || 0}%</small>
                    </div>
                  )}
                </td>
                <td>
                  <div className="milestone-actions">
                    {milestone.status !== 'Completed' && (
                      <button 
                        className="status-btn"
                        onClick={() => handleStatusUpdate(milestone._id, 'Completed')}
                      >
                        Complete
                      </button>
                    )}
                    {milestone.type === 'Payment' && milestone.payment?.paymentStatus !== 'Paid' && (
                      <button 
                        className="payment-btn"
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setShowPaymentModal(true);
                        }}
                      >
                        Add Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PaymentModal = () => {
    const [paymentData, setPaymentData] = useState({
      amount: '',
      method: 'Cash',
      transactionId: '',
      notes: ''
    });

    if (!showPaymentModal || !selectedMilestone) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddPayment(selectedMilestone._id, paymentData);
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Add Payment</h3>
            <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="milestone-summary">
              <h4>{selectedMilestone.title}</h4>
              <p>Due Amount: {formatCurrency(selectedMilestone.payment?.amount)}</p>
              <p>Already Paid: {formatCurrency(selectedMilestone.totalPaid)}</p>
              <p>Remaining: {formatCurrency(selectedMilestone.remainingBalance)}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedMilestone.remainingBalance}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="Optional transaction reference"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional payment notes"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Add Payment
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="milestone-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading milestones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="milestone-tracker">
      <div className="tracker-header">
        <h2>Milestone Tracker</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="tracker-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          All Milestones
        </button>
      </div>

      <div className="tracker-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'milestones' && <MilestonesTab />}
      </div>

      <PaymentModal />
    </div>
  );
};

export default MilestoneTracker;
