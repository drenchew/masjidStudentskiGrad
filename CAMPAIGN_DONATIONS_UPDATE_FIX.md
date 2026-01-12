# Campaign Donations Not Updating - Root Cause & Solution

## 🔴 Problem

Campaign donation totals are **not updating** when users complete payments. The `currentAmount` field stays at 0 even after successful donations.

## 🔍 Root Cause

**Campaign totals only update via Stripe webhooks**, not immediately when the donation is created.

### How It Works (The Flow):

```
1. User clicks "Donate" → Frontend calls: POST /api/donations/campaign/{id}
   ↓
2. Backend creates donation record (status: PENDING)
   ↓
3. Backend creates Stripe Payment Intent
   ↓
4. Frontend shows Stripe payment form
   ↓
5. User enters card details and submits
   ↓
6. Stripe processes payment
   ↓
7. 🚨 CRITICAL: Stripe sends webhook to backend ← THIS IS MISSING
   ↓
8. Backend receives webhook event: payment_intent.succeeded
   ↓
9. Backend updates donation (status: PENDING → COMPLETED)
   ↓
10. Backend updates campaign.currentAmount += donation.amount ✅
```

**The problem:** Step 7 never happens because Stripe webhook is not configured.

## ✅ Solution: Configure Stripe Webhooks

You have **two options** depending on your environment:

### Option A: Local Development (Stripe CLI)

**Best for:** Testing on localhost without exposing your server

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. **Login:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to localhost:8080/api/donations/webhook/stripe
   ```
   
   This outputs something like:
   ```
   > Ready! Your webhook signing secret is whsec_abc123xyz...
   ```

4. **Copy the webhook secret and add to `backend/.env`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
   ```

5. **Restart backend:**
   ```bash
   ./stop-servers.sh
   ./start-servers.sh
   ```

6. **Leave the `stripe listen` terminal running** while testing donations

### Option B: Production (Stripe Dashboard)

**Best for:** Deployed application on a public server

1. **Go to Stripe Dashboard:**
   - Test mode: https://dashboard.stripe.com/test/webhooks
   - Live mode: https://dashboard.stripe.com/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL:**
   ```
   https://yourdomain.com/api/donations/webhook/stripe
   ```
   
   ⚠️ Must be publicly accessible (not localhost)
   
   ✅ Must use HTTPS in production

4. **Select events to listen for:**
   - `payment_intent.succeeded` ✅
   - `payment_intent.payment_failed` ✅

5. **Click "Add endpoint"**

6. **Copy the "Signing secret"** (starts with `whsec_...`)

7. **Add to `backend/.env` on your server:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

8. **Restart backend:**
   ```bash
   ./stop-servers.sh
   ./start-servers.sh
   ```

## 🧪 Testing

### 1. Check Configuration

```bash
./check-webhook-setup.sh
```

Should show:
```
✓ Webhook secret... Configured
```

### 2. Make a Test Donation

```bash
./test-campaign-donation.sh
```

Or use the frontend:
1. Go to http://localhost:3000/donate
2. Click "Donate to this Campaign"
3. Enter amount: 50
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC
6. Click "Donate"

### 3. Watch the Logs

```bash
tail -f /tmp/masjid-backend.log | grep -E "(webhook|campaign|payment_intent)"
```

**You should see:**
```
Received Stripe webhook event: payment_intent.succeeded
Processing payment_intent.succeeded for PaymentIntent: pi_xxx
Found donation ID: 5, campaignId: 1, amount: 50
Donation 5 marked as COMPLETED
✅ Successfully updated campaign 1 current amount: 100 → 150 (added 50)
```

### 4. Verify Campaign Total

```bash
curl -s http://localhost:8080/api/campaigns/active | jq '.[] | {id, titleEn, currentAmount, goalAmount}'
```

Should show updated `currentAmount`.

## 📊 Production Code Changes Made

I've improved the webhook handling to be **production-ready**:

### 1. Enhanced Webhook Security (`DonationService.java`)

```java
@Transactional
public void handleStripeWebhook(String payload, String sigHeader) throws SignatureVerificationException {
    if (webhookSecret == null || webhookSecret.isEmpty()) {
        log.error("Webhook secret not configured! Set STRIPE_WEBHOOK_SECRET in application.yml");
        throw new RuntimeException("Webhook secret must be configured for production");
    }
    
    Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    // ... process event
}
```

**Why:** Ensures webhooks are always verified with signature in production. Prevents malicious requests from updating campaigns.

### 2. Better Logging & Error Handling

```java
private void handlePaymentIntentSucceeded(Event event) {
    // ... find donation
    
    if (matchingDonations.isEmpty()) {
        log.error("No donation found for PaymentIntent: {}", paymentIntentId);
        return;
    }
    
    matchingDonations.forEach(donation -> {
        log.info("Found donation ID: {}, campaignId: {}, amount: {}", 
                donation.getId(), donation.getCampaignId(), donation.getAmount());
        
        // ... update donation
        
        if (donation.getCampaignId() != null) {
            campaignRepository.findById(donation.getCampaignId())
                .ifPresentOrElse(campaign -> {
                    BigDecimal oldAmount = campaign.getCurrentAmount();
                    BigDecimal newAmount = oldAmount.add(donation.getAmount());
                    campaign.setCurrentAmount(newAmount);
                    campaignRepository.save(campaign);
                    log.info("✅ Successfully updated campaign {} current amount: {} → {} (added {})", 
                            campaign.getId(), oldAmount, newAmount, donation.getAmount());
                }, () -> {
                    log.error("❌ Campaign {} not found for donation {}", 
                            donation.getCampaignId(), donation.getId());
                });
        }
    });
}
```

**Why:** Detailed logging helps diagnose issues. Clear success/error messages make debugging easier.

### 3. Helper Scripts

- **`check-webhook-setup.sh`** - Diagnose webhook configuration issues
- **`STRIPE_WEBHOOK_SETUP.md`** - Complete setup guide

## 🔧 Quick Fix Commands

```bash
# 1. Check current status
./check-webhook-setup.sh

# 2. For local dev: Start webhook forwarding
stripe listen --forward-to localhost:8080/api/donations/webhook/stripe
# Copy the whsec_... secret

# 3. Add to backend/.env
echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret_here" >> backend/.env

# 4. Restart
./stop-servers.sh && ./start-servers.sh

# 5. Test
./test-campaign-donation.sh

# 6. Watch logs
tail -f /tmp/masjid-backend.log | grep "campaign"
```

## 📋 Production Checklist

Before deploying:

- [ ] Stripe webhook endpoint created at dashboard
- [ ] Webhook URL is publicly accessible (https://yourdomain.com/...)
- [ ] HTTPS enabled on domain
- [ ] `STRIPE_WEBHOOK_SECRET` added to backend environment
- [ ] Backend restarted after adding secret
- [ ] Test donation completed successfully
- [ ] Logs show "Successfully updated campaign"
- [ ] Campaign `currentAmount` increased in database
- [ ] Thank you email received by donor

## 🐛 Common Issues

### "Webhook secret not configured"
**Fix:** Add `STRIPE_WEBHOOK_SECRET=whsec_...` to `backend/.env` and restart

### Webhooks not received
**Fix:** 
- Local dev: Run `stripe listen --forward-to localhost:8080/api/donations/webhook/stripe`
- Production: Ensure webhook URL is publicly accessible via HTTPS

### Campaign not updating but webhook received
**Check logs for:**
- `"❌ Campaign X not found"` → Campaign was deleted
- `"No donation found for PaymentIntent"` → Donation wasn't saved properly

## 📚 Additional Resources

- **Stripe Webhook Testing:** https://stripe.com/docs/webhooks/test
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Our Setup Guide:** `cat STRIPE_WEBHOOK_SETUP.md`
