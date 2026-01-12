#!/bin/bash

# Production Cleanup Script
# This script removes development/debug files and organizes documentation

set -e

echo "🧹 Cleaning up project for production..."
echo "=========================================="
echo ""

# Create backup
echo "📦 Creating backup of files to be removed..."
mkdir -p .cleanup_backup
BACKUP_DIR=".cleanup_backup/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Function to move file to backup
backup_and_remove() {
    if [ -f "$1" ]; then
        echo "  Removing: $1"
        mv "$1" "$BACKUP_DIR/"
    fi
}

echo ""
echo "🗑️  Removing development/troubleshooting documentation..."

# Remove fix/troubleshooting documentation (keep in backup)
backup_and_remove "ADMIN_FEATURES_FIXED.md"
backup_and_remove "ANNOUNCEMENT_EMAIL_TROUBLESHOOTING.md"
backup_and_remove "CAMPAIGN_403_FIX.md"
backup_and_remove "CAMPAIGN_DONATIONS_UPDATE_FIX.md"
backup_and_remove "CAMPAIGN_DONATIONS_WORKING.md"
backup_and_remove "CAMPAIGNS_DATABASE_FIX.md"
backup_and_remove "CAMPAIGN_STRIPE_IMPLEMENTATION.md"
backup_and_remove "CAMPAIGN_STRIPE_INTEGRATION.md"
backup_and_remove "FIXES_SUMMARY.md"
backup_and_remove "NEWSLETTER_AND_ANNOUNCEMENTS_FIX.md"
backup_and_remove "OPTIMISTIC_CAMPAIGN_UPDATES.md"
backup_and_remove "STRIPE_WEBHOOK_SETUP.md"

# Remove duplicate/old documentation
backup_and_remove "DEPLOYMENT.md"  # We have DEPLOYMENT_GUIDE.md
backup_and_remove "README_FINAL.md"
backup_and_remove "CHECKLIST.md"  # We have PRE_PUSH_CHECKLIST.md
backup_and_remove "HOW_TO_RUN.md"  # Info is in README
backup_and_remove "QUICK_START.md"  # Info is in README
backup_and_remove "TLDR.md"

# Remove implementation details (keep in backup)
backup_and_remove "CAMPAIGNS_IMPLEMENTATION.md"
backup_and_remove "CAMPAIGNS_QUICK_START.md"
backup_and_remove "QUESTIONS_IMPLEMENTATION.md"
backup_and_remove "QUESTIONS_SETUP.md"
backup_and_remove "IMPLEMENTATION_SUMMARY.md"

echo ""
echo "🗑️  Removing development/testing scripts..."

# Remove development scripts
backup_and_remove "check-announcement-status.sh"
backup_and_remove "check-email.sh"
backup_and_remove "check-webhook-setup.sh"
backup_and_remove "fix-campaigns-permissions.sh"
backup_and_remove "reset_databases.sh"
backup_and_remove "set-db-password.sh"
backup_and_remove "setup-campaigns-feature.sh"
backup_and_remove "setup-campaign-stripe.sh"
backup_and_remove "setup-questions-feature.sh"
backup_and_remove "setup-stripe-webhooks.sh"
backup_and_remove "simulate-payment-webhook.sh"
backup_and_remove "start-servers.sh"
backup_and_remove "stop-servers.sh"
backup_and_remove "test-campaign-donation.sh"
backup_and_remove "test-email-verified.sh"
backup_and_remove "test-newsletter-fix.sh"
backup_and_remove "view-donation-logs.sh"

echo ""
echo "🗑️  Removing test/dummy data files..."

# Remove test data
backup_and_remove "backend/add-announcements-ramadan.sql"
backup_and_remove "backend/add-dummy-products.sql"
backup_and_remove "backend/add-campaign-donations.sql"

echo ""
echo "🗑️  Removing utility scripts (obsolete)..."

backup_and_remove "backend/generate_password.py"
backup_and_remove "backend/hash_password.py"
backup_and_remove "backend/fix-postgres.sh"
backup_and_remove "backend/setup.sh"

echo ""
echo "🗑️  Removing strange files..."

# Remove weird files
backup_and_remove "backend/Accept:"
backup_and_remove "backend/cd"
backup_and_remove "backend/Content-Length:"
backup_and_remove "backend/Content-Type:"
backup_and_remove "backend/Host:"
backup_and_remove "backend/POST"
backup_and_remove "backend/User-Agent:"

echo ""
echo "🗑️  Removing old documentation..."

backup_and_remove "backend/BACKEND_SETUP.md"

echo ""
echo "📝 Organizing remaining documentation..."

# Create docs directory
mkdir -p docs

# Move comprehensive guides to docs (if they exist)
[ -f "ARCHITECTURE.md" ] && mv "ARCHITECTURE.md" "docs/"
[ -f "API_ENDPOINTS.md" ] && mv "API_ENDPOINTS.md" "docs/"
[ -f "STRIPE_INTEGRATION_GUIDE.md" ] && mv "STRIPE_INTEGRATION_GUIDE.md" "docs/"
[ -f "FUNDRAISING_CAMPAIGNS.md" ] && mv "FUNDRAISING_CAMPAIGNS.md" "docs/"
[ -f "QUESTIONS_FEATURE.md" ] && mv "QUESTIONS_FEATURE.md" "docs/"
[ -f "PRODUCTION_DONATION_SYSTEM.md" ] && mv "PRODUCTION_DONATION_SYSTEM.md" "docs/"
[ -f "ADMIN_DONATIONS_VIEW.md" ] && mv "ADMIN_DONATIONS_VIEW.md" "docs/"

echo ""
echo "📄 Consolidating main documentation..."

# Use the GitHub-ready README
if [ -f "README_GITHUB.md" ]; then
    echo "  Using README_GITHUB.md as main README.md"
    mv "README.md" "$BACKUP_DIR/README_old.md" 2>/dev/null || true
    mv "README_GITHUB.md" "README.md"
fi

echo ""
echo "🧹 Cleaning build artifacts..."

# Clean backend build files
if [ -d "backend/target" ]; then
    echo "  Removing backend/target directory..."
    rm -rf "backend/target"
fi

# Clean frontend build files
if [ -d "frontend/dist" ]; then
    echo "  Removing frontend/dist directory..."
    rm -rf "frontend/dist"
fi

if [ -d "frontend/node_modules" ]; then
    echo "  ⚠️  frontend/node_modules exists (will be ignored by git)"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "==========="
echo ""
echo "Remaining files:"
echo "  - README.md (main documentation)"
echo "  - DEPLOYMENT_GUIDE.md (deployment instructions)"
echo "  - PRE_PUSH_CHECKLIST.md (pre-deployment checklist)"
echo "  - CONTRIBUTING.md (contribution guidelines)"
echo "  - LICENSE (MIT license)"
echo "  - setup.sh (initial setup script)"
echo "  - push-to-github.sh (GitHub push helper)"
echo "  - docker-compose.yml (Docker orchestration)"
echo "  - .gitignore (git ignore rules)"
echo ""
echo "Documentation moved to docs/:"
ls -1 docs/ 2>/dev/null | sed 's/^/  - /'
echo ""
echo "Backup location: $BACKUP_DIR"
echo "  (You can delete this after verifying everything works)"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Test the application locally"
echo "3. Commit: git add . && git commit -m 'Clean up for production'"
echo "4. Push to GitHub: ./push-to-github.sh"
echo ""
