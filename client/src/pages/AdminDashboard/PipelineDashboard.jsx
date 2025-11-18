import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import './PipelineDashboard.css';

const PipelineDashboard = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [customers, setCustomers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pipeline categories
  const pipelineCategories = {
    leads: { name: 'Leads', color: '#f59e0b', icon: '🎯' },
    prospects: { name: 'Prospects', color: '#3b82f6', icon: '👥' },
    qualified: { name: 'Qualified', color: '#10b981', icon: '✅' },
    proposal: { name: 'Proposal', color: '#8b5cf6', icon: '📋' },
    negotiation: { name: 'Negotiation', color: '#f97316', icon: '🤝' },
    closed: { name: 'Closed Won', color: '#059669', icon: '💰' },
    lost: { name: 'Closed Lost', color: '#dc2626', icon: '❌' }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load customers and quotes data
      const [customersData, quotesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getQuotes()
      ]);

      // Process customers data
      const customersArray = Array.isArray(customersData) ? customersData : (customersData?.users || []);
      const quotesArray = Array.isArray(quotesData) ? quotesData : (quotesData?.quotes || []);

      // Categorize customers into pipeline stages
      const categorizedCustomers = categorizeCustomers(customersArray, quotesArray);
      setCustomers(categorizedCustomers);
      setQuotes(quotesArray);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const categorizeCustomers = (customers, quotes) => {
    // Create a map of customers by their pipeline stage
    const customerMap = {};
    
    customers.forEach(customer => {
      // Find the most recent quote for this customer
      const customerQuotes = quotes.filter(quote => quote.customerId === customer._id || quote.customerEmail === customer.email);
      const latestQuote = customerQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      let stage = 'leads'; // default stage
      
      if (latestQuote) {
        // Determine stage based on quote status and other factors
        if (latestQuote.status === 'approved') {
          stage = 'closed';
        } else if (latestQuote.status === 'rejected') {
          stage = 'lost';
        } else if (latestQuote.status === 'pending') {
          stage = 'proposal';
        } else if (latestQuote.status === 'sent') {
          stage = 'negotiation';
        } else if (customerQuotes.length > 0) {
          stage = 'qualified';
        } else if (customer.createdAt && (new Date() - new Date(customer.createdAt)) < 7 * 24 * 60 * 60 * 1000) {
          stage = 'prospects';
        }
      }
      
      if (!customerMap[stage]) {
        customerMap[stage] = [];
      }
      customerMap[stage].push({
        ...customer,
        latestQuote,
        quoteCount: customerQuotes.length
      });
    });
    
    return customerMap;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'sent':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Fix date parsing to prevent "one day off" issue by using UTC parsing
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const moveCustomerToStage = async (customerId, newStage) => {
    try {
      // Update customer's pipeline stage
      await apiService.updateUserProfile({ pipelineStage: newStage });
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error moving customer:', error);
      alert('Failed to move customer. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="pipeline-dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading pipeline dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="pipeline-dashboard">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadDashboardData}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pipeline-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">
              <span className="logo-icon">🏠</span>
              HomeInspectPro
            </h1>
          </div>
          <div className="header-right">
            <Link to="/admin" className="nav-btn">Main Dashboard</Link>
            <button className="nav-btn active">Pipeline</button>
            <button className="nav-btn logout-btn">Logout</button>
          </div>
        </div>

        {/* Navigation */}
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            Quotes
          </button>
          <button 
            className={`nav-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Quote Requests
          </button>
          <button 
            className={`nav-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {activeTab === 'quotes' && (
            <>
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Quotes</h3>
                  <div className="chart-container">
                    <div className="pie-chart">
                      <div className="pie-slice" style={{ backgroundColor: '#8B4513', transform: 'rotate(0deg)' }}></div>
                      <div className="pie-slice" style={{ backgroundColor: '#f59e0b', transform: 'rotate(120deg)' }}></div>
                      <div className="pie-slice" style={{ backgroundColor: '#d1d5db', transform: 'rotate(240deg)' }}></div>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Pending Requests</h3>
                  <div className="chart-container">
                    <div className="bar-chart">
                      <div className="bar" style={{ width: '70%', backgroundColor: '#f59e0b' }}></div>
                      <div className="bar" style={{ width: '50%', backgroundColor: '#d1d5db' }}></div>
                      <div className="bar" style={{ width: '85%', backgroundColor: '#f59e0b' }}></div>
                      <div className="bar" style={{ width: '30%', backgroundColor: '#d1d5db' }}></div>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Status Overview</h3>
                  <div className="chart-container">
                    <div className="line-chart">
                      <svg width="100%" height="100" viewBox="0 0 200 100">
                        <polyline
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          points="0,80 40,60 80,40 120,70 160,30 200,50"
                        />
                        <polyline
                          fill="none"
                          stroke="#d1d5db"
                          strokeWidth="2"
                          points="0,60 40,50 80,70 120,30 160,60 200,40"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Quotes Table */}
              <div className="quotes-table-container">
                <h3>Recent Quotes</h3>
                <div className="quotes-table">
                  <div className="table-header">
                    <div className="header-cell">Quote ID</div>
                    <div className="header-cell">Client Name</div>
                    <div className="header-cell">Date</div>
                    <div className="header-cell">Status</div>
                  </div>
                  <div className="table-body">
                                         {quotes.slice(0, 5).map((quote, index) => (
                       <div key={quote._id || index} className="table-row">
                         <div className="table-cell">#{quote._id?.slice(-5) || `1452${index + 3}`}</div>
                         <div className="table-cell">{quote.customer?.name || `Client ${index + 1}`}</div>
                         <div className="table-cell">{formatDate(quote.createdAt)}</div>
                         <div className="table-cell">
                           <span 
                             className="status-badge"
                             style={{ backgroundColor: getStatusColor(quote.status) }}
                           >
                             {quote.status || 'Pending'}
                           </span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pipeline' && (
            <div className="pipeline-view">
              <div className="pipeline-header">
                <h2>Customer Pipeline</h2>
                <p>Manage customers through the sales pipeline</p>
              </div>
              
              <div className="pipeline-columns">
                {Object.entries(pipelineCategories).map(([stageKey, stageInfo]) => (
                  <div key={stageKey} className="pipeline-column">
                    <div className="column-header" style={{ borderLeftColor: stageInfo.color }}>
                      <span className="stage-icon">{stageInfo.icon}</span>
                      <h3>{stageInfo.name}</h3>
                      <span className="customer-count">
                        {customers[stageKey]?.length || 0}
                      </span>
                    </div>
                    
                    <div className="customer-cards">
                      {customers[stageKey]?.map((customer, index) => (
                                                 <div key={customer._id || index} className="customer-card">
                           <div className="customer-header">
                             <h4>{customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.email}</h4>
                             <span className="quote-count">{customer.quoteCount || 0} quotes</span>
                           </div>
                          
                          <div className="customer-details">
                            <p>{customer.email}</p>
                            <p>Created: {formatDate(customer.createdAt)}</p>
                            {customer.latestQuote && (
                              <p>Latest: {formatCurrency(customer.latestQuote.total)}</p>
                            )}
                          </div>
                          
                          <div className="customer-actions">
                            <button 
                              className="btn btn-small"
                              onClick={() => moveCustomerToStage(customer._id, 'qualified')}
                            >
                              Move
                            </button>
                            <button className="btn btn-small btn-secondary">
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="status-view">
              <h2>System Status</h2>
              <div className="status-grid">
                <div className="status-card">
                  <h3>API Health</h3>
                  <div className="status-indicator online">Online</div>
                </div>
                <div className="status-card">
                  <h3>Database</h3>
                  <div className="status-indicator online">Connected</div>
                </div>
                <div className="status-card">
                  <h3>File Storage</h3>
                  <div className="status-indicator online">Available</div>
                </div>
                <div className="status-card">
                  <h3>PICRA Processing</h3>
                  <div className="status-indicator online">Active</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PipelineDashboard; 
