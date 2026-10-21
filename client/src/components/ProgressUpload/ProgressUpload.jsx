import React, { useState, useRef } from 'react';
import { jobProgressApi } from '../../services/jobApi';
import './ProgressUpload.css';

const ProgressUpload = ({ jobId, onUploadComplete, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const [progressData, setProgressData] = useState({
    logType: 'Image Upload',
    description: '',
    workPerformed: '',
    isPublic: false,
    timeLog: {
      startTime: '',
      endTime: '',
      hourlyRate: ''
    },
    materialsUsed: [],
    issues: []
  });

  const [imageData, setImageData] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.includes('document');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only images, PDFs, and documents under 10MB are allowed.');
    }

    setSelectedFiles(validFiles);
    
    // Initialize image data for each file
    const newImageData = validFiles.map((file, index) => ({
      file,
      description: '',
      category: 'During'
    }));
    setImageData(newImageData);
    setError(null);
  };

  const updateImageData = (index, field, value) => {
    setImageData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImageData(prev => prev.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    setProgressData(prev => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, { item: '', quantity: 1, unit: 'piece', cost: 0 }]
    }));
  };

  const updateMaterial = (index, field, value) => {
    setProgressData(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const removeMaterial = (index) => {
    setProgressData(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter((_, i) => i !== index)
    }));
  };

  const addIssue = () => {
    setProgressData(prev => ({
      ...prev,
      issues: [...prev.issues, { description: '', severity: 'Medium', resolved: false }]
    }));
  };

  const updateIssue = (index, field, value) => {
    setProgressData(prev => ({
      ...prev,
      issues: prev.issues.map((issue, i) => 
        i === index ? { ...issue, [field]: value } : issue
      )
    }));
  };

  const removeIssue = (index) => {
    setProgressData(prev => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index)
    }));
  };

  const calculateDuration = () => {
    if (progressData.timeLog.startTime && progressData.timeLog.endTime) {
      const start = new Date(`2000-01-01T${progressData.timeLog.startTime}`);
      const end = new Date(`2000-01-01T${progressData.timeLog.endTime}`);
      const duration = (end - start) / (1000 * 60); // in minutes
      return duration > 0 ? duration : 0;
    }
    return 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!progressData.description.trim()) {
      setError('Please provide a description for this progress log.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Calculate duration if time log is provided
      const finalProgressData = { ...progressData, jobId };
      if (progressData.timeLog.startTime && progressData.timeLog.endTime) {
        finalProgressData.timeLog.duration = calculateDuration();
      }

      // Create progress log first
      const progressResponse = await jobProgressApi.createProgressLog(finalProgressData);
      const progressLogId = progressResponse.progressLog._id;

      // Upload images if any
      if (selectedFiles.length > 0) {
        const descriptions = imageData.map(item => item.description);
        const categories = imageData.map(item => item.category);
        
        await jobProgressApi.uploadProgressImages(
          progressLogId,
          selectedFiles,
          descriptions,
          categories
        );
      }

      setSuccess('Progress log and images uploaded successfully!');
      
      // Reset form
      setSelectedFiles([]);
      setImageData([]);
      setProgressData({
        logType: 'Image Upload',
        description: '',
        workPerformed: '',
        isPublic: false,
        timeLog: { startTime: '', endTime: '', hourlyRate: '' },
        materialsUsed: [],
        issues: []
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(progressResponse.progressLog);
      }

      // Auto-close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('Error uploading progress:', err);
      setError(err.response?.data?.error || 'Failed to upload progress. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="progress-upload">
      <div className="upload-header">
        <h3>Upload Work Progress</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Basic Information */}
        <div className="form-section">
          <h4>Progress Information</h4>
          
          <div className="form-group">
            <label>Log Type</label>
            <select 
              value={progressData.logType}
              onChange={(e) => setProgressData(prev => ({ ...prev, logType: e.target.value }))}
              required
            >
              <option value="Image Upload">Image Upload</option>
              <option value="Time Log">Time Log</option>
              <option value="Status Update">Status Update</option>
              <option value="Note">Note</option>
              <option value="Issue">Issue</option>
              <option value="Completion">Completion</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={progressData.description}
              onChange={(e) => setProgressData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the work performed or progress made..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Work Performed</label>
            <textarea
              value={progressData.workPerformed}
              onChange={(e) => setProgressData(prev => ({ ...prev, workPerformed: e.target.value }))}
              placeholder="Provide detailed information about the work performed..."
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={progressData.isPublic}
                onChange={(e) => setProgressData(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              Make this progress visible to the customer
            </label>
          </div>
        </div>

        {/* Time Log */}
        <div className="form-section">
          <h4>Time Log (Optional)</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={progressData.timeLog.startTime}
                onChange={(e) => setProgressData(prev => ({ 
                  ...prev, 
                  timeLog: { ...prev.timeLog, startTime: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={progressData.timeLog.endTime}
                onChange={(e) => setProgressData(prev => ({ 
                  ...prev, 
                  timeLog: { ...prev.timeLog, endTime: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label>Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={progressData.timeLog.hourlyRate}
                onChange={(e) => setProgressData(prev => ({ 
                  ...prev, 
                  timeLog: { ...prev.timeLog, hourlyRate: e.target.value }
                }))}
                placeholder="0.00"
              />
            </div>
          </div>

          {progressData.timeLog.startTime && progressData.timeLog.endTime && (
            <div className="time-summary">
              <span>Duration: {Math.round(calculateDuration())} minutes</span>
              {progressData.timeLog.hourlyRate && (
                <span>
                  Estimated Cost: ${((calculateDuration() / 60) * parseFloat(progressData.timeLog.hourlyRate || 0)).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Materials Used */}
        <div className="form-section">
          <div className="section-header">
            <h4>Materials Used</h4>
            <button type="button" className="add-btn" onClick={addMaterial}>+ Add Material</button>
          </div>

          {progressData.materialsUsed.map((material, index) => (
            <div key={index} className="material-row">
              <input
                type="text"
                placeholder="Material name"
                value={material.item}
                onChange={(e) => updateMaterial(index, 'item', e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty"
                value={material.quantity}
                onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <input
                type="text"
                placeholder="Unit"
                value={material.unit}
                onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
              />
              <input
                type="number"
                placeholder="Cost ($)"
                value={material.cost}
                onChange={(e) => updateMaterial(index, 'cost', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
              <button type="button" className="remove-btn" onClick={() => removeMaterial(index)}>×</button>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div className="form-section">
          <div className="section-header">
            <h4>Issues Encountered</h4>
            <button type="button" className="add-btn" onClick={addIssue}>+ Add Issue</button>
          </div>

          {progressData.issues.map((issue, index) => (
            <div key={index} className="issue-row">
              <textarea
                placeholder="Describe the issue..."
                value={issue.description}
                onChange={(e) => updateIssue(index, 'description', e.target.value)}
                rows={2}
              />
              <select
                value={issue.severity}
                onChange={(e) => updateIssue(index, 'severity', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <button type="button" className="remove-btn" onClick={() => removeIssue(index)}>×</button>
            </div>
          ))}
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h4>Upload Images & Documents</h4>
          
          <div className="file-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <span className="upload-icon">📁</span>
              <span>Choose Files</span>
              <small>Images, PDFs, and documents (max 10MB each)</small>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h5>Selected Files ({selectedFiles.length})</h5>
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <div className="file-details">
                      <strong>{file.name}</strong>
                      <small>{formatFileSize(file.size)}</small>
                    </div>
                  </div>
                  
                  <div className="file-metadata">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={imageData[index]?.description || ''}
                      onChange={(e) => updateImageData(index, 'description', e.target.value)}
                    />
                    <select
                      value={imageData[index]?.category || 'During'}
                      onChange={(e) => updateImageData(index, 'category', e.target.value)}
                    >
                      <option value="Before">Before</option>
                      <option value="During">During</option>
                      <option value="After">After</option>
                      <option value="Issue">Issue</option>
                      <option value="Completed">Completed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={uploading || !progressData.description.trim()}
          >
            {uploading ? 'Uploading...' : 'Upload Progress'}
          </button>
          
          {onClose && (
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProgressUpload;


