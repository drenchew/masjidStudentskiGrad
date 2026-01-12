import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import NewsletterSubscribe from './NewsletterSubscribe';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-islamic-darkGreen text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Newsletter Section */}
        <div className="mb-8">
          <NewsletterSubscribe />
        </div>

        <div className="grid md:grid-cols-3 gap-8 border-t border-white/20 pt-8">
          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-xl mb-4 text-islamic-gold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <p>Studentski Grad, Sofia, Bulgaria</p>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FaPhone className="flex-shrink-0" />
                <p>+359 XXX XXX XXX</p>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FaEnvelope className="flex-shrink-0" />
                <p>info@masjidstudentskigrad.com</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xl mb-4 text-islamic-gold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/prayer-times" className="block hover:text-islamic-gold transition-colors">
                {t('nav.prayerTimes')}
              </Link>
              <Link to="/khutbahs" className="block hover:text-islamic-gold transition-colors">
                {t('nav.khutbahs')}
              </Link>
              <Link to="/shop" className="block hover:text-islamic-gold transition-colors">
                {t('nav.shop')}
              </Link>
              <Link to="/donate" className="block hover:text-islamic-gold transition-colors">
                {t('nav.donate')}
              </Link>
              <Link to="/track-order" className="block hover:text-islamic-gold transition-colors">
                {t('order.trackOrder')}
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-xl mb-4 text-islamic-gold">Follow Us</h3>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-2xl hover:text-islamic-gold transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="text-2xl hover:text-islamic-gold transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="text-2xl hover:text-islamic-gold transition-colors">
                <FaYoutube />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-300">
                JazakAllah Khair for supporting our community
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2026 Masjid Studentski Grad. All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-400">Built with ❤️ for the Muslim community</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
