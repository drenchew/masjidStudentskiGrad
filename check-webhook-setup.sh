#!/bin/bash

# Check Stripe Webhook Configuration
echo "🔍 Checking Stripe Webhook Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES=0

# Check 1: Backend .env file exists
echo -n "1. Backend .env file... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    echo "   Run: cp backend/.env.example backend/.env"
    ISSUES=$((ISSUES + 1))
fi

# Check 2: Stripe API key configured
echo -n "2. Stripe API key... "
if [ -f "backend/.env" ] && grep -q "STRIPE_API_KEY=sk_" backend/.env 2>/dev/null; then
    STRIPE_KEY=$(grep "STRIPE_API_KEY=" backend/.env | cut -d'=' -f2)
    if [[ $STRIPE_KEY == sk_test_* ]]; then
        echo -e "${YELLOW}⚠ Test mode${NC} (sk_test_...)"
    elif [[ $STRIPE_KEY == sk_live_* ]]; then
        echo -e "${GREEN}✓ Live mode${NC} (sk_live_...)"
    else
        echo -e "${RED}✗ Invalid format${NC}"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}✗ Not configured${NC}"
    echo "   Add: STRIPE_API_KEY=sk_test_... or sk_live_..."
    ISSUES=$((ISSUES + 1))
fi

# Check 3: Webhook secret configured
echo -n "3. Webhook secret... "
if [ -f "backend/.env" ] && grep -q "STRIPE_WEBHOOK_SECRET=whsec_" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✓ Configured${NC}"
    WEBHOOK_SECRET=$(grep "STRIPE_WEBHOOK_SECRET=" backend/.env | cut -d'=' -f2 | cut -c1-20)
    echo "   Secret: ${WEBHOOK_SECRET}..."
else
    echo -e "${RED}✗ Not configured${NC}"
    echo ""
    echo "   ${YELLOW}⚠ Webhooks are REQUIRED for campaign donations to update!${NC}"
    echo ""
    echo "   To fix:"
    echo "   A) For local dev:"
    echo "      1. Install Stripe CLI: brew install stripe/stripe-cli/stripe"
    echo "      2. Run: stripe listen --forward-to localhost:8080/api/donations/webhook/stripe"
    echo "      3. Copy the webhook secret (whsec_...)"
    echo "      4. Add to backend/.env: STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    echo "   B) For production:"
    echo "      1. Go to: https://dashboard.stripe.com/webhooks"
    echo "      2. Add endpoint: https://yourdomain.com/api/donations/webhook/stripe"
    echo "      3. Select events: payment_intent.succeeded, payment_intent.payment_failed"
    echo "      4. Copy the signing secret"
    echo "      5. Add to backend/.env: STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    ISSUES=$((ISSUES + 1))
fi

# Check 4: Backend running
echo -n "4. Backend server... "
if curl -s http://localhost:8080/api/campaigns/active > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "   Run: ./start-servers.sh"
    ISSUES=$((ISSUES + 1))
fi

# Check 5: Webhook endpoint accessible
echo -n "5. Webhook endpoint... "
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/donations/webhook/stripe \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}' 2>/dev/null)

if [ "$WEBHOOK_RESPONSE" = "200" ] || [ "$WEBHOOK_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✓ Reachable${NC} (HTTP $WEBHOOK_RESPONSE)"
else
    echo -e "${RED}✗ Not reachable${NC} (HTTP $WEBHOOK_RESPONSE)"
    ISSUES=$((ISSUES + 1))
fi

# Check 6: Recent logs
echo -n "6. Recent webhook events... "
if [ -f "/tmp/masjid-backend.log" ]; then
    WEBHOOK_COUNT=$(grep "Received Stripe webhook event" /tmp/masjid-backend.log 2>/dev/null | wc -l)
    if [ "$WEBHOOK_COUNT" -gt 0 ] 2>/dev/null; then
        echo -e "${GREEN}✓ Found $WEBHOOK_COUNT events${NC}"
        echo ""
        echo "   Recent events:"
        grep "Received Stripe webhook event" /tmp/masjid-backend.log | tail -n 3 | while read line; do
            echo "   - $line"
        done
    else
        echo -e "${YELLOW}⚠ No events yet${NC}"
        echo "   (This is normal if no donations have been made)"
    fi
else
    echo -e "${YELLOW}⚠ No log file${NC}"
fi

# Check 7: Campaign updates in logs
echo -n "7. Campaign update logs... "
if [ -f "/tmp/masjid-backend.log" ]; then
    UPDATE_COUNT=$(grep "Successfully updated campaign" /tmp/masjid-backend.log 2>/dev/null | wc -l)
    if [ "$UPDATE_COUNT" -gt 0 ] 2>/dev/null; then
        echo -e "${GREEN}✓ Found $UPDATE_COUNT updates${NC}"
        echo ""
        echo "   Recent updates:"
        grep "Successfully updated campaign" /tmp/masjid-backend.log | tail -n 3 | while read line; do
            echo "   - $line"
        done
    else
        echo -e "${YELLOW}⚠ No updates yet${NC}"
        echo "   (Check after making a test donation)"
    fi
else
    echo -e "${YELLOW}⚠ No log file${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your webhook setup looks good. Test it with:"
    echo "  ./test-campaign-donation.sh"
else
    echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please fix the issues above, then:"
    echo "  1. Restart backend: ./stop-servers.sh && ./start-servers.sh"
    echo "  2. Run this check again: ./check-webhook-setup.sh"
    echo "  3. Test donation: ./test-campaign-donation.sh"
fi

echo ""
echo "📖 For detailed setup instructions:"
echo "   cat STRIPE_WEBHOOK_SETUP.md"
echo ""
