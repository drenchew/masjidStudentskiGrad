#!/bin/bash
set -a
[ -f .env ] && source .env
set +a
# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "Masjid Studentski Grad - Setup Validator"
echo "================================"
echo ""

# Track validation results
VALID=true

# Function to check environment variable
check_env() {
    local var_name=$1
    local optional=$2
    
    if [ -z "${!var_name}" ]; then
        if [ "$optional" = "true" ]; then
            echo -e "${YELLOW}⚠ OPTIONAL${NC}: $var_name is not set"
        else
            echo -e "${RED}✗ REQUIRED${NC}: $var_name is not set"
            VALID=false
        fi
    else
        echo -e "${GREEN}✓${NC} $var_name is set"
    fi
}

# Function to check JWT secret length
check_jwt() {
    if [ -n "$JWT_SECRET" ]; then
        length=${#JWT_SECRET}
        if [ $length -lt 32 ]; then
            echo -e "${RED}✗${NC} JWT_SECRET is too short (${length} chars, minimum 32 required)"
            VALID=false
        else
            echo -e "${GREEN}✓${NC} JWT_SECRET is secure (${length} chars)"
        fi
    fi
}

# Function to check URL format
check_url() {
    local url=$1
    local var_name=$2
    
    if [ -n "$url" ]; then
        if [[ $url =~ ^https?:// ]]; then
            echo -e "${GREEN}✓${NC} $var_name format is valid"
        else
            echo -e "${RED}✗${NC} $var_name must start with http:// or https://"
            VALID=false
        fi
    fi
}

echo "REQUIRED VARIABLES:"
echo "==================="
check_env "JWT_SECRET"
check_env "DATABASE_NAME"
check_env "DATABASE_USERNAME"
check_env "DATABASE_PASSWORD"
check_env "STRIPE_API_KEY"
check_env "STRIPE_WEBHOOK_SECRET"
check_env "CORS_ALLOWED_ORIGINS"
echo ""

echo "FRONTEND VARIABLES:"
echo "==================="
check_env "VITE_API_URL"
check_env "VITE_STRIPE_PK"
check_env "FRONTEND_URL"
check_url "$VITE_API_URL" "VITE_API_URL"
check_url "$FRONTEND_URL" "FRONTEND_URL"
echo ""

echo "EMAIL VARIABLES:"
echo "================"
check_env "EMAIL_FROM"
check_env "MAIL_HOST"
check_env "MAIL_PORT"
check_env "MAIL_USERNAME"
check_env "MAIL_PASSWORD"
echo ""

echo "OPTIONAL VARIABLES:"
echo "==================="
check_env "BREVO_API_KEY" "true"
check_env "UPLOAD_DIR" "true"
check_env "JWT_EXPIRATION" "true"
echo ""

echo "SECURITY CHECKS:"
echo "================"
check_jwt
echo ""

# Check Docker
echo "DOCKER CHECK:"
echo "============="
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
else
    echo -e "${RED}✗${NC} Docker is not installed"
    VALID=false
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed"
else
    echo -e "${RED}✗${NC} Docker Compose is not installed"
    VALID=false
fi
echo ""

# Final verdict
echo "================================"
if [ "$VALID" = true ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Start deployment with:"
    echo "  docker-compose up -d"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the errors above.${NC}"
    echo ""
    echo "Reference: .env.example for all available variables"
    exit 1
fi
