#!/bin/bash

# Masjid Studentski Grad Backend Setup Script

echo "=== Masjid Backend Setup ==="
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  Fedora/RHEL: sudo dnf install postgresql-server postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database
echo "2. Creating database..."
sudo -u postgres psql -c "CREATE DATABASE masjid_db;" 2>/dev/null || echo "Database might already exist"
echo "✅ Database ready"
echo ""

# Create .env file
echo "3. Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  .env file created. Please edit it with your credentials:"
    echo "   - DATABASE_PASSWORD"
    echo "   - MAIL_USERNAME and MAIL_PASSWORD (Brevo/SendGrid)"
    echo "   - STRIPE_API_KEY"
    echo ""
fi

# Check if Maven is installed
echo "4. Checking Maven..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed!"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt install maven"
    echo "  Fedora/RHEL: sudo dnf install maven"
    exit 1
fi
echo "✅ Maven is installed"
echo ""

# Build the project
echo "5. Building the project..."
mvn clean install -DskipTests
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your credentials"
echo "2. Run: cd backend && mvn spring-boot:run"
echo "3. Backend will be available at http://localhost:8080"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123 (change this after first login!)"
echo ""
