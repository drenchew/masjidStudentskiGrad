import { useTranslation } from 'react-i18next';
import { FaClock } from 'react-icons/fa';
import usePrayerTimes from '../hooks/usePrayerTimes';

/**
 * Displays the next upcoming prayer time with countdown
 * Auto-updates every minute
 */
const NextPrayerCard = () => {
  const { t } = useTranslation();
  const { prayerTimes, nextPrayer, loading, error } = usePrayerTimes();

  if (loading) {
    return (
      <div className="prayer-card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prayer-card bg-red-50 border border-red-200">
        <p className="text-red-600 text-center">{t('common.error')}</p>
      </div>
    );
  }

  if (!prayerTimes || !nextPrayer) {
    return null;
  }

  return (
    <div className="prayer-card relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-islamic-gold opacity-5 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-xl gradient-text">{t('hero.nextPrayer')}</h3>
        <div className="relative">
          <FaClock className="text-islamic-gold text-2xl animate-pulse" />
          <div className="absolute inset-0 bg-islamic-gold blur-md opacity-30 animate-pulse"></div>
        </div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="bg-gradient-to-br from-islamic-lightGreen to-white rounded-2xl p-6 mb-4 shadow-inner">
          <p className="text-4xl font-bold mb-2">
            <span className="gradient-text">
              {t(`prayerTimes.${nextPrayer.name}`)}
            </span>
          </p>
          <p className="text-3xl font-bold text-islamic-gold mb-3 tracking-wider">
            {nextPrayer.time}
          </p>
          <div className="inline-block px-4 py-2 bg-white rounded-full shadow-md">
            <p className="text-sm font-semibold text-gray-700">
              {nextPrayer.isTomorrow ? t('prayerTimes.tomorrow') : t('prayerTimes.in')} {nextPrayer.timeLeft}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 relative z-10">
        <p className="text-sm text-center font-semibold text-islamic-green">
          {t('prayerTimes.hijriDate')}: <span className="text-islamic-gold">{prayerTimes.hijriDate}</span>
        </p>
      </div>
    </div>
  );
};

export default NextPrayerCard;
