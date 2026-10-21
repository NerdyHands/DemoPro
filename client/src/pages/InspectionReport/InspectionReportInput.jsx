import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import ImageDropzone from '../../components/ImageDropzone/ImageDropzone.jsx';
import './InspectionReportInput.css';

const InspectionReportInput = () => {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contractData, setContractData] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    propertyAddress: ''
  });

  useEffect(() => {
    if (reportId) {
      loadExistingReport();
    } else if (contractId) {
      loadContractLineItems();
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
        propertyAddress: report.propertyAddress || ''
      });

      // Process line items and preserve existing images
      const processedLineItems = (report.lineItems || []).map(item => {
        // Handle both single image (legacy) and multiple images
        let itemImages = [];
        
        if (item.images && item.images.length > 0) {
          // New format: multiple images
          itemImages = item.images.map((img, idx) => ({
            gcsUrl: img.gcsUrl,
            originalName: img.originalName,
            size: img.size,
            mimeType: img.mimeType,
            order: img.order || idx,
            isNew: false
          }));
        } else if (item.image && item.image.gcsUrl) {
          // Legacy format: single image - convert to array
          itemImages = [{
            gcsUrl: item.image.gcsUrl,
            originalName: item.image.originalName,
            size: item.image.size,
            mimeType: item.image.mimeType,
            order: 0,
            isNew: false
          }];
        }
        
        return {
          ...item,
          itemImages: itemImages
        };
      });

      setLineItems(processedLineItems);
      
      const contractIdToUse = report.contractId?._id || report.contractId;
      
      setContractData({
        contractId: contractIdToUse,
        contractNumber: report.contractId?.contractNumber || 'N/A',
        customerName: report.customerName,
        customerId: report.customerId || report.customer?._id
      });

      // If no line items in report, load from contract as fallback
      if (processedLineItems.length === 0 && contractIdToUse) {
        console.log('⚠️ Report has no line items, loading from contract...');
        await loadLineItemsFromContract(contractIdToUse);
      }

    } catch (err) {
      console.error('Error loading report:', err);
      setError('Failed to load report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLineItemsFromContract = async (contractId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/contract-line-items/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load contract line items');

      const data = await response.json();
      console.log('✅ Loaded line items from contract:', data.data.lineItems.length);
      
      setLineItems(data.data.lineItems);
      
      // Update contract data with amendment info
      setContractData(prev => ({
        ...prev,
        amendmentsApplied: data.data.amendmentsApplied
      }));
    } catch (err) {
      console.error('Error loading contract line items:', err);
      setError('Failed to load contract line items: ' + err.message);
    }
  };

  const loadContractLineItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/client-reports/contract-line-items/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load contract line items');

      const data = await response.json();
      
      console.log('✅ Loaded contract with line items:', data.data.lineItems.length);
      console.log('📋 Contract data:', {
        contractId: data.data.contractId,
        contractNumber: data.data.contractNumber,
        customerId: data.data.customerId,
        customerIdType: typeof data.data.customerId,
        customerName: data.data.customerName
      });
      
      setContractData({
        contractId: data.data.contractId,
        contractNumber: data.data.contractNumber,
        customerId: data.data.customerId,
        customerName: data.data.customerName,
        propertyAddress: data.data.propertyAddress,
        originalAmount: data.data.originalAmount,
        amendmentsApplied: data.data.amendmentsApplied
      });

      setLineItems(data.data.lineItems);
      
      // Set default report data
      setReportData({
        title: `Inspection Report - ${data.data.contractNumber}`,
        description: `Final inspection report for ${data.data.customerName}`,
        propertyAddress: data.data.propertyAddress || ''
      });

    } catch (err) {
      console.error('Error loading contract line items:', err);
      setError('Failed to load contract line items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportDataChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLineItems(updated);
  };

  const handleImagesChange = (index, images) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      itemImages: images
    };
    setLineItems(updated);
  };

  const handleSaveDraft = async () => {
    await saveReport('Draft');
  };

  const handleGeneratePdf = async () => {
    await saveReport('In Review', true);
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
        status: status,
        lineItems: lineItems.map(item => {
          // Separate existing images from new uploads
          const existingImages = (item.itemImages || [])
            .filter(img => !img.isNew && img.gcsUrl)
            .map(img => ({
              filename: img.filename,
              originalName: img.originalName,
              gcsUrl: img.gcsUrl,
              size: img.size,
              mimeType: img.mimeType,
              order: img.order
            }));

          return {
            lineItemNumber: item.lineItemNumber,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            inspectionStatus: item.inspectionStatus || 'Not Started',
            inspectionNotes: item.inspectionNotes || '',
            sourceType: item.sourceType,
            amendmentId: item.amendmentId,
            images: existingImages
          };
        })
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

      console.log('📤 Saving report with payload:', {
        customerId: reportPayload.customerId,
        contractId: reportPayload.contractId,
        title: reportPayload.title,
        status: reportPayload.status,
        lineItemsCount: reportPayload.lineItems?.length
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

      // Upload new images for line items
      console.log('📷 Starting image uploads...');
      let totalImagesUploaded = 0;
      
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        const newImages = (item.itemImages || []).filter(img => img.isNew && img.file);
        
        if (newImages.length > 0) {
          console.log(`📋 Uploading ${newImages.length} images for line item ${item.lineItemNumber}`);
          
          const formData = new FormData();
          
          // Append all new image files
          newImages.forEach(img => {
            formData.append('images', img.file);
          });
          
          formData.append('lineItemNumber', item.lineItemNumber);
          formData.append('caption', item.inspectionNotes || item.description);

          try {
            const uploadResponse = await fetch(`/api/client-reports/${savedReportId}/images`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || 'Upload failed');
            }

            const uploadResult = await uploadResponse.json();
            console.log(`✅ Uploaded ${uploadResult.data?.uploadedImages?.length || newImages.length} images for line item ${item.lineItemNumber}`);
            console.log('📤 Upload response:', {
              success: uploadResult.success,
              imagesUploaded: uploadResult.data?.uploadedImages?.map(img => ({
                filename: img.filename,
                gcsUrl: img.gcsUrl,
                order: img.order
              }))
            });
            totalImagesUploaded += uploadResult.data?.uploadedImages?.length || newImages.length;
          } catch (uploadError) {
            console.error(`❌ Error uploading images for line item ${item.lineItemNumber}:`, uploadError);
            alert(`Warning: Failed to upload images for line item ${item.lineItemNumber}. Error: ${uploadError.message}`);
          }
        }
      }

      if (totalImagesUploaded > 0) {
        console.log(`✅ Total images uploaded: ${totalImagesUploaded}`);
      }

      if (generatePdf) {
        // Generate PDF
        const pdfResponse = await fetch(`/api/client-reports/${savedReportId}/pdf`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Inspection_Report_${contractData.contractNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }

      alert(`Report ${reportId ? 'updated' : 'created'} successfully!`);
      navigate(`/client-reports/${savedReportId}`);

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
        <div className="inspection-report-input">
          <div className="loading">Loading contract line items...</div>
        </div>
      </Layout>
    );
  }

  if (error && !contractData) {
    return (
      <Layout>
        <div className="inspection-report-input">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="inspection-report-input">
        <div className="report-header">
          <div className="header-content">
            <h1>{reportId ? 'Edit Inspection Report' : 'Create Inspection Report'}</h1>
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
                  ✏️ Editing existing report
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
              className="btn btn-primary"
            >
              {saving ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Report Information Section */}
        <div className="report-section">
          <h2>Report Information</h2>
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
              />
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="report-section">
          <div className="section-header-with-badge">
            <div>
              <h2>Contract Line Items - Final Scope</h2>
              <p className="section-description">
                ✓ All {lineItems.length} line items from your contract (including approved amendments) are preloaded below.
                Document each item with status, photos, and comments.
              </p>
            </div>
            <div className="preload-badge">
              ✓ Preloaded from Contract
            </div>
          </div>

          {lineItems.length === 0 ? (
            <div className="no-items-message">
              <p><strong>No line items found.</strong></p>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                This could happen if:
              </p>
              <ul style={{ textAlign: 'left', marginTop: '8px', fontSize: '14px' }}>
                <li>The contract doesn't have any line items defined</li>
                <li>The contract ID is invalid</li>
                <li>There was an error loading the data</li>
              </ul>
              <p style={{ marginTop: '12px', fontSize: '14px' }}>
                Check the browser console for more details or go back and try again.
              </p>
            </div>
          ) : (
            <div className="line-items-container">
              {lineItems.map((item, index) => (
                <div key={index} className="line-item-card">
                  <div className="line-item-header">
                    <div className="line-item-number">#{item.lineItemNumber}</div>
                    <div className="line-item-description">
                      <h3>{item.description}</h3>
                      <div className="line-item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>Unit Price: ${item.unitPrice?.toFixed(2)}</span>
                        <span>Total: ${item.totalPrice?.toFixed(2)}</span>
                        {item.sourceType === 'amendment' && (
                          <span className="amendment-badge">
                            From Amendment {item.amendmentNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="line-item-content">
                    {/* Status Selection */}
                    <div className="form-group status-group">
                      <label>Status *</label>
                      <select
                        value={item.inspectionStatus || 'Not Started'}
                        onChange={(e) => handleLineItemChange(index, 'inspectionStatus', e.target.value)}
                        className="form-select"
                      >
                        <option value="Complete">✓ Complete</option>
                        <option value="Needs Attention">⚠ Needs Attention</option>
                        <option value="In Progress">🔄 In Progress</option>
                        <option value="Not Started">⏸ Not Started</option>
                        <option value="N/A">➖ N/A</option>
                      </select>
                    </div>

                    {/* Notes/Comments Section */}
                    <div className="form-group comments-group">
                      <div className="label-with-button">
                        <label>Comments & Notes</label>
                        {!item.inspectionNotes && (
                          <button
                            type="button"
                            className="btn-add-comment"
                            onClick={() => {
                              const textarea = document.getElementById(`notes-${index}`);
                              if (textarea) textarea.focus();
                            }}
                          >
                            💬 Add Comment
                          </button>
                        )}
                      </div>
                      <textarea
                        id={`notes-${index}`}
                        value={item.inspectionNotes || ''}
                        onChange={(e) => handleLineItemChange(index, 'inspectionNotes', e.target.value)}
                        className="form-textarea"
                        rows="3"
                        placeholder="Describe work performed, materials used, any issues encountered..."
                      />
                      {item.inspectionNotes && (
                        <div className="char-count">
                          {item.inspectionNotes.length} characters
                        </div>
                      )}
                    </div>

                    {/* Image Upload Section - Multiple Photos with Drag & Drop */}
                    <div className="form-group photo-group full-width">
                      <label>Photo Documentation</label>
                      <p className="field-hint">Upload multiple photos and drag to reorder them</p>
                      <ImageDropzone
                        images={item.itemImages || []}
                        onImagesChange={(images) => handleImagesChange(index, images)}
                        maxImages={10}
                      />
                    </div>
                  </div>

                  {/* Completion Indicator */}
                  <div className="line-item-completion">
                    {item.inspectionStatus === 'Complete' && item.inspectionNotes && (item.itemImages && item.itemImages.length > 0) ? (
                      <span className="completion-badge complete">✓ Fully Documented ({item.itemImages.length} photo{item.itemImages.length !== 1 ? 's' : ''})</span>
                    ) : item.inspectionStatus && item.inspectionStatus !== 'Not Started' ? (
                      <span className="completion-badge partial">⚠ Partially Documented</span>
                    ) : (
                      <span className="completion-badge pending">⏸ Not Started</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
              className="btn btn-primary"
            >
              {saving ? 'Generating...' : 'Save & Generate PDF'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InspectionReportInput;

