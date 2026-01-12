import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const NewsletterSubscribe = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/subscribers/subscribe', {
        email,
        language: i18n.language.toUpperCase()
      });
      setMessage(t('newsletter.success'));
      setEmail('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-islamic-green/20 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2 text-islamic-gold">{t('newsletter.title')}</h3>
      <p className="text-sm mb-4">{t('newsletter.subtitle')}</p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.emailPlaceholder')}
          required
          className="flex-1 px-4 py-2 rounded-lg text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-secondary whitespace-nowrap disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('newsletter.subscribe')}
        </button>
      </form>
      
      {message && (
        <p className="mt-2 text-sm text-islamic-gold">{message}</p>
      )}
    </div>
  );
};

export default NewsletterSubscribe;
