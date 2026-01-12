#!/usr/bin/env bash

# Script to set database password for local development

echo "🔐 Setting Database Password"
echo "=============================="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Prompt for password
read -sp "Enter your PostgreSQL password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password cannot be empty"
    exit 1
fi

# Create or update .env file
cat > .env << EOF
# Local development environment variables
# DO NOT COMMIT THIS FILE TO GIT!

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=MasjidStudentskiGradSecretKeyForJWTTokenGeneration2026

# Mail (optional for local dev)
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=

# Stripe (optional for local dev)
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Server
PORT=8080
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "⚠️  IMPORTANT: The .env file contains your password."
echo "    Make sure it's in .gitignore (already configured)"
echo ""
echo "To use these variables, source the file before running:"
echo "    export \$(cat .env | grep -v '^#' | xargs)"
echo ""
