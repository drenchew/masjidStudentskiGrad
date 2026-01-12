import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaVideo, FaMusic, FaFilePdf } from 'react-icons/fa';

export default function ManageKhutbahs() {
  const [khutbahs, setKhutbahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingKhutbah, setEditingKhutbah] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleBg: '',
    titleAr: '',
    descriptionEn: '',
    descriptionBg: '',
    descriptionAr: '',
    speaker: '',
    deliveredDate: '',
    audioUrl: '',
    videoUrl: '',
    pdfUrl: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchKhutbahs(token);
  }, [navigate]);

  const fetchKhutbahs = async (token) => {
    try {
      const response = await axios.get('/api/admin/khutbahs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKhutbahs(response.data);
    } catch (error) {
      console.error('Error fetching khutbahs:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      if (editingKhutbah) {
        await axios.put(`/api/admin/khutbahs/${editingKhutbah.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Khutbah updated successfully!');
      } else {
        await axios.post('/api/admin/khutbahs', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Khutbah created successfully!');
      }
      
      resetForm();
      fetchKhutbahs(token);
    } catch (error) {
      console.error('Error saving khutbah:', error);
      alert('Failed to save khutbah');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this khutbah?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/admin/khutbahs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Khutbah deleted successfully!');
      fetchKhutbahs(token);
    } catch (error) {
      console.error('Error deleting khutbah:', error);
      alert('Failed to delete khutbah');
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
      speaker: '',
      deliveredDate: '',
      audioUrl: '',
      videoUrl: '',
      pdfUrl: ''
    });
    setEditingKhutbah(null);
    setShowForm(false);
  };

  const editKhutbah = (khutbah) => {
    setFormData({
      titleEn: khutbah.titleEn || '',
      titleBg: khutbah.titleBg || '',
      titleAr: khutbah.titleAr || '',
      descriptionEn: khutbah.descriptionEn || '',
      descriptionBg: khutbah.descriptionBg || '',
      descriptionAr: khutbah.descriptionAr || '',
      speaker: khutbah.speaker || '',
      deliveredDate: khutbah.deliveredDate || '',
      audioUrl: khutbah.audioUrl || '',
      videoUrl: khutbah.videoUrl || '',
      pdfUrl: khutbah.pdfUrl || ''
    });
    setEditingKhutbah(khutbah);
    setShowForm(true);
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Khutbah Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-masjid-green text-white rounded-lg hover:bg-masjid-dark transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Khutbah
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Khutbahs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {khutbahs.map((khutbah) => (
            <div key={khutbah.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{khutbah.titleEn}</h3>
              <p className="text-sm text-gray-600 mb-2">Speaker: {khutbah.speaker}</p>
              <p className="text-sm text-gray-600 mb-3">
                Date: {new Date(khutbah.deliveredDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{khutbah.descriptionEn}</p>
              
              <div className="flex gap-2 mb-4 text-sm">
                {khutbah.audioUrl && <span className="text-green-600"><FaMusic /> Audio</span>}
                {khutbah.videoUrl && <span className="text-blue-600"><FaVideo /> Video</span>}
                {khutbah.pdfUrl && <span className="text-red-600"><FaFilePdf /> PDF</span>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editKhutbah(khutbah)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(khutbah.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {khutbahs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">No khutbahs yet. Click "Add New Khutbah" to create one.</p>
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingKhutbah ? 'Edit Khutbah' : 'Add New Khutbah'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titles */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Bulgarian)</label>
                  <input
                    type="text"
                    value={formData.titleBg}
                    onChange={(e) => setFormData({ ...formData, titleBg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaker *</label>
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivered Date *</label>
                  <input
                    type="date"
                    value={formData.deliveredDate}
                    onChange={(e) => setFormData({ ...formData, deliveredDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
              </div>

              {/* Media URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMusic className="inline mr-1" /> Audio URL (YouTube, SoundCloud, etc.)
                </label>
                <input
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaVideo className="inline mr-1" /> Video URL (YouTube, Vimeo, etc.)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaFilePdf className="inline mr-1" /> PDF URL (Transcript)
                </label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-masjid-green text-white px-4 py-2 rounded-lg hover:bg-masjid-dark transition-colors font-semibold"
                >
                  {editingKhutbah ? 'Update Khutbah' : 'Create Khutbah'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
