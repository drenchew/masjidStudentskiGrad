#!/bin/bash

echo "======================================"
echo "Email Sending Diagnostic Tool"
echo "======================================"
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:8080/api/announcements > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Run: ./start-servers.sh"
    exit 1
fi
echo ""

# Check Brevo API Key
echo "2. Checking Brevo API Key configuration..."
if grep -q "BREVO_API_KEY=" backend/.env && [ -n "$(grep BREVO_API_KEY= backend/.env | cut -d= -f2)" ]; then
    echo "   ✅ Brevo API Key is configured"
    echo "   Key: $(grep BREVO_API_KEY= backend/.env | cut -d= -f2 | cut -c1-20)..."
else
    echo "   ❌ Brevo API Key NOT found in backend/.env"
    echo "   Add: BREVO_API_KEY=your_key_here"
    exit 1
fi
echo ""

# Check Email FROM address
echo "3. Checking Email FROM address..."
if grep -q "EMAIL_FROM=" backend/.env; then
    EMAIL_FROM=$(grep EMAIL_FROM= backend/.env | cut -d= -f2)
    echo "   ✅ Email FROM: $EMAIL_FROM"
else
    echo "   ⚠️  EMAIL_FROM not configured (will use default)"
fi
echo ""

# Check backend logs for email sends
echo "4. Checking recent email activity in logs..."
if [ -f /tmp/masjid-backend.log ]; then
    echo "   Recent email log entries:"
    grep -i "email\|brevo\|smtp" /tmp/masjid-backend.log | tail -5 | sed 's/^/   /'
else
    echo "   ⚠️  Backend log file not found"
fi
echo ""

# Test email subscription
echo "5. Testing email subscription..."
TEST_EMAIL="test-$(date +%s)@example.com"
echo "   Subscribing: $TEST_EMAIL"

RESPONSE=$(curl -s -X POST http://localhost:8080/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"language\":\"EN\"}")

echo "   Response: $RESPONSE"
echo ""

# Wait and check logs
echo "6. Checking if email was sent (checking logs in 2 seconds)..."
sleep 2

if grep -q "$TEST_EMAIL.*sent.*Brevo" /tmp/masjid-backend.log 2>/dev/null; then
    echo "   ✅ Email was sent successfully via Brevo API"
elif grep -q "$TEST_EMAIL.*sent.*SMTP" /tmp/masjid-backend.log 2>/dev/null; then
    echo "   ✅ Email was sent successfully via SMTP"
elif grep -q "$TEST_EMAIL.*failed\|error" /tmp/masjid-backend.log 2>/dev/null; then
    echo "   ❌ Email sending FAILED - check logs:"
    grep "$TEST_EMAIL" /tmp/masjid-backend.log | tail -3 | sed 's/^/   /'
else
    echo "   ⚠️  Cannot confirm email send status"
fi
echo ""

echo "======================================"
echo "Common Issues & Solutions:"
echo "======================================"
echo ""
echo "If email was sent but not received:"
echo "  1. ✉️  Check your SPAM/JUNK folder"
echo "  2. 🔍 Check Brevo dashboard: https://app.brevo.com/email"
echo "  3. ✅ Verify sender email in Brevo"
echo "  4. ⏰ Wait 5-10 minutes (emails can be delayed)"
echo "  5. 📧 Add $EMAIL_FROM to your contacts"
echo ""
echo "If email sending failed:"
echo "  1. 🔑 Check Brevo API key is valid"
echo "  2. 💳 Check Brevo account isn't suspended"
echo "  3. 📊 Check daily email limit (300/day on free tier)"
echo "  4. 🔗 Visit: https://app.brevo.com/settings/keys/api"
echo ""
echo "Backend logs: tail -f /tmp/masjid-backend.log"
echo "======================================"
