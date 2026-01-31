import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaBullhorn, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleBg: '',
    titleAr: '',
    contentEn: '',
    contentBg: '',
    contentAr: '',
    sendEmail: false,
    active: true
  });

  const [emailData, setEmailData] = useState({
    subject: '',
    contentEn: '',
    contentBg: '',
    contentAr: '',
    language: 'ALL'
  });

  const emailTemplates = [
    {
      name: 'Weekly Announcement',
      subject: 'Weekly Update - Masjid Studentski Grad',
      contentEn: `Assalamu Alaikum dear community,

This week at Masjid Studentski Grad:

- Friday Prayer: 12:30 PM
- Weekend Classes: Saturday 10:00 AM
- Community Iftar: [Date/Time]

For more information, visit our website.

JazakAllah Khair,
Masjid Studentski Grad`,
      contentBg: `Мир и благословения, скъпа общност,

Тази седмица в Джамия Студентски град:

- Петъчна молитва: 12:30 ч.
- Уроци през уикенда: Събота 10:00 ч.
- Обществен ифтар: [Дата/Час]

За повече информация посетете нашия уебсайт.

С благодарности,
Джамия Студентски град`,
      contentAr: `السلام عليكم ورحمة الله وبركاته، أعزاءنا في المجتمع

هذا الأسبوع في مسجد المدينة الطلابية:

- صلاة الجمعة: الساعة 12:30
- دروس نهاية الأسبوع: السبت الساعة 10:00
- إفطار جماعي: [التاريخ/الوقت]

لمزيد من المعلومات، يرجى زيارة موقعنا الإلكتروني.

جزاكم الله خيراً،
مسجد المدينة الطلابية`
    },
    {
      name: 'Event Announcement',
      subject: 'Special Event - Masjid Studentski Grad',
      contentEn: `Assalamu Alaikum,

We are pleased to announce a special event:

Event: [Event Name]
Date: [Date]
Time: [Time]
Location: Masjid Studentski Grad

Please join us for this blessed occasion.

Barakallah Feekum,
Masjid Studentski Grad`,
      contentBg: `Мир и благословения,

С удоволствие обявяваме специално събитие:

Събитие: [Име на събитието]
Дата: [Дата]
Час: [Час]
Местоположение: Джамия Студентски град

Моля, присъединете се към нас за този благословен повод.

С благодарности,
Джамия Студентски град`,
      contentAr: `السلام عليكم ورحمة الله وبركاته،

يسرنا أن نعلن عن حدث خاص:

الحدث: [اسم الحدث]
التاريخ: [التاريخ]
الوقت: [الوقت]
المكان: مسجد المدينة الطلابية

يرجى الانضمام إلينا في هذه المناسبة المباركة.

بارك الله فيكم،
مسجد المدينة الطلابية`
    },
    {
      name: 'Ramadan Message',
      subject: 'Ramadan Mubarak - Masjid Studentski Grad',
      contentEn: `Assalamu Alaikum wa Rahmatullahi wa Barakatuh,

Ramadan Mubarak to you and your family!

During this blessed month:
- Tarawih prayers: Every night after Isha
- Iftar times: Check our prayer times
- Weekend Quran classes continue
- Special lectures on weekends

May Allah accept our prayers and fasting.

Ramadan Kareem,
Masjid Studentski Grad`,
      contentBg: `Мир, милост и благословения Божи,

Рамадан Мубарак на вас и вашето семейство!

През този благословен месец:
- Таравих молитви: Всяка вечер след Иша
- Времена за ифтар: Проверете нашите молитвени времена
- Уроци по Коран през уикенда продължават
- Специални лекции през уикендите

Нека Аллах приеме нашите молитви и пост.

Рамадан Карим,
Джамия Студентски град`,
      contentAr: `السلام عليكم ورحمة الله وبركاته،

رمضان مبارك لكم ولعائلتكم!

خلال هذا الشهر المبارك:
- صلاة التراويح: كل ليلة بعد صلاة العشاء
- أوقات الإفطار: تحققوا من أوقات الصلاة لدينا
- دروس القرآن في نهاية الأسبوع تستمر
- محاضرات خاصة في نهاية الأسبوع

عسى أن يتقبل الله صلاتنا وصيامنا.

رمضان كريم،
مسجد المدينة الطلابية`
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAnnouncements(token);
  }, [navigate]);

  const fetchAnnouncements = async (token) => {
    try {
      const response = await axios.get('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
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
      if (editingAnnouncement) {
        await axios.put(`/api/admin/announcements/${editingAnnouncement.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Announcement updated successfully!');
      } else {
        await axios.post('/api/admin/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Announcement created successfully!' + (formData.sendEmail ? ' Email will be sent to subscribers.' : ''));
      }
      
      resetForm();
      fetchAnnouncements(token);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Announcement deleted successfully!');
      fetchAnnouncements(token);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/announcements/${id}/toggle`, 
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnnouncements(token);
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleBg: '',
      titleAr: '',
      contentEn: '',
      contentBg: '',
      contentAr: '',
      sendEmail: false,
      active: true
    });
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const editAnnouncement = (announcement) => {
    setFormData({
      titleEn: announcement.titleEn || '',
      titleBg: announcement.titleBg || '',
      titleAr: announcement.titleAr || '',
      contentEn: announcement.contentEn || '',
      contentBg: announcement.contentBg || '',
      contentAr: announcement.contentAr || '',
      sendEmail: false, // Don't resend email on edit
      active: announcement.active
    });
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleSendEmail = async () => {
    const token = localStorage.getItem('adminToken');
    setEmailSending(true);
    
    try {
      await axios.post('/api/admin/subscribers/send-announcement', emailData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Email sent successfully to all subscribers!');
      setShowEmailDialog(false);
      resetEmailForm();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + (error.response?.data?.message || error.message));
    } finally {
      setEmailSending(false);
    }
  };

  const resetEmailForm = () => {
    setEmailData({
      subject: '',
      contentEn: '',
      contentBg: '',
      contentAr: '',
      language: 'ALL'
    });
  };

  const applyTemplate = (template) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      contentEn: template.contentEn,
      contentBg: template.contentBg,
      contentAr: template.contentAr
    });
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
            <FaBullhorn className="text-masjid-green" />
            Announcements Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEmailDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaEnvelope /> Send to Subscribers
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-masjid-green text-white rounded-lg hover:bg-masjid-dark transition-colors flex items-center gap-2"
            >
              <FaPlus /> New Announcement
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
        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`bg-white rounded-lg shadow-md p-6 ${!announcement.active ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{announcement.titleEn}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      announcement.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </span>
                    {announcement.emailSent && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                        <FaEnvelope /> Email Sent
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{announcement.contentEn}</p>
                  
                  {announcement.titleBg && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-600">Bulgarian:</p>
                      <p className="text-sm text-gray-600">{announcement.titleBg}</p>
                    </div>
                  )}
                  
                  {announcement.titleAr && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-600">Arabic:</p>
                      <p className="text-sm text-gray-600 text-right" dir="rtl">{announcement.titleAr}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Created: {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(announcement.id, announcement.active)}
                    className={`px-3 py-2 rounded transition-colors flex items-center gap-1 text-sm ${
                      announcement.active 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={announcement.active ? 'Deactivate' : 'Activate'}
                  >
                    {announcement.active ? <FaEyeSlash /> : <FaEye />}
                    {announcement.active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => editAnnouncement(announcement)}
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <FaBullhorn className="mx-auto text-5xl mb-4 text-gray-300" />
            <p className="text-xl">No announcements yet.</p>
            <p className="text-sm mt-2">Click "New Announcement" to create one.</p>
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Bulgarian) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleBg}
                    onChange={(e) => setFormData({ ...formData, titleBg: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Content - English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (English) *
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  placeholder="Enter announcement content in English..."
                />
              </div>

              {/* Content - Bulgarian */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Bulgarian) *
                </label>
                <textarea
                  value={formData.contentBg}
                  onChange={(e) => setFormData({ ...formData, contentBg: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  placeholder="Въведете съдържанието на съобщението на български..."
                />
              </div>

              {/* Content - Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Arabic) *
                </label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green"
                  dir="rtl"
                  placeholder="أدخل محتوى الإعلان باللغة العربية..."
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-masjid-green focus:ring-masjid-green"
                  />
                  <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
                </label>

                {!editingAnnouncement && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FaEnvelope /> Send email to all subscribers
                    </span>
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-masjid-green text-white px-6 py-3 rounded-lg hover:bg-masjid-dark transition-colors font-semibold"
                >
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
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

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              Send Email to Subscribers
            </h3>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Templates Sidebar */}
              <div className="lg:col-span-1">
                <h4 className="font-semibold text-gray-800 mb-3">Email Templates</h4>
                <div className="space-y-2">
                  {emailTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.subject}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Form */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send to
                    </label>
                    <select
                      value={emailData.language}
                      onChange={(e) => setEmailData({ ...emailData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Subscribers (All Languages)</option>
                      <option value="EN">English Subscribers Only</option>
                      <option value="BG">Bulgarian Subscribers Only</option>
                      <option value="AR">Arabic Subscribers Only</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Content Tabs */}
                  <div>
                    <div className="flex border-b border-gray-200 mb-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600"
                      >
                        English
                      </button>
                    </div>
                    
                    <textarea
                      value={emailData.contentEn}
                      onChange={(e) => setEmailData({ ...emailData, contentEn: e.target.value })}
                      required
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email content in English..."
                    />
                  </div>

                  <div>
                    <div className="flex border-b border-gray-200 mb-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-500"
                      >
                        Bulgarian
                      </button>
                    </div>
                    
                    <textarea
                      value={emailData.contentBg}
                      onChange={(e) => setEmailData({ ...emailData, contentBg: e.target.value })}
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Въведете съдържанието на имейла на български..."
                    />
                  </div>

                  <div>
                    <div className="flex border-b border-gray-200 mb-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-500"
                      >
                        Arabic
                      </button>
                    </div>
                    
                    <textarea
                      value={emailData.contentAr}
                      onChange={(e) => setEmailData({ ...emailData, contentAr: e.target.value })}
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                      placeholder="أدخل محتوى البريد الإلكتروني باللغة العربية..."
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailData.subject || !emailData.contentEn}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {emailSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope /> Send Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailDialog(false);
                      resetEmailForm();
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
