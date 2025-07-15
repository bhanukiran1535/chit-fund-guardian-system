import { useState, useEffect } from 'react';
import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { LoginForm } from '../components/LoginForm';
import { Header } from '../components/Header';
import './Index.css';

const Index = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on load using cookie
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
      credentials: 'include', // ✅ Important: send cookies
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData); // token already in cookie
  };

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content">
        {user.isAdmin ? (
          <AdminDashboard user={user} />
        ) : (
          <UserDashboard user={user} />
        )}
      </main>
    </div>
  );
};

export default Index;