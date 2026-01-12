#!/bin/bash

echo "=========================================="
echo "🔍 Checking Announcement Email Status"
echo "=========================================="
echo ""

# Check if servers are running
if ! curl -s http://localhost:8080/api/announcements > /dev/null 2>&1; then
    echo "❌ Backend is not running!"
    echo "Run: ./start-servers.sh"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Check database for subscribers
echo "📊 Checking subscribers in database..."
echo "=========================================="
PGPASSWORD=masjid123 psql -U postgres -d masjid_db -t -c "
SELECT 
    email || ' | Verified: ' || verified || ' | Active: ' || active || ' | Language: ' || preferred_language
FROM subscribers
ORDER BY subscribed_at DESC;
" 2>/dev/null || echo "⚠️  Could not connect to database"
echo ""

# Check backend logs for recent email activity
echo "📧 Recent Email Activity (last 10 entries):"
echo "=========================================="
grep -i "email.*sent\|announcement" /tmp/masjid-backend.log 2>/dev/null | tail -10 | while read line; do
    echo "  $line"
done
echo ""

# Check Brevo configuration
echo "🔑 Email Configuration:"
echo "=========================================="
if [ -f backend/.env ]; then
    echo "  From Email: $(grep EMAIL_FROM backend/.env | cut -d= -f2)"
    echo "  Brevo API Key: $(grep BREVO_API_KEY backend/.env | cut -d= -f2 | cut -c1-20)..."
    echo "  Mail Host: $(grep MAIL_HOST backend/.env | cut -d= -f2)"
else
    echo "  ⚠️  backend/.env not found"
fi
echo ""

echo "=========================================="
echo "💡 Troubleshooting Tips:"
echo "=========================================="
echo ""
echo "If logs show 'Announcement sent to X subscribers':"
echo "  ✅ Email WAS sent to Brevo successfully"
echo "  📬 Check your SPAM/JUNK folder!"
echo "  📁 Check Gmail Promotions tab"
echo "  🔍 Search Gmail for: from:spiritgameplay11@gmail.com"
echo ""
echo "To send a test announcement:"
echo "  1. Go to: http://localhost:5173/admin/login"
echo "  2. Navigate to: Announcements Management"
echo "  3. Click: 'Send to Subscribers'"
echo "  4. Fill in subject and content"
echo "  5. Click 'Send Email'"
echo "  6. Watch logs: tail -f /tmp/masjid-backend.log"
echo ""
echo "Check Brevo Dashboard:"
echo "  🌐 https://app.brevo.com/email/transactional"
echo "  Look for recent sends and delivery status"
echo ""
echo "=========================================="
