import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth-pages.css';

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
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
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/send-otp`, {
        method: 'POST',
        body: { email },
        showToast: false
      });

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
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/verify-otp`, {
        method: 'POST',
        body: { email, otp },
        showToast: false
      });

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

    // Validation
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

    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/create`, {
        method: 'POST',
        body: {
          firstName,
          lastName,
          email,
          phoneNo,
          password
        },
        showToast: false
      });

      // Auto-login after account creation
      login({
        id: data.user._id,
        email: data.user.email,
        isAdmin: data.user.isAdmin,
        token: data.token
      });
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Header with back button */}
      <div className="auth-header-top">
        <motion.button
          onClick={() => navigate('/')}
          className="back-button"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-card auth-card-signup"
      >
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-logo">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1>Create Your Chitfunds Account</h1>
          <p>Join thousands of groups managing chit funds securely</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form auth-form-signup">
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="form-input"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phoneNo">Phone Number</label>
            <input
              id="phoneNo"
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="+91 98765 43210"
              className="form-input"
              required
            />
          </div>

          {/* Email Verification */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
                placeholder="you@example.com"
                className={`form-input ${isEmailVerified ? 'verified' : ''}`}
                required
                disabled={isEmailVerified}
              />
              {!isEmailVerified && (
                <motion.button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isVerifyingEmail || !email}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="verify-button"
                >
                  {isVerifyingEmail ? 'Sending...' : 'Verify'}
                </motion.button>
              )}
              {isEmailVerified && (
                <div className="verified-badge">
                  <CheckCircle className="w-5 h-5" />
                  Verified
                </div>
              )}
            </div>

            {/* OTP Input */}
            <AnimatePresence>
              {showOtpInput && !isEmailVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="otp-container"
                >
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="form-input otp-input"
                    maxLength="6"
                  />
                  <motion.button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || !otp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="verify-otp-button"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Password Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
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
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="form-error"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="form-success"
            >
              {success}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !isEmailVerified}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="auth-submit-button"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <div className="auth-footer-text">
          <p>Already have an account? <motion.button
            onClick={() => navigate('/login')}
            className="auth-link"
            whileHover={{ textDecoration: 'underline' }}
          >
            Sign in here
          </motion.button></p>
        </div>

        {/* Terms */}
        <div className="auth-terms">
          <p className="text-xs text-slate-500">
            By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="auth-trust-indicators">
          <div className="indicator">
            <div className="indicator-dot" />
            <span>Bank-grade Security</span>
          </div>
          <div className="indicator">
            <div className="indicator-dot" />
            <span>Two-Factor Auth</span>
          </div>
          <div className="indicator">
            <div className="indicator-dot" />
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
