# Stripe Webhook Setup Guide

## Why Webhooks Are Required

Campaign donation totals **only update after successful payment** via Stripe webhooks. Without properly configured webhooks, donations will be created but campaigns won't show the updated totals.

## The Problem

When a user donates to a campaign:
1. ✅ Frontend creates a Payment Intent via `/api/donations/campaign/{id}`
2. ✅ User completes payment with Stripe
3. ❌ **Campaign total doesn't update** ← This is the webhook issue

## The Solution

Stripe must send a webhook event (`payment_intent.succeeded`) to your backend, which then:
- Marks the donation as COMPLETED
- Updates the campaign's `currentAmount`
- Sends a thank you email

---

## Setup Instructions

### Option 1: Production (Live Server)

#### 1. Create a Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/donations/webhook/stripe
   ```
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click **"Add endpoint"**

#### 2. Copy the Webhook Signing Secret

After creating the endpoint, Stripe shows a signing secret like:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

#### 3. Configure Backend

Add to `backend/.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

#### 4. Restart Backend

```bash
./stop-servers.sh
./start-servers.sh
```

#### 5. Test

Make a test donation and check logs:
```bash
tail -f /tmp/masjid-backend.log | grep -i "webhook\|campaign"
```

You should see:
```
Received Stripe webhook event: payment_intent.succeeded
✅ Successfully updated campaign 1 current amount: 500 → 550 (added 50)
```

---

### Option 2: Local Development (Stripe CLI)

For local testing without exposing your server to the internet:

#### 1. Install Stripe CLI

```bash
# Linux/Mac
brew install stripe/stripe-cli/stripe

# Or download from:
# https://stripe.com/docs/stripe-cli
```

#### 2. Login to Stripe

```bash
stripe login
```

#### 3. Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:8080/api/donations/webhook/stripe
```

This will output a webhook signing secret like:
```
whsec_123abc456def...
```

#### 4. Configure Backend

Add to `backend/.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_123abc456def...
```

#### 5. Restart Backend

```bash
./stop-servers.sh
./start-servers.sh
```

#### 6. Test

In another terminal:
```bash
./test-campaign-donation.sh
```

The Stripe CLI terminal will show webhook events being forwarded.

---

## Verifying It Works

### 1. Check Webhook Events

```bash
# Watch backend logs
tail -f /tmp/masjid-backend.log

# Make a test donation
./test-campaign-donation.sh

# You should see:
# - "Received Stripe webhook event: payment_intent.succeeded"
# - "✅ Successfully updated campaign X current amount: Y → Z"
```

### 2. Check Campaign Total

```bash
# Before donation
curl -s http://localhost:8080/api/campaigns/active | jq '.[0].currentAmount'

# Make donation, complete payment

# After donation
curl -s http://localhost:8080/api/campaigns/active | jq '.[0].currentAmount'
# Should be increased by donation amount
```

### 3. Check Database

```bash
psql -U masjid_user -d masjid_db -c "
  SELECT 
    c.title_en, 
    c.current_amount, 
    COUNT(d.id) as donation_count,
    SUM(d.amount) as total_donated
  FROM fundraising_campaigns c
  LEFT JOIN donations d ON d.campaign_id = c.id AND d.payment_status = 'COMPLETED'
  GROUP BY c.id;
"
```

---

## Troubleshooting

### Webhook Secret Not Configured

**Error in logs:**
```
Webhook secret not configured! Set STRIPE_WEBHOOK_SECRET in application.yml
```

**Fix:**
- Follow setup instructions above
- Make sure `backend/.env` has `STRIPE_WEBHOOK_SECRET=whsec_...`
- Restart backend

### Webhooks Not Being Received

**Symptoms:**
- Donations created but campaigns don't update
- No "Received Stripe webhook event" in logs

**Check:**

1. **Is webhook endpoint reachable?**
   ```bash
   curl -X POST http://localhost:8080/api/donations/webhook/stripe \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

2. **Production: Is your server publicly accessible?**
   - Stripe can't reach `localhost`
   - Must use a public domain or ngrok

3. **Using Stripe CLI?**
   ```bash
   stripe listen --forward-to localhost:8080/api/donations/webhook/stripe
   ```

### Campaign Total Not Updating

**Check logs for:**
```bash
tail -f /tmp/masjid-backend.log | grep -i "campaign"
```

**Should see:**
```
✅ Successfully updated campaign 1 current amount: 100 → 150 (added 50)
```

**If you see:**
```
❌ Campaign 2 not found for donation 5
```

Then the campaign was deleted or the campaign_id is wrong.

---

## Testing Without Real Payments

Use Stripe test mode with test cards:

| Card Number         | Scenario           |
|--------------------|--------------------|
| 4242 4242 4242 4242 | Success           |
| 4000 0000 0000 9995 | Declined          |
| 4000 0025 0000 3155 | Requires 3D Secure |

Any future expiry date, any 3-digit CVC.

---

## Production Checklist

- [ ] Stripe account in **live mode** (not test mode)
- [ ] Webhook endpoint created at Stripe Dashboard
- [ ] Webhook secret added to `backend/.env`
- [ ] Backend restarted after adding secret
- [ ] Server is publicly accessible (not localhost)
- [ ] SSL/HTTPS enabled on your domain
- [ ] Test donation completed successfully
- [ ] Campaign total updated in database
- [ ] Thank you email received

---

## Quick Commands

```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:8080/api/donations/webhook/stripe

# Test campaign donation
./test-campaign-donation.sh

# Watch logs for webhook events
tail -f /tmp/masjid-backend.log | grep -E "(webhook|campaign|payment_intent)"

# Check campaign totals
curl -s http://localhost:8080/api/campaigns/active | jq '.[] | {id, titleEn, currentAmount, goalAmount}'

# Check recent donations
curl -s http://localhost:8080/api/admin/donations | jq '.[] | {id, amount, campaignId, paymentStatus}'
```
