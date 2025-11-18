import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import './ClientReportView.css';

const ClientReportView = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [creatingEstimate, setCreatingEstimate] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load report');

      const data = await response.json();
      
      // Debug logging for images
      console.log('\n🖼️ === CLIENT DEBUG: Report Data Received ===');
      console.log('Report ID:', data.data._id);
      console.log('Report Number:', data.data.reportNumber);
      console.log('Line Items Count:', data.data.lineItems?.length || 0);
      
      if (data.data.lineItems && data.data.lineItems.length > 0) {
        data.data.lineItems.forEach((item, idx) => {
          console.log(`\n📋 Line Item ${idx + 1} (${item.lineItemNumber}):`);
          console.log('  - Description:', item.description?.substring(0, 50) + '...');
          console.log('  - Has images array:', !!item.images);
          console.log('  - Images array length:', item.images?.length || 0);
          console.log('  - Has legacy image:', !!item.image);
          console.log('  - Legacy image URL:', item.image?.gcsUrl || 'none');
          
          if (item.images && item.images.length > 0) {
            console.log('  - Images array:', item.images.map(img => ({
              filename: img.filename,
              hasUrl: !!img.gcsUrl,
              url: img.gcsUrl
            })));
          }
        });
      }
      console.log('🖼️ === END CLIENT DEBUG ===\n');
      
      setReport(data.data);
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Failed to load report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/${reportId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_Report_${report.reportNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateEstimateFromTasks = () => {
    if (!report || !report.tasks || report.tasks.length === 0) return;
    setCreatingEstimate(true);
    try {
      const preworkLineItems = report.tasks
        .filter(t => (t.description || '').trim().length > 0)
        .map((t) => ({
          description: t.description + (t.notes ? `\nNotes: ${t.notes}` : ''),
          quantity: t.suggestedQuantity || 1,
          unitPrice: 0,
          total: 0
        }));
      const customerId = (report.customer && (report.customer._id || report.customer.id)) || report.customerId || '';
      if (customerId) {
        navigate(`/estimates/new?customerId=${customerId}`, { state: { preworkLineItems, fromPreworkId: report._id } });
      } else {
        navigate('/estimates/new', { state: { preworkLineItems, fromPreworkId: report._id } });
      }
    } finally {
      setCreatingEstimate(false);
    }
  };

  const handleEdit = () => {
    navigate(`/inspection-report/edit?reportId=${reportId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(
      `Are you sure you want to delete this report?\n\n` +
      `Report: ${report.reportNumber}\n` +
      `Title: ${report.title}\n\n` +
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
      navigate(-1);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm(
      `Are you sure you want to finalize this report?\n\n` +
      `Report: ${report.reportNumber}\n` +
      `Title: ${report.title}\n\n` +
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
      loadReport(); // Reload to show updated status
    } catch (err) {
      console.error('Error finalizing report:', err);
      alert('Failed to finalize report: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return { bg: '#d4edda', text: '#155724' };
      case 'Needs Attention': return { bg: '#f8d7da', text: '#721c24' };
      case 'In Progress': return { bg: '#fff3cd', text: '#856404' };
      case 'Not Started': return { bg: '#e2e3e5', text: '#383d41' };
      case 'N/A': return { bg: '#f8f9fa', text: '#6c757d' };
      default: return { bg: '#e9ecef', text: '#495057' };
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case 'Draft': return { bg: '#fff3cd', text: '#856404' };
      case 'In Review': return { bg: '#cce5ff', text: '#004085' };
      case 'Approved': return { bg: '#d4edda', text: '#155724' };
      case 'Sent to Client': return { bg: '#d1ecf1', text: '#0c5460' };
      default: return { bg: '#e9ecef', text: '#6c757d' };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="client-report-view">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="client-report-view">
          <div className="error-container">
            <h2>Error Loading Report</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusColor = getReportStatusColor(report.status);
  const completionPercentage = report.lineItems?.length > 0 
    ? Math.round((report.lineItems.filter(item => item.inspectionStatus === 'Complete' || item.inspectionStatus === 'N/A').length / report.lineItems.length) * 100)
    : 0;

  return (
    <Layout>
      <div className="client-report-view">
        {/* Header Section */}
        <div className="report-view-header">
          <div className="header-top">
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Back
            </button>
            <div className="header-actions">
              {report.tasks && report.tasks.length > 0 && (
                <button onClick={handleCreateEstimateFromTasks} className="btn btn-secondary" disabled={creatingEstimate}>
                  {creatingEstimate ? 'Preparing...' : 'Create Estimate from Tasks'}
                </button>
              )}
              {(report.status === 'Draft' || report.status === 'In Review') && (
                <>
                  <button onClick={handleEdit} className="btn btn-secondary">
                    ✏️ Edit Report
                  </button>
                  <button onClick={handleFinalize} className="btn btn-success">
                    ✅ Finalize Report
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger">
                    🗑️ Delete
                  </button>
                </>
              )}
              <button 
                onClick={handleDownloadPdf} 
                disabled={downloading}
                className="btn btn-primary"
              >
                {downloading ? 'Generating...' : '📄 Download PDF'}
              </button>
            </div>
          </div>

          <div className="header-main">
            <div className="title-section">
              <h1>{report.title}</h1>
              <div className="report-meta">
                <span className="report-number">Report #{report.reportNumber}</span>
                <span 
                  className="status-badge"
                  style={{ 
                    background: statusColor.bg, 
                    color: statusColor.text 
                  }}
                >
                  {report.status}
                </span>
                {report.reportType && (
                  <span className="status-badge" style={{ background: '#eee', color: '#333' }}>
                    {report.reportType}
                  </span>
                )}
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Customer</label>
                <span>{report.customerName}</span>
              </div>
              <div className="info-item">
                <label>Report Date</label>
                <span>{formatDate(report.reportDate)}</span>
              </div>
              {report.contractId && (
                <div className="info-item">
                  <label>Contract</label>
                  <span>{typeof report.contractId === 'object' ? (report.contractId.contractNumber || report.contractId.title || report.contractId._id) : report.contractId}</span>
                </div>
              )}
              {report.propertyAddress && (
                <div className="info-item full-width">
                  <label>Property Address</label>
                  <span>{report.propertyAddress}</span>
                </div>
              )}
              <div className="info-item">
                <label>Created</label>
                <span>{formatDateTime(report.createdAt)}</span>
              </div>
              {report.updatedAt && (
                <div className="info-item">
                  <label>Updated</label>
                  <span>{formatDateTime(report.updatedAt)}</span>
                </div>
              )}
              {report.technicianName && (
                <div className="info-item">
                  <label>Technician</label>
                  <span>{report.technicianName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion Progress */}
        {report.lineItems && report.lineItems.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <h3>Completion Status</h3>
              <span className="percentage">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span>{report.lineItems.filter(i => i.inspectionStatus === 'Complete').length} Complete</span>
              <span>{report.lineItems.filter(i => i.inspectionStatus === 'N/A').length} N/A</span>
              <span>{report.lineItems.filter(i => i.inspectionStatus === 'Needs Attention').length} Need Attention</span>
              <span>{report.lineItems.filter(i => i.inspectionStatus === 'In Progress').length} In Progress</span>
              <span>{report.lineItems.filter(i => i.inspectionStatus === 'Not Started').length} Not Started</span>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        {report.executiveSummary && (
          <div className="report-section">
            <h2>Executive Summary</h2>
            <p className="text-content">{report.executiveSummary}</p>
          </div>
        )}

        {/* Work Performed */}
        {report.workPerformed && (
          <div className="report-section">
            <h2>Work Performed</h2>
            <p className="text-content">{report.workPerformed}</p>
          </div>
        )}

        {/* Tasks (Pre-Work) */}
        {report.tasks && report.tasks.length > 0 && (
          <div className="report-section">
            <h2>Tasks ({report.tasks.length})</h2>
            {/* Task Summary */}
            <div className="progress-stats" style={{ marginBottom: '12px' }}>
              <span>{report.tasks.filter(t => (t.status || 'Not Started') === 'Complete').length} Complete</span>
              <span>{report.tasks.filter(t => (t.status || 'Not Started') === 'In Progress').length} In Progress</span>
              <span>{report.tasks.filter(t => (t.status || 'Not Started') === 'Needs Attention').length} Need Attention</span>
              <span>{report.tasks.filter(t => (t.status || 'Not Started') === 'Not Started').length} Not Started</span>
            </div>
            <div className="line-items-list">
              {report.tasks.map((task, index) => {
                const taskStatus = task.status || 'Not Started';
                const color = getStatusColor(taskStatus);
                return (
                  <div key={index} className="line-item-view-card">
                    <div className="item-header">
                      <div className="item-number">#{task.taskNumber || index + 1}</div>
                      <div className="item-title">
                        <h3>{task.description || 'Task'}</h3>
                        <div className="item-details">
                          {task.suggestedQuantity ? <span>Qty: {task.suggestedQuantity}</span> : null}
                          {task.completedAt ? <span>Completed: {formatDate(task.completedAt)}</span> : null}
                        </div>
                      </div>
                      <span 
                        className="item-status"
                        style={{ background: color.bg, color: color.text }}
                      >
                        {taskStatus}
                      </span>
                    </div>

                    {task.notes && (
                      <div className="item-notes">
                        <strong>Notes:</strong>
                        <p>{task.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Line Items */}
        {report.lineItems && report.lineItems.length > 0 && (
          <div className="report-section">
            <h2>Line Items ({report.lineItems.length})</h2>
            <div className="line-items-list">
              {report.lineItems.map((item, index) => {
                const itemStatusColor = getStatusColor(item.inspectionStatus);
                return (
                  <div key={index} className="line-item-view-card">
                    <div className="item-header">
                      <div className="item-number">#{item.lineItemNumber}</div>
                      <div className="item-title">
                        <h3>{item.description}</h3>
                        <div className="item-details">
                          {item.quantity && <span>Qty: {item.quantity}</span>}
                          {item.unitPrice && <span>Unit: ${item.unitPrice.toFixed(2)}</span>}
                          {item.totalPrice && <span>Total: ${item.totalPrice.toFixed(2)}</span>}
                          {item.sourceType === 'amendment' && (
                            <span className="amendment-tag">
                              From Amendment {item.amendmentNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <span 
                        className="item-status"
                        style={{
                          background: itemStatusColor.bg,
                          color: itemStatusColor.text
                        }}
                      >
                        {item.inspectionStatus}
                      </span>
                    </div>

                    {item.inspectionNotes && (
                      <div className="item-notes">
                        <strong>Notes:</strong>
                        <p>{item.inspectionNotes}</p>
                      </div>
                    )}

                    {/* Display multiple images or single legacy image */}
                    {((item.images && item.images.length > 0) || item.image?.gcsUrl) && (
                      <div className="item-images">
                        {item.images && item.images.length > 0 ? (
                          // Multiple images
                          <div className="images-grid">
                            {item.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="item-image">
                                <div className="image-number-badge">{imgIndex + 1}</div>
                                <img src={img.gcsUrl} alt={`${item.description} - Photo ${imgIndex + 1}`} />
                                {img.caption && (
                                  <p className="image-caption">{img.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Legacy single image
                          <div className="item-image">
                            <img src={item.image.gcsUrl} alt={item.description} />
                            {item.image.caption && (
                              <p className="image-caption">{item.image.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Materials Used */}
        {report.materialsUsed && report.materialsUsed.length > 0 && (
          <div className="report-section">
            <h2>Materials Used</h2>
            <ul className="materials-list">
              {report.materialsUsed.map((material, index) => (
                <li key={index}>
                  <strong>{material.item}</strong>
                  {material.quantity && ` (${material.quantity} ${material.unit || 'units'})`}
                  {material.description && <p>{material.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Report Images (non-line-item) */}
        {report.images && report.images.length > 0 && (
          <div className="report-section">
            <h2>Photos</h2>
            <div className="line-items-list">
              <div className="images-grid">
                {report.images.map((img, idx) => (
                  <div key={idx} className="item-image">
                    <div className="image-number-badge">{idx + 1}</div>
                    <img src={img.gcsUrl} alt={img.caption || `Photo ${idx + 1}`} />
                    {img.caption && <p className="image-caption">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="report-section">
            <h2>Recommendations</h2>
            <div className="recommendations-list">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-header">
                    <span className={`priority-badge priority-${rec.priority?.toLowerCase() || 'medium'}`}>
                      {rec.priority || 'Medium'}
                    </span>
                    <p>{rec.description}</p>
                  </div>
                  {rec.estimatedCost && (
                    <span className="rec-cost">Est. Cost: ${rec.estimatedCost.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="report-footer-info">
          <div className="footer-item">
            <label>Created:</label>
            <span>{formatDate(report.createdAt)}</span>
          </div>
          {report.updatedAt && report.updatedAt !== report.createdAt && (
            <div className="footer-item">
              <label>Last Updated:</label>
              <span>{formatDate(report.updatedAt)}</span>
            </div>
          )}
          {report.technicianName && (
            <div className="footer-item">
              <label>Technician:</label>
              <span>{report.technicianName}</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClientReportView;

