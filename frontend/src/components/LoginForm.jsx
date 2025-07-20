import { useState } from 'react';
import { Shield } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    
    setIsVerifyingEmail(true);
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      setShowOtpInput(true);
      setSuccess('OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    setIsVerifyingOtp(true);
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }
      
      setIsEmailVerified(true);
      setShowOtpInput(false);
      setSuccess('Email verified successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (isSignUp) {
      // Validation for signup
      if (!isEmailVerified) {
        setError('Please verify your email first');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
    }

    try {
      const endpoint = isSignUp ? '/user/create' : '/user/login';
      const body = isSignUp 
        ? { 
            firstName, 
            lastName, 
            email, 
            phoneNo, 
            password 
          }
        : { email, password };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(body),
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isSignUp ? 'Registration failed' : 'Login failed'));
      }

      if (isSignUp) {
        setSuccess('Account created successfully! Please sign in.');
        setIsSignUp(false);
        // Clear form
        setFirstName('');
        setLastName('');
        setPhoneNo('');
        setConfirmPassword('');
        setEmail('');
        setPassword('');
      } else {
        // Pass user data to parent (likely App.jsx or AuthProvider)
        onLogin({
          id: data.user._id,
          email: data.user.email,
          isAdmin: data.user.isAdmin,
          token: data.token
        });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <Shield className="logo-icon" />
          </div>
          <h1 className="login-title">MS ChitFund</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create your account to get started' : 'Sign in to manage your chit fund groups'}
          </p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={`toggle-button ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setSuccess('');
              setIsEmailVerified(false);
              setShowOtpInput(false);
              setOtp('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`toggle-button ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setSuccess('');
              setIsEmailVerified(false);
              setShowOtpInput(false);
              setOtp('');
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNo" className="form-label">Phone Number</label>
                <input
                  id="phoneNo"
                  type="tel"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  placeholder="Enter your phone number"
                  className="form-input"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="email-verification-container">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isEmailVerified) {
                    setIsEmailVerified(false);
                    setShowOtpInput(false);
                  }
                }}
                placeholder="Enter your email"
                className={`form-input ${isEmailVerified ? 'verified' : ''}`}
                required
                disabled={isEmailVerified && isSignUp}
              />
              {isSignUp && !isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isVerifyingEmail || !email}
                  className="verify-button"
                >
                  {isVerifyingEmail ? 'Sending...' : 'Verify'}
                </button>
              )}
              {isSignUp && isEmailVerified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            
            {isSignUp && showOtpInput && (
              <div className="otp-container">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="form-input otp-input"
                  maxLength="6"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || !otp}
                  className="verify-otp-button"
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
              className="form-input"
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
                required
              />
            </div>
          )}

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading 
              ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
              : (isSignUp ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>
      </div>
    </div>
  );
};
