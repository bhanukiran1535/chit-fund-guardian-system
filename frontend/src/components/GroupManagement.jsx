import { useEffect, useState } from 'react';
import { Calendar, Users, Settings, Eye, Plus } from 'lucide-react';
import './GroupManagement.css';

export const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);


  const parseStartMonth = (startMonth) => {
  const [month, year] = startMonth.split(' ');
  const monthIndex = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ].indexOf(month);
  return new Date(parseInt(year), monthIndex);
};


const fetchGroups = async () => {
  try {
    const statuses = ['active', 'upcoming'];

    const responses = await Promise.all(
      statuses.map(status =>
        fetch(`${import.meta.env.VITE_API_BASE_URL}/group/allGroups?status=${status}`, {
          credentials: 'include',
        }).then(res => res.json())
      )
    );

    const allGroups = responses.flatMap(r => (r.success ? r.groups : []));
    setGroups(allGroups);
  } catch (err) {
    console.error('Failed to fetch groups:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchGroups();
  }, []);

  const getStatusBadge = (status) =>{
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

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
                            style={{ width: `${(group?.months?.length / group.tenure) * 100}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {group?.months?.length}/{group.tenure}
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
                        <button className="action-btn secondary">
                          <Eye className="btn-icon" />
                          View
                        </button>
                        <button className="action-btn secondary">
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
    </div>
  );
};
