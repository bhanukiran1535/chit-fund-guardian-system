
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './MonthlyPayments.css';

export const MonthlyPayments = ({ groups }) => {
  // Mock monthly payment data
  const payments = [
    {
      id: '1',
      groupNo: 'G001',
      month: 'March 2024',
      amount: 5000,
      dueDate: '2024-03-15',
      status: 'due',
      paymentMethod: null
    },
    {
      id: '2',
      groupNo: 'G002',
      month: 'March 2024',
      amount: 5000,
      dueDate: '2024-03-20',
      status: 'paid',
      paymentMethod: 'Cash',
      paidDate: '2024-03-18'
    },
    {
      id: '3',
      groupNo: 'G001',
      month: 'February 2024',
      amount: 5000,
      dueDate: '2024-02-15',
      status: 'paid',
      paymentMethod: 'Online',
      paidDate: '2024-02-14'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="status-icon green" />;
      case 'due': return <AlertCircle className="status-icon red" />;
      case 'pending': return <Clock className="status-icon yellow" />;
      default: return <Clock className="status-icon gray" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  return (
    <div className="payments-card">
      <div className="card-header">
        <div className="header-content">
          <DollarSign className="header-icon" />
          <div>
            <h2 className="card-title">Monthly Payments</h2>
            <p className="card-subtitle">Track your monthly contributions across all groups</p>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-medium">{payment.groupNo}</td>
                  <td>{payment.month}</td>
                  <td className="amount">₹{payment.amount.toLocaleString()}</td>
                  <td>{new Date(payment.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </td>
                  <td>
                    {payment.status === 'due' ? (
                      <button className="action-btn primary">Pay Now</button>
                    ) : payment.status === 'paid' ? (
                      <button className="action-btn disabled" disabled>
                        Paid {payment.paidDate && `on ${new Date(payment.paidDate).toLocaleDateString()}`}
                      </button>
                    ) : (
                      <button className="action-btn secondary">View Details</button>
                    )}
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
