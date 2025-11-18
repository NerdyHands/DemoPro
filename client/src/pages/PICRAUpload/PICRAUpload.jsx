import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import apiService from '../../services/api.jsx';
import ProgressModal from '../../components/ProgressModal/ProgressModal.jsx';
// import PICRAValidationResult from '../../components/PICRAValidationResult/index.jsx';
import PDFTextCheckpoint from '../../components/PDFTextCheckpoint/index.jsx';
import './PICRAUpload.css';

const PICRAUpload = () => {
  const navigate = useNavigate();
  const [picraFile, setPicraFile] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [fileValidationErrors, setFileValidationErrors] = useState([]);
  // const [validationResult, setValidationResult] = useState(null);
  // const [showValidationResult, setShowValidationResult] = useState(false);
  // const [extractedText, setExtractedText] = useState('');
  // const [chatGptPrompt, setChatGptPrompt] = useState('');
  // const [chatGptResponse, setChatGptResponse] = useState('');
  // const [isLoadingChatGpt, setIsLoadingChatGpt] = useState(false);
  // const [structuredRepairItems, setStructuredRepairItems] = useState([]);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointExtractedText, setCheckpointExtractedText] = useState('');
  // const [pendingValidationResult, setPendingValidationResult] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // File validation helper
  const validateFile = (file) => {
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
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        setFileValidationErrors(errors);
        alert(`PICRA file validation failed:\n${errors.join('\n')}`);
        e.target.value = '';
        setPicraFile(null);
        return;
      }
      
      setPicraFile(file);
      setFileValidationErrors([]);
      setError('');
      // setExtractedText('');
      // setChatGptPrompt('');
      // setChatGptResponse('');
      // setStructuredRepairItems([]);
    }
  };

  const handleDeletePicraFile = () => {
    if (window.confirm(`Are you sure you want to delete "${picraFile.name}"?`)) {
      setPicraFile(null);
      setFileValidationErrors([]);
      // setExtractedText('');
      // setChatGptPrompt('');
      // setChatGptResponse('');
      // setStructuredRepairItems([]);
      // Reset the file input
      const fileInput = document.getElementById('picra-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!picraFile) {
      setError('Please select a PICRA file to upload');
      return;
    }

    setShowProgressModal(true);
    setUploadStatus('Creating project...');
    setError('');

    try {
      // First, create a project for this PICRA upload
      setUploadStatus('Creating project...');
      const userProfile = await apiService.getUserProfile();
      
      const projectData = {
        name: `PICRA Analysis - ${picraFile.name}`,
        address: 'Not specified',
        reportType: 'inspection',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `PICRA document analysis for ${picraFile.name}`,
        status: 'pending',
        metadata: {
          uploadDate: new Date().toISOString(),
          fileName: picraFile.name,
          fileSize: picraFile.size,
          fileType: picraFile.type
        }
      };

      const projectResponse = await apiService.createProject(projectData);
      console.log('✅ [PICRA Upload] Project created:', projectResponse);
      
      let project = projectResponse;
      if (projectResponse && projectResponse.project) {
        project = projectResponse.project;
      }
      
      if (!project || (!project.id && !project._id)) {
        throw new Error('Failed to create project. No project ID received.');
      }

      const projectId = project.id || project._id;
      console.log('✅ [PICRA Upload] Project ID:', projectId);

      // Create FormData for file upload
      setUploadStatus('Uploading PICRA file...');
      const formData = new FormData();
      formData.append('file', picraFile);
      formData.append('projectId', projectId);
      formData.append('title', `PICRA Upload - ${picraFile.name}`);
      formData.append('description', 'PICRA document for repair item extraction');
      formData.append('fileType', 'picra');
      formData.append('metadata', JSON.stringify({
        originalName: picraFile.name,
        fileSize: picraFile.size,
        mimeType: picraFile.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: userProfile._id || userProfile.id
      }));

      // Upload and process the PICRA file with Google Document AI
      setUploadStatus('Processing with Google Document AI...');
      const response = await apiService.uploadPICRAForProcessing(formData);
      
      if (response.success) {
        setUploadStatus('Processing completed!');
        
        // Get the extracted text from Document AI results
        const extractedText = response.documentAIResults?.text || 
                            response.documentAIResults?.extractedText || 
                            response.validationResult?.sampleText || 
                            'No text extracted from document.';
        
        setCheckpointExtractedText(extractedText);
        setShowCheckpoint(true);
        
      } else {
        throw new Error(response.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'An error occurred during upload');
    } finally {
      setShowProgressModal(false);
    }
  };

  // const generateChatGptPrompt = (text) => {
  //   const prompt = `Extract all repair items from this Property Inspection Contingency Removal Addendum (PICRA) document. 

  // Please format the response as a JSON array with the following structure for each repair item:
  // {
  //   "category": "System or area (e.g., HVAC, Plumbing, Electrical, Exterior, etc.)",
  //   "issue": "Specific issue or problem description",
  //   "action": "Required action or repair needed",
  //   "location": "Specific location if mentioned",
  //   "priority": "High/Medium/Low based on safety and functionality",
  //   "estimated_cost": "Rough cost estimate if mentioned, otherwise null"
  // }

  // Focus only on the repair items section. If there are no repair items or if the document indicates no repairs are needed, return an empty array.

  // Document text:
  // ${text}

  // Please respond with only the JSON array, no additional text.`;

  //   setChatGptPrompt(prompt);
  // };

  // const sendToChatGpt = async () => {
  //   if (!chatGptPrompt) {
  //     setError('No prompt available. Please upload and process a PICRA file first.');
  //     return;
  //   }

  //   setIsLoadingChatGpt(true);
  //   setError('');

  //   try {
  //     const response = await apiService.extractRepairItemsWithChatGPT(chatGptPrompt, extractedText);
      
  //     if (response.success) {
  //         setChatGptResponse(response.response);
        
  //         // Try to parse the response as JSON
  //         try {
  //           const parsedItems = JSON.parse(response.response);
  //           setStructuredRepairItems(Array.isArray(parsedItems) ? parsedItems : []);
  //         } catch (parseError) {
  //           console.warn('Failed to parse ChatGPT response as JSON:', parseError);
  //           setStructuredRepairItems([]);
  //         }
  //     } else {
  //         throw new Error(response.error || 'ChatGPT processing failed');
  //     }
  //   } catch (error) {
  //     console.error('ChatGPT error:', error);
  //     setError(error.message || 'An error occurred while processing with ChatGPT');
  //   } finally {
  //     setIsLoadingChatGpt(false);
  //   }
  // };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
  };

  const handleProgressCancel = () => {
    setShowProgressModal(false);
    setUploadStatus('');
  };

  // const handleValidationProceed = () => {
  //   setShowValidationResult(false);
  //   // Continue with the process
  // };

  // const handleValidationReject = () => {
  //   setShowValidationResult(false);
  //   setValidationResult(null);
  //   setExtractedText('');
  //   setChatGptPrompt('');
  //   setChatGptResponse('');
  //   setStructuredRepairItems([]);
  // };

  // Checkpoint handlers
  const handleCheckpointContinue = () => {
    setShowCheckpoint(false);
    // For this simplified version, just close the checkpoint
    console.log('Checkpoint completed - extracted text:', checkpointExtractedText);
  };

  const handleCheckpointCancel = () => {
    setShowCheckpoint(false);
    setCheckpointExtractedText('');
  };



  return (
    <Layout>
      <div className="picra-upload-container">
        <div className="picra-upload-header">
          <h1>PICRA Upload & Text Extraction</h1>
          <p>Upload a PICRA document to view the extracted text alongside the original PDF</p>
          <div className="ocr-info">
            <span className="ocr-badge">🔍 OCR Enabled</span>
            <span className="ocr-description">Side-by-side PDF and text review</span>
          </div>
        </div>

        <div className="picra-upload-content">
          {/* File Upload Section */}
          <div className="upload-section">
            <h2>Step 1: Upload PICRA Document</h2>
            <div className="file-upload-area">
              <input
                type="file"
                id="picra-file-upload"
                accept=".pdf,.doc,.docx"
                onChange={handlePicraFileChange}
                style={{ display: 'none' }}
              />
              
              {!picraFile ? (
                <label htmlFor="picra-file-upload" className="file-upload-label">
                  <div className="upload-icon">📄</div>
                  <div className="upload-text">
                    <strong>Click to select PICRA file</strong>
                    <span>or drag and drop here</span>
                    <small>Supports PDF, DOC, DOCX (max 10MB)</small>
                  </div>
                </label>
              ) : (
                <div className="file-selected">
                  <div className="file-info">
                    <span className="file-name">{picraFile.name}</span>
                    <span className="file-size">({(picraFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleDeletePicraFile}
                    className="delete-file-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {fileValidationErrors.length > 0 && (
              <div className="validation-errors">
                {fileValidationErrors.map((error, index) => (
                  <div key={index} className="error-message">{error}</div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!picraFile}
              className="upload-btn"
            >
              Upload & Process PICRA
            </button>
          </div>



          {/* Error Display */}
          {error && (
            <div className="error-section">
              <div className="error-message">{error}</div>
            </div>
          )}
        </div>

        {/* Progress Modal */}
        {showProgressModal && (
          <ProgressModal
            isOpen={showProgressModal}
            status={uploadStatus}
            onComplete={handleProgressComplete}
            onCancel={handleProgressCancel}
            showSteps={true}
            currentStep={uploadStatus.includes('OCR') ? 'documentAI' : 
                        uploadStatus.includes('Validating') ? 'validation' :
                        uploadStatus.includes('Analyzing') ? 'openAI' :
                        uploadStatus.includes('Generating') ? 'quoteGeneration' : 'unknown'}
          />
        )}



        {/* PDF/OCR Checkpoint Modal */}
        {showCheckpoint && (
          <PDFTextCheckpoint
            isOpen={showCheckpoint}
            onClose={handleCheckpointCancel}
            onContinue={handleCheckpointContinue}
            pdfFile={picraFile}
            extractedText={checkpointExtractedText}
            fileName={picraFile?.name}
          />
        )}
      </div>
    </Layout>
  );
};

export default PICRAUpload;
