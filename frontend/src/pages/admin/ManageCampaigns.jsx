import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaDonate, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleBg: '',
    titleAr: '',
    descriptionEn: '',
    descriptionBg: '',
    descriptionAr: '',
    goalAmount: '',
    currentAmount: '0',
    imageUrl: '',
    startDate: '',
    endDate: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }
    
    fetchCampaigns();
  }, [navigate]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get('/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const campaignData = {
        ...formData,
        goalAmount: parseFloat(formData.goalAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      if (editingCampaign) {
        await axios.put(`/api/admin/campaigns/${editingCampaign.id}`, campaignData, { headers });
        alert('Campaign updated successfully!');
      } else {
        await axios.post('/api/admin/campaigns', campaignData, { headers });
        alert('Campaign created successfully!');
      }

      setShowForm(false);
      setEditingCampaign(null);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      titleEn: campaign.titleEn,
      titleBg: campaign.titleBg,
      titleAr: campaign.titleAr,
      descriptionEn: campaign.descriptionEn,
      descriptionBg: campaign.descriptionBg,
      descriptionAr: campaign.descriptionAr,
      goalAmount: campaign.goalAmount,
      currentAmount: campaign.currentAmount,
      imageUrl: campaign.imageUrl || '',
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      active: campaign.active,
      featured: campaign.featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Campaign deleted successfully!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleBg: '',
      titleAr: '',
      descriptionEn: '',
      descriptionBg: '',
      descriptionAr: '',
      goalAmount: '',
      currentAmount: '0',
      imageUrl: '',
      startDate: '',
      endDate: '',
      active: true,
      featured: false
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCampaign(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-masjid-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaDonate className="text-masjid-green" />
              Manage Fundraising Campaigns
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-masjid-green text-white rounded-lg hover:bg-masjid-dark transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add Campaign
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* English Fields */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-700">English</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title (EN)</label>
                      <input
                        type="text"
                        name="titleEn"
                        value={formData.titleEn}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (EN)</label>
                      <textarea
                        name="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bulgarian Fields */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Български (Bulgarian)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title (BG)</label>
                      <input
                        type="text"
                        name="titleBg"
                        value={formData.titleBg}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (BG)</label>
                      <textarea
                        name="descriptionBg"
                        value={formData.descriptionBg}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Arabic Fields */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3 text-amber-700">العربية (Arabic)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title (AR)</label>
                      <input
                        type="text"
                        name="titleAr"
                        value={formData.titleAr}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        dir="rtl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (AR)</label>
                      <textarea
                        name="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Goal Amount (€)</label>
                    <input
                      type="number"
                      name="goalAmount"
                      value={formData.goalAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Amount (€)</label>
                    <input
                      type="number"
                      name="currentAmount"
                      value={formData.currentAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-masjid-green"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a URL to an image for this campaign</p>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-masjid-green"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-masjid-green"
                    />
                    <span className="text-sm font-medium">Featured (Show prominently)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-masjid-green text-white px-6 py-3 rounded-lg hover:bg-masjid-dark transition-colors font-semibold"
                  >
                    {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">All Campaigns ({campaigns.length})</h2>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaDonate className="text-6xl mx-auto mb-4 opacity-30" />
                <p>No campaigns yet. Create your first fundraising campaign!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{campaign.titleEn}</h3>
                          <div className="flex gap-2">
                            {campaign.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                                <FaStar /> Featured
                              </span>
                            )}
                            {campaign.active ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                <FaCheckCircle /> Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                                <FaTimesCircle /> Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {campaign.descriptionEn}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Goal:</span>
                            <span className="font-semibold ml-2">€{campaign.goalAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Raised:</span>
                            <span className="font-semibold ml-2">€{campaign.currentAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <span className="font-semibold ml-2">
                              {((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="font-semibold ml-2">
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-masjid-green h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  (campaign.currentAmount / campaign.goalAmount) * 100,
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                        
                        {campaign.startDate && campaign.endDate && (
                          <div className="mt-2 text-xs text-gray-500">
                            Duration: {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
