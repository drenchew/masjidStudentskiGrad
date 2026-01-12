#!/bin/bash

# Git Initialization and GitHub Push Script
# This script will help you push your project to GitHub

set -e

echo "🚀 Preparing to Push to GitHub"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ -d .git ]; then
    echo "✅ Git repository already initialized"
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""
echo "📋 Pre-Push Checklist"
echo "====================="
echo ""
echo "Before pushing, make sure you have:"
echo "  ✓ Removed all sensitive data from code"
echo "  ✓ Created .env.example files (not .env)"
echo "  ✓ Updated README.md with your information"
echo "  ✓ Tested the application locally"
echo ""

read -p "Have you completed the checklist? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the checklist first. See PRE_PUSH_CHECKLIST.md"
    exit 1
fi

echo ""
echo "🔍 Checking for sensitive files..."

# Check if .env files exist (they shouldn't be committed)
if [ -f backend/.env ] || [ -f frontend/.env ] || [ -f .env ]; then
    echo "⚠️  Warning: .env files detected. These should NOT be committed."
    echo "   Make sure they are in .gitignore"
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "❌ .gitignore not found. Please create it first."
    exit 1
fi

echo "✅ .gitignore found"

echo ""
echo "📁 Files to be tracked:"
git add -n . | head -20
echo "(showing first 20 files...)"

echo ""
read -p "Do these files look correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please review your files and try again."
    exit 1
fi

echo ""
echo "➕ Staging all files..."
git add .

echo ""
echo "📝 Creating initial commit..."
git commit -m "Initial commit - Masjid Studentski Grad website

Features:
- Prayer times integration with Aladhan API
- Fundraising campaigns system
- E-commerce for Islamic products
- Donation system with Stripe
- Newsletter subscription
- Khutbah archive with audio/video
- Questions & Answers feature
- Admin management panel
- Trilingual support (Bulgarian, English, Arabic)
- Docker support
- CI/CD with GitHub Actions

Tech stack:
- Backend: Java 17, Spring Boot, PostgreSQL
- Frontend: React, Tailwind CSS, Vite
- Payment: Stripe
- Email: Brevo/Sendinblue"

echo "✅ Initial commit created"

echo ""
echo "🌐 Setting up GitHub remote"
echo "============================"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it: masjid-studentski-grad"
echo "   - Description: Mosque website with prayer times, donations, and e-commerce"
echo "   - Make it Public or Private (your choice)"
echo "   - DO NOT initialize with README (we have one)"
echo ""

read -p "Have you created the GitHub repository? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the repository first, then run this script again."
    exit 1
fi

echo ""
read -p "Enter your GitHub username: " github_username
read -p "Enter repository name (default: masjid-studentski-grad): " repo_name
repo_name=${repo_name:-masjid-studentski-grad}

echo ""
echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${github_username}/${repo_name}.git"

echo ""
echo "📤 Pushing to GitHub..."
git branch -M main

echo ""
echo "Pushing to GitHub (you may be prompted for credentials)..."
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your project is now on GitHub!"
    echo ""
    echo "Repository URL: https://github.com/${github_username}/${repo_name}"
    echo ""
    echo "Next steps for deployment:"
    echo "1. Backend: Deploy to Railway (see DEPLOYMENT_GUIDE.md)"
    echo "2. Frontend: Deploy to Vercel (see DEPLOYMENT_GUIDE.md)"
    echo "3. Configure Stripe webhooks"
    echo "4. Set up email service"
    echo ""
    echo "For detailed deployment instructions, see DEPLOYMENT_GUIDE.md"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "1. Authentication failed - set up GitHub token or SSH key"
    echo "2. Repository doesn't exist - make sure you created it on GitHub"
    echo "3. Remote already exists - check: git remote -v"
    echo ""
    echo "To authenticate:"
    echo "Option 1: Use GitHub CLI: gh auth login"
    echo "Option 2: Use Personal Access Token: https://github.com/settings/tokens"
    echo "Option 3: Use SSH key: https://docs.github.com/en/authentication"
    exit 1
fi
