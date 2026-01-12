import { useTranslation } from 'react-i18next';
import { FaClock } from 'react-icons/fa';
import usePrayerTimes from '../hooks/usePrayerTimes';

const PrayerTimes = () => {
  const { t } = useTranslation();
  const { prayerTimes, loading } = usePrayerTimes();

  const prayers = [
    { name: 'fajr', icon: '🌅' },
    { name: 'sunrise', icon: '☀️' },
    { name: 'dhuhr', icon: '🌞' },
    { name: 'asr', icon: '🌤️' },
    { name: 'maghrib', icon: '🌆' },
    { name: 'isha', icon: '🌙' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-islamic-darkGreen">
          {t('prayerTimes.title')}
        </h1>

        {prayerTimes && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600">
                {new Date().toLocaleDateString()}
              </p>
              <p className="text-islamic-gold font-semibold">
                {t('prayerTimes.hijriDate')}: {prayerTimes.hijriDate}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {prayers.map((prayer) => (
                <div
                  key={prayer.name}
                  className="flex items-center justify-between p-4 bg-islamic-lightGreen rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="text-3xl">{prayer.icon}</span>
                    <span className="text-xl font-semibold text-islamic-darkGreen">
                      {t(`prayerTimes.${prayer.name}`)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FaClock className="text-islamic-green" />
                    <span className="text-2xl font-bold text-islamic-green">
                      {prayerTimes[prayer.name]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-islamic-cream rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-islamic-darkGreen">
            Important Notes
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Jumu'ah (Friday Prayer) starts at Dhuhr time</li>
            <li>• Please arrive 15 minutes early for congregational prayers</li>
            <li>• Prayer times are calculated for Sofia, Bulgaria</li>
            <li>• Times may vary slightly during daylight saving time changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
