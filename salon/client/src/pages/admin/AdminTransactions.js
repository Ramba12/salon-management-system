import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/transactions?${params.toString()}`);
      setTransactions(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/transactions/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`/api/transactions/${id}/status`, { status: newStatus });
      toast.success('Transaction status updated');
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge bg-warning',
      completed: 'badge bg-success',
      failed: 'badge bg-danger',
      refunded: 'badge bg-info'
    };
    return statusClasses[status] || 'badge bg-secondary';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-salon-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 d-md-block sidebar">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item border-bottom mb-2 pb-2 px-3">
                <h6 className="text-muted text-uppercase small fw-bold">Management</h6>
              </li>
              <li className="nav-item"><Link className="nav-link" to="/admin"><i className="fas fa-tachometer-alt me-2"></i> Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/services"><i className="fas fa-cut me-2"></i> Services</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/bookings"><i className="fas fa-calendar-check me-2"></i> Bookings</Link></li>
              <li className="nav-item border-bottom my-2 py-2 px-3">
                <h6 className="text-muted text-uppercase small fw-bold">Financials</h6>
              </li>
              <li className="nav-item"><Link className="nav-link active" to="/admin/transactions"><i className="fas fa-money-bill-wave me-2"></i> Transactions</Link></li>
              <li className="nav-item border-bottom my-2 py-2 px-3">
                <h6 className="text-muted text-uppercase small fw-bold">People</h6>
              </li>
              <li className="nav-item"><Link className="nav-link" to="/admin/users"><i className="fas fa-users me-2"></i> Users</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/staff"><i className="fas fa-user-tie me-2"></i> Staff</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/reviews"><i className="fas fa-star me-2"></i> Reviews</Link></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">Transaction Analytics</h1>
            <div className="d-flex gap-2">
              <select 
                className="form-select w-auto" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm bg-salon-primary text-white">
                  <div className="card-body">
                    <h6 className="text-white-50 uppercase small">Total Revenue</h6>
                    <h2 className="mb-0">${parseFloat(stats.overview.total_revenue || 0).toLocaleString()}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted uppercase small">Completed Payments</h6>
                    <h2 className="mb-0">{stats.overview.completed_count || 0}</h2>
                    <small className="text-success fw-bold">${parseFloat(stats.overview.completed_revenue || 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted uppercase small">Pending Transactions</h6>
                    <h2 className="mb-0">{stats.overview.pending_count || 0}</h2>
                    <small className="text-warning fw-bold">Awaiting confirmation</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td><small className="text-muted">#TX-{t.id.toString().padStart(5, '0')}</small></td>
                      <td>
                        <div className="fw-bold">{t.customer_name}</div>
                      </td>
                      <td>{t.service_name}</td>
                      <td><span className="fw-bold">${parseFloat(t.amount).toFixed(2)}</span></td>
                      <td className="text-capitalize">{t.payment_method}</td>
                      <td>
                        <span className={getStatusBadge(t.payment_status)}>
                          {t.payment_status}
                        </span>
                      </td>
                      <td><small className="text-muted">{new Date(t.transaction_date).toLocaleDateString()}</small></td>
                      <td>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Action
                          </button>
                          <ul className="dropdown-menu">
                            {t.payment_status === 'pending' && (
                              <li><button className="dropdown-item text-success" onClick={() => handleStatusUpdate(t.id, 'completed')}>Mark Completed</button></li>
                            )}
                            {['pending', 'completed'].includes(t.payment_status) && (
                              <li><button className="dropdown-item text-danger" onClick={() => handleStatusUpdate(t.id, 'failed')}>Mark Failed</button></li>
                            )}
                            {t.payment_status === 'completed' && (
                              <li><button className="dropdown-item text-info" onClick={() => handleStatusUpdate(t.id, 'refunded')}>Issue Refund</button></li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">No transactions found matching your selection.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
