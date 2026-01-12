import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PrayerTimes from './pages/PrayerTimes';
import Khutbahs from './pages/Khutbahs';
import Shop from './pages/Shop';
import Donate from './pages/Donate';
import Ramadan from './pages/Ramadan';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDonations from './pages/admin/AdminDonations';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageKhutbahs from './pages/admin/ManageKhutbahs';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageRamadanVideos from './pages/admin/ManageRamadanVideos';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageCampaigns from './pages/admin/ManageCampaigns';
import TestAuth from './pages/admin/TestAuth';
import VerifySubscription from './pages/VerifySubscription';
import Questions from './pages/Questions';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document direction based on language
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prayer-times" element={<PrayerTimes />} />
              <Route path="/khutbahs" element={<Khutbahs />} />
              <Route path="/ramadan" element={<Ramadan />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/about" element={<About />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/donations" element={<AdminDonations />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/khutbahs" element={<ManageKhutbahs />} />
              <Route path="/admin/announcements" element={<ManageAnnouncements />} />
              <Route path="/admin/ramadan-videos" element={<ManageRamadanVideos />} />
              <Route path="/admin/questions" element={<ManageQuestions />} />
              <Route path="/admin/campaigns" element={<ManageCampaigns />} />
              <Route path="/admin/test-auth" element={<TestAuth />} />
              <Route path="/verify-subscription" element={<VerifySubscription />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
