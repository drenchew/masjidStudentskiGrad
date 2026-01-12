import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Khutbahs = () => {
  const { t, i18n } = useTranslation();
  const [khutbahs, setKhutbahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKhutbahs();
  }, []);

  const fetchKhutbahs = async () => {
    try {
      const response = await axios.get('/api/khutbahs/public');
      setKhutbahs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching khutbahs:', error);
      setLoading(false);
    }
  };

  const getTitle = (khutbah) => {
    const lang = i18n.language;
    if (lang === 'bg') return khutbah.titleBg;
    if (lang === 'ar') return khutbah.titleAr;
    return khutbah.titleEn;
  };

  const getDescription = (khutbah) => {
    const lang = i18n.language;
    if (lang === 'bg') return khutbah.descriptionBg;
    if (lang === 'ar') return khutbah.descriptionAr;
    return khutbah.descriptionEn;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-islamic-darkGreen">
        {t('khutbahs.title')}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {khutbahs.map((khutbah) => (
          <div
            key={khutbah.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-bold mb-2 text-islamic-darkGreen">
              {getTitle(khutbah)}
            </h3>
            
            <p className="text-sm text-gray-500 mb-3">
              {t('khutbahs.date')}: {new Date(khutbah.deliveredDate).toLocaleDateString()}
            </p>
            
            {khutbah.speaker && (
              <p className="text-sm text-gray-600 mb-3">
                {t('khutbahs.speaker')}: {khutbah.speaker}
              </p>
            )}

            <p className="text-gray-700 mb-4 line-clamp-3">
              {getDescription(khutbah)}
            </p>

            <div className="flex flex-wrap gap-2">
              {khutbah.audioUrl && (
                <a
                  href={khutbah.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-islamic-green text-white px-4 py-2 rounded hover:bg-islamic-darkGreen text-sm"
                >
                  {t('khutbahs.listen')} 🎧
                </a>
              )}
              {khutbah.videoUrl && (
                <a
                  href={khutbah.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-islamic-gold text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  {t('khutbahs.watch')} 📺
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {khutbahs.length === 0 && (
        <div className="text-center text-gray-600 py-12">
          No khutbahs available at the moment. Check back soon!
        </div>
      )}
    </div>
  );
};

export default Khutbahs;
