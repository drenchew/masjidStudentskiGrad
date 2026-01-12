# Stripe Integration Guide

## Quick Setup Guide for Payment Processing

### Step 1: Install Stripe.js

```bash
cd frontend
npm install @stripe/stripe-js
```

### Step 2: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign in or create an account
3. Get your **Publishable Key** (starts with `pk_test_` for test mode)
4. Get your **Secret Key** (starts with `sk_test_` for test mode) - Already in backend

### Step 3: Add Publishable Key to Frontend

**File**: `frontend/src/pages/Donate.jsx`

**Add at the top of the file**:

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe('pk_test_YOUR_KEY_HERE');
```

### Step 4: Update the handleDonate Function

**Replace the current handleDonate function with**:

```javascript
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
    // Create payment session with backend
    const response = await axios.post('/api/donations/create-checkout-session', {
      amount: parseFloat(donationAmount),
      donationType: donationType.toUpperCase(),
      frequency: frequency.toUpperCase(),
      currency: 'BGN', // or 'EUR'
      successUrl: `${window.location.origin}/donate?success=true`,
      cancelUrl: `${window.location.origin}/donate?canceled=true`
    });

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: response.data.sessionId
    });

    if (error) {
      console.error('Stripe error:', error);
      alert('Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Donation error:', error);
    alert('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Backend API Endpoint

**Ensure your backend has this endpoint**:

```
POST /api/donations/create-checkout-session
```

**Expected Request Body**:
```json
{
  "amount": 50.00,
  "donationType": "GENERAL",
  "frequency": "ONE_TIME",
  "currency": "BGN",
  "successUrl": "http://localhost:5173/donate?success=true",
  "cancelUrl": "http://localhost:5173/donate?canceled=true"
}
```

**Expected Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Step 6: Handle Success/Cancel Redirects

**Add this to your Donate.jsx useEffect**:

```javascript
useEffect(() => {
  // Check for success/cancel in URL
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('success')) {
    alert('Thank you for your donation! 🎉');
    // Clear URL params
    window.history.replaceState({}, '', '/donate');
  }
  
  if (urlParams.get('canceled')) {
    alert('Donation was canceled. You can try again whenever you\'re ready.');
    window.history.replaceState({}, '', '/donate');
  }
}, []);
```

---

## Alternative: Stripe Elements Integration

If you prefer embedded payment form instead of redirect:

### Step 1: Install additional packages

```bash
npm install @stripe/react-stripe-js
```

### Step 2: Create Payment Form Component

**File**: `frontend/src/components/StripePaymentForm.jsx`

```javascript
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function StripePaymentForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { data } = await axios.post('/api/donations/create-payment-intent', {
        amount
      });

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay ${amount} BGN`}
      </button>
    </form>
  );
}
```

### Step 3: Wrap your app with Elements provider

**In App.jsx or Donate.jsx**:

```javascript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_YOUR_KEY_HERE');

// In your component:
<Elements stripe={stripePromise}>
  <StripePaymentForm amount={donationAmount} onSuccess={handleSuccess} />
</Elements>
```

---

## Testing with Test Cards

Use these test card numbers in Stripe test mode:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

**Other test details**:
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

## Important Security Notes

⚠️ **Never commit your Secret Key to Git!**
⚠️ **Use environment variables for keys**
⚠️ **Always validate amounts on the server side**
⚠️ **Use HTTPS in production**

---

## Quick Checklist

- [ ] Stripe account created
- [ ] npm install @stripe/stripe-js completed
- [ ] Publishable key added to frontend
- [ ] Secret key in backend (environment variable)
- [ ] Backend endpoint created
- [ ] Test with test cards
- [ ] Success/cancel redirects working
- [ ] Switch to live keys for production

---

## Need Help?

- **Stripe Docs**: https://stripe.com/docs
- **React Integration**: https://stripe.com/docs/stripe-js/react
- **Testing**: https://stripe.com/docs/testing

Your backend already has Stripe integration. You just need to add the frontend key and uncomment the integration code!
