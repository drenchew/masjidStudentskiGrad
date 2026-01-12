#!/bin/bash

# View Donation Logs - Shows what people donated for (Campaign, Zakat, General, etc.)
echo "📊 Donation History with Purpose"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Install PostgreSQL client tools."
    exit 1
fi

# Database connection details (from backend/.env or default)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-masjid_db}"
DB_USER="${DB_USER:-masjid_user}"
DB_PASSWORD="${DB_PASSWORD:-masjid_pass}"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Option 1: Summary by Purpose
echo -e "${BLUE}📋 Summary by Purpose:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT 
    purpose,
    COUNT(*) as donation_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    SUM(CASE WHEN payment_status = 'COMPLETED' THEN amount ELSE 0 END) as completed_amount,
    COUNT(CASE WHEN payment_status = 'COMPLETED' THEN 1 END) as completed_count,
    COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN payment_status = 'FAILED' THEN 1 END) as failed_count
  FROM donations
  GROUP BY purpose
  ORDER BY total_amount DESC;
" 2>/dev/null

echo ""
echo -e "${BLUE}💰 Campaign-Specific Donations:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT 
    fc.title_en as campaign_name,
    COUNT(d.id) as donations,
    SUM(d.amount) as total_raised,
    fc.current_amount,
    fc.goal_amount,
    ROUND((fc.current_amount / fc.goal_amount * 100)::numeric, 1) as progress_pct
  FROM fundraising_campaigns fc
  LEFT JOIN donations d ON d.campaign_id = fc.id AND d.payment_status = 'COMPLETED'
  WHERE fc.active = true
  GROUP BY fc.id, fc.title_en, fc.current_amount, fc.goal_amount
  ORDER BY total_raised DESC;
" 2>/dev/null

echo ""
echo -e "${BLUE}📜 Recent Donations (Last 20):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT 
    d.id,
    d.donor_name,
    d.donor_email,
    d.amount || ' ' || d.currency as amount,
    d.purpose,
    COALESCE(fc.title_en, '-') as campaign_name,
    d.payment_status,
    d.type as donation_type,
    TO_CHAR(d.created_at, 'YYYY-MM-DD HH24:MI') as donated_at
  FROM donations d
  LEFT JOIN fundraising_campaigns fc ON d.campaign_id = fc.id
  ORDER BY d.created_at DESC
  LIMIT 20;
" 2>/dev/null

echo ""
echo -e "${BLUE}📅 Donations by Date (Last 7 days):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT 
    DATE(created_at) as donation_date,
    purpose,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    COUNT(CASE WHEN payment_status = 'COMPLETED' THEN 1 END) as completed
  FROM donations
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at), purpose
  ORDER BY donation_date DESC, total_amount DESC;
" 2>/dev/null

echo ""
echo -e "${YELLOW}💡 Tip: You can also query specific donation details:${NC}"
echo ""
echo "  # View all Zakat donations:"
echo "  psql -U $DB_USER -d $DB_NAME -c \"SELECT * FROM donations WHERE purpose = 'ZAKAT';\""
echo ""
echo "  # View donations for a specific campaign:"
echo "  psql -U $DB_USER -d $DB_NAME -c \"SELECT * FROM donations WHERE campaign_id = 1;\""
echo ""
echo "  # View only completed donations:"
echo "  psql -U $DB_USER -d $DB_NAME -c \"SELECT * FROM donations WHERE payment_status = 'COMPLETED';\""
echo ""
echo "  # View donations with messages:"
echo "  psql -U $DB_USER -d $DB_NAME -c \"SELECT donor_name, amount, message FROM donations WHERE message IS NOT NULL;\""
echo ""
