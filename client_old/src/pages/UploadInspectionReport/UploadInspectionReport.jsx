import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import ProgressModal from '../../components/ProgressModal/ProgressModal.jsx';
import PICRAValidationResult from '../../components/PICRAValidationResult/index.jsx';

const UploadInspectionReport = () => {
  const navigate = useNavigate();
  const [picraFile, setPicraFile] = useState(null);
  const [inspectionFile, setInspectionFile] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [fileValidationErrors, setFileValidationErrors] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [showValidationResult, setShowValidationResult] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

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
      
      // If there's an existing file, replace it
      if (picraFile) {
        console.log('🔄 Replacing existing PICRA file:', picraFile.name, 'with:', file.name);
      }
      
      setPicraFile(file);
      setFileValidationErrors(prev => ({ ...prev, picra: [] }));
      setError(''); // Clear any previous errors
    }
  };

  const handleDeletePicraFile = () => {
    if (window.confirm(`Are you sure you want to delete "${picraFile.name}"?`)) {
      setPicraFile(null);
      setFileValidationErrors(prev => ({ ...prev, picra: [] }));
      // Reset the file input
      const fileInput = document.getElementById('picra-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
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
      
      // If there's an existing file, replace it
      if (inspectionFile) {
        console.log('🔄 Replacing existing inspection file:', inspectionFile.name, 'with:', file.name);
      }
      
      setInspectionFile(file);
      setFileValidationErrors(prev => ({ ...prev, inspection: [] }));
      setError(''); // Clear any previous errors
    }
  };

  const handleDeleteInspectionFile = () => {
    if (window.confirm(`Are you sure you want to delete "${inspectionFile.name}"?`)) {
      setInspectionFile(null);
      setFileValidationErrors(prev => ({ ...prev, inspection: [] }));
      // Reset the file input
      const fileInput = document.getElementById('inspection-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setUploadStatus('');
    setFileValidationErrors({});
    
    if (!picraFile && !inspectionFile) {
      setError('Please select at least one file to upload.');
      return;
    }

    if (!projectName.trim()) {
      setError('Please enter a project name.');
      return;
    }

    if (!propertyAddress.trim()) {
      setError('Please enter a property address.');
      return;
    }

    // Show progress modal
    setShowProgressModal(true);
    setUploadStatus('Creating project...');

    try {
      // Check authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('🔍 [Upload] Starting upload process...');
      
      // Get user profile for project creation
      setUploadStatus('Loading user profile...');
      const userProfile = await apiService.getUserProfile();
      console.log('✅ [Upload] User profile loaded:', userProfile);
      
      // Create project data with enhanced metadata
      const projectData = {
        name: projectName,
        address: propertyAddress,
        reportType: 'inspection',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        description: `Project for ${projectName} at ${propertyAddress}`,
        status: 'pending',
        metadata: {
          uploadDate: new Date().toISOString(),
          filesToUpload: {
            picra: picraFile ? {
              name: picraFile.name,
              size: picraFile.size,
              type: picraFile.type
            } : null,
            inspection: inspectionFile ? {
              name: inspectionFile.name,
              size: inspectionFile.size,
              type: inspectionFile.type
            } : null
          }
        }
      };

      // Create the project
      setUploadStatus('Creating project...');
      console.log('🔍 [Upload] Creating project with data:', projectData);
      const projectResponse = await apiService.createProject(projectData);
      console.log('✅ [Upload] Project created:', projectResponse);
      
      // Handle different response formats
      let project = projectResponse;
      if (projectResponse && projectResponse.project) {
        project = projectResponse.project;
      }
      
      if (!project || (!project.id && !project._id)) {
        throw new Error('Failed to create project. No project ID received.');
      }

      const projectId = project.id || project._id;
      console.log('✅ [Upload] Project ID:', projectId);

      // Upload files and create reports
      const uploadResults = [];

      if (picraFile) {
        setUploadStatus('Uploading PICRA document...');
        console.log('🔍 [Upload] Uploading PICRA file:', picraFile.name);
        
        const picraFormData = new FormData();
        picraFormData.append('file', picraFile);
        picraFormData.append('projectId', projectId);
        picraFormData.append('title', `PICRA Report - ${projectName}`);
        picraFormData.append('description', `Property PICRA document for ${projectName}`);
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
          console.log('✅ [Upload] PICRA upload successful:', picraResult);
          
          // Check for validation results
          if (picraResult.validationResult) {
            setValidationResult(picraResult.validationResult);
            setShowValidationResult(true);
            setShowProgressModal(false);
            
            // If validation failed, stop processing
            if (!picraResult.validationResult.isValid) {
              console.log('❌ [Upload] PICRA validation failed:', picraResult.validationResult);
              return;
            }
          }
          
          uploadResults.push({ type: 'PICRA', result: picraResult });
        } catch (picraError) {
          console.error('❌ [Upload] PICRA upload failed:', picraError);
          
          // Check if it's a validation error
          if (picraError.response && picraError.response.data && picraError.response.data.validationResult) {
            setValidationResult(picraError.response.data.validationResult);
            setShowValidationResult(true);
            setShowProgressModal(false);
            return;
          }
          
          throw new Error(`PICRA upload failed: ${picraError.message}`);
        }
      }

      if (inspectionFile) {
        setUploadStatus('Uploading inspection report...');
        console.log('🔍 [Upload] Uploading inspection file:', inspectionFile.name);
        
        const inspectionFormData = new FormData();
        inspectionFormData.append('file', inspectionFile);
        inspectionFormData.append('projectId', projectId);
        inspectionFormData.append('title', `Home Inspection Report - ${projectName}`);
        inspectionFormData.append('description', `Home inspection report for ${projectName}`);
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
          console.log('✅ [Upload] Inspection upload successful:', inspectionResult);
          uploadResults.push({ type: 'Inspection', result: inspectionResult });
        } catch (inspectionError) {
          console.error('❌ [Upload] Inspection upload failed:', inspectionError);
          throw new Error(`Inspection upload failed: ${inspectionError.message}`);
        }
      }

      setUploadStatus('Processing documents...');
      console.log('✅ [Upload] All uploads completed successfully');
      console.log('📊 [Upload] Upload results:', uploadResults);
      
      // Store upload results for potential use
      localStorage.setItem('lastUploadResults', JSON.stringify(uploadResults));
      
      // Reset form
      setPicraFile(null);
      setInspectionFile(null);
      setProjectName('');
      setPropertyAddress('');
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      // Store project ID for navigation
      localStorage.setItem('currentProjectId', projectId);
      
      setUploadStatus('Upload completed successfully!');
      
    } catch (error) {
      console.error('❌ [Upload] Upload failed:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        setShowProgressModal(false);
        navigate('/login');
        return;
      }
      
      setError(`Upload failed: ${error.message}`);
      setShowProgressModal(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    // Navigate to project details with the project ID
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      navigate(`/project-details/${projectId}`);
      localStorage.removeItem('currentProjectId');
    } else {
      navigate('/project-dashboard');
    }
  };

  const handleProgressCancel = () => {
    setShowProgressModal(false);
    setError('');
    setUploadStatus('');
  };

  const handleValidationProceed = () => {
    setShowValidationResult(false);
    setValidationResult(null);
    // Continue with the upload process
    setShowProgressModal(true);
    setUploadStatus('Continuing with processing...');
  };

  const handleValidationReject = () => {
    setShowValidationResult(false);
    setValidationResult(null);
    setPicraFile(null);
    // Reset the file input
    const fileInput = document.getElementById('picra-file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Check if at least one file is uploaded and required fields are filled
  const hasAtLeastOneFile = picraFile || inspectionFile;
  const hasRequiredFields = projectName.trim() && propertyAddress.trim();
  const canSubmit = hasAtLeastOneFile && hasRequiredFields;

  return (
    <Layout>
      <div className="upload-content">
        <div className="upload-header-section">
          <h1 className="upload-title">Upload Documents</h1>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showValidationResult && validationResult && (
          <PICRAValidationResult
            validationResult={validationResult}
            onProceed={handleValidationProceed}
            onReject={handleValidationReject}
          />
        )}
        
        <div className="upload-card">
          <form onSubmit={handleSubmit} className="upload-form">
            {/* Project Information Section */}
            <div className="upload-section">
              <h2 className="section-title">Project Information</h2>
              <div className="form-group">
                <label htmlFor="project-name" className="form-label">Project Name</label>
                <input
                  type="text"
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="form-input"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="property-address" className="form-label">Property Address</label>
                <input
                  type="text"
                  id="property-address"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Enter the property address"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Property PICRA Upload Section */}
            <div className="upload-section">
              <h2 className="section-title">Upload Property PICRA</h2>
              <p className="upload-note">
                Upload your Property PICRA document. Accepted formats: PDF, DOCX. Maximum file size: 10MB.
              </p>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="picra-file-upload"
                  accept=".pdf,.docx,.doc"
                  onChange={handlePicraFileChange}
                  className="file-input"
                />
                <label htmlFor="picra-file-upload" className="file-label">
                  {picraFile ? picraFile.name : 'Choose a PICRA file or drag it here'}
                </label>
                {picraFile && (
                  <div className="file-info">
                    <div className="file-details">
                      <span>Size: {(picraFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>Type: {picraFile.type}</span>
                    </div>
                    <div className="file-actions">
                      <button
                        type="button"
                        onClick={handleDeletePicraFile}
                        className="btn btn-danger btn-sm delete-file-btn"
                        title="Delete file"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
                {fileValidationErrors.picra && fileValidationErrors.picra.length > 0 && (
                  <div className="file-validation-errors">
                    {fileValidationErrors.picra.map((error, index) => (
                      <div key={index} className="validation-error">❌ {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Home Inspection Report Upload Section */}
            <div className="upload-section">
              <h2 className="section-title">Upload Home Inspection Report</h2>
              <p className="upload-note">
                Upload your Home Inspection Report. Accepted formats: PDF, DOCX. Maximum file size: 10MB.
              </p>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="inspection-file-upload"
                  accept=".pdf,.docx,.doc"
                  onChange={handleInspectionFileChange}
                  className="file-input"
                />
                <label htmlFor="inspection-file-upload" className="file-label">
                  {inspectionFile ? inspectionFile.name : 'Choose an inspection report file or drag it here'}
                </label>
                {inspectionFile && (
                  <div className="file-info">
                    <div className="file-details">
                      <span>Size: {(inspectionFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>Type: {inspectionFile.type}</span>
                    </div>
                    <div className="file-actions">
                      <button
                        type="button"
                        onClick={handleDeleteInspectionFile}
                        className="btn btn-danger btn-sm delete-file-btn"
                        title="Delete file"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
                {fileValidationErrors.inspection && fileValidationErrors.inspection.length > 0 && (
                  <div className="file-validation-errors">
                    {fileValidationErrors.inspection.map((error, index) => (
                      <div key={index} className="validation-error">❌ {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={!canSubmit}
              >
                Submit Documents
              </button>
              {!canSubmit && (
                <p className="submit-note">
                  Please fill in all required fields and upload at least one document to continue.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Progress Modal */}
        <ProgressModal
          isOpen={showProgressModal}
          onClose={handleProgressCancel}
          onComplete={handleProgressComplete}
          status={uploadStatus}
        />
      </div>
    </Layout>
  );
};

export default UploadInspectionReport; 
