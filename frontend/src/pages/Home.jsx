import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaMosque, FaHeart, FaBook } from 'react-icons/fa';
import NextPrayerCard from '../components/NextPrayerCard';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-islamic-green via-islamic-darkGreen to-teal-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-islamic-gold opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-islamic-gold opacity-10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="inline-block hover:scale-110 transition-transform duration-300">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-3xl mb-12 opacity-95 font-light max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/donate" className="btn-secondary transform hover:scale-105 transition-all">
                <span className="flex items-center gap-2">
                  ❤️ {t('hero.donate')}
                </span>
              </Link>
              <Link to="/prayer-times" className="glass-effect text-white px-8 py-4 rounded-xl hover:bg-white hover:text-islamic-green transition-all font-bold shadow-2xl">
                🕌 {t('nav.prayerTimes')}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="rgba(245, 247, 250, 1)" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Next Prayer Time Widget */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="max-w-md mx-auto">
          <NextPrayerCard />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="card-modern text-center p-8 group">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-islamic-green opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
              <FaMosque className="text-6xl text-islamic-green mx-auto relative animate-float" />
            </div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">Daily Prayers</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Join us for the five daily prayers. All welcome to our community.
            </p>
            <Link to="/prayer-times" className="inline-flex items-center text-islamic-green hover:text-islamic-darkGreen font-bold text-lg group-hover:gap-3 gap-2 transition-all">
              View Prayer Times 
              <span className="transform group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="card-modern text-center p-8 group">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-islamic-gold opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
              <FaBook className="text-6xl text-islamic-gold mx-auto relative animate-float" style={{animationDelay: '0.5s'}} />
            </div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">Friday Khutbahs</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Listen to inspiring Friday sermons and lectures from our scholars.
            </p>
            <Link to="/khutbahs" className="inline-flex items-center text-islamic-gold hover:text-islamic-darkGreen font-bold text-lg group-hover:gap-3 gap-2 transition-all">
              Browse Archive 
              <span className="transform group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="card-modern text-center p-8 group">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-red-500 opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
              <FaHeart className="text-6xl text-red-500 mx-auto relative animate-float" style={{animationDelay: '1s'}} />
            </div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">Support Us</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Help us maintain and grow our masjid with your generous donations.
            </p>
            <Link to="/donate" className="inline-flex items-center text-red-500 hover:text-red-700 font-bold text-lg group-hover:gap-3 gap-2 transition-all">
              Make a Donation 
              <span className="transform group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto glass-effect rounded-3xl p-12 backdrop-blur-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center gradient-text">
              {t('About Masjid Studentski Grad')}
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p className="text-center max-w-3xl mx-auto">
                Masjid Studentski Grad serves as a spiritual home for the Muslim community in Sofia's student district. 
                We provide a welcoming space for worship, learning, and community engagement.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="text-center p-6 hover:bg-white/50 rounded-xl transition-all">
                  <div className="text-5xl font-bold text-islamic-green mb-2 pulse-glow">5</div>
                  <p className="text-gray-600 font-semibold">Daily Prayers</p>
                </div>
                <div className="text-center p-6 hover:bg-white/50 rounded-xl transition-all">
                  <div className="text-5xl font-bold text-islamic-gold mb-2 pulse-glow">∞</div>
                  <p className="text-gray-600 font-semibold">Community Members</p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to="/about" className="btn-primary inline-block">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-islamic-green via-islamic-darkGreen to-teal-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Stay connected with prayer times, events, and announcements.
          </p>
          <Link to="/donate" className="btn-secondary transform hover:scale-105 transition-all shadow-2xl">
            Subscribe to Newsletter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
