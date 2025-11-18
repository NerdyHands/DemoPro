import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import ProgressModal from '../../components/ProgressModal/ProgressModal.jsx';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRecords, setProcessingRecords] = useState([]);
  
  // Upload state
  const [picraFile, setPicraFile] = useState(null);
  const [inspectionFile, setInspectionFile] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileValidationErrors, setFileValidationErrors] = useState({});

  // Load project data on component mount
  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProjectData = async () => {
      if (!projectId) {
        console.error('❌ [ProjectDetails] No project ID provided');
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      console.log('🔍 [ProjectDetails] Loading project with ID:', projectId);

      try {
        setLoading(true);
        setError(null);
        
        // Load project details
        const response = await apiService.getProject(projectId);
        console.log('🔍 [ProjectDetails] Raw project response:', response);
        
        // Handle different response formats
        let projectData = response;
        if (response && response.project) {
          projectData = response.project;
        } else if (response && response.data) {
          projectData = response.data;
        }
        
        console.log('🔍 [ProjectDetails] Processed project data:', projectData);
        
        // Ensure project data is valid
        if (projectData && typeof projectData === 'object') {
          setProject(projectData);
        } else {
          console.error('❌ [ProjectDetails] Invalid project data received:', projectData);
          setError('Invalid project data received from server.');
          return;
        }
        
        // Load processing records for this project
        try {
          console.log('🔍 [ProjectDetails] Loading processing records for project:', projectId);
          const records = await apiService.getProjectPICRAProcessingRecords(projectId);
          console.log('🔍 [ProjectDetails] Raw processing records response:', records);
          
          // Ensure we have an array of processing records
          let processingRecordsArray = [];
          if (records) {
            if (Array.isArray(records)) {
              processingRecordsArray = records;
            } else if (records.processingRecords && Array.isArray(records.processingRecords)) {
              processingRecordsArray = records.processingRecords;
            } else if (records.data && Array.isArray(records.data)) {
              processingRecordsArray = records.data;
            } else if (records.records && Array.isArray(records.records)) {
              processingRecordsArray = records.records;
            }
          }
          
          console.log('🔧 [ProjectDetails] Processed processing records:', processingRecordsArray);
          setProcessingRecords(processingRecordsArray);
        } catch (recordsError) {
          console.warn('⚠️ [ProjectDetails] Could not load processing records:', recordsError);
          setProcessingRecords([]);
        }
        
      } catch (err) {
        console.error('❌ [ProjectDetails] Failed to load project:', err);
        
        // Check if it's an authentication error
        if (err.message.includes('401') || err.message.includes('Authentication')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          navigate('/login');
          return;
        }
        
        // Check if it's a 404 error (project not found)
        if (err.message.includes('404') || err.message.includes('not found')) {
          setError('Project not found. It may have been deleted or you may not have access to it.');
        } else {
          setError('Failed to load project details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, navigate]);

  // File validation helper
  const validateFile = (file, fileType) => {
    const errors = [];
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please select a PDF or Word document');
    }
    
    // Check file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('File must be a PDF or Word document');
    }
    
    return errors;
  };

  const handlePicraFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const errors = validateFile(file, 'picra');
      
      if (errors.length > 0) {
        setFileValidationErrors(prev => ({ ...prev, picra: errors }));
        alert(`PICRA file validation failed:\n${errors.join('\n')}`);
        e.target.value = '';
        setPicraFile(null);
        return;
      }
      
      setPicraFile(file);
      setFileValidationErrors(prev => ({ ...prev, picra: [] }));
      setError(''); // Clear any previous errors
    }
  };

  const handleInspectionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const errors = validateFile(file, 'inspection');
      
      if (errors.length > 0) {
        setFileValidationErrors(prev => ({ ...prev, inspection: errors }));
        alert(`Inspection file validation failed:\n${errors.join('\n')}`);
        e.target.value = '';
        setInspectionFile(null);
        return;
      }
      
      setInspectionFile(file);
      setFileValidationErrors(prev => ({ ...prev, inspection: [] }));
      setError(''); // Clear any previous errors
    }
  };

  const handleUploadDocuments = async () => {
    // Clear previous errors
    setError('');
    setUploadStatus('');
    setFileValidationErrors({});
    
    if (!picraFile && !inspectionFile) {
      setError('Please select at least one file to upload.');
      return;
    }

    // Show progress modal
    setShowProgressModal(true);
    setUploadStatus('Starting upload...');

    try {
      // Check authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('🔍 [ProjectDetails] Starting document upload for project:', projectId);
      
      // Get user profile for upload
      setUploadStatus('Loading user profile...');
      const userProfile = await apiService.getUserProfile();
      console.log('✅ [ProjectDetails] User profile loaded:', userProfile);
      
      // Upload files and create reports
      const uploadResults = [];

      if (picraFile) {
        setUploadStatus('Uploading PICRA document...');
        console.log('🔍 [ProjectDetails] Uploading PICRA file:', picraFile.name);
        
        const picraFormData = new FormData();
        picraFormData.append('file', picraFile);
        picraFormData.append('projectId', projectId);
        picraFormData.append('title', `PICRA Report - ${project.name}`);
        picraFormData.append('description', `Property PICRA document for ${project.name}`);
        picraFormData.append('fileType', 'picra');
        picraFormData.append('metadata', JSON.stringify({
          originalName: picraFile.name,
          fileSize: picraFile.size,
          mimeType: picraFile.type,
          uploadDate: new Date().toISOString(),
          uploadedBy: userProfile._id || userProfile.id
        }));
        
        try {
          const picraResult = await apiService.uploadPICRAForProcessing(picraFormData);
          console.log('✅ [ProjectDetails] PICRA upload successful:', picraResult);
          uploadResults.push({ type: 'PICRA', result: picraResult });
        } catch (picraError) {
          console.error('❌ [ProjectDetails] PICRA upload failed:', picraError);
          throw new Error(`PICRA upload failed: ${picraError.message}`);
        }
      }

      if (inspectionFile) {
        setUploadStatus('Uploading inspection report...');
        console.log('🔍 [ProjectDetails] Uploading inspection file:', inspectionFile.name);
        
        const inspectionFormData = new FormData();
        inspectionFormData.append('file', inspectionFile);
        inspectionFormData.append('projectId', projectId);
        inspectionFormData.append('title', `Home Inspection Report - ${project.name}`);
        inspectionFormData.append('description', `Home inspection report for ${project.name}`);
        inspectionFormData.append('fileType', 'inspection');
        inspectionFormData.append('metadata', JSON.stringify({
          originalName: inspectionFile.name,
          fileSize: inspectionFile.size,
          mimeType: inspectionFile.type,
          uploadDate: new Date().toISOString(),
          uploadedBy: userProfile._id || userProfile.id
        }));
        
        try {
          const inspectionResult = await apiService.uploadPICRAForProcessing(inspectionFormData);
          console.log('✅ [ProjectDetails] Inspection upload successful:', inspectionResult);
          uploadResults.push({ type: 'Inspection', result: inspectionResult });
        } catch (inspectionError) {
          console.error('❌ [ProjectDetails] Inspection upload failed:', inspectionError);
          throw new Error(`Inspection upload failed: ${inspectionError.message}`);
        }
      }

      setUploadStatus('Processing documents...');
      console.log('✅ [ProjectDetails] All uploads completed successfully');
      console.log('📊 [ProjectDetails] Upload results:', uploadResults);
      
      // Reset form
      setPicraFile(null);
      setInspectionFile(null);
      
      // Reload processing records
      try {
        const records = await apiService.getProjectPICRAProcessingRecords(projectId);
        let processingRecordsArray = [];
        if (records) {
          if (Array.isArray(records)) {
            processingRecordsArray = records;
          } else if (records.processingRecords && Array.isArray(records.processingRecords)) {
            processingRecordsArray = records.processingRecords;
          } else if (records.data && Array.isArray(records.data)) {
            processingRecordsArray = records.data;
          } else if (records.records && Array.isArray(records.records)) {
            processingRecordsArray = records.records;
          }
        }
        setProcessingRecords(processingRecordsArray);
      } catch (recordsError) {
        console.warn('⚠️ [ProjectDetails] Could not reload processing records:', recordsError);
      }
      
      setUploadStatus('Upload completed successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowProgressModal(false);
        setUploadStatus('');
      }, 2000);
      
    } catch (error) {
      console.error('❌ [ProjectDetails] Upload failed:', error);
      setError(error.message);
      setShowProgressModal(false);
      setUploadStatus('');
    }
  };

  const handleDownloadDocument = async (processingRecord) => {
    try {
      console.log('🔍 [ProjectDetails] Downloading document:', processingRecord);
      
      // Get the processing results which should contain the file URL
      const results = await apiService.getPICRAProcessingResults(processingRecord._id || processingRecord.id);
      
      if (results && results.processing && results.processing.fileInfo && results.processing.fileInfo.gcsUrl) {
        // Open the file URL in a new tab
        window.open(results.processing.fileInfo.gcsUrl, '_blank');
      } else {
        alert('File download URL not available. The document may still be processing.');
      }
    } catch (error) {
      console.error('❌ [ProjectDetails] Download failed:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    setUploadStatus('');
    // Optionally reload the page or refresh data
    window.location.reload();
  };

  const handleProgressCancel = () => {
    setShowProgressModal(false);
    setUploadStatus('');
  };

  const handleCancel = () => {
    navigate('/project-dashboard');
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
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentStatus = (processingRecord) => {
    if (!processingRecord) return 'Not Available';
    
    // Ensure processingRecord is an object
    if (typeof processingRecord !== 'object' || processingRecord === null) {
      return 'Invalid Record';
    }
    
    switch (processingRecord.status) {
      case 'completed':
        return 'Available';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return '#FFC107';
      case 'failed':
        return '#f44336';
      default:
        return '#888888';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="project-details-container">
          <div className="project-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading project details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="project-details-container">
          <div className="project-content">
            <div className="close-section">
              <button onClick={handleCancel} className="close-btn">×</button>
            </div>
            <div className="error-container">
              <div className="error-message">{error}</div>
              <button onClick={handleCancel} className="btn btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show project details
  if (!project) {
    return (
      <Layout>
        <div className="project-details-container">
          <div className="project-content">
            <div className="close-section">
              <button onClick={handleCancel} className="close-btn">×</button>
            </div>
            <div className="error-container">
              <div className="error-message">Project not found</div>
              <button onClick={handleCancel} className="btn btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="project-details-container">
        <div className="project-content">
          <div className="close-section">
            <button onClick={handleCancel} className="close-btn">×</button>
          </div>

          {/* Project Header */}
          <div className="project-header">
            <h1 className="project-title">{project.name || 'Untitled Project'}</h1>
            <div className="project-meta">
              <span className="project-status" style={{ backgroundColor: getStatusColor(project.status) }}>
                {project.status || 'Unknown'}
              </span>
              <span className="project-address">{project.address || 'No address provided'}</span>
            </div>
          </div>

          {/* Project Form Container */}
          <div className="project-form-container">
            <h2 className="form-title">Project Information</h2>
            
            {/* Project Info Grid */}
            <div className="project-info-grid">
              <div className="info-item">
                <label>Project Name</label>
                <span>{project.name || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <label>Status</label>
                <span>{project.status || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <label>Address</label>
                <span>{project.address || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <label>Description</label>
                <span>{project.description || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <label>Created</label>
                <span>{formatDate(project.createdAt)}</span>
              </div>
              
              <div className="info-item">
                <label>Last Updated</label>
                <span>{formatDate(project.updatedAt)}</span>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="document-upload-section">
              <h3>Upload Documents</h3>
              <div className="upload-grid">
                {/* PICRA Upload */}
                <div className="upload-item">
                  <label className="upload-label">PICRA Document</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handlePicraFileChange}
                    className="file-input"
                  />
                  {picraFile && (
                    <div className="file-info">
                      <span className="file-name">{picraFile.name}</span>
                      <span className="file-size">{formatFileSize(picraFile.size)}</span>
                    </div>
                  )}
                  {fileValidationErrors.picra && fileValidationErrors.picra.length > 0 && (
                    <div className="validation-errors">
                      {fileValidationErrors.picra.map((error, index) => (
                        <span key={index} className="error-text">{error}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inspection Report Upload */}
                <div className="upload-item">
                  <label className="upload-label">Home Inspection Report</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInspectionFileChange}
                    className="file-input"
                  />
                  {inspectionFile && (
                    <div className="file-info">
                      <span className="file-name">{inspectionFile.name}</span>
                      <span className="file-size">{formatFileSize(inspectionFile.size)}</span>
                    </div>
                  )}
                  {fileValidationErrors.inspection && fileValidationErrors.inspection.length > 0 && (
                    <div className="validation-errors">
                      {fileValidationErrors.inspection.map((error, index) => (
                        <span key={index} className="error-text">{error}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-actions">
                <button 
                  onClick={handleUploadDocuments}
                  disabled={!picraFile && !inspectionFile}
                  className="btn btn-primary upload-btn"
                >
                  Upload Documents
                </button>
              </div>
            </div>

            {/* Processing Records Section */}
            {processingRecords.length > 0 && (
              <div className="processing-records-section">
                <h3>Document Processing Records</h3>
                <div className="records-grid">
                  {processingRecords.map((record, index) => (
                    <div key={index} className="record-item">
                      <div className="record-header">
                        <span className="record-type">
                          {record.fileInfo?.fileType === 'picra' ? 'PICRA Document' : 
                           record.fileInfo?.fileType === 'inspection' ? 'Inspection Report' : 
                           record.fileInfo?.title || 'Unknown Document'}
                        </span>
                        <span 
                          className="record-status"
                          style={{ backgroundColor: getStatusColor(record.status) }}
                        >
                          {getDocumentStatus(record)}
                        </span>
                      </div>
                      <div className="record-details">
                        <p><strong>Created:</strong> {formatDate(record.createdAt)}</p>
                        <p><strong>Updated:</strong> {formatDate(record.updatedAt)}</p>
                        {record.fileInfo?.fileSize && (
                          <p><strong>File Size:</strong> {formatFileSize(record.fileInfo.fileSize)}</p>
                        )}
                        {record.fileInfo?.originalName && (
                          <p><strong>File:</strong> {record.fileInfo.originalName}</p>
                        )}
                      </div>
                      <div className="record-actions">
                        {record.status === 'completed' && (
                          <button 
                            onClick={() => handleDownloadDocument(record)}
                            className="btn btn-small btn-secondary download-btn"
                          >
                            Download
                          </button>
                        )}
                        {record.status === 'processing' && (
                          <span className="processing-indicator">Processing...</span>
                        )}
                        {record.status === 'failed' && (
                          <span className="error-indicator">Processing Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={handleCancel} className="btn btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Progress Modal */}
        <ProgressModal
          isOpen={showProgressModal}
          status={uploadStatus}
          onComplete={handleProgressComplete}
          onCancel={handleProgressCancel}
        />
      </div>
    </Layout>
  );
};

export default ProjectDetails; 
