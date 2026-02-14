import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';
import { FaClock } from 'react-icons/fa';

const PrayerTimesWidget = () => {
  const { t, i18n } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrayerTimes();
    const interval = setInterval(fetchPrayerTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      const response = await axios.get('/api/prayer-times/today');
      let data = response.data;

      // If backend returned our fallback (used when backend can't reach external APIs), try client-side fetch
      const isFallback = data && data.hijriDate && data.hijriDate.includes('Rajab 1447');
      if (isFallback) {
        try {
          const remote = await fetch(
            `https://api.aladhan.com/v1/timingsByCity?city=Sofia&country=Bulgaria&method=2`
          );
          if (remote.ok) {
            const jr = await remote.json();
            if (jr?.data?.timings) {
              data = {
                fajr: jr.data.timings.Fajr.split(' ')[0],
                sunrise: jr.data.timings.Sunrise.split(' ')[0],
                dhuhr: jr.data.timings.Dhuhr.split(' ')[0],
                asr: jr.data.timings.Asr.split(' ')[0],
                maghrib: jr.data.timings.Maghrib.split(' ')[0],
                isha: jr.data.timings.Isha.split(' ')[0],
                hijriDate: jr.data.date?.hijri?.day + ' ' + jr.data.date?.hijri?.month?.en + ' ' + jr.data.date?.hijri?.year
              };
            }
          }
        } catch (e) {
          // ignore, we'll use backend fallback
        }
      }

      setPrayerTimes(data);
      calculateNextPrayer(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setLoading(false);
    }
  };

  const calculateNextPrayer = (times) => {
    // Robust parsing helper: returns minutes since midnight or null
    const parseTimeToMinutes = (timeStr) => {
      try {
        if (!timeStr || typeof timeStr !== 'string') return null;
        // Trim and normalize
        let s = timeStr.trim();
        // Remove timezone or other trailing tokens (keep first two tokens)
        s = s.split(/\s+/).slice(0, 2).join(' ');

        // Handle formats: "6:15", "06:15", "6:15 am", "6:15 AM", "06:15:00"
        const ampmMatch = s.match(/(am|pm)$/i);
        let isPM = false;
        if (ampmMatch) {
          isPM = ampmMatch[1].toLowerCase() === 'pm';
          s = s.replace(/(am|pm)$/i, '').trim();
        }

        const parts = s.split(':').map((p) => p.replace(/[^0-9]/g, ''));
        if (parts.length < 2) return null;
        let hh = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10) || 0;
        if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
        if (ampmMatch) {
          if (isPM && hh < 12) hh += 12;
          if (!isPM && hh === 12) hh = 0;
        }
        // Normalize hour to 0-23
        hh = ((hh % 24) + 24) % 24;
        return hh * 60 + mm;
      } catch (e) {
        return null;
      }
    };

    if (!times) {
      setNextPrayer(null);
      return;
    }

    const now = new Date();

    const ordered = [
      { name: 'fajr', time: times.fajr },
      { name: 'dhuhr', time: times.dhuhr },
      { name: 'asr', time: times.asr },
      { name: 'maghrib', time: times.maghrib },
      { name: 'isha', time: times.isha }
    ];

    // Build Date objects for each prayer and pick the first that's after 'now'
    let found = null;
    for (const p of ordered) {
      const mins = parseTimeToMinutes(p.time);
      if (mins === null) continue;
      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(mins / 60), mins % 60, 0, 0);
      if (prayerDate.getTime() > now.getTime()) {
        const diffMs = prayerDate.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hoursLeft = Math.floor(diffMins / 60);
        const minutesLeft = diffMins % 60;
        found = { name: p.name, time: formatMinutesAsTime(mins), timeLeft: `${hoursLeft}h ${minutesLeft}m` };
        break;
      }
    }

    if (!found) {
      // Next is fajr tomorrow
      const fajrMins = parseTimeToMinutes(ordered[0].time) || 6 * 60; // default 06:00
      found = { name: 'fajr', time: formatMinutesAsTime(fajrMins), timeLeft: 'Tomorrow' };
    }

    setNextPrayer(found);

    // Helper to turn minutes since midnight back to HH:MM
    function formatMinutesAsTime(totalMins) {
      const hh = Math.floor(totalMins / 60);
      const mm = totalMins % 60;
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
  };

  if (loading) {
    return (
      <div className="prayer-card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!prayerTimes) {
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
      
      {nextPrayer && (
        <div className="text-center relative z-10">
          <div className="bg-gradient-to-br from-islamic-lightGreen to-white rounded-2xl p-6 mb-4 shadow-inner">
            <p className="text-4xl font-bold mb-2">
              <span className="gradient-text">
                {t(`prayerTimes.${nextPrayer.name}`)}
              </span>
            </p>
            <p className="text-3xl font-bold text-islamic-gold mb-3 tracking-wider">{nextPrayer.time}</p>
            <div className="inline-block px-4 py-2 bg-white rounded-full shadow-md">
              <p className="text-sm font-semibold text-gray-700">in {nextPrayer.timeLeft}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200 relative z-10">
        <p className="text-sm text-center font-semibold text-islamic-green">
          {t('prayerTimes.hijriDate')}: <span className="text-islamic-gold">{prayerTimes.hijriDate}</span>
        </p>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
