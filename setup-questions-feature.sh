#!/bin/bash

# Questions Feature Setup Script

echo "=========================================="
echo "Anonymous Questions Feature Setup"
echo "=========================================="
echo ""

# Step 1: Create database table
echo "Step 1: Creating questions table in database..."
echo "Please run the following command with your database credentials:"
echo ""
echo "psql -U masjid_user -d masjid_db -f create-questions-table.sql"
echo ""
echo "Or if you need to use a different user:"
echo "psql -U your_db_user -d masjid_db -f create-questions-table.sql"
echo ""
read -p "Press Enter after you've created the table..."

# Step 2: Rebuild backend
echo ""
echo "Step 2: Rebuilding backend with new Question feature..."
cd backend
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✓ Backend built successfully!"
else
    echo "✗ Backend build failed. Please check for errors."
    exit 1
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "The anonymous questions feature is now ready to use."
echo ""
echo "To start the servers, run:"
echo "  ./start-servers.sh"
echo ""
echo "Then navigate to:"
echo "  - Public: http://localhost:5173/questions"
echo "  - Admin: http://localhost:5173/admin/questions"
echo ""
