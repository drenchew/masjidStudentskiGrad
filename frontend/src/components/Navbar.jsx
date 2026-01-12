import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FaMosque, FaBars, FaTimes } from 'react-icons/fa';
import ShoppingCart from './ShoppingCart';
import NavbarPrayerTimes from './NavbarPrayerTimes';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/prayer-times', label: t('nav.prayerTimes') },
    { path: '/khutbahs', label: t('nav.khutbahs') },
    { path: '/ramadan', label: i18n.language === 'ar' ? 'رمضان' : i18n.language === 'bg' ? 'Рамадан' : 'Ramadan' },
    { path: '/questions', label: t('nav.questions') || 'Questions' },
    { path: '/shop', label: t('nav.shop') },
    { path: '/donate', label: t('nav.donate') },
    { path: '/about', label: t('nav.about') }
  ];

  return (
    <nav className="bg-gradient-to-r from-islamic-green via-teal-700 to-islamic-darkGreen text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="relative">
              <FaMosque className="text-3xl text-islamic-gold transform group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-islamic-gold blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <span className="font-bold text-2xl tracking-wide group-hover:text-islamic-gold transition-colors">Masjid Studentski Grad</span>
          </Link>

          {/* Small next-prayer indicator */}
          <div className="hidden md:flex items-center">
            <NavbarPrayerTimes />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-lg font-semibold hover:text-islamic-gold transition-all duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-gold group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            
            {/* Shopping Cart */}
            <ShoppingCart />
            
            {/* Language Selector */}
            <div className="flex space-x-2 rtl:space-x-reverse pl-6 border-l border-white/30 rtl:pr-6 rtl:border-r rtl:border-l-0">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${i18n.language === 'en' ? 'bg-islamic-gold shadow-lg scale-110' : 'hover:bg-white/20 hover:scale-105'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('bg')}
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${i18n.language === 'bg' ? 'bg-islamic-gold shadow-lg scale-110' : 'hover:bg-white/20 hover:scale-105'}`}
              >
                BG
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${i18n.language === 'ar' ? 'bg-islamic-gold shadow-lg scale-110' : 'hover:bg-white/20 hover:scale-105'}`}
              >
                عربي
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 hover:text-islamic-gold transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex space-x-2 rtl:space-x-reverse mt-4 pt-4 border-t border-white/30">
              <button
                onClick={() => {
                  changeLanguage('en');
                  setIsOpen(false);
                }}
                className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-islamic-gold' : 'hover:bg-islamic-darkGreen'}`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  changeLanguage('bg');
                  setIsOpen(false);
                }}
                className={`px-3 py-1 rounded ${i18n.language === 'bg' ? 'bg-islamic-gold' : 'hover:bg-islamic-darkGreen'}`}
              >
                BG
              </button>
              <button
                onClick={() => {
                  changeLanguage('ar');
                  setIsOpen(false);
                }}
                className={`px-3 py-1 rounded ${i18n.language === 'ar' ? 'bg-islamic-gold' : 'hover:bg-islamic-darkGreen'}`}
              >
                عربي
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
