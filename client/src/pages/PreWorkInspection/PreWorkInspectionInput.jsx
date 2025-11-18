import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import ImageDropzone from '../../components/ImageDropzone/ImageDropzone.jsx';
import './PreWorkInspectionInput.css';

const PreWorkInspectionInput = () => {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contractData, setContractData] = useState(null);
  // Findings collected during pre-work inspection (no contract line items yet)
  const [findings, setFindings] = useState([
    {
      id: 1,
      description: '',
      notes: '',
      suggestedQuantity: 1,
      images: []
    }
  ]);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    propertyAddress: '',
    reportType: 'Pre-Work Inspection'
  });

  useEffect(() => {
    if (reportId) {
      loadExistingReport();
    } else if (contractId) {
      loadContractSummary();
    }
  }, [contractId, reportId]);

  const loadExistingReport = async () => {
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
      const report = data.data;

      // Check if report can be edited
      if (report.status === 'Approved' || report.status === 'Sent to Client') {
        alert(`This report has been ${report.status.toLowerCase()} and can no longer be edited.`);
        navigate(`/client-reports/${reportId}`);
        return;
      }

      setReportData({
        title: report.title || '',
        description: report.description || '',
        propertyAddress: report.propertyAddress || '',
        reportType: 'Pre-Work Inspection'
      });

      // If existing report contains tasks (findings), attach images grouped by taskNumber with robust parsing
      console.log('📸 Loading report images:', report.images);
      const imagesByTask = {};
      const extractTaskNumber = (img) => {
        if (img.taskNumber !== undefined && img.taskNumber !== null && img.taskNumber !== '') {
          const n = Number(img.taskNumber);
          if (!Number.isNaN(n)) return n;
        }
        if (img.caption && typeof img.caption === 'string') {
          const m = img.caption.match(/Task\s*#(\d+)/i);
          if (m && m[1]) {
            const n = Number(m[1]);
            if (!Number.isNaN(n)) return n;
          }
        }
        return undefined;
      };
      (report.images || []).forEach((img) => {
        const tn = extractTaskNumber(img);
        console.log(`Image ${img.originalName}: taskNumber=${tn}`);
        if (!tn) return;
        if (!imagesByTask[tn]) imagesByTask[tn] = [];
        imagesByTask[tn].push({
          filename: img.filename,
          originalName: img.originalName,
          gcsUrl: img.gcsUrl,
          size: img.size,
          mimeType: img.mimeType,
          order: img.order || 0,
          isNew: false
        });
      });
      console.log('📸 Images grouped by task:', imagesByTask);

      const existingFindings = (report.tasks || []).map((t, idx) => {
        const taskId = t.taskNumber || (idx + 1);
        const taskImages = imagesByTask[taskId] || [];
        console.log(`Task #${taskId}: ${taskImages.length} images attached`);
        return {
          id: taskId,
          description: t.description || '',
          notes: t.notes || '',
          suggestedQuantity: t.suggestedQuantity || 1,
          images: taskImages
        };
      });
      if (existingFindings.length > 0) {
        setFindings(existingFindings);
        console.log('✅ Findings loaded with images:', existingFindings);
      }
      
      const contractIdToUse = report.contractId?._id || report.contractId;
      
      setContractData({
        contractId: contractIdToUse,
        contractNumber: report.contractId?.contractNumber || 'N/A',
        customerName: report.customerName,
        customerId: report.customerId || report.customer?._id
      });

      // No line items for pre-work phase

    } catch (err) {
      console.error('Error loading report:', err);
      setError('Failed to load report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Minimal contract summary for header context only
  const loadContractSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load contract');
      const data = await response.json();
      const contract = data.contract;
      setContractData({
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        customerName: contract.customer ? `${contract.customer.firstName} ${contract.customer.lastName}` : '',
        customerId: (contract.customer && (contract.customer._id || contract.customer.id)) || contract.customerId,
        propertyAddress: contract.propertyAddress,
        amendmentsApplied: 0
      });
      setReportData(prev => ({
        ...prev,
        title: `Pre-Work Inspection - ${contract.contractNumber}`,
        description: `Pre-work findings for ${contract.customer ? `${contract.customer.firstName} ${contract.customer.lastName}` : 'customer'}`,
        propertyAddress: contract.propertyAddress || ''
      }));
    } catch (err) {
      console.error('Error loading contract:', err);
      setError('Failed to load contract: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Removed contract line items fetching for pre-work phase

  const handleReportDataChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFindingChange = (id, field, value) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleFindingImagesChange = (id, images) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, images } : f));
  };

  const addFinding = () => {
    const newId = Math.max(...findings.map(f => f.id)) + 1;
    setFindings(prev => ([...prev, {
      id: newId,
      description: '',
      notes: '',
      suggestedQuantity: 1,
      images: []
    }]));
  };

  const removeFinding = (id) => {
    if (findings.length <= 1) return;
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveDraft = async () => {
    await saveReport('Draft');
  };

  const handleGeneratePdf = async () => {
    await saveReport('In Review', true);
  };

  const handleCreateEstimate = async () => {
    const savedId = await saveReport('Draft', false);
    // Map findings into simple line items for estimate prefill
    const preworkLineItems = findings
      .filter(f => f.description && f.suggestedQuantity > 0)
      .map((f) => ({
        description: f.description + (f.notes ? `\nNotes: ${f.notes}` : ''),
        quantity: f.suggestedQuantity || 1,
        unitPrice: 0,
        total: 0
      }));
    // Navigate to new estimate with prefilled items via navigation state
    if (contractData?.customerId) {
      navigate(`/estimates/new?customerId=${contractData.customerId}`, { state: { preworkLineItems, fromPreworkId: savedId } });
    } else {
      navigate('/estimates/new', { state: { preworkLineItems, fromPreworkId: savedId } });
    }
  };

  const saveReport = async (status = 'Draft', generatePdf = false) => {
    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('authToken');

      // Create or update report
      const isValidObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
      const reportPayload = {
        contractId: contractData.contractId,
        title: reportData.title,
        description: reportData.description,
        propertyAddress: reportData.propertyAddress,
        reportType: 'Pre-Work Inspection',
        status: status,
        // No line items at pre-work; store findings as tasks for reference
        tasks: findings.map((f, idx) => ({
          taskNumber: idx + 1,
          description: f.description,
          notes: f.notes,
          suggestedQuantity: f.suggestedQuantity,
          status: 'Not Started'
        }))
      };

      // Only include customerId if it's a valid ObjectId
      if (isValidObjectId(contractData.customerId)) {
        reportPayload.customerId = contractData.customerId;
      } else {
        console.error('❌ Invalid customerId:', contractData.customerId);
        setError('Invalid customer ID. Please try again.');
        setSaving(false);
        return;
      }

      console.log('📤 Saving pre-work inspection with payload:', {
        customerId: reportPayload.customerId,
        contractId: reportPayload.contractId,
        title: reportPayload.title,
        status: reportPayload.status,
        tasksCount: reportPayload.tasks?.length
      });

      let reportResponse;
      if (reportId) {
        // Update existing report
        reportResponse = await fetch(`/api/client-reports/${reportId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportPayload)
        });
      } else {
        // Create new report
        reportResponse = await fetch('/api/client-reports', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportPayload)
        });
      }

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json();
        console.error('❌ Failed to save report:', errorData);
        throw new Error(errorData.details?.[0]?.msg || errorData.error || 'Failed to save report');
      }

      const savedReport = await reportResponse.json();
      const savedReportId = savedReport.data._id;

      // Upload report-level images (no line items at pre-work)
      console.log('📷 Starting report-level image uploads...');
      let totalImagesUploaded = 0;
      for (let fi = 0; fi < findings.length; fi++) {
        const f = findings[fi];
        const taskNumber = fi + 1; // Use same numbering as report payload
        const newImages = (f.images || []).filter(img => img.isNew && img.file);
        if (newImages.length === 0) continue;

        const formData = new FormData();
        // Append all files first
        newImages.forEach(img => { formData.append('images', img.file); });
        // For each image, append aligned caption, category, and taskNumber
        newImages.forEach(() => {
          const caption = `Task #${taskNumber}: ${f.description?.slice(0, 80) || 'Photo'}`;
          formData.append('captions[]', caption);
          formData.append('categories[]', 'Before');
          formData.append('taskNumbers[]', String(taskNumber)); // Use consistent task numbering
        });

        try {
          const uploadResponse = await fetch(`/api/client-reports/${savedReportId}/images`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Upload failed');
          }
          const uploadResult = await uploadResponse.json();
          totalImagesUploaded += uploadResult.data?.uploadedImages?.length || newImages.length;
        } catch (uploadError) {
          console.error(`❌ Error uploading images for task ${taskNumber}:`, uploadError);
          alert(`Warning: Failed to upload images for task ${taskNumber}. Error: ${uploadError.message}`);
        }
      }
      if (totalImagesUploaded > 0) console.log(`✅ Total images uploaded: ${totalImagesUploaded}`);

      if (generatePdf) {
        const pdfResponse = await fetch(`/api/client-reports/${savedReportId}/pdf`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PreWork_Inspection_${contractData?.contractNumber || savedReportId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }

      alert(`Pre-work inspection ${reportId ? 'updated' : 'created'} successfully!`);
      return savedReportId;

    } catch (err) {
      console.error('Error saving report:', err);
      setError('Failed to save report: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="prework-inspection-input">
          <div className="loading">Loading contract line items...</div>
        </div>
      </Layout>
    );
  }

  if (error && !contractData) {
    return (
      <Layout>
        <div className="prework-inspection-input">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="prework-inspection-input">
        <div className="report-header">
          <div className="header-content">
            <h1>{reportId ? 'Edit Pre-Work Inspection' : 'Create Pre-Work Inspection'}</h1>
            <div className="report-type-badge">Before Work Documentation</div>
            <div className="contract-info">
              <p><strong>Contract:</strong> {contractData?.contractNumber}</p>
              <p><strong>Customer:</strong> {contractData?.customerName}</p>
              {contractData?.amendmentsApplied > 0 && (
                <p className="amendments-badge">
                  ✓ {contractData.amendmentsApplied} Amendment{contractData.amendmentsApplied > 1 ? 's' : ''} Applied
                </p>
              )}
              {reportId && (
                <p style={{ color: '#08a171', fontSize: '13px', fontWeight: '500' }}>
                  ✏️ Editing existing inspection
                </p>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="btn btn-secondary"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handleGeneratePdf} 
              disabled={saving}
              className="btn btn-secondary"
            >
              {saving ? 'Generating...' : 'Generate PDF'}
            </button>
            <button 
              onClick={handleCreateEstimate} 
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Preparing...' : 'Save & Create Estimate'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Report Information Section */}
        <div className="report-section">
          <h2>Inspection Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => handleReportDataChange('title', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Property Address</label>
              <input
                type="text"
                value={reportData.propertyAddress}
                onChange={(e) => handleReportDataChange('propertyAddress', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={reportData.description}
                onChange={(e) => handleReportDataChange('description', e.target.value)}
                className="form-textarea"
                rows="3"
                placeholder="Brief description of the pre-work inspection..."
              />
            </div>
          </div>
        </div>

        {/* Findings Section (no contract line items at pre-work) */}
        <div className="report-section">
          <div className="section-header-with-badge">
            <div>
              <h2>Tasks</h2>
              <p className="section-description">
                Document tasks you recommend before creating an estimate. These will flow into a new estimate as draft line items.
              </p>
            </div>
          </div>

          <div className="line-items-container">
            {findings.map((f, index) => (
              <div key={f.id} className="line-item-card">
                <div className="line-item-header">
                  <div className="line-item-number">#{index + 1}</div>
                  <div className="line-item-description">
                    <h3>Task</h3>
                    <div className="line-item-meta">
                      <span>
                        Suggested Qty:&nbsp;
                        <input
                          type="number"
                          min="1"
                          value={f.suggestedQuantity}
                          onChange={(e) => handleFindingChange(f.id, 'suggestedQuantity', parseFloat(e.target.value) || 1)}
                          className="form-input"
                          style={{ width: '90px' }}
                        />
                      </span>
                    </div>
                  </div>
                  {findings.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFinding(f.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="line-item-content">
                  <div className="form-group full-width">
                    <label>Task Description *</label>
                    <textarea
                      value={f.description}
                      onChange={(e) => handleFindingChange(f.id, 'description', e.target.value)}
                      className="form-textarea"
                      rows="3"
                      placeholder="Describe the recommended work..."
                    />
                  </div>

                  <div className="form-group comments-group">
                    <label>Notes</label>
                    <textarea
                      value={f.notes}
                      onChange={(e) => handleFindingChange(f.id, 'notes', e.target.value)}
                      className="form-textarea"
                      rows="3"
                      placeholder="Additional context, measurements, access constraints, etc."
                    />
                  </div>

                  <div className="form-group photo-group full-width">
                    <label>Photos</label>
                    <p className="field-hint">Upload photos related to this finding. Drag to reorder.</p>
                    <ImageDropzone
                      images={f.images || []}
                      onImagesChange={(images) => handleFindingImagesChange(f.id, images)}
                      maxImages={10}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={addFinding}>+ Add Another Finding</button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="report-footer">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <div className="footer-actions">
            <button 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="btn btn-secondary"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handleGeneratePdf} 
              disabled={saving}
              className="btn btn-secondary"
            >
              {saving ? 'Generating...' : 'Generate PDF'}
            </button>
            <button 
              onClick={handleCreateEstimate} 
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Preparing...' : 'Save & Create Estimate'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PreWorkInspectionInput;

