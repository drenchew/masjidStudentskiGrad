import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMoon, FaStar, FaPlay, FaCalendar } from 'react-icons/fa';
import axios from 'axios';

const Ramadan = () => {
  const { t, i18n } = useTranslation();
  const [taraweehVideos, setTaraweehVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaraweehVideos();
  }, []);

  const fetchTaraweehVideos = async () => {
    try {
      const response = await axios.get('/api/ramadan-videos');
      setTaraweehVideos(response.data);
    } catch (error) {
      console.error('Error fetching Ramadan videos:', error);
      // Keep empty array if API fails
      setTaraweehVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (video) => {
    const lang = i18n.language;
    if (lang === 'bg') return video.titleBg || video.titleEn;
    if (lang === 'ar') return video.titleAr || video.titleEn;
    return video.titleEn;
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
    // Fallbacks: if videoUrl itself is an image link
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-islamic-darkGreen text-white py-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="absolute top-10 right-10 text-yellow-300 opacity-30 text-9xl animate-pulse">
          <FaMoon />
        </div>
        <div className="absolute bottom-10 left-10 text-yellow-300 opacity-20 text-6xl">
          <FaStar />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Ramadan Mubarak 🌙
            </h1>
            <p className="text-2xl md:text-3xl mb-8 opacity-90">
              {i18n.language === 'ar' ? 'رمضان كريم - صلاة التراويح' : 
               i18n.language === 'bg' ? 'Рамадан Карим - Молитви Таравих' : 
               'Ramadan Kareem - Taraweeh Prayers'}
            </p>
            <p className="text-lg max-w-2xl mx-auto opacity-80">
              {i18n.language === 'ar' ? 'شاهد تسجيلات صلاة التراويح من مسجدنا خلال شهر رمضان المبارك' :
               i18n.language === 'bg' ? 'Гледайте записи на молитвите Таравих от нашата джамия през благословения месец Рамадан' :
               'Watch recordings of Taraweeh prayers from our mosque during the blessed month of Ramadan'}
            </p>
          </div>
        </div>
      </section>

      {/* Ramadan Schedule */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-islamic-cream to-yellow-50 rounded-3xl p-8 shadow-xl mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center gradient-text flex items-center justify-center gap-3">
            <FaCalendar className="text-islamic-gold" />
            {i18n.language === 'ar' ? 'جدول رمضان' : 
             i18n.language === 'bg' ? 'Рамадан Разписание' : 
             'Ramadan Schedule'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-islamic-green mb-4">
                {i18n.language === 'ar' ? 'الإفطار' : 
                 i18n.language === 'bg' ? 'Ифтар' : 
                 'Iftar'}
              </h3>
              <p className="text-gray-700 text-lg">
                {i18n.language === 'ar' ? 'يقدم يوميًا في المسجد - 30 دقيقة قبل المغرب' :
                 i18n.language === 'bg' ? 'Предоставя се ежедневно в джамията - 30 минути преди Магриб' :
                 'Served daily at the mosque - 30 minutes before Maghrib'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-islamic-green mb-4">
                {i18n.language === 'ar' ? 'صلاة التراويح' : 
                 i18n.language === 'bg' ? 'Таравих Молитва' : 
                 'Taraweeh Prayer'}
              </h3>
              <p className="text-gray-700 text-lg">
                {i18n.language === 'ar' ? 'يبدأ 20 دقيقة بعد صلاة العشاء' :
                 i18n.language === 'bg' ? 'Започва 20 минути след Иша' :
                 'Starts 20 minutes after Isha prayer'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Taraweeh Videos */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="gradient-text">
            {i18n.language === 'ar' ? 'تسجيلات صلاة التراويح' : 
             i18n.language === 'bg' ? 'Записи на Таравих' : 
             'Taraweeh Recordings'}
          </span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {taraweehVideos.map((video) => (
            <div key={video.id} className="card-modern group">
              <div className="relative overflow-hidden rounded-t-2xl">
                {getThumbnailUrl(video) ? (
                  <img 
                    src={getThumbnailUrl(video)} 
                    alt={getTitle(video)}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-purple-900 to-islamic-green flex items-center justify-center">
                    <FaMoon className="text-6xl text-yellow-300 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-islamic-gold rounded-full p-6 transform group-hover:scale-110 transition-transform">
                      <FaPlay className="text-white text-3xl" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-islamic-green text-white px-3 py-1 rounded-full text-sm font-bold">
                  {video.duration || 'N/A'}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-islamic-darkGreen">
                  {getTitle(video)}
                </h3>
                <p className="text-gray-600 mb-2 flex items-center gap-2">
                  <FaCalendar className="text-islamic-gold" />
                  {new Date(video.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mb-4">
                  {i18n.language === 'ar' ? 'الإمام' : 
                   i18n.language === 'bg' ? 'Имам' : 
                   'Imam'}: <span className="font-semibold">{video.imam}</span>
                </p>
                <a 
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center inline-block"
                >
                  <span className="flex items-center justify-center gap-2">
                    <FaPlay />
                    {i18n.language === 'ar' ? 'شاهد الآن' : 
                     i18n.language === 'bg' ? 'Гледай сега' : 
                     'Watch Now'}
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {taraweehVideos.length === 0 && !loading && (
          <div className="text-center text-gray-600 py-12 bg-white rounded-2xl shadow-lg">
            <FaMoon className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl">
              {i18n.language === 'ar' ? 'سيتم إضافة تسجيلات التراويح قريبًا إن شاء الله' :
               i18n.language === 'bg' ? 'Записите на Таравих ще бъдат добавени скоро, Иншаллах' :
               'Taraweeh recordings will be added soon, Insha\'Allah'}
            </p>
          </div>
        )}
      </section>

      {/* Ramadan Tips */}
      <section className="bg-gradient-to-br from-islamic-green to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {i18n.language === 'ar' ? '🌟 نصائح رمضانية 🌟' : 
             i18n.language === 'bg' ? '🌟 Рамадански съвети 🌟' : 
             '🌟 Ramadan Tips 🌟'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="font-bold text-xl mb-2">
                {i18n.language === 'ar' ? 'اقرأ القرآن' : 
                 i18n.language === 'bg' ? 'Четете Корана' : 
                 'Read Quran'}
              </h3>
              <p>
                {i18n.language === 'ar' ? 'اجعل هدفك إكمال القرآن' :
                 i18n.language === 'bg' ? 'Поставете си цел да завършите Корана' :
                 'Aim to complete the Quran'}
              </p>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🤲</div>
              <h3 className="font-bold text-xl mb-2">
                {i18n.language === 'ar' ? 'أكثر من الدعاء' : 
                 i18n.language === 'bg' ? 'Молете се повече' : 
                 'Make Dua'}
              </h3>
              <p>
                {i18n.language === 'ar' ? 'ادع الله في كل وقت' :
                 i18n.language === 'bg' ? 'Молете се на Аллах по всяко време' :
                 'Pray to Allah at all times'}
              </p>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="font-bold text-xl mb-2">
                {i18n.language === 'ar' ? 'تصدق' : 
                 i18n.language === 'bg' ? 'Дарявайте' : 
                 'Give Charity'}
              </h3>
              <p>
                {i18n.language === 'ar' ? 'تصدق وساعد المحتاجين' :
                 i18n.language === 'bg' ? 'Дарявайте и помагайте на нуждаещите се' :
                 'Give charity and help the needy'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ramadan;
