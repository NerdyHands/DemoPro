import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ProgressModal.css';

const ProgressModal = ({ isOpen, onClose, onComplete, onCancel, status = '', showSteps = false, currentStep = 'unknown' }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageMessages, setStageMessages] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const stages = useMemo(() => [
    { name: 'Upload', message: 'Uploading document to server...' },
    { name: 'Reading', message: 'Reading and analyzing document...' },
    { name: 'Extracting', message: 'Extracting key information...' },
    { name: 'Processing', message: 'Processing data and generating results...' },
    { name: 'Done', message: 'Processing completed successfully!' }
  ], []);

  const picraStages = useMemo(() => [
    { 
      name: 'Validation', 
      message: 'Validating PICRA document...',
      step: 'validation'
    },
    { 
      name: 'OCR Processing', 
      message: 'Extracting text with OCR...',
      step: 'documentAI'
    },
    { 
      name: 'AI Analysis', 
      message: 'Analyzing with AI...',
      step: 'openAI'
    },
    { 
      name: 'Quote Generation', 
      message: 'Generating quote...',
      step: 'quoteGeneration'
    },
    { 
      name: 'Complete', 
      message: 'Processing completed successfully!',
      step: 'completed'
    }
  ], []);

  const startProgress = useCallback(async () => {
    setCurrentStage(0);
    setProgress(0);
    setStageMessages([]);
    setIsCompleted(false);

    // Simulate the entire process
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      setCurrentStage(stageIndex);
      
      // Add stage message
      setStageMessages(prev => [...prev, {
        stage: stages[stageIndex].name,
        message: stages[stageIndex].message,
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Simulate progress within each stage
      const stageProgress = 100 / stages.length;
      const startProgress = stageIndex * stageProgress;
      
      for (let i = 0; i <= 20; i++) {
        const currentProgress = startProgress + (stageProgress * i / 20);
        setProgress(currentProgress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Add a small delay between stages
      if (stageIndex < stages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Complete the process
    setIsCompleted(true);
    setTimeout(() => {
      onComplete && onComplete();
    }, 1000);
  }, [stages, onComplete]);

  useEffect(() => {
    if (isOpen) {
      startProgress();
    }
  }, [isOpen, startProgress]);

  useEffect(() => {
    // Update stage messages when status changes
    if (status && status.trim()) {
      setStageMessages(prev => [...prev, {
        stage: 'Status',
        message: status,
        timestamp: new Date().toLocaleTimeString(),
        isStatus: true
      }]);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal">
        <div className="progress-modal-header">
          <h2>Processing Your Documents</h2>
          <p>Please wait while we process your uploaded files...</p>
        </div>

        <div className="progress-container">
          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="progress-text">
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Current Stage */}
        <div className="current-stage">
          <div className="stage-indicator">
            <span className="stage-number">{currentStage + 1}</span>
            <span className="stage-name">{stages[currentStage].name}</span>
          </div>
          <p className="stage-message">
            {status && status.trim() ? status : stages[currentStage].message}
          </p>
        </div>

        {/* PICRA Processing Steps */}
        {showSteps && (
          <div className="picra-steps">
            <h4>Processing Steps</h4>
            <div className="steps-container">
              {picraStages.map((stage, index) => {
                const isActive = stage.step === currentStep;
                const isCompleted = picraStages.findIndex(s => s.step === currentStep) > index;
                
                return (
                  <div 
                    key={index} 
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="step-indicator">
                      {isCompleted ? (
                        <span className="step-check">✓</span>
                      ) : (
                        <span className="step-number">{index + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <span className="step-name">{stage.name}</span>
                      <span className="step-message">{stage.message}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Log */}
        <div className="progress-log">
          <h4>Progress Log</h4>
          <div className="log-entries">
            {stageMessages.map((entry, index) => (
              <div key={index} className={`log-entry ${entry.isStatus ? 'status-entry' : ''}`}>
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-stage">{entry.stage}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="progress-modal-actions">
          <button 
            className="btn btn-secondary cancel-btn"
            onClick={onClose}
            disabled={isCompleted}
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal; 