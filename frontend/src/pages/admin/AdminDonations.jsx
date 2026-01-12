import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PENDING, FAILED
  const [purposeFilter, setPurposeFilter] = useState('ALL'); // ALL, GENERAL, ZAKAT, CAMPAIGN
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    completedAmount: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDonations(token);
  }, [navigate]);

  const fetchDonations = async (token) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/admin/donations', { headers });
      setDonations(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (donationsList) => {
    const completed = donationsList.filter(d => d.paymentStatus === 'COMPLETED');
    const pending = donationsList.filter(d => d.paymentStatus === 'PENDING');
    const failed = donationsList.filter(d => d.paymentStatus === 'FAILED');
    
    const totalAmount = donationsList.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const completedAmount = completed.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    setStats({
      total: donationsList.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      totalAmount: totalAmount.toFixed(2),
      completedAmount: completedAmount.toFixed(2)
    });
  };

  const getFilteredDonations = () => {
    return donations.filter(donation => {
      const statusMatch = filter === 'ALL' || donation.paymentStatus === filter;
      const purposeMatch = purposeFilter === 'ALL' || donation.purpose === purposeFilter;
      return statusMatch && purposeMatch;
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPurposeBadge = (purpose) => {
    const styles = {
      GENERAL: 'bg-blue-100 text-blue-800',
      ZAKAT: 'bg-purple-100 text-purple-800',
      CAMPAIGN: 'bg-orange-100 text-orange-800'
    };
    const labels = {
      GENERAL: 'General',
      ZAKAT: 'Zakat',
      CAMPAIGN: 'Campaign'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[purpose] || 'bg-gray-100 text-gray-800'}`}>
        {labels[purpose] || purpose}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredDonations();
    const csv = [
      ['ID', 'Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Purpose', 'Status', 'Type', 'Campaign ID', 'Message'].join(','),
      ...filtered.map(d => [
        d.id,
        formatDate(d.createdAt),
        d.donorName || 'Anonymous',
        d.donorEmail,
        d.amount,
        d.currency,
        d.purpose,
        d.paymentStatus,
        d.type,
        d.campaignId || '-',
        (d.message || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredDonations = getFilteredDonations();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-masjid-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-masjid-green text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            📥 Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total" value={stats.total} color="bg-blue-500" />
          <StatCard title="Completed" value={stats.completed} color="bg-green-500" />
          <StatCard title="Pending" value={stats.pending} color="bg-yellow-500" />
          <StatCard title="Failed" value={stats.failed} color="bg-red-500" />
          <StatCard title="Total Amount" value={`€${stats.totalAmount}`} color="bg-purple-500" />
          <StatCard title="Completed €" value={`€${stats.completedAmount}`} color="bg-teal-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-masjid-green focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose Filter</label>
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-masjid-green focus:border-transparent"
              >
                <option value="ALL">All Purposes</option>
                <option value="GENERAL">General</option>
                <option value="ZAKAT">Zakat</option>
                <option value="CAMPAIGN">Campaign</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('ALL');
                  setPurposeFilter('ALL');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredDonations.length} of {donations.length} donations
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{donation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donorName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {donation.amount} {donation.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPurposeBadge(donation.purpose)}
                        {donation.campaignId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Campaign #{donation.campaignId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(donation.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.type === 'ONE_TIME' ? 'One-time' : 'Recurring'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {donation.message || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${color.replace('bg-', 'text-')}`}>
        {value}
      </div>
    </div>
  );
}
