#!/bin/bash

# Simulate Stripe Webhook - Mark Donation as Completed
# Usage: ./simulate-payment-webhook.sh <donation_id>

if [ -z "$1" ]; then
    echo "Usage: ./simulate-payment-webhook.sh <donation_id>"
    echo ""
    echo "Example: ./simulate-payment-webhook.sh 5"
    echo ""
    echo "Available PENDING donations:"
    PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -t -c "
        SELECT '  ID: ' || id || ' - ' || donor_name || ' - €' || amount || ' - ' || purpose 
        FROM donations 
        WHERE payment_status = 'PENDING' 
        ORDER BY created_at DESC 
        LIMIT 10;
    "
    exit 1
fi

DONATION_ID=$1

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Simulating successful payment for donation #$DONATION_ID..."
echo ""

# Get donation details
DONATION_INFO=$(PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -t -c "
    SELECT 
        d.id,
        d.donor_name,
        d.amount,
        d.campaign_id,
        d.payment_status,
        COALESCE(fc.title_en, 'N/A') as campaign_title
    FROM donations d
    LEFT JOIN fundraising_campaigns fc ON d.campaign_id = fc.id
    WHERE d.id = $DONATION_ID;
" | tr -s ' ' | sed 's/^ //')

if [ -z "$DONATION_INFO" ]; then
    echo -e "${RED}❌ Donation #$DONATION_ID not found${NC}"
    exit 1
fi

echo "Donation details:"
echo "$DONATION_INFO"
echo ""

# Update donation to COMPLETED
PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -c "
    UPDATE donations 
    SET payment_status = 'COMPLETED', 
        active = true 
    WHERE id = $DONATION_ID
    RETURNING id, donor_name, amount, payment_status;
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Donation #$DONATION_ID marked as COMPLETED${NC}"
else
    echo -e "${RED}❌ Failed to update donation${NC}"
    exit 1
fi

# Check if this is a campaign donation and get campaign info
CAMPAIGN_INFO=$(PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -t -c "
    SELECT campaign_id, amount 
    FROM donations 
    WHERE id = $DONATION_ID AND campaign_id IS NOT NULL;
" | tr -s ' ')

if [ ! -z "$CAMPAIGN_INFO" ]; then
    CAMPAIGN_ID=$(echo "$CAMPAIGN_INFO" | awk '{print $1}')
    AMOUNT=$(echo "$CAMPAIGN_INFO" | awk '{print $2}')
    
    echo ""
    echo "📊 This is a campaign donation. Campaign #$CAMPAIGN_ID should already have optimistic update."
    
    # Show current campaign total
    PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -c "
        SELECT 
            id,
            title_en as campaign,
            current_amount,
            goal_amount,
            ROUND((current_amount / goal_amount * 100)::numeric, 1) as progress_pct
        FROM fundraising_campaigns 
        WHERE id = $CAMPAIGN_ID;
    "
fi

echo ""
echo -e "${GREEN}✅ Payment simulation complete!${NC}"
echo ""
echo "📝 To verify:"
echo "  - Check admin donations page: http://localhost:3000/admin/donations"
echo "  - Or query: PGPASSWORD=masjid123 psql -h localhost -U masjid_user -d masjid_db -c \"SELECT * FROM donations WHERE id = $DONATION_ID;\""
