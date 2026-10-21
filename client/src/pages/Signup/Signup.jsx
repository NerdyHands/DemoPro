import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.jsx';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: user info, 2: OTP verification, 3: success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    userType: 'client',
    waitlistReason: '',
    role: 'client' // Will be set based on userType
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (formData.userType === 'waitlist' && !formData.waitlistReason.trim()) {
      newErrors.waitlistReason = 'Please provide a reason for waitlist status';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
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
    
    if (!validateForm()) return;
    
    try {
      // Send OTP for registration
      await apiService.sendOTP(formData.email, 'registration');
      console.log('OTP sent to:', formData.email);
      
      // Set countdown and disable resend
      setCountdown(30);
      setIsResendDisabled(true);
      
      // Move to OTP step
      setStep(2);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    
    try {
      await apiService.sendOTP(formData.email, 'registration');
      console.log('OTP resent to:', formData.email);
      setCountdown(30);
      setIsResendDisabled(true);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      alert('Failed to resend OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    
    if (otpCode.length !== 6) return;
    
    try {
      // Create user account (without password for OTP-based auth)
      // OTP verification will be done in the backend
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
              role: formData.userType === 'waitlist' ? 'client' : 'client', // Always client role, but with waitlist flag
      isWaitlisted: formData.userType === 'waitlist',
      waitlistReason: formData.userType === 'waitlist' ? formData.waitlistReason : undefined,
        otp: otpCode // Include OTP for verification
      };
      
      const result = await apiService.createUser(userData);
      console.log('User account created successfully');
      
      // Store auth token and user profile if provided
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
      console.error('Failed to verify OTP or create account:', error);
      alert('Failed to verify OTP or create account. Please try again.');
    }
  };

  const renderStep1 = () => (
    <div className="signup-card">
      <div className="signup-header">
        <h1>Create Your Account</h1>
        <p>Join ezPICRA to manage your inspection projects</p>
      </div>
      
      <form onSubmit={handleSendOtp} className="signup-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName" className="label">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`input-field ${errors.firstName ? 'error' : ''}`}
              placeholder="Enter your first name"
              required
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName" className="label">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`input-field ${errors.lastName ? 'error' : ''}`}
              placeholder="Enter your last name"
              required
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="company" className="label">Company (Optional)</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your company name"
          />
        </div>

        {/* User Type Selection */}
        <div className="form-group">
          <label className="label">Account Type</label>
          <div className="user-type-options">
            <label className="user-type-option">
              <input
                type="radio"
                name="userType"
                value="client"
                checked={formData.userType === 'client'}
                onChange={handleChange}
              />
              <span className="radio-custom"></span>
              <span className="option-text">Client</span>
            </label>
            <label className="user-type-option">
              <input
                type="radio"
                name="userType"
                value="waitlist"
                checked={formData.userType === 'waitlist'}
                onChange={handleChange}
              />
              <span className="radio-custom"></span>
              <span className="option-text">Waitlist</span>
            </label>
          </div>
        </div>

        {/* Waitlist Reason Input */}
        {formData.userType === 'waitlist' && (
          <div className="form-group">
            <label htmlFor="waitlistReason" className="label">Reason for Waitlist Status *</label>
            <input
              type="text"
              id="waitlistReason"
              name="waitlistReason"
              value={formData.waitlistReason}
              onChange={handleChange}
              className={`input-field ${errors.waitlistReason ? 'error' : ''}`}
              placeholder="Please provide a reason for waitlist status"
              required
            />
            {errors.waitlistReason && <span className="error-message">{errors.waitlistReason}</span>}
          </div>
        )}
        
        <button type="submit" className="btn btn-primary signup-btn">
          Send Verification Code
        </button>
      </form>
      
      <div className="signup-footer">
        <Link to="/login" className="link">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="signup-card">
      <div className="signup-header">
        <h1>Verify Your Email</h1>
        <p>We've sent a 6-digit code to {formData.email}</p>
      </div>
      
      <form onSubmit={handleVerifyOtp} className="signup-form">
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
              />
            ))}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary signup-btn"
          disabled={otpDigits.join('').length !== 6}
        >
          Verify & Create Account
        </button>
        
        <div className="resend-section">
          <p className="resend-text">
            Didn't receive the code? 
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled}
              className="resend-btn"
            >
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </p>
        </div>
      </form>
      
      <div className="signup-footer">
        <button 
          onClick={() => setStep(1)} 
          className="back-btn"
        >
          ← Back to Registration
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="signup-card">
      <div className="signup-header">
        <div className="success-icon">✓</div>
        <h1>Account Created Successfully!</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="signup-container">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default Signup; 