import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.jsx';

const Login = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: success
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null); // Store OTP in dev mode
  const navigate = useNavigate();
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  // Debug environment on mount
  useEffect(() => {
    console.log('🔍 Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      isDevelopment
    });
  }, [isDevelopment]);

  // Debug error state changes
  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, setCountdown, setIsResendDisabled]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      
      // Update formData
      setFormData({
        ...formData,
        otp: newOtpDigits.join('')
      });
      
      // Clear error when user starts typing
      if (error) {
        setError('');
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setError('');
    setIsLoading(true);
    setDevOtp(null);
    
    try {
      // Send OTP using API service
      const sendResponse = await apiService.sendOTP(formData.email);
      console.log('OTP sent to:', formData.email);
      console.log('Send OTP Response:', sendResponse);
      
      // In development mode, check if OTP is in the response
      console.log('🔍 Checking if should fetch OTP - isDevelopment:', isDevelopment);
      console.log('🔍 Send OTP Response full object:', JSON.stringify(sendResponse, null, 2));
      
      if (isDevelopment) {
        // First check if OTP was included in the send response (faster)
        if (sendResponse && sendResponse.devOtp) {
          console.log('✅✅✅ SUCCESS! OTP from send response:', sendResponse.devOtp);
          setDevOtp(sendResponse.devOtp);
          alert(`🔑 DEV MODE - Your OTP is: ${sendResponse.devOtp}`);
        } else {
          console.log('⚠️ No devOtp in send response, trying status endpoint...');
          // Otherwise, fetch from status endpoint
          // Add a small delay to ensure OTP is created in the database
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            console.log('🔑 Fetching OTP status for:', formData.email);
            const otpStatus = await apiService.getOTPStatus(formData.email);
            console.log('🔑 OTP Status Response:', otpStatus);
            console.log('🔑 OTP Status Type:', typeof otpStatus);
            console.log('🔑 OTP Status Keys:', Object.keys(otpStatus || {}));
            
            if (otpStatus && otpStatus.hasActiveOTP) {
              setDevOtp(otpStatus.otp);
              console.log('✅✅✅ SUCCESS! OTP from status endpoint:', otpStatus.otp);
              alert(`🔑 DEV MODE - Your OTP is: ${otpStatus.otp}`);
            } else {
              console.log('⚠️ No active OTP found in response:', otpStatus);
            }
          } catch (err) {
            console.error('❌ Failed to fetch OTP status:', err);
            console.error('❌ Error details:', err.message, err.stack);
          }
        }
      } else {
        console.log('⚠️ NOT in development mode - OTP will not be displayed');
      }
      
      // Set countdown and disable resend
      setCountdown(30);
      setIsResendDisabled(true);
      
      // Move to OTP step
      setStep(2);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      
      // Check if it's a "User not found" error
      console.log('Error message:', error.message);
      const errorMessage = error.message || '';
      if (errorMessage.includes('User not found') || 
          errorMessage.includes('No account found') || 
          errorMessage.includes('User not found')) {
        console.log('Setting user not found error');
        setError('No account found with this email address. Please register for a new account.');
      } else {
        console.log('Setting generic error');
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    
    setError('');
    setIsLoading(true);
    setDevOtp(null);
    
    try {
      const sendResponse = await apiService.sendOTP(formData.email);
      console.log('OTP resent to:', formData.email);
      console.log('Resend OTP Response:', sendResponse);
      
      // In development mode, fetch the OTP for display
      console.log('🔍 Resend OTP Response full object:', JSON.stringify(sendResponse, null, 2));
      
      if (isDevelopment) {
        // First check if OTP was included in the send response
        if (sendResponse && sendResponse.devOtp) {
          console.log('✅✅✅ SUCCESS! OTP from resend response:', sendResponse.devOtp);
          setDevOtp(sendResponse.devOtp);
          alert(`🔑 DEV MODE - Your NEW OTP is: ${sendResponse.devOtp}`);
        } else {
          console.log('⚠️ No devOtp in resend response, trying status endpoint...');
          // Otherwise, fetch from status endpoint
          // Add a small delay to ensure OTP is created in the database
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            console.log('🔑 Fetching OTP status after resend for:', formData.email);
            const otpStatus = await apiService.getOTPStatus(formData.email);
            console.log('🔑 OTP Status Response after resend:', otpStatus);
            
            if (otpStatus && otpStatus.hasActiveOTP) {
              setDevOtp(otpStatus.otp);
              console.log('✅✅✅ SUCCESS! OTP from status endpoint after resend:', otpStatus.otp);
              alert(`🔑 DEV MODE - Your NEW OTP is: ${otpStatus.otp}`);
            } else {
              console.log('⚠️ No active OTP found after resend:', otpStatus);
            }
          } catch (err) {
            console.error('❌ Failed to fetch OTP status after resend:', err);
            console.error('❌ Error details:', err.message, err.stack);
          }
        }
      } else {
        console.log('⚠️ NOT in development mode - OTP will not be displayed');
      }
      
      setCountdown(30);
      setIsResendDisabled(true);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      
      // Check if it's a "User not found" error
      if (error.message && (error.message.includes('User not found') || error.message.includes('No account found'))) {
        setError('No account found with this email address. Please register for a new account.');
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    
    if (otpCode.length !== 6) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      // Verify OTP using API service
      const result = await apiService.verifyOTP(formData.email, otpCode);
      console.log('OTP verified:', result);
      
      // Store auth token and user profile
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      if (result.user) {
        localStorage.setItem('userProfile', JSON.stringify(result.user));
      }
      
      // Move to success step
      setStep(3);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="login-card">
      <div className="login-header">
        <h1>Welcome to ezPICRA</h1>
        <p>Enter your email to receive a verification code</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSendOtp} className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your email address"
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
      
      <div className="login-footer">
        <Link to="/signup" className="link">
          New user? Register for an account
        </Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="login-card">
      <div className="login-header">
        <h1>Enter Verification Code</h1>
        <p>We've sent a 6-digit code to {formData.email}</p>
        {isDevelopment && (
          <div style={{
            marginTop: '20px',
            marginBottom: '20px',
            padding: '24px',
            background: devOtp ? 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)' : '#f8f9fa',
            border: devOtp ? '3px solid #ff6b6b' : '2px solid #dee2e6',
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center',
            boxShadow: devOtp ? '0 4px 12px rgba(255, 107, 107, 0.3)' : 'none',
            animation: devOtp ? 'pulse 2s infinite' : 'none'
          }}>
            {devOtp ? (
              <>
                <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>
                  🎯 DEV MODE - YOUR OTP CODE 🎯
                </div>
                <code style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  letterSpacing: '12px',
                  color: '#d32f2f',
                  background: '#fff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  border: '2px solid #ff6b6b',
                  display: 'inline-block',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>{devOtp}</code>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#856404' }}>
                  👆 Copy this code into the boxes below
                </div>
              </>
            ) : (
              <div style={{ color: '#6c757d' }}>
                🔍 DEV MODE - Fetching OTP...
                <br />
                <small>Check console for details</small>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleVerifyOtp} className="login-form">
        <div className="form-group">
          <label className="label">Verification Code</label>
          <div className="otp-container">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                maxLength={1}
                autoFocus={index === 0}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary login-btn"
          disabled={otpDigits.join('').length !== 6 || isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify & Login'}
        </button>
        
        <div className="resend-section">
          <p className="resend-text">
            Didn't receive the code? 
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled || isLoading}
              className="resend-btn"
            >
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </p>
        </div>
      </form>
      
      <div className="login-footer">
        <button 
          onClick={() => {
            setStep(1);
            setError('');
          }} 
          className="back-btn"
          disabled={isLoading}
        >
          ← Back to Email
        </button>
      </div>
      
      {isDevelopment && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#333'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>NODE_ENV: {process.env.NODE_ENV}</div>
          <div>hostname: {window.location.hostname}</div>
          <div>isDevelopment: {String(isDevelopment)}</div>
          <div>devOtp: {devOtp || 'null'}</div>
          <div>step: {step}</div>
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={async () => {
                console.log('🔄 Manual OTP fetch triggered');
                try {
                  const otpStatus = await apiService.getOTPStatus(formData.email);
                  console.log('🔑 Manual fetch result:', otpStatus);
                  if (otpStatus && otpStatus.hasActiveOTP) {
                    setDevOtp(otpStatus.otp);
                    alert(`OTP: ${otpStatus.otp}`);
                  } else {
                    alert('No active OTP found. Check console for details.');
                  }
                } catch (err) {
                  console.error('❌ Manual fetch error:', err);
                  alert(`Error: ${err.message}`);
                }
              }}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px'
              }}
            >
              🔄 Manually Fetch OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="login-card">
      <div className="login-header">
        <div className="success-icon">✓</div>
        <h1>Login Successful!</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="login-container">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default Login; 