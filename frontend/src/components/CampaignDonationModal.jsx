import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../api/axios';
import { FaTimes, FaHeart, FaExclamationCircle } from 'react-icons/fa';
import { validateDonationAmount, validateName, validateEmail, sanitizeInput, VALIDATION_LIMITS } from '../utils/validationLimits';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder');

export default function CampaignDonationModal({ campaign, onClose }) {
  const { t, i18n } = useTranslation();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [10, 20, 50, 100, 200, 500];

  const title = i18n.language === 'ar' ? campaign.titleAr :
               i18n.language === 'bg' ? campaign.titleBg :
               campaign.titleEn;

  const handleProceedToPayment = async () => {
    setError('');
    const donationAmount = customAmount || amount;
    
    // Validate donation amount
    if (!donationAmount) {
      setError(i18n.language === 'ar' ? 'الرجاء إدخال مبلغ' :
               i18n.language === 'bg' ? 'Моля, въведете сума' :
               'Please enter an amount');
      return;
    }

    const amountError = validateDonationAmount(donationAmount);
    if (amountError) {
      setError(amountError);
      return;
    }

    // Validate optional fields if provided
    if (name && name.length > VALIDATION_LIMITS.NAME.MAX) {
      setError(VALIDATION_LIMITS.NAME.ERROR_MAX);
      return;
    }

    if (email && email.length > VALIDATION_LIMITS.EMAIL.MAX) {
      setError(VALIDATION_LIMITS.EMAIL.ERROR_MAX);
      return;
    }

    if (message && message.length > VALIDATION_LIMITS.CONTACT_MESSAGE.MAX) {
      setError(VALIDATION_LIMITS.CONTACT_MESSAGE.ERROR_MAX);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/api/donations/campaign/${campaign.id}`, {
        email: email ? sanitizeInput(email) : 'anonymous@donor.com',
        name: name ? sanitizeInput(name) : 'Anonymous',
        amount: parseFloat(donationAmount),
        message: message ? sanitizeInput(message) : '',
        currency: 'EUR'
      });

      if (response.data?.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowPaymentForm(true);

      } else {
        setError(i18n.language === 'ar' ? 'فشل إعداد الدفع' :
                 i18n.language === 'bg' ? 'Неуспешно настройване на плащане' :
                 'Payment setup failed: no clientSecret returned');
      }
    } catch (error) {
      console.error('Donation error:', error);
      const errorMsg = error.response?.data?.message || 
                       (i18n.language === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' :
                        i18n.language === 'bg' ? 'Възникна грешка. Моля, опитайте отново.' :
                        'An error occurred. Please try again.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (showPaymentForm && clientSecret) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-4">
          <Elements stripe={stripePromise}>
            <PaymentForm 
              clientSecret={clientSecret} 
              amount={customAmount || amount}
              campaignTitle={title}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-2xl" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaHeart className="text-3xl text-islamic-green" />
            <h2 className="text-3xl font-bold gradient-text">
              {i18n.language === 'ar' ? 'تبرع للحملة' :
               i18n.language === 'bg' ? 'Дарете за кампанията' :
               'Donate to Campaign'}
            </h2>
          </div>
          <p className="text-xl text-gray-700 font-semibold">{title}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
            <FaExclamationCircle className="text-red-600 text-xl mt-0.5 flex-shrink-0" />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Campaign Progress */}
        <div className="mb-6 p-4 bg-islamic-cream rounded-xl">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">
              {i18n.language === 'ar' ? 'المبلغ المجموع' :
               i18n.language === 'bg' ? 'Събрано' :
               'Raised'}
            </span>
            <span className="font-semibold">
              €{campaign.currentAmount.toLocaleString()} / €{campaign.goalAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-islamic-green to-teal-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-3 text-islamic-darkGreen">
            {i18n.language === 'ar' ? 'اختر المبلغ' :
             i18n.language === 'bg' ? 'Изберете сума' :
             'Select Amount'}
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  amount === preset
                    ? 'bg-islamic-green text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                €{preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount('');
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-islamic-green/30 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
            placeholder={i18n.language === 'ar' ? 'مبلغ مخصص (€)' :
                        i18n.language === 'bg' ? 'Друга сума (€)' :
                        'Custom Amount (€)'}
          />
        </div>

        {/* Donor Information (Optional) */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {i18n.language === 'ar' ? 'الاسم (اختياري)' :
               i18n.language === 'bg' ? 'Име (по избор)' :
               'Name (Optional)'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
              placeholder={i18n.language === 'ar' ? 'أو أترك فارغاً للتبرع مجهولاً' :
                          i18n.language === 'bg' ? 'Или оставете празно за анонимно дарение' :
                          'Or leave blank for anonymous donation'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {i18n.language === 'ar' ? 'البريد الإلكتروني (اختياري)' :
               i18n.language === 'bg' ? 'Имейл (по избор)' :
               'Email (Optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
              placeholder={i18n.language === 'ar' ? 'للحصول على إيصال' :
                          i18n.language === 'bg' ? 'За получаване на разписка' :
                          'For receipt'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {i18n.language === 'ar' ? 'رسالة (اختياري)' :
               i18n.language === 'bg' ? 'Съобщение (по избор)' :
               'Message (Optional)'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-islamic-green focus:ring-2 focus:ring-islamic-green/20 transition-all"
              placeholder={i18n.language === 'ar' ? 'أترك رسالة للمجتمع' :
                          i18n.language === 'bg' ? 'Оставете съобщение за общността' :
                          'Leave a message for the community'}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleProceedToPayment}
            disabled={!amount && !customAmount || loading}
            className="flex-1 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              i18n.language === 'ar' ? '⏳ جاري المعالجة...' :
              i18n.language === 'bg' ? '⏳ Обработка...' :
              '⏳ Processing...'
            ) : (
              i18n.language === 'ar' ? '💳 المتابعة للدفع' :
              i18n.language === 'bg' ? '💳 Продължете към плащане' :
              '💳 Proceed to Payment'
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
          >
            {i18n.language === 'ar' ? 'إلغاء' :
             i18n.language === 'bg' ? 'Отказ' :
             'Cancel'}
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>🔒 {i18n.language === 'ar' ? 'دفع آمن:' :
                        i18n.language === 'bg' ? 'Сигурно плащане:' :
                        'Secure Payment:'}</strong>{' '}
            {i18n.language === 'ar' ? 'جميع المدفوعات تتم بشكل آمن عبر Stripe' :
             i18n.language === 'bg' ? 'Всички плащания се обработват сигурно чрез Stripe' :
             'All payments are processed securely through Stripe'}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ clientSecret, amount, campaignTitle, onClose }) {
  const { i18n } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    });

    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        alert(
          i18n.language === 'ar' ? `✅ تم الدفع بنجاح! شكراً لدعمك لـ ${campaignTitle}` :
          i18n.language === 'bg' ? `✅ Плащането бе успешно! Благодарим ви за подкрепата на ${campaignTitle}` :
          `✅ Payment successful! Thank you for supporting ${campaignTitle}`
        );
        onClose();
        // Reload the page to show updated campaign progress
        window.location.reload();
      }
      setProcessing(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 gradient-text">
        {i18n.language === 'ar' ? 'أدخل بيانات البطاقة' :
         i18n.language === 'bg' ? 'Въведете данни за картата' :
         'Enter Card Details'}
      </h3>
      <div className="mb-6 p-4 bg-islamic-cream rounded-xl">
        <p className="text-sm text-gray-600 mb-1">
          {i18n.language === 'ar' ? 'المبلغ' : i18n.language === 'bg' ? 'Сума' : 'Amount'}
        </p>
        <p className="text-3xl font-bold text-islamic-green">€{amount}</p>
        <p className="text-sm text-gray-600 mt-2">{campaignTitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border-2 border-gray-300 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {i18n.language === 'ar' ? 'بطاقة الائتمان / الخصم' :
             i18n.language === 'bg' ? 'Кредитна/дебитна карта' :
             'Credit / Debit Card'}
          </label>
          <div className="p-3 border-2 border-gray-200 rounded-lg">
            <CardElement 
              options={{
                hidePostalCode: false,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {i18n.language === 'ar' ? '🧪 اختبر: 4242 4242 4242 4242 — أي CVC، أي تاريخ مستقبلي' :
             i18n.language === 'bg' ? '🧪 Тест: 4242 4242 4242 4242 — всеки CVC, всяка бъдеща дата' :
             '🧪 Test: 4242 4242 4242 4242 — any CVC, any future date'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 bg-islamic-green text-white px-6 py-4 rounded-xl hover:bg-islamic-darkGreen transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              i18n.language === 'ar' ? '⏳ جاري المعالجة...' :
              i18n.language === 'bg' ? '⏳ Обработка...' :
              '⏳ Processing...'
            ) : (
              i18n.language === 'ar' ? `💝 تبرع €${amount}` :
              i18n.language === 'bg' ? `💝 Дарете €${amount}` :
              `💝 Donate €${amount}`
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
          >
            {i18n.language === 'ar' ? 'إلغاء' :
             i18n.language === 'bg' ? 'Отказ' :
             'Cancel'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <p className="text-sm text-green-800">
          <strong>🔒 {i18n.language === 'ar' ? 'آمن 100%:' :
                      i18n.language === 'bg' ? '100% сигурно:' :
                      '100% Secure:'}</strong>{' '}
          {i18n.language === 'ar' ? 'نحن لا نخزن بيانات بطاقتك الائتمانية. جميع المدفوعات تتم بشكل آمن عبر Stripe.' :
           i18n.language === 'bg' ? 'Ние не съхраняваме данните на вашата карта. Всички плащания се обработват сигурно чрез Stripe.' :
           'We never store your card details. All payments are securely processed by Stripe.'}
        </p>
      </div>
    </div>
  );
}
