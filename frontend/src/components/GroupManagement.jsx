import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Eye, Plus } from 'lucide-react';
import { GroupDetailsView } from './GroupDetailsView';
import './GroupManagement.css';
import { apiFetch } from '../lib/api';

export const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();


  const parseStartMonth = (startMonth) => {
  const [month, year] = startMonth.split(' ');
  const monthIndex = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ].indexOf(month);
  return new Date(parseInt(year), monthIndex);
};


const fetchGroups = async () => {
  setLoading(true);
  try {
    const statuses = ['active', 'upcoming'];
    const responses = await Promise.all(
      statuses.map(status =>
        apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/allGroups?status=${status}`, { showToast: false })
      )
    );
    const allGroups = responses.flatMap(r => (r.success ? r.groups : []));
    setGroups(allGroups);
  } catch (err) {
    setGroups([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchGroups();
  }, []);

function calculateCurrentMonth(startDateISO) {
  const startDate = new Date(startDateISO);
  if (isNaN(startDate)) return 0;

  const now = new Date();

  const monthsPassed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth()) + 1;

  return monthsPassed > 0 ? monthsPassed : 0;
}


  const getStatusBadge = (status) =>{
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  if (loading) return <p>Loading groups...</p>;
  if (groups.length === 0) return <p>No groups found.</p>;

  return (
    <div className="groups-card">
      <div className="card-header">
        <div className="header-content">
          <div className="header-left">
            <Calendar className="header-icon" />
            <div>
              <h2 className="card-title">Group Management</h2>
              <p className="card-subtitle">Manage all chit fund groups and their members</p>
            </div>
          </div>
          <button className="create-btn">
            <Plus className="btn-icon" />
            Create Group
          </button>
        </div>
      </div>
      
      <div className="card-content">
        {loading ? (
          <p>Loading groups...</p>
        ) : (
          <div className="table-container">
            <table className="groups-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Chit Value</th>
                  <th>Progress</th>
                  <th>Members</th>
                  <th>Monthly Collection</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group._id}>
                    <td>
                      <div className="group-cell">
                        <div className="group-name">{group.groupNo}</div>
                        <div className="group-start">Started: {new Date(group.startMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                      </div>
                    </td>
                    <td className="chit-value">
                      ₹{group.chitValue.toLocaleString()}
                    </td>
                    <td>
                    <div className="progress-cell">
  <div className="progress-bar">
    <div 
      className="progress-fill"   
      style={{ 
        width: `${group.startMonth && group.tenure ? Math.min(((calculateCurrentMonth(group.startMonth)) / group.tenure) * 100, 100) : 0}%` 
      }}
    ></div>
  </div>
  <span className="progress-text">
    {group.startMonth ? calculateCurrentMonth(group.startMonth) : 0}/{group.tenure}
  </span>
</div>

                    </td>
                    <td>
                      <div className="members-cell">
                        <Users className="members-icon" />
                        <span>{group.members?.length || 0}</span>
                      </div>
                    </td>
                    <td>
                      {group.status === 'active' ? (
                        <span className="collection-active">
                          ₹{group.chitValue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="collection-completed">Completed</span>
                      )}
                    </td>
                    <td>{getStatusBadge(group.status)}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="action-btn secondary"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <Eye className="btn-icon" />
                          View
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => navigate(`/admin/group/${group._id}/manage`)}
                        >
                          <Settings className="btn-icon" />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetailsView 
          group={selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
        />
      )}
    </div>
  );
};
