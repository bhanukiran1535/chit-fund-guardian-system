
import { Calendar, Users, Settings, Eye, Plus } from 'lucide-react';
import './GroupManagement.css';

export const GroupManagement = () => {
  // Mock groups data
  const groups = [
    {
      id: '1',
      groupNo: 'G001',
      chitValue: 100000,
      tenure: 20,
      startMonth: 'January 2024',
      currentMonth: 3,
      totalMembers: 20,
      status: 'active',
      foremanCommission: 2000,
      monthlyCollection: 100000
    },
    {
      id: '2',
      groupNo: 'G002',
      chitValue: 50000,
      tenure: 10,
      startMonth: 'March 2024',
      currentMonth: 1,
      totalMembers: 10,
      status: 'active',
      foremanCommission: 1000,
      monthlyCollection: 50000
    },
    {
      id: '3',
      groupNo: 'G003',
      chitValue: 200000,
      tenure: 24,
      startMonth: 'February 2024',
      currentMonth: 2,
      totalMembers: 24,
      status: 'active',
      foremanCommission: 4000,
      monthlyCollection: 200000
    },
    {
      id: '4',
      groupNo: 'G004',
      chitValue: 75000,
      tenure: 15,
      startMonth: 'December 2023',
      currentMonth: 15,
      totalMembers: 15,
      status: 'completed',
      foremanCommission: 1500,
      monthlyCollection: 0
    }
  ];

  const getStatusBadge = (status) => {
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
                <tr key={group.id}>
                  <td>
                    <div className="group-cell">
                      <div className="group-name">{group.groupNo}</div>
                      <div className="group-start">Started: {group.startMonth}</div>
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
                          style={{ width: `${(group.currentMonth / group.tenure) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {group.currentMonth}/{group.tenure}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="members-cell">
                      <Users className="members-icon" />
                      <span>{group.totalMembers}</span>
                    </div>
                  </td>
                  <td>
                    {group.status === 'active' ? (
                      <span className="collection-active">₹{group.monthlyCollection.toLocaleString()}</span>
                    ) : (
                      <span className="collection-completed">Completed</span>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(group.status)}
                  </td>
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
      </div>
    </div>
  );
};
