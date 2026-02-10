#!/bin/bash

# 🔒 Security Pre-Deployment Verification Script
# Run this before deploying to production

set -e

echo "🔍 MASJID STUDENTSKI GRAD - SECURITY VERIFICATION"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ((ERRORS++))
    fi
}

# Function to check for pattern in file
check_pattern() {
    if grep -q "$1" "$2" 2>/dev/null; then
        echo -e "${RED}❌ $3${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✅ $3${NC}"
        return 0
    fi
}

# Function to check pattern exists
check_exists() {
    if grep -q "$1" "$2" 2>/dev/null; then
        echo -e "${GREEN}✅ $3${NC}"
    else
        echo -e "${RED}❌ $3${NC}"
        ((ERRORS++))
    fi
}

echo "1️⃣  CRITICAL SECURITY CHECKS"
echo "----------------------------"

# Check for @CrossOrigin wildcards
echo "Checking for CORS wildcards..."
if find backend/src/main/java/com/masjid/controller -name "*.java" -exec grep -l '@CrossOrigin(origins = "\*")' {} \; 2>/dev/null | grep -q .; then
    echo -e "${RED}❌ Found @CrossOrigin wildcards in controllers!${NC}"
    find backend/src/main/java/com/masjid/controller -name "*.java" -exec grep -l '@CrossOrigin(origins = "\*")' {} \;
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No CORS wildcards found${NC}"
fi

# Check JWT secret validation
echo "Checking JWT secret validation..."
check_exists "@PostConstruct" "backend/src/main/java/com/masjid/security/JwtTokenProvider.java" "JWT secret validation exists"

# Check LoginAttemptService exists
check_file "backend/src/main/java/com/masjid/service/LoginAttemptService.java" "LoginAttemptService exists (rate limiting)"

# Check for weak default secrets
echo "Checking for weak secrets in config..."
if grep -r "secret.*=.*password\|secret.*=.*123\|secret.*=.*test" backend/src/main/resources/*.yml 2>/dev/null; then
    echo -e "${RED}❌ Found weak secrets in config files!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No weak secrets in config files${NC}"
fi

echo ""
echo "2️⃣  INPUT VALIDATION CHECKS"
echo "----------------------------"

# Check for @Valid annotations
check_exists "@Valid" "backend/src/main/java/com/masjid/controller/AuthController.java" "Input validation on AuthController"
check_exists "@NotBlank\|@Size" "backend/src/main/java/com/masjid/dto/LoginRequest.java" "Validation annotations on LoginRequest"

echo ""
echo "3️⃣  SECURITY HEADERS CHECKS"
echo "----------------------------"

check_file "backend/src/main/java/com/masjid/config/SecurityHeadersConfig.java" "SecurityHeadersConfig exists"
check_exists "X-Frame-Options" "backend/src/main/java/com/masjid/config/SecurityHeadersConfig.java" "Clickjacking protection configured"
check_exists "Content-Security-Policy" "backend/src/main/java/com/masjid/config/SecurityHeadersConfig.java" "CSP configured"

echo ""
echo "4️⃣  BUILD VERIFICATION"
echo "----------------------------"

echo "Building backend..."
cd backend
if mvn clean compile -DskipTests -q; then
    echo -e "${GREEN}✅ Backend builds successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed!${NC}"
    ((ERRORS++))
fi
cd ..

echo ""
echo "5️⃣  ENVIRONMENT VARIABLE CHECKS"
echo "----------------------------"

# Check .env is in .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env not in .gitignore${NC}"
    ((WARNINGS++))
fi

# Check for committed .env files
if find . -name ".env" -not -path "./node_modules/*" -not -path "./backend/target/*" | grep -q .; then
    echo -e "${RED}❌ Found .env files in repository!${NC}"
    find . -name ".env" -not -path "./node_modules/*" -not -path "./backend/target/*"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No .env files committed${NC}"
fi

echo ""
echo "6️⃣  DEPENDENCY SECURITY"
echo "----------------------------"

# Check for known vulnerable dependencies (basic check)
if grep -q "log4j.*2\.1[0-4]\." backend/pom.xml 2>/dev/null; then
    echo -e "${RED}❌ Vulnerable Log4j version detected!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No known vulnerable Log4j versions${NC}"
fi

echo ""
echo "7️⃣  PRODUCTION READINESS"
echo "----------------------------"

# Check application.yml doesn't have hardcoded production secrets
if grep -E "password.*:.*[^${\w]|secret.*:.*[^${\w]" backend/src/main/resources/application.yml | grep -v "JWT_SECRET:\$" | grep -q .; then
    echo -e "${YELLOW}⚠️  Possible hardcoded secrets in application.yml${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ No hardcoded secrets in application.yml${NC}"
fi

echo ""
echo "=================================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🚀 Your application is ready for production deployment!"
    echo ""
    echo "⚠️  REMINDER: Before deploying, ensure these environment variables are set:"
    echo "   - JWT_SECRET (min 32 chars, generate with: openssl rand -base64 64)"
    echo "   - DATABASE_URL"
    echo "   - STRIPE_API_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} WARNING(S) FOUND${NC}"
    echo ""
    echo "Review warnings above. You may proceed with deployment but address these issues."
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} ERROR(S) FOUND${NC}"
    echo -e "${YELLOW}⚠️  ${WARNINGS} WARNING(S) FOUND${NC}"
    echo ""
    echo "🛑 DO NOT DEPLOY until all errors are fixed!"
    echo ""
    echo "📝 Review the errors above and run this script again."
    exit 1
fi
