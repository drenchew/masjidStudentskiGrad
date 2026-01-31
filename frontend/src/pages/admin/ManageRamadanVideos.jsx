import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaMoon, FaVideo, FaPlay } from 'react-icons/fa';

export default function ManageRamadanVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleBg: '',
    titleAr: '',
    date: '',
    imam: '',
    duration: '',
    videoUrl: '',
    thumbnail: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchVideos(token);
  }, [navigate]);

  const fetchVideos = async (token) => {
    try {
      const response = await axios.get('/api/admin/ramadan-videos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching Ramadan videos:', error);
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
      if (editingVideo) {
        await axios.put(`/api/admin/ramadan-videos/${editingVideo.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Ramadan video updated successfully!');
      } else {
        await axios.post('/api/admin/ramadan-videos', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Ramadan video created successfully!');
      }
      
      resetForm();
      fetchVideos(token);
    } catch (error) {
      console.error('Error saving Ramadan video:', error);
      alert('Failed to save video: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Ramadan video?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/admin/ramadan-videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Ramadan video deleted successfully!');
      fetchVideos(token);
    } catch (error) {
      console.error('Error deleting Ramadan video:', error);
      alert('Failed to delete video');
    }
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleBg: '',
      titleAr: '',
      date: '',
      imam: '',
      duration: '',
      videoUrl: '',
      thumbnail: ''
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const editVideo = (video) => {
    setFormData({
      titleEn: video.titleEn || '',
      titleBg: video.titleBg || '',
      titleAr: video.titleAr || '',
      date: video.date || '',
      imam: video.imam || '',
      duration: video.duration || '',
      videoUrl: video.videoUrl || '',
      thumbnail: video.thumbnail || ''
    });
    setEditingVideo(video);
    setShowForm(true);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (video) => {
    if (video.thumbnail) return video.thumbnail;
    const id = extractYouTubeId(video.videoUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    if (video.videoUrl && (video.videoUrl.endsWith('.jpg') || video.videoUrl.endsWith('.png') || video.videoUrl.endsWith('.jpeg'))) {
      return video.videoUrl;
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaMoon className="text-purple-600" />
            Ramadan Videos Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-masjid-green text-white rounded-lg hover:bg-masjid-dark transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Video
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
        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Thumbnail */}
              <div className="relative bg-gray-900 aspect-video">
                {getThumbnailUrl(video) ? (
                  <img 
                    src={getThumbnailUrl(video)} 
                    alt={video.titleEn}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <FaVideo className="text-5xl" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <FaPlay className="text-2xl" />
                  </a>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-semibold">
                    {video.duration}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900">{video.titleEn}</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p><strong>Imam:</strong> {video.imam}</p>
                  <p><strong>Date:</strong> {new Date(video.date).toLocaleDateString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => editVideo(video)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <FaMoon className="mx-auto text-5xl mb-4 text-gray-300" />
            <p className="text-xl">No Ramadan videos yet.</p>
            <p className="text-sm mt-2">Click "Add New Video" to upload a Taraweeh prayer video.</p>
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingVideo ? 'Edit Ramadan Video' : 'Add New Ramadan Video'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titles */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    required
                    placeholder="Taraweeh Night 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Bulgarian)
                  </label>
                  <input
                    type="text"
                    value={formData.titleBg}
                    onChange={(e) => setFormData({ ...formData, titleBg: e.target.value })}
                    placeholder="Таравих Нощ 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="صلاة التراويح الليلة 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Imam, Date, Duration */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imam *
                  </label>
                  <input
                    type="text"
                    value={formData.imam}
                    onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                    required
                    placeholder="Sheikh Ahmed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="45:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaVideo className="inline mr-1" /> Video URL (YouTube, Vimeo, etc.) *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full URL of your video (e.g., YouTube link)
                </p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Custom thumbnail image (if empty, will use default)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-masjid-green text-white px-6 py-3 rounded-lg hover:bg-masjid-dark transition-colors font-semibold"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
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
