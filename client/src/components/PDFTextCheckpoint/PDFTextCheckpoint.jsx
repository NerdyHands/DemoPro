import React, { useState, useEffect } from 'react';
import './PDFTextCheckpoint.css';

const PDFTextCheckpoint = ({ 
  isOpen, 
  onClose, 
  onContinue, 
  pdfFile, 
  extractedText, 
  fileName 
}) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  // Create PDF URL when component mounts or file changes
  useEffect(() => {
    if (pdfFile && isOpen) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      
      // Cleanup URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfFile, isOpen]);

  const handleContinue = () => {
    onContinue();
  };

  const handleCancel = () => {
    onClose();
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_extracted_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-text-checkpoint-overlay">
      <div className="pdf-text-checkpoint-modal">
        <div className="checkpoint-header">
          <h2>Review PDF and Extracted Text</h2>
          <p>Please review the uploaded PDF and its extracted text before proceeding with validation.</p>
        </div>

        <div className="checkpoint-content">
          <div className="pdf-section">
            <div className="section-header">
              <h3>PDF Document</h3>
              <span className="file-name">{fileName}</span>
            </div>
            <div className="pdf-viewer">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>

          <div className="text-section">
            <div className="section-header">
              <h3>Extracted Text (OCR)</h3>
              <div className="text-actions">
                <button onClick={copyText} className="action-btn copy-btn">
                  Copy Text
                </button>
                <button onClick={downloadText} className="action-btn download-btn">
                  Download
                </button>
              </div>
            </div>
            <div className="text-stats">
              <span>{extractedText.length} characters</span>
              <span>{extractedText.split(/\s+/).filter(word => word.length > 0).length} words</span>
              <span>{extractedText.split('\n').filter(line => line.trim().length > 0).length} lines</span>
            </div>
            <div className="text-content">
              <textarea
                value={extractedText}
                readOnly
                placeholder="No text extracted..."
              />
            </div>
          </div>
        </div>

        <div className="checkpoint-actions">
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleContinue} className="btn btn-primary">
            Continue with Validation
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFTextCheckpoint;
