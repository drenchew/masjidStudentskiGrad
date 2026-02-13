import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ donations: 0, orders: 0, subscribers: 0, products: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      // Let axios interceptor handle Authorization header automatically
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // If auth fails, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!user) {
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Donations"
            value={stats.donations}
            icon="💰"
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            icon="🛒"
            color="bg-blue-500"
          />
          <StatCard
            title="Subscribers"
            value={stats.subscribers}
            icon="📧"
            color="bg-purple-500"
          />
          <StatCard
            title="Products"
            value={stats.products}
            icon="📦"
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionButton
              title="Manage Products"
              description="Add, edit, or remove shop products"
              icon="🛍️"
              onClick={() => navigate('/admin/products')}
            />
            <ActionButton
              title="Manage Khutbahs"
              description="Upload and organize khutbah recordings"
              icon="🎤"
              onClick={() => navigate('/admin/khutbahs')}
            />
            <ActionButton
              title="View Donations"
              description="See all donations and generate reports"
              icon="💵"
              onClick={() => navigate('/admin/donations')}
            />
            <ActionButton
              title="Manage Orders"
              description="Process and track customer orders"
              icon="📋"
              onClick={() => navigate('/admin/orders')}
            />
            <ActionButton
              title="Ramadan Videos"
              description="Upload Taraweeh prayer videos"
              icon="🌙"
              onClick={() => navigate('/admin/ramadan-videos')}
            />
            <ActionButton
              title="Announcements"
              description="Create and manage mosque announcements"
              icon="📢"
              onClick={() => navigate('/admin/announcements')}
            />
            <ActionButton
              title="Manage Questions"
              description="Answer anonymous questions from users"
              icon="❓"
              onClick={() => navigate('/admin/questions')}
            />
            <ActionButton
              title="Fundraising Campaigns"
              description="Create and manage fundraising campaigns"
              icon="🎯"
              onClick={() => navigate('/admin/campaigns')}
            />
            <ActionButton
              title="System Settings"
              description="Configure shop ordering and other settings"
              icon="⚙️"
              onClick={() => navigate('/admin/settings')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to display</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ title, description, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-masjid-green hover:shadow-md transition-all group"
    >
      <div className="flex items-start space-x-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-masjid-green transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
