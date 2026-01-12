#!/bin/bash

echo "=========================================="
echo "Testing Newsletter Subscription Fix"
echo "=========================================="
echo ""

# Test 1: Newsletter Subscribe
echo "Test 1: Testing Newsletter Subscribe Endpoint"
echo "----------------------------------------------"
response=$(curl -s -X POST http://localhost:8080/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","language":"EN"}')
echo "Response: $response"
echo ""

# Test 2: Test that announcements endpoint is public
echo "Test 2: Testing Public Announcements Endpoint"
echo "----------------------------------------------"
response=$(curl -s http://localhost:8080/api/announcements)
echo "Response: $response"
echo ""

# Test 3: Test verification endpoint (without token, should fail gracefully)
echo "Test 3: Testing Verification Endpoint Access (should be accessible)"
echo "----------------------------------------------"
response=$(curl -s -w "\nHTTP Code: %{http_code}\n" http://localhost:8080/api/subscribers/verify?token=invalid-token)
echo "Response: $response"
echo ""

echo "=========================================="
echo "Tests Complete!"
echo "=========================================="
echo ""
echo "Key Points:"
echo "1. Newsletter subscription should work without authentication"
echo "2. Announcements endpoint should be publicly accessible"
echo "3. Verification endpoint should be accessible (even with invalid token)"
echo ""
echo "Next Steps:"
echo "1. Test actual subscription with real email"
echo "2. Check email for verification link"
echo "3. Click verification link - should work now!"
echo "4. Test sending announcements from admin panel"
