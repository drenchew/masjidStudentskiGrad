#!/bin/bash

echo "🧪 Testing Newsletter with Verified Gmail Sender"
echo "=================================================="
echo ""

# Start servers in background
echo "Starting servers..."
cd /home/dre/proj/masjidStudentskiGrad
echo "masjidPassword123" | RUN_DB_MIGRATION=0 ./start-servers.sh > /dev/null 2>&1 &

echo "Waiting for backend to start (15 seconds)..."
sleep 15

# Test subscription
TEST_EMAIL="$1"
if [ -z "$TEST_EMAIL" ]; then
    echo "Usage: $0 <your-email-address>"
    echo "Example: $0 eenderalek@gmail.com"
    exit 1
fi

echo ""
echo "📧 Testing subscription for: $TEST_EMAIL"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8080/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"language\":\"EN\"}")

echo "Response: $RESPONSE"
echo ""

# Check logs
echo "Checking backend logs..."
sleep 2

if grep -q "$TEST_EMAIL.*sent.*Brevo" /tmp/masjid-backend.log 2>/dev/null; then
    echo "✅ Email sent via Brevo API!"
    echo ""
    echo "Sender details:"
    grep -i "email.from\|spiritgameplay" backend/.env | head -2
    echo ""
    echo "📬 Check your inbox:"
    echo "   From: spiritgameplay11@gmail.com"
    echo "   Subject: Confirm Your Subscription - Masjid Studentski Grad"
    echo ""
    echo "If not in inbox, check SPAM folder."
else
    echo "⚠️  Email status unclear. Check logs:"
    tail -10 /tmp/masjid-backend.log | grep -i email
fi

echo ""
echo "Full backend logs: tail -f /tmp/masjid-backend.log"
