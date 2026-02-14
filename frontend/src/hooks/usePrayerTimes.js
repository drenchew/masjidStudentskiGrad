import { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';

/**
 * Custom hook to manage prayer times data and next prayer calculation
 * Automatically fetches prayer times and updates every minute
 */
const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Parse time string to minutes since midnight
   * Handles formats: "6:15", "06:15", "6:15 AM", "06:15:00"
   */
  const parseTimeToMinutes = useCallback((timeStr) => {
    try {
      if (!timeStr || typeof timeStr !== 'string') return null;

      // Normalize string: trim and keep first two tokens
      let normalized = timeStr.trim().split(/\s+/).slice(0, 2).join(' ');

      // Check for AM/PM
      const ampmMatch = normalized.match(/(am|pm)$/i);
      let isPM = false;
      if (ampmMatch) {
        isPM = ampmMatch[1].toLowerCase() === 'pm';
        normalized = normalized.replace(/(am|pm)$/i, '').trim();
      }

      // Parse hours and minutes
      const parts = normalized.split(':').map((p) => p.replace(/[^0-9]/g, ''));
      if (parts.length < 2) return null;

      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10) || 0;

      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

      // Convert to 24-hour format if needed
      if (ampmMatch) {
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      }

      // Normalize to 0-23 range
      hours = ((hours % 24) + 24) % 24;
      return hours * 60 + minutes;
    } catch (e) {
      console.error('Error parsing time:', timeStr, e);
      return null;
    }
  }, []);

  /**
   * Format minutes since midnight to HH:MM string
   */
  const formatMinutesAsTime = useCallback((totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }, []);

  /**
   * Check if current time is within a prohibited time window
   */
  const isTimeInRange = useCallback((current, start, end) => {
    const currentMinutes = parseTimeToMinutes(current);
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);

    if (currentMinutes === null || startMinutes === null || endMinutes === null) {
      return false;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }, [parseTimeToMinutes]);

  /**
   * Check if current time is in prohibited period
   */
  const getProhibitedTimeInfo = useCallback((times) => {
    if (!times) return null;

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check sunrise prohibited time
    if (times.sunriseProhibitedStart && times.sunriseProhibitedEnd) {
      if (isTimeInRange(currentTimeStr, times.sunriseProhibitedStart, times.sunriseProhibitedEnd)) {
        return {
          type: 'sunrise',
          start: times.sunriseProhibitedStart,
          end: times.sunriseProhibitedEnd
        };
      }
    }

    // Check noon prohibited time
    if (times.noonProhibitedStart && times.noonProhibitedEnd) {
      if (isTimeInRange(currentTimeStr, times.noonProhibitedStart, times.noonProhibitedEnd)) {
        return {
          type: 'noon',
          start: times.noonProhibitedStart,
          end: times.noonProhibitedEnd
        };
      }
    }

    // Check sunset prohibited time
    if (times.sunsetProhibitedStart && times.sunsetProhibitedEnd) {
      if (isTimeInRange(currentTimeStr, times.sunsetProhibitedStart, times.sunsetProhibitedEnd)) {
        return {
          type: 'sunset',
          start: times.sunsetProhibitedStart,
          end: times.sunsetProhibitedEnd
        };
      }
    }

    return null;
  }, [isTimeInRange]);

  /**
   * Calculate the next prayer based on current time
   */
  const calculateNextPrayer = useCallback((times) => {
    if (!times) {
      setNextPrayer(null);
      return;
    }

    // Check for prohibited times
    const prohibitedTime = getProhibitedTimeInfo(times);
    if (prohibitedTime) {
      setNextPrayer({
        isProhibitedTime: true,
        prohibitedType: prohibitedTime.type,
        prohibitedStart: prohibitedTime.start,
        prohibitedEnd: prohibitedTime.end
      });
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'fajr', time: times.fajr },
      { name: 'dhuhr', time: times.dhuhr },
      { name: 'asr', time: times.asr },
      { name: 'maghrib', time: times.maghrib },
      { name: 'isha', time: times.isha }
    ];

    // Find the next prayer
    for (const prayer of prayers) {
      const prayerMinutes = parseTimeToMinutes(prayer.time);
      if (prayerMinutes === null) continue;

      if (prayerMinutes > currentMinutes) {
        const minutesUntil = prayerMinutes - currentMinutes;
        const hoursLeft = Math.floor(minutesUntil / 60);
        const minutesLeft = minutesUntil % 60;

        setNextPrayer({
          name: prayer.name,
          time: formatMinutesAsTime(prayerMinutes),
          timeLeft: `${hoursLeft}h ${minutesLeft}m`,
          minutesUntil,
          isProhibitedTime: false
        });
        return;
      }
    }

    // If no prayer found today, next is Fajr tomorrow
    const fajrMinutes = parseTimeToMinutes(prayers[0].time) || 360; // Default 06:00
    const minutesUntilTomorrow = (24 * 60 - currentMinutes) + fajrMinutes;
    const hoursLeft = Math.floor(minutesUntilTomorrow / 60);
    const minutesLeft = minutesUntilTomorrow % 60;

    setNextPrayer({
      name: 'fajr',
      time: formatMinutesAsTime(fajrMinutes),
      timeLeft: `${hoursLeft}h ${minutesLeft}m`,
      minutesUntil: minutesUntilTomorrow,
      isTomorrow: true,
      isProhibitedTime: false
    });
  }, [parseTimeToMinutes, formatMinutesAsTime, getProhibitedTimeInfo]);

  /**
   * Fetch prayer times from backend, with fallback to direct API call
   */
  const fetchPrayerTimes = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get('/api/prayer-times/today');
      let data = response.data;

      // Check if backend returned fallback data (Rajab 1447 indicates fallback)
      const isFallback = data?.hijriDate?.includes('Rajab 1447');
      
      if (isFallback) {
        try {
          // Try to fetch directly from Aladhan API
          const directResponse = await fetch(
            'https://api.aladhan.com/v1/timingsByCity?city=Sofia&country=Bulgaria&method=2'
          );
          
          if (directResponse.ok) {
            const json = await directResponse.json();
            if (json?.data?.timings) {
              data = {
                fajr: json.data.timings.Fajr.split(' ')[0],
                sunrise: json.data.timings.Sunrise.split(' ')[0],
                dhuhr: json.data.timings.Dhuhr.split(' ')[0],
                asr: json.data.timings.Asr.split(' ')[0],
                maghrib: json.data.timings.Maghrib.split(' ')[0],
                isha: json.data.timings.Isha.split(' ')[0],
                hijriDate: `${json.data.date?.hijri?.day} ${json.data.date?.hijri?.month?.en} ${json.data.date?.hijri?.year}`
              };
            }
          }
        } catch (fallbackError) {
          console.warn('Failed to fetch from direct API, using backend fallback:', fallbackError);
        }
      }

      setPrayerTimes(data);
      calculateNextPrayer(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError(err.message || 'Failed to fetch prayer times');
      setLoading(false);
    }
  }, [calculateNextPrayer]);

  // Initial fetch on mount and setup intervals
  useEffect(() => {
    // Fetch prayer times once on component mount
    fetchPrayerTimes();
    
    // Update next prayer calculation every minute (locally, no API call)
    // This keeps the countdown timer accurate without hitting the API
    const updateInterval = setInterval(() => {
      if (prayerTimes) {
        calculateNextPrayer(prayerTimes);
      }
    }, 60000); // 60 seconds
    
    // Refetch prayer times once per day (at midnight) to get next day's times
    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;
    
    const midnightTimeout = setTimeout(() => {
      fetchPrayerTimes(); // Refetch at midnight
      
      // Then refetch every 24 hours
      const dailyInterval = setInterval(fetchPrayerTimes, 86400000); // 24 hours
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => {
      clearInterval(updateInterval);
      clearTimeout(midnightTimeout);
    };
  }, [fetchPrayerTimes, prayerTimes, calculateNextPrayer]);

  return {
    prayerTimes,
    nextPrayer,
    loading,
    error,
    refetch: fetchPrayerTimes
  };
};

export default usePrayerTimes;
