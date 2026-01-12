import { useNavigate } from 'react-router-dom';
import usePrayerTimes from '../hooks/usePrayerTimes';

const PRAYER_NAMES = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};

const NavbarPrayerTimes = () => {
  const { nextPrayer } = usePrayerTimes();
  const navigate = useNavigate();

  if (!nextPrayer) return null;

  return (
    <button
      onClick={() => navigate('/prayer-times')}
      className="ml-3 px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
      title="View full prayer times"
    >
      Next: <span className="font-semibold ml-1">{PRAYER_NAMES[nextPrayer.name]} {nextPrayer.time}</span>
    </button>
  );
};

export default NavbarPrayerTimes;
