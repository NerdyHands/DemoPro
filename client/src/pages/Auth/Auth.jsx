import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import apiService from '../../services/api.jsx';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: email/form, 2: OTP, 3: success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    userType: 'client',
    waitlistReason: '',
    role: 'client'
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
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
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
    }
    return true;
  };

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

  // Google Sign-In handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setIsLoading(true);
        setError('');
        
        // Decode the JWT token to get user information
        const decoded = jwtDecode(credentialResponse.access_token);
        
        // Prepare user data for registration/login
        const userData = {
          email: decoded.email,
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          googleId: decoded.sub,
          profilePicture: decoded.picture,
          isGoogleUser: true
        };

        // Try to register/login with Google
        const response = await apiService.googleAuth(userData);
        
        if (response.success) {
          // Store the token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          setError(response.message || 'Google authentication failed');
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        setError('Google authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
      setIsLoading(false);
    }
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const otpType = isLogin ? 'login' : 'registration';
      const response = await apiService.sendOTP(formData.email, otpType);
      console.log('OTP sent to:', formData.email);
      
      // In development mode, store the OTP code to display on page
      if (response.devOtp) {
        setDevOtp(response.devOtp);
        console.log('🔑 DEV OTP:', response.devOtp);
      }
      
      // Set countdown and disable resend
      setCountdown(30);
      setIsResendDisabled(true);
      
      // Move to OTP step
      setStep(2);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      
      const errorMessage = error.message || '';
      if (isLogin && (errorMessage.includes('User not found') || errorMessage.includes('No account found'))) {
        setError('No account found with this email address. Please sign up for a new account.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const otpType = isLogin ? 'login' : 'registration';
      const response = await apiService.sendOTP(formData.email, otpType);
      console.log('OTP resent to:', formData.email);
      
      // In development mode, store the OTP code to display on page
      if (response.devOtp) {
        setDevOtp(response.devOtp);
        console.log('🔑 DEV OTP:', response.devOtp);
      }
      
      setCountdown(30);
      setIsResendDisabled(true);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      setError('Failed to resend verification code. Please try again.');
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
      if (isLogin) {
        // Login flow
        const result = await apiService.verifyOTP(formData.email, otpCode);
        console.log('OTP verified:', result);
        
        // Store auth token and user profile
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        if (result.user) {
          localStorage.setItem('userProfile', JSON.stringify(result.user));
        }
      } else {
        // Signup flow
        const result = await apiService.register(formData);
        console.log('Registration successful:', result);
        
        // Store auth token and user profile
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        if (result.user) {
          localStorage.setItem('userProfile', JSON.stringify(result.user));
        }
      }
      
      // Move to success step
      setStep(3);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h1>Welcome to Mr Demo Pro</h1>
        <p>{isLogin ? 'Sign in to your account' : 'Get started - it\'s free. No credit card needed.'}</p>
        {!isLogin && (
          <div className="no-credit-card-banner">
            <span className="no-credit-card-icon">💳</span>
            <span className="no-credit-card-text">No credit card required</span>
          </div>
        )}
        {isLogin && (
          <div className="no-credit-card-subtle">
            <span>No credit card required</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSendOtp} className="auth-form">
        {!isLogin && (
          <>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="First name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Last name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input-field"
                placeholder="Company name (optional)"
                disabled={isLoading}
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="name@company.com"
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary auth-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : (isLogin ? 'Continue' : 'Continue')}
        </button>
      </form>
      
      <div className="auth-footer">
        <div className="divider">
          <span>Or</span>
        </div>
        
        <button 
          type="button"
          className="btn btn-google"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        {!isLogin && (
          <div className="no-credit-card-note">
            <span>💳 No credit card required to get started</span>
          </div>
        )}
        
        <div className="auth-switch">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setStep(1);
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setStep(1);
                }}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderOTP = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <h1>Enter verification code</h1>
        <p>We've sent a 6-digit code to {formData.email}</p>
      </div>
      
      {devOtp && (
        <div className="dev-otp-display">
          <div className="dev-otp-badge">DEV MODE</div>
          <div className="dev-otp-code">Your OTP: <strong>{devOtp}</strong></div>
          <p className="dev-otp-note">This only appears in development mode</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleVerifyOtp} className="auth-form">
        <div className="form-group">
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
          className="btn btn-primary auth-btn"
          disabled={otpDigits.join('').length !== 6 || isLoading}
        >
          {isLoading ? 'Verifying...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
        
        <div className="resend-section">
          <p className="resend-text">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled || isLoading}
              className="resend-btn"
            >
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </p>
        </div>
      </form>
      
      <div className="auth-footer">
        <button 
          onClick={() => {
            setStep(1);
            setError('');
          }} 
          className="back-btn"
          disabled={isLoading}
        >
          ← Back to {isLogin ? 'sign in' : 'sign up'}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="auth-form-container">
      <div className="auth-header">
        <div className="success-icon">✓</div>
        <h1>{isLogin ? 'Sign in successful!' : 'Account created successfully!'}</h1>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-left">
        {step === 1 && renderForm()}
        {step === 2 && renderOTP()}
        {step === 3 && renderSuccess()}
      </div>
      
      <div className="auth-right">
        <div className="auth-illustration">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-logo">Mr Demo Pro</div>
              <div className="mockup-nav">
                <span className="nav-item active">Dashboard</span>
                <span className="nav-item">Projects</span>
                <span className="nav-item">Reports</span>
              </div>
            </div>
            <div className="mockup-content">
              <div className="mockup-card">
                <div className="card-header">
                  <h3>Recent Projects</h3>
                  <span className="status-badge">3 Active</span>
                </div>
                <div className="card-items">
                  <div className="item">
                    <div className="item-icon">🏠</div>
                    <div className="item-content">
                      <div className="item-title">Property Inspection</div>
                      <div className="item-subtitle">123 Main St, Hampton VA</div>
                    </div>
                    <div className="item-status completed">✓</div>
                  </div>
                  <div className="item">
                    <div className="item-icon">📋</div>
                    <div className="item-content">
                      <div className="item-title">Demolition Project</div>
                      <div className="item-subtitle">456 Oak Ave, Newport News</div>
                    </div>
                    <div className="item-status in-progress">●</div>
                  </div>
                  <div className="item">
                    <div className="item-icon">📄</div>
                    <div className="item-content">
                      <div className="item-title">Contract Review</div>
                      <div className="item-subtitle">789 Pine Rd, Virginia Beach</div>
                    </div>
                    <div className="item-status pending">○</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive elements */}
          <div className="interaction-points">
            <div className="point point-1">
              <div className="point-circle"></div>
            </div>
            <div className="point point-2">
              <div className="point-circle"></div>
            </div>
            <div className="point point-3">
              <div className="point-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
