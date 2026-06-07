import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import Landing from './Landing';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black tracking-tight">
            MS
          </div>
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return <Landing />;

  return user.isAdmin ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
};

export default Index;
