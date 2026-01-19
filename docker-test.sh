#!/bin/bash

# Docker Build and Test Script for Render Deployment
# This script helps you test your Docker containers locally before deploying to Render

set -e  # Exit on error

echo "🐳 Docker Build and Test Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Docker is installed"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose is not installed. Some features may not work."
fi

# Menu
echo ""
echo "Choose an option:"
echo "1. Build and test backend only"
echo "2. Build and test frontend only"
echo "3. Build and test full stack (docker-compose)"
echo "4. Build single monolith container (for Render single container)"
echo "5. Clean up all containers and images"
echo "6. View logs"
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        print_status "Building backend Docker image..."
        docker build -t masjid-backend -f backend/Dockerfile backend/
        
        echo ""
        print_status "Backend image built successfully!"
        
        read -p "Do you want to run the backend container? (y/n): " run_backend
        if [ "$run_backend" = "y" ]; then
            echo ""
            print_status "Starting backend container..."
            docker run -d \
                --name masjid-backend-test \
                -p 8080:8080 \
                -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/masjid_db" \
                -e DATABASE_USERNAME="postgres" \
                -e DATABASE_PASSWORD="postgres" \
                -e JWT_SECRET="test-secret-key-change-in-production-min-32-chars" \
                masjid-backend
            
            print_status "Backend is running on http://localhost:8080"
            echo "   Health check: http://localhost:8080/actuator/health"
            echo "   Stop with: docker stop masjid-backend-test"
            echo "   Remove with: docker rm masjid-backend-test"
        fi
        ;;
        
    2)
        echo ""
        print_status "Building frontend Docker image..."
        docker build -t masjid-frontend \
            --build-arg VITE_API_URL="http://localhost:8080" \
            --build-arg VITE_STRIPE_PK="pk_test_your_key" \
            -f frontend/Dockerfile frontend/
        
        echo ""
        print_status "Frontend image built successfully!"
        
        read -p "Do you want to run the frontend container? (y/n): " run_frontend
        if [ "$run_frontend" = "y" ]; then
            echo ""
            print_status "Starting frontend container..."
            docker run -d \
                --name masjid-frontend-test \
                -p 3000:80 \
                masjid-frontend
            
            print_status "Frontend is running on http://localhost:3000"
            echo "   Stop with: docker stop masjid-frontend-test"
            echo "   Remove with: docker rm masjid-frontend-test"
        fi
        ;;
        
    3)
        echo ""
        print_status "Starting full stack with docker-compose..."
        
        if [ ! -f .env ]; then
            print_warning ".env file not found. Creating from example..."
            cat > .env << EOF
DATABASE_PASSWORD=postgres
JWT_SECRET=test-secret-key-change-in-production-min-32-chars
STRIPE_API_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
EMAIL_FROM=masjid@test.com
BREVO_API_KEY=your_api_key
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PK=pk_test_your_key
EOF
            print_warning "Please edit .env file with your actual credentials"
        fi
        
        docker-compose up -d --build
        
        print_status "Full stack is running!"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend: http://localhost:8080"
        echo "   Database: localhost:5432"
        echo ""
        echo "   View logs: docker-compose logs -f"
        echo "   Stop: docker-compose down"
        ;;
        
    4)
        echo ""
        print_status "Building monolith container (frontend + backend)..."
        docker build -t masjid-monolith -f Dockerfile .
        
        echo ""
        print_status "Monolith image built successfully!"
        
        read -p "Do you want to run the monolith container? (y/n): " run_mono
        if [ "$run_mono" = "y" ]; then
            echo ""
            print_status "Starting monolith container..."
            docker run -d \
                --name masjid-monolith-test \
                -p 8080:8080 \
                -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/masjid_db" \
                -e DATABASE_USERNAME="postgres" \
                -e DATABASE_PASSWORD="postgres" \
                -e JWT_SECRET="test-secret-key-change-in-production-min-32-chars" \
                -e VITE_API_URL="http://localhost:8080" \
                masjid-monolith
            
            print_status "Monolith is running on http://localhost:8080"
            echo "   Stop with: docker stop masjid-monolith-test"
            echo "   Remove with: docker rm masjid-monolith-test"
        fi
        ;;
        
    5)
        echo ""
        print_warning "This will remove all masjid containers and images"
        read -p "Are you sure? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo ""
            print_status "Stopping and removing containers..."
            docker stop masjid-backend-test masjid-frontend-test masjid-monolith-test 2>/dev/null || true
            docker rm masjid-backend-test masjid-frontend-test masjid-monolith-test 2>/dev/null || true
            docker-compose down 2>/dev/null || true
            
            print_status "Removing images..."
            docker rmi masjid-backend masjid-frontend masjid-monolith 2>/dev/null || true
            docker rmi $(docker images | grep 'masjid' | awk '{print $3}') 2>/dev/null || true
            
            print_status "Cleanup complete!"
        fi
        ;;
        
    6)
        echo ""
        echo "Choose which logs to view:"
        echo "1. Backend"
        echo "2. Frontend"
        echo "3. Monolith"
        echo "4. Docker Compose (all services)"
        read -p "Enter your choice (1-4): " log_choice
        
        case $log_choice in
            1) docker logs -f masjid-backend-test ;;
            2) docker logs -f masjid-frontend-test ;;
            3) docker logs -f masjid-monolith-test ;;
            4) docker-compose logs -f ;;
            *) print_error "Invalid choice" ;;
        esac
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_status "Done!"
