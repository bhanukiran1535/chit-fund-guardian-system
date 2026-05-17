import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../lib/api';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useAuth } from '../context/AuthContext';
import '../styles/auth-pages.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
        method: 'POST',
        body: { email, password },
        showToast: false
      });

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
        className="auth-card"
      >
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-logo">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1>Sign In to Chitfunds</h1>
          <p>Access your chit groups and manage your finances securely</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>

          <motion.button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="forgot-password-link"
            whileHover={{ x: 5 }}
          >
            Forgot Password?
          </motion.button>

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

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="auth-submit-button"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <div className="auth-footer-text">
          <p>Don't have an account? <motion.button
            onClick={() => navigate('/signup')}
            className="auth-link"
            whileHover={{ textDecoration: 'underline' }}
          >
            Create one now
          </motion.button></p>
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
};

export default Login;
