import React from 'react';
import './PICRAValidationResult.css';

const PICRAValidationResult = ({ validationResult, onProceed, onReject }) => {
  if (!validationResult) {
    return null;
  }

  const { isValid, confidence, reason, details } = validationResult;
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#28a745'; // Green
    if (confidence >= 0.6) return '#ffc107'; // Yellow
    if (confidence >= 0.4) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  return (
    <div className="picra-validation-result">
      <div className="validation-header">
        <h3>Document Validation Results</h3>
        <div className={`validation-status ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? '✅ Valid PICRA Document' : '❌ Invalid Document'}
        </div>
      </div>

      <div className="confidence-section">
        <div className="confidence-score">
          <div 
            className="confidence-circle"
            style={{ 
              borderColor: getConfidenceColor(confidence),
              color: getConfidenceColor(confidence)
            }}
          >
            {Math.round(confidence * 100)}%
          </div>
          <div className="confidence-label">
            {getConfidenceLabel(confidence)}
          </div>
        </div>
      </div>

      <div className="validation-details">
        <div className="reason-section">
          <h4>Analysis Summary</h4>
          <p>{reason}</p>
        </div>

        {details && (
          <div className="detailed-analysis">
            <h4>Detailed Analysis</h4>
            <div className="analysis-grid">
              <div className="analysis-item">
                <span className="analysis-label">Title Match:</span>
                <span className={`analysis-value ${details.titleMatch ? 'positive' : 'negative'}`}>
                  {details.titleMatch ? '✅ Found' : '❌ Not Found'}
                </span>
              </div>
              
              <div className="analysis-item">
                <span className="analysis-label">Form Fields:</span>
                <span className="analysis-value">
                  {details.formFieldsFound}/{details.totalFormFields} found
                </span>
              </div>
              
              <div className="analysis-item">
                <span className="analysis-label">Legal Terms:</span>
                <span className="analysis-value">
                  {details.legalTermsFound}/{details.totalLegalTerms} found
                </span>
              </div>
              
              <div className="analysis-item">
                <span className="analysis-label">Repair Content:</span>
                <span className={`analysis-value ${details.repairContentFound ? 'positive' : 'negative'}`}>
                  {details.repairContentFound ? '✅ Found' : '❌ Not Found'}
                </span>
              </div>
              
              <div className="analysis-item">
                <span className="analysis-label">Inspection Terms:</span>
                <span className="analysis-value">
                  {details.inspectionTermsFound}/{details.totalInspectionTerms} found
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="validation-actions">
        {isValid ? (
          <div className="proceed-section">
            <p className="proceed-message">
              ✅ This document appears to be a valid PICRA document. 
              You can proceed with processing.
            </p>
            <button 
              className="proceed-btn"
              onClick={onProceed}
            >
              Proceed with Processing
            </button>
          </div>
        ) : (
          <div className="reject-section">
            <p className="reject-message">
              ❌ This document does not appear to be a valid PICRA document. 
              Please upload a different document.
            </p>
            <button 
              className="reject-btn"
              onClick={onReject}
            >
              Upload Different Document
            </button>
          </div>
        )}
      </div>

      <div className="validation-info">
        <h4>About PICRA Validation</h4>
        <p>
          Our system analyzes documents to determine if they are valid Property Inspection 
          Contingency Removal Addendum (PICRA) documents. The validation checks for:
        </p>
        <ul>
          <li>PICRA-specific title and keywords</li>
          <li>Standard form fields (buyer, seller, property address, etc.)</li>
          <li>Legal and real estate terminology</li>
          <li>Repair-related content</li>
          <li>Inspection-related terms</li>
        </ul>
        <p>
          <strong>Confidence Score:</strong> Higher scores indicate a greater likelihood 
          that the document is a valid PICRA. Documents with scores below 60% are 
          typically not valid PICRA documents.
        </p>
      </div>
    </div>
  );
};

export default PICRAValidationResult;
