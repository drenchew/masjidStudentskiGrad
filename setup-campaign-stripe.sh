#!/bin/bash

# Campaign Stripe Integration Setup Script
echo "🚀 Setting up Campaign Stripe Integration..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: frontend directory not found${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing frontend dependencies...${NC}"
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

echo -e "${BLUE}🗄️  Step 2: Running database migrations...${NC}"
PGPASSWORD=masjid123 psql -U postgres -d masjid_db -f backend/add-campaign-donations.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Database migrations may have already been applied${NC}"
fi

echo -e "${BLUE}🔑 Step 3: Checking Stripe configuration...${NC}"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cat > backend/.env << EOF
DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=masjid123

STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

FRONTEND_URL=http://localhost:5173

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
EOF
    echo -e "${GREEN}✅ Created backend/.env template${NC}"
else
    echo -e "${GREEN}✅ backend/.env file exists${NC}"
fi

# Check if frontend .env file exists
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  No frontend .env file found. Creating from template...${NC}"
    cat > frontend/.env << EOF
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
VITE_API_URL=http://localhost:8080
EOF
    echo -e "${GREEN}✅ Created frontend/.env template${NC}"
else
    echo -e "${GREEN}✅ frontend/.env file exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Get your Stripe API keys:"
echo "   - Go to https://dashboard.stripe.com/test/apikeys"
echo "   - Copy your Publishable Key (starts with pk_test_)"
echo "   - Copy your Secret Key (starts with sk_test_)"
echo ""
echo "2. Update backend/.env:"
echo "   - Set STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY"
echo ""
echo "3. Update frontend/.env:"
echo "   - Set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY"
echo ""
echo "4. (Optional) Set up Stripe Webhook:"
echo "   - Run: stripe listen --forward-to localhost:8080/api/donations/webhook/stripe"
echo "   - Copy the webhook secret and update backend/.env"
echo ""
echo "5. Start the servers:"
echo "   ./start-servers.sh"
echo ""
echo -e "${BLUE}📚 For more information, see CAMPAIGN_STRIPE_INTEGRATION.md${NC}"
