import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaMosque, FaHandHoldingHeart, FaCalculator, FaBullseye } from 'react-icons/fa';
import axios from '../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CampaignDonationModal from '../components/CampaignDonationModal';

export default function Donate() {
  const { t, i18n } = useTranslation();
  const [donationType, setDonationType] = useState('general'); // general, zakat
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState('one-time'); // one-time, monthly, yearly
  const [loading, setLoading] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const presetAmounts = [10, 20, 50, 100, 200, 500];

  const zakatCalculator = {
    gold: 0,
    silver: 0,
    cash: 0,
    investments: 0,
    business: 0,
    debt: 0
  };

  const [zakatAssets, setZakatAssets] = useState(zakatCalculator);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns/active');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const calculateZakat = () => {
    const totalAssets = 
      parseFloat(zakatAssets.gold || 0) +
      parseFloat(zakatAssets.silver || 0) +
      parseFloat(zakatAssets.cash || 0) +
      parseFloat(zakatAssets.investments || 0) +
      parseFloat(zakatAssets.business || 0);
    
    const totalDebt = parseFloat(zakatAssets.debt || 0);
    const zakatable = totalAssets - totalDebt;
    
    if (zakatable > 0) {
      return (zakatable * 0.025).toFixed(2); // 2.5% Zakat
    }
    return '0.00';
  };

  const handleDonate = async () => {
    const donationAmount = customAmount || amount;
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert(i18n.language === 'ar' ? 'الرجاء إدخال مبلغ صالح' :
            i18n.language === 'bg' ? 'Моля, въведете валидна сума' :
            'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create donation intent with backend
      // NOTE: backend currently exposes POST /api/donations/create which returns clientSecret
      // We'll call that and then show a card form to confirm the payment using Elements.
      const response = await axios.post('/api/donations/create', {
        email: '',
        name: '',
        amount: String(parseFloat(donationAmount).toFixed(2)),
        message: ''
      });

      if (response.data?.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowCardForm(true);
      } else {
        alert('Payment setup failed: no clientSecret returned');
      }
      
    } catch (error) {
      console.error('Donation error:', error);
      alert(i18n.language === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' :
            i18n.language === 'bg' ? 'Възникна грешка. Моля, опитайте отново.' :
            'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-islamic-green via-teal-700 to-islamic-darkGreen text-white py-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-fadeInUp">
            <FaHeart className="text-6xl mx-auto mb-6 text-islamic-gold animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {i18n.language === 'ar' ? 'ادعم مسجدنا' : 
               i18n.language === 'bg' ? 'Подкрепете нашата джамия' : 
               'Support Our Mosque'}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              {i18n.language === 'ar' ? 'ساعدنا في الحفاظ على المسجد وخدمة المجتمع' :
               i18n.language === 'bg' ? 'Помогнете ни да поддържаме джамията и да служим на общността' :
               'Help us maintain the mosque and serve the community'}
            </p>
          </div>
        </div>
      </section>

      {/* Fundraising Campaigns Section */}
      {!loadingCampaigns && campaigns.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-gradient-to-b from-white to-islamic-cream">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fadeInUp">
              <FaBullseye className="text-5xl text-islamic-green mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4 gradient-text">
                {i18n.language === 'ar' ? 'حملات جمع التبرعات' :
                 i18n.language === 'bg' ? 'Кампании за набиране на средства' :
                 'Fundraising Campaigns'}
              </h2>
              <p className="text-lg text-gray-600">
                {i18n.language === 'ar' ? 'ساعدنا في تحقيق أهدافنا المجتمعية' :
                 i18n.language === 'bg' ? 'Помогнете ни да постигнем нашите общи цели' :
                 'Help us achieve our community goals'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => {
                const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
                const title = i18n.language === 'ar' ? campaign.titleAr :
                             i18n.language === 'bg' ? campaign.titleBg :
                             campaign.titleEn;
                const description = i18n.language === 'ar' ? campaign.descriptionAr :
                                   i18n.language === 'bg' ? campaign.descriptionBg :
                                   campaign.descriptionEn;
                
                return (
                  <div key={campaign.id} className="card-modern overflow-hidden animate-fadeInUp">
                    {campaign.imageUrl && (
                      <img
                        src={campaign.imageUrl}
                        alt={title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold gradient-text flex-1">
                          {title}
                        </h3>
                        {campaign.featured && (
                          <span className="px-3 py-1 bg-islamic-gold text-white text-xs rounded-full font-semibold">
                            ⭐ {i18n.language === 'ar' ? 'مميز' : i18n.language === 'bg' ? 'Избран' : 'Featured'}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-islamic-darkGreen">
                            {i18n.language === 'ar' ? 'المبلغ المجموع' :
                             i18n.language === 'bg' ? 'Събрано' :
                             'Raised'}
                          </span>
                          <span className="font-semibold text-islamic-darkGreen">
                            €{campaign.currentAmount.toLocaleString()} / €{campaign.goalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-islamic-green to-teal-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-lg font-bold text-islamic-green">
                            {progress.toFixed(1)}% {i18n.language === 'ar' ? 'مكتمل' : i18n.language === 'bg' ? 'Завършено' : 'Complete'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Campaign Dates */}
                      {campaign.endDate && (
                        <div className="text-sm text-gray-500 mb-4">
                          <span className="font-semibold">
                            {i18n.language === 'ar' ? 'ينتهي في: ' :
                             i18n.language === 'bg' ? 'Завършва на: ' :
                             'Ends on: '}
                          </span>
                          {new Date(campaign.endDate).toLocaleDateString(i18n.language)}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowCampaignModal(true);
                        }}
                        className="w-full btn-primary py-3"
                      >
                        {i18n.language === 'ar' ? '💝 تبرع لهذه الحملة' :
                         i18n.language === 'bg' ? '💝 Дарете за тази кампания' :
                         '💝 Donate to this Campaign'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Donation Type Selection */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setDonationType('general')}
              className={`card-modern p-8 text-left transition-all ${
                donationType === 'general' 
                  ? 'ring-4 ring-islamic-green shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
            >
              <FaMosque className="text-5xl text-islamic-green mb-4" />
              <h3 className="text-2xl font-bold mb-2 gradient-text">
                {i18n.language === 'ar' ? 'تبرع عام' : 
                 i18n.language === 'bg' ? 'Общо дарение' : 
                 'General Donation'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'للصيانة والأنشطة المجتمعية والبرامج التعليمية' :
                 i18n.language === 'bg' ? 'За поддръжка, обществени дейности и образователни програми' :
                 'For maintenance, community activities, and educational programs'}
              </p>
            </button>

            <button
              onClick={() => setDonationType('zakat')}
              className={`card-modern p-8 text-left transition-all ${
                donationType === 'zakat' 
                  ? 'ring-4 ring-islamic-gold shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
            >
              <FaHandHoldingHeart className="text-5xl text-islamic-gold mb-4" />
              <h3 className="text-2xl font-bold mb-2 gradient-text">
                {i18n.language === 'ar' ? 'زكاة' : 
                 i18n.language === 'bg' ? 'Закят' : 
                 'Zakat'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'أدِّ زكاتك المفروضة لمساعدة المحتاجين' :
                 i18n.language === 'bg' ? 'Платете задължителния си Закят за помощ на нуждаещите се' :
                 'Pay your obligatory Zakat to help those in need'}
              </p>
            </button>
          </div>

          {/* Zakat Calculator */}
          {donationType === 'zakat' && (
            <div className="bg-islamic-cream rounded-3xl p-8 mb-12 animate-fadeInUp">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3 gradient-text">
                <FaCalculator />
                {i18n.language === 'ar' ? 'حاسبة الزكاة' : 
                 i18n.language === 'bg' ? 'Калкулатор на Закят' : 
                 'Zakat Calculator'}
              </h3>
              <p className="text-gray-700 mb-6">
                {i18n.language === 'ar' ? 'احسب زكاتك بناءً على أصولك' :
                 i18n.language === 'bg' ? 'Изчислете вашия Закят въз основа на активите ви' :
                 'Calculate your Zakat based on your assets'}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                    {i18n.language === 'ar' ? 'الذهب (€)' : 
                     i18n.language === 'bg' ? 'Злато (€)' : 
                     'Gold (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.gold}
                    onChange={(e) => setZakatAssets({...zakatAssets, gold: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                    {i18n.language === 'ar' ? 'الفضة (€)' : 
                     i18n.language === 'bg' ? 'Сребро (€)' : 
                     'Silver (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.silver}
                    onChange={(e) => setZakatAssets({...zakatAssets, silver: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                    {i18n.language === 'ar' ? 'النقد (€)' : 
                     i18n.language === 'bg' ? 'Пари в брой (€)' : 
                     'Cash (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.cash}
                    onChange={(e) => setZakatAssets({...zakatAssets, cash: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                    {i18n.language === 'ar' ? 'الاستثمارات (€)' : 
                     i18n.language === 'bg' ? 'Инвестиции (€)' : 
                     'Investments (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.investments}
                    onChange={(e) => setZakatAssets({...zakatAssets, investments: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                    {i18n.language === 'ar' ? 'الأعمال (€)' : 
                     i18n.language === 'bg' ? 'Бизнес (€)' : 
                     'Business (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.business}
                    onChange={(e) => setZakatAssets({...zakatAssets, business: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-red-600">
                    {i18n.language === 'ar' ? 'الديون (€)' : 
                     i18n.language === 'bg' ? 'Дългове (€)' : 
                     'Debts (€)'}
                  </label>
                  <input
                    type="number"
                    value={zakatAssets.debt}
                    onChange={(e) => setZakatAssets({...zakatAssets, debt: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-islamic-green to-teal-700 text-white rounded-2xl p-6 text-center">
                <p className="text-lg mb-2">
                  {i18n.language === 'ar' ? 'الزكاة المستحقة' : 
                   i18n.language === 'bg' ? 'Дължим Закят' : 
                   'Zakat Due'}
                </p>
                <p className="text-5xl font-bold">€{calculateZakat()}</p>
                <p className="text-sm mt-2 opacity-80">
                  {i18n.language === 'ar' ? '(2.5% من الأصول المؤهلة)' :
                   i18n.language === 'bg' ? '(2.5% от подходящите активи)' :
                   '(2.5% of zakatable assets)'}
                </p>
              </div>
            </div>
          )}

          {/* Donation Amount Selection */}
          <div className="card-modern p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 gradient-text">
              {i18n.language === 'ar' ? 'اختر المبلغ' : 
               i18n.language === 'bg' ? 'Изберете сума' : 
               'Select Amount'}
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-4 rounded-xl font-bold text-lg transition-all ${
                    amount === preset
                      ? 'bg-islamic-green text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  €{preset}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'مبلغ مخصص (€)' : 
                 i18n.language === 'bg' ? 'Друга сума (€)' : 
                 'Custom Amount (€)'}
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                className="w-full px-6 py-4 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all text-lg"
                placeholder="0.00"
              />
            </div>

            {/* Frequency Selection */}
            {donationType === 'general' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'التكرار' : 
                   i18n.language === 'bg' ? 'Честота' : 
                   'Frequency'}
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setFrequency('one-time')}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      frequency === 'one-time'
                        ? 'bg-islamic-gold text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i18n.language === 'ar' ? 'مرة واحدة' : 
                     i18n.language === 'bg' ? 'Еднократно' : 
                     'One-time'}
                  </button>
                  <button
                    onClick={() => setFrequency('monthly')}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      frequency === 'monthly'
                        ? 'bg-islamic-gold text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i18n.language === 'ar' ? 'شهري' : 
                     i18n.language === 'bg' ? 'Месечно' : 
                     'Monthly'}
                  </button>
                  <button
                    onClick={() => setFrequency('yearly')}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      frequency === 'yearly'
                        ? 'bg-islamic-gold text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i18n.language === 'ar' ? 'سنوي' : 
                     i18n.language === 'bg' ? 'Годишно' : 
                     'Yearly'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={!amount && !customAmount || loading}
              className="btn-primary w-full py-5 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                i18n.language === 'ar' ? '⏳ جاري المعالجة...' : 
                i18n.language === 'bg' ? '⏳ Обработка...' : 
                '⏳ Processing...'
              ) : (
                i18n.language === 'ar' ? '💝 تبرع الآن' : 
                i18n.language === 'bg' ? '💝 Дарете сега' : 
                '💝 Donate Now'
              )}
            </button>

            {/* Stripe Integration Note */}
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Developer Note:</strong> Stripe integration is ready on the backend. 
                Add your Stripe Publishable Key to complete payment processing.
              </p>
            </div>
          </div>

          {/* Card Form Modal (Stripe Elements) */}
          {showCardForm && clientSecret && (
            <Elements stripe={loadStripe(import.meta.env.VITE_STRIPE_PK)}>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6">
                  <h3 className="text-2xl font-bold mb-4">{i18n.language === 'ar' ? 'ادخل بيانات البطاقة' : i18n.language === 'bg' ? 'Въведете данни за картата' : 'Enter card details'}</h3>
                  <CardPaymentForm clientSecret={clientSecret} onClose={() => { setShowCardForm(false); setClientSecret(null); }} />
                </div>
              </div>
            </Elements>
          )}

          {/* Impact Section */}
          <div className="bg-gradient-to-br from-islamic-lightGreen to-white rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center gradient-text">
              {i18n.language === 'ar' ? 'تأثير تبرعك' : 
               i18n.language === 'bg' ? 'Въздействие на вашето дарение' : 
               'Your Donation Impact'}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🕌</div>
                <h4 className="font-bold mb-2 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'صيانة المسجد' : 
                   i18n.language === 'bg' ? 'Поддръжка на джамията' : 
                   'Mosque Maintenance'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {i18n.language === 'ar' ? 'الحفاظ على نظافة وأمان مكان العبادة' :
                   i18n.language === 'bg' ? 'Поддържане на чисто и безопасно място за поклонение' :
                   'Keep our place of worship clean and safe'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="font-bold mb-2 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'البرامج التعليمية' : 
                   i18n.language === 'bg' ? 'Образователни програми' : 
                   'Educational Programs'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {i18n.language === 'ar' ? 'دعم دروس القرآن والتعليم الإسلامي' :
                   i18n.language === 'bg' ? 'Подкрепа на уроци по Коран и ислямско образование' :
                   'Support Quran classes and Islamic education'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h4 className="font-bold mb-2 text-islamic-darkGreen">
                  {i18n.language === 'ar' ? 'الخدمات المجتمعية' : 
                   i18n.language === 'bg' ? 'Обществени услуги' : 
                   'Community Services'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {i18n.language === 'ar' ? 'دعم الفعاليات والخدمات المجتمعية' :
                   i18n.language === 'bg' ? 'Подкрепа на събития и обществени услуги' :
                   'Fund community events and services'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Donation Modal */}
      {showCampaignModal && selectedCampaign && (
        <CampaignDonationModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}

function CardPaymentForm({ clientSecret, onClose }) {
  const { i18n } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const card = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    });

    if (result.error) {
      alert((i18n.language === 'ar' ? 'خطأ في الدفع: ' : i18n.language === 'bg' ? 'Грешка при плащане: ' : 'Payment error: ') + result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        alert(i18n.language === 'ar' ? 'تم الدفع بنجاح، جزاكم الله خيراً' : i18n.language === 'bg' ? 'Плащането бе успешно, благодарим ви' : 'Payment successful, thank you');
        onClose();
      } else {
        alert(i18n.language === 'ar' ? 'Payment status: ' : i18n.language === 'bg' ? 'Статус на плащането: ' : 'Payment status: ' + (result.paymentIntent?.status || 'unknown'));
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card</label>
        <div className="p-3 border rounded">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Use test card: 4242 4242 4242 4242 — any CVC, any future date.</p>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={!stripe || processing} className="flex-1 bg-masjid-green text-white px-6 py-3 rounded-lg hover:bg-masjid-dark transition-colors font-semibold">
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 rounded-lg">Cancel</button>
      </div>
    </form>
  );
}
