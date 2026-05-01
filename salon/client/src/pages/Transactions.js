import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTransactions();
  }, []);

  const fetchMyTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions/my-transactions');
      setTransactions(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch transaction history');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 text-salon-primary">My Transactions</h1>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-salon-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <small className="text-muted">{formatDate(transaction.transaction_date)}</small>
                    </td>
                    <td>
                      <div className="fw-bold">{transaction.service_name}</div>
                    </td>
                    <td>
                      <span className="fw-bold">${parseFloat(transaction.amount).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="text-capitalize">{transaction.payment_method}</span>
                    </td>
                    <td>
                      <span className={getStatusBadge(transaction.payment_status)}>
                        {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">{transaction.notes || '-'}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 card shadow-sm">
          <div className="card-body">
            <i className="fas fa-receipt display-4 text-muted mb-3"></i>
            <h4 className="text-muted">No transactions found</h4>
            <p className="text-muted">You haven't made any payments yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
