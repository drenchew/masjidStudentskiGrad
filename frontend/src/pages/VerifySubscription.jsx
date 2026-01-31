import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function VerifySubscription() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`/api/subscribers/verify?token=${encodeURIComponent(token)}`);
        setStatus('success');
        setMessage(res.data?.message || 'Subscription verified successfully.');
        // Redirect to homepage after short delay
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to verify subscription.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        {status === 'pending' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-masjid-green mx-auto mb-4"></div>
            <p className="text-gray-700">Verifying your subscription... Please wait.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-3">Subscription Confirmed</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <p className="text-sm text-gray-500">You will be redirected to the homepage shortly.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-3">Verification Failed</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 rounded">Go Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
