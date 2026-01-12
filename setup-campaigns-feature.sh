#!/bin/bash

# Setup script for Fundraising Campaigns feature

echo "=========================================="
echo "Setting up Fundraising Campaigns Feature"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   Try: sudo systemctl start postgresql"
    exit 1
fi

echo "✓ PostgreSQL is running"
echo ""

# Get database credentials
DB_NAME=${DB_NAME:-masjid_db}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Database Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if database exists
echo "Checking if database exists..."
export PGPASSWORD=${DB_PASSWORD}
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo ""
    echo "⚠️  Database '$DB_NAME' does not exist!"
    echo ""
    echo "Creating database..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully!"
    else
        echo "❌ Failed to create database. You may need to run:"
        echo "   sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME;\""
        exit 1
    fi
fi

echo "✓ Database exists"
echo ""

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo -n "Enter database password for $DB_USER: "
    read -s DB_PASSWORD
    echo ""
    echo ""
fi

export PGPASSWORD=$DB_PASSWORD

# Run the SQL script
echo "Creating fundraising_campaigns table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/create-campaigns-table.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fundraising campaigns table created successfully!"
    echo ""
    echo "Sample campaigns have been added to the database."
    echo "You can now:"
    echo "  1. Access the admin panel at /admin/campaigns"
    echo "  2. View campaigns on the donate page at /donate"
    echo ""
else
    echo ""
    echo "❌ Error creating campaigns table. Please check the error messages above."
    exit 1
fi

# Verify the table was created
echo "Verifying table creation..."
TABLE_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fundraising_campaigns');")

if [[ "$TABLE_EXISTS" == *"t"* ]]; then
    echo "✅ Table verification successful"
    
    # Count campaigns
    CAMPAIGN_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM fundraising_campaigns;")
    echo "📊 Total campaigns in database: $(echo $CAMPAIGN_COUNT | xargs)"
else
    echo "⚠️  Table verification failed"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Backend is already built ✅"
echo "  2. Start the servers: ./start-servers.sh"
echo "  3. Login to admin panel at http://localhost:5173/admin/login"
echo "  4. Navigate to 'Fundraising Campaigns' to manage campaigns"
echo "  5. View campaigns on the donate page at http://localhost:5173/donate"
echo ""
