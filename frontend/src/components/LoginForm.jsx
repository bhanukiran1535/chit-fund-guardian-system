<<<<<<< HEAD:src/components/LoginForm.jsx

=======
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx
import { useState } from 'react';
import { Shield } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD:src/components/LoginForm.jsx
=======
  const [error, setError] = useState('');
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
<<<<<<< HEAD:src/components/LoginForm.jsx
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      onLogin({
        id: '1',
        email,
        alias: 'John Doe',
        isAdmin: email.includes('admin'),
        token: 'mock-jwt-token'
      });
      setIsLoading(false);
    }, 1000);
=======
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // VERY IMPORTANT to send cookies
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Pass user data to parent (likely App.jsx or AuthProvider)
      onLogin({
        id: data.user._id,
        email: data.user.email,
        isAdmin: data.user.isAdmin,
        token: data.token
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <Shield className="logo-icon" />
          </div>
          <h1 className="login-title">ChitFund Guardian</h1>
          <p className="login-subtitle">Sign in to manage your chit fund groups</p>
        </div>
<<<<<<< HEAD:src/components/LoginForm.jsx
        
=======

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>
<<<<<<< HEAD:src/components/LoginForm.jsx
          
=======

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
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
<<<<<<< HEAD:src/components/LoginForm.jsx
          
=======

          {error && <p className="login-error">{error}</p>}

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/LoginForm.jsx
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
