#!/bin/bash

# Quick Setup Script for Masjid Studentski Grad
# This script helps you set up the project quickly for development

set -e

echo "🕌 Masjid Studentski Grad - Quick Setup"
echo "========================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install JDK 17 or higher."
    exit 1
fi
echo "✅ Java found: $(java -version 2>&1 | head -n 1)"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven 3.8 or higher."
    exit 1
fi
echo "✅ Maven found: $(mvn -version | head -n 1)"

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20 or higher."
    exit 1
fi
echo "✅ Node.js found: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi
echo "✅ npm found: $(npm -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. You'll need to install PostgreSQL."
fi

echo ""
echo "📦 Setting up backend..."

# Backend setup
cd backend

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your actual configuration!"
else
    echo "✅ backend/.env already exists"
fi

echo "Installing backend dependencies..."
mvn clean install -DskipTests

echo "✅ Backend setup complete!"

cd ..

echo ""
echo "📦 Setting up frontend..."

# Frontend setup
cd frontend

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with your actual configuration!"
else
    echo "✅ frontend/.env already exists"
fi

echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database and API credentials"
echo "2. Edit frontend/.env with your backend URL and Stripe public key"
echo "3. Create database: psql -U postgres -f backend/setup-database.sql"
echo "4. Create admin user: psql -U postgres -d masjid_db -f backend/create-admin.sql"
echo "5. Start backend: cd backend && mvn spring-boot:run"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "For detailed instructions, see README.md and DEPLOYMENT_GUIDE.md"
echo ""
