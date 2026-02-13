import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/ToastContext';
import axios from '../../api/axios';
import { FaCog, FaShoppingCart, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function ManageSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopOrderingEnabled, setShopOrderingEnabled] = useState(true);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSettings(token);
  }, [navigate]);

  const fetchSettings = async (token) => {
    try {
      const response = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      
      // Find shop ordering setting
      const shopSetting = response.data.find(s => s.settingKey === 'shop.ordering.enabled');
      if (shopSetting) {
        setShopOrderingEnabled(shopSetting.settingValue === 'true');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        showError('Failed to fetch settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShopOrdering = async () => {
    const token = localStorage.getItem('adminToken');
    const newValue = !shopOrderingEnabled;
    
    try {
      await axios.put(
        '/api/settings/shop.ordering.enabled',
        { 
          value: String(newValue),
          description: 'Enable or disable online shop ordering. When disabled, customers can only view products for in-person purchases.'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShopOrderingEnabled(newValue);
      success(newValue ? 'Shop ordering enabled!' : 'Shop ordering disabled - view-only mode');
    } catch (error) {
      console.error('Error updating setting:', error);
      showError('Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaCog className="text-2xl text-islamic-green" />
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shop Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-islamic-lightGreen p-3 rounded-xl">
                <FaShoppingCart className="text-2xl text-islamic-green" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Online Shop Ordering</h2>
                <p className="text-gray-600 mb-4">
                  {shopOrderingEnabled 
                    ? 'Customers can place orders online and checkout through the website.'
                    : 'Shop is in view-only mode. Customers can browse products but must purchase in-person at the masjid.'}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    shopOrderingEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {shopOrderingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleShopOrdering}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                shopOrderingEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {shopOrderingEnabled ? (
                <>
                  <FaToggleOff className="text-xl" />
                  Disable Ordering
                </>
              ) : (
                <>
                  <FaToggleOn className="text-xl" />
                  Enable Ordering
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ About Shop Ordering Settings</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• <strong>Enabled:</strong> Customers can add items to cart, checkout, and place orders online</li>
            <li>• <strong>Disabled:</strong> Shop becomes view-only - perfect for showcasing products that are only available for in-person purchase at the masjid</li>
            <li>• The checkout button will be hidden when disabled</li>
            <li>• Existing orders are not affected by this setting</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
