#!/bin/bash

# Setup Stripe Webhooks for Campaign Donations
echo "🔧 Setting up Stripe Webhooks..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env not found${NC}"
    echo "Creating from template..."
    cp backend/.env.example backend/.env
fi

# Check if Stripe CLI is installed
echo -n "Checking for Stripe CLI... "
if command -v stripe &> /dev/null; then
    echo -e "${GREEN}✓ Found${NC}"
    USE_STRIPE_CLI=true
else
    echo -e "${YELLOW}✗ Not installed${NC}"
    USE_STRIPE_CLI=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$USE_STRIPE_CLI" = true ]; then
    echo -e "${GREEN}Option 1: Use Stripe CLI (Recommended for Local Dev)${NC}"
    echo ""
    echo "I'll start the Stripe CLI to forward webhooks to your local backend."
    echo "This is the easiest way to test campaign donations locally."
    echo ""
    read -p "Do you want to use Stripe CLI? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Starting Stripe webhook forwarding..."
        echo -e "${YELLOW}⚠ This will run in the foreground. Open a new terminal for testing.${NC}"
        echo ""
        echo "Once running, you'll see a webhook secret (whsec_...)."
        echo "Copy it and add to backend/.env as:"
        echo "  STRIPE_WEBHOOK_SECRET=whsec_..."
        echo ""
        echo "Then restart your backend in another terminal:"
        echo "  ./stop-servers.sh && ./start-servers.sh"
        echo ""
        read -p "Press Enter to start Stripe CLI..."
        
        # Check if user is logged in
        if ! stripe config --list &> /dev/null; then
            echo ""
            echo "You need to login to Stripe first:"
            stripe login
        fi
        
        echo ""
        echo -e "${GREEN}Starting webhook forwarding...${NC}"
        echo ""
        stripe listen --forward-to localhost:8080/api/donations/webhook/stripe
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}Option 2: Manual Setup${NC}"
echo ""
echo "For local development without Stripe CLI:"
echo ""
echo "1. Install Stripe CLI:"
echo "   macOS: brew install stripe/stripe-cli/stripe"
echo "   Linux: wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz"
echo ""
echo "2. Run this script again"
echo ""
echo "For production deployment:"
echo ""
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter URL: https://yourdomain.com/api/donations/webhook/stripe"
echo "4. Select events:"
echo "   - payment_intent.succeeded"
echo "   - payment_intent.payment_failed"
echo "5. Copy the signing secret (whsec_...)"
echo "6. Add to backend/.env on your server:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo "7. Restart backend"
echo ""
echo "For detailed instructions, see:"
echo "  cat STRIPE_WEBHOOK_SETUP.md"
echo ""
