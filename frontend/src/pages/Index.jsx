import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { Header } from '../components/Header';
import Landing from './Landing';
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

  // Show landing page if user is not authenticated
  if (!user) {
    return <Landing />;
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