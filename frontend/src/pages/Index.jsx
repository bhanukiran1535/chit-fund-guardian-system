import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { LoginForm } from '../components/LoginForm';
import { Header } from '../components/Header';
import './Index.css';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm onLogin={login} />;
  }
  
  return (
    <div className="app-container">
      <Header user={user} onLogout={logout} />
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