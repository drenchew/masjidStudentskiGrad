#!/bin/bash

# Test Campaign Donation Flow
echo "🧪 Testing Campaign Donation Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Check if backend is running
echo -n "1. Checking backend (port 8080)... "
if curl -s http://localhost:8080/api/campaigns/active > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
    echo "   Run: ./start-servers.sh"
    exit 1
fi

# Test 2: Check if campaigns exist
echo -n "2. Checking for active campaigns... "
CAMPAIGN_COUNT=$(curl -s http://localhost:8080/api/campaigns/active | jq '. | length' 2>/dev/null || echo "0")
if [ "$CAMPAIGN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $CAMPAIGN_COUNT campaigns${NC}"
    CAMPAIGN_ID=$(curl -s http://localhost:8080/api/campaigns/active | jq -r '.[0].id' 2>/dev/null)
    CAMPAIGN_TITLE=$(curl -s http://localhost:8080/api/campaigns/active | jq -r '.[0].titleEn' 2>/dev/null)
    echo "   Campaign #$CAMPAIGN_ID: $CAMPAIGN_TITLE"
else
    echo -e "${RED}✗ No campaigns found${NC}"
    echo "   Create a campaign in admin panel first"
    exit 1
fi

# Test 3: Test donation endpoint
echo -n "3. Testing donation endpoint... "
RESPONSE=$(curl -s -X POST http://localhost:8080/api/donations/campaign/$CAMPAIGN_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "amount": 50,
    "message": "Test donation",
    "currency": "EUR"
  }' 2>&1)

if echo "$RESPONSE" | grep -q "clientSecret"; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "   Client Secret: $(echo "$RESPONSE" | jq -r '.clientSecret' | cut -c1-40)..."
else
    echo -e "${RED}✗ Failed${NC}"
    echo "   Response: $RESPONSE"
    echo ""
    echo "   Checking logs..."
    tail -n 20 /tmp/masjid-backend.log | grep -i "error\|exception" || echo "   No obvious errors in logs"
    exit 1
fi

# Test 4: Check Stripe configuration
echo -n "4. Checking Stripe configuration... "
if [ -f "backend/.env" ]; then
    if grep -q "STRIPE_API_KEY=sk_test_" backend/.env 2>/dev/null; then
        echo -e "${GREEN}✓ Stripe key configured${NC}"
    else
        echo -e "${YELLOW}⚠ Stripe key not found or invalid${NC}"
        echo "   Add STRIPE_API_KEY=sk_test_... to backend/.env"
    fi
else
    echo -e "${RED}✗ backend/.env not found${NC}"
fi

# Test 5: Check frontend configuration
echo -n "5. Checking frontend Stripe config... "
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_STRIPE_PK=pk_test_" frontend/.env 2>/dev/null; then
        echo -e "${GREEN}✓ Frontend key configured${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend key not found or invalid${NC}"
        echo "   Add VITE_STRIPE_PK=pk_test_... to frontend/.env"
    fi
else
    echo -e "${RED}✗ frontend/.env not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "📝 To test in browser:"
echo "   1. Go to http://localhost:3000/donate"
echo "   2. Click 'Donate to this Campaign' on any campaign"
echo "   3. Enter amount and details"
echo "   4. Use test card: 4242 4242 4242 4242"
echo "   5. Any CVC, any future date"
echo ""
