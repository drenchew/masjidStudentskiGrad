# Backend API Endpoints Required

## Authentication Endpoints

### Login
```
POST /api/auth/login
Body: { "username": "string", "password": "string" }
Response: { "token": "jwt_token", "username": "string", "role": "ADMIN" }
```

---

## Prayer Times Endpoints

### Get Today's Prayer Times
```
GET /api/prayer-times/today
Response: {
  "fajr": "05:30",
  "sunrise": "07:15",
  "dhuhr": "12:45",
  "asr": "15:30",
  "maghrib": "18:00",
  "isha": "19:30",
  "hijriDate": "15 Ramadan 1445"
}
```

---

## Products Endpoints

### Get All Products (Public)
```
GET /api/products
Response: [
  {
    "id": 1,
    "nameEn": "string",
    "nameBg": "string",
    "nameAr": "string",
    "descriptionEn": "string",
    "descriptionBg": "string",
    "descriptionAr": "string",
    "price": 29.99,
    "stock": 10,
    "category": "BOOKS",
    "imageUrl": "https://..."
  }
]
```

### Create Product (Admin)
```
POST /api/products
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "nameEn": "string",
  "nameBg": "string",
  "nameAr": "string",
  "descriptionEn": "string",
  "descriptionBg": "string",
  "descriptionAr": "string",
  "price": 29.99,
  "stock": 10,
  "category": "BOOKS",
  "imageUrl": "https://..."
}
Response: { "id": 1, ... }
```

### Update Product (Admin)
```
PUT /api/products/{id}
Headers: { "Authorization": "Bearer <token>" }
Body: { same as create }
Response: { updated product }
```

### Delete Product (Admin)
```
DELETE /api/products/{id}
Headers: { "Authorization": "Bearer <token>" }
Response: 204 No Content
```

---

## Orders Endpoints

### Create Order
```
POST /api/orders
Body: {
  "customerName": "string",
  "email": "string",
  "phoneNumber": "string",
  "shippingAddress": "string",
  "city": "string",
  "postalCode": "string",
  "notes": "string",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 29.99
    }
  ],
  "totalAmount": 59.98
}
Response: {
  "id": 1,
  "orderNumber": "ORD-20260110-001",
  "status": "PENDING",
  ...
}
```

### Track Order
```
GET /api/orders/track?orderNumber=ORD-20260110-001&email=user@example.com
Response: {
  "id": 1,
  "orderNumber": "ORD-20260110-001",
  "customerName": "string",
  "email": "string",
  "phoneNumber": "string",
  "shippingAddress": "string",
  "city": "string",
  "postalCode": "string",
  "status": "SHIPPED",
  "trackingNumber": "TRACK123",
  "totalAmount": 59.98,
  "items": [
    {
      "product": { product details },
      "quantity": 2,
      "price": 29.99
    }
  ],
  "createdAt": "2026-01-10T10:00:00Z"
}
```

### Get All Orders (Admin)
```
GET /api/orders
Headers: { "Authorization": "Bearer <token>" }
Response: [ array of orders ]
```

### Update Order Status (Admin)
```
PUT /api/orders/{id}/status
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "status": "SHIPPED",
  "trackingNumber": "TRACK123" (optional)
}
Response: { updated order }
```

---

## Khutbahs Endpoints

### Get Public Khutbahs
```
GET /api/khutbahs/public
Response: [
  {
    "id": 1,
    "titleEn": "string",
    "titleBg": "string",
    "titleAr": "string",
    "descriptionEn": "string",
    "descriptionBg": "string",
    "descriptionAr": "string",
    "speaker": "Sheikh Ahmed",
    "deliveredDate": "2026-01-03",
    "audioUrl": "https://...",
    "videoUrl": "https://...",
    "pdfUrl": "https://..."
  }
]
```

### Get All Khutbahs (Admin)
```
GET /api/khutbahs
Headers: { "Authorization": "Bearer <token>" }
Response: [ array of all khutbahs ]
```

### Create Khutbah (Admin)
```
POST /api/khutbahs
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "titleEn": "string",
  "titleBg": "string",
  "titleAr": "string",
  "descriptionEn": "string",
  "descriptionBg": "string",
  "descriptionAr": "string",
  "speaker": "string",
  "deliveredDate": "2026-01-03",
  "audioUrl": "https://...",
  "videoUrl": "https://...",
  "pdfUrl": "https://..."
}
Response: { created khutbah }
```

### Update Khutbah (Admin)
```
PUT /api/khutbahs/{id}
Headers: { "Authorization": "Bearer <token>" }
Body: { same as create }
Response: { updated khutbah }
```

### Delete Khutbah (Admin)
```
DELETE /api/khutbahs/{id}
Headers: { "Authorization": "Bearer <token>" }
Response: 204 No Content
```

---

## Donations Endpoints

### Create Stripe Checkout Session
```
POST /api/donations/create-checkout-session
Body: {
  "amount": 50.00,
  "donationType": "GENERAL" | "ZAKAT",
  "frequency": "ONE_TIME" | "MONTHLY" | "YEARLY",
  "currency": "BGN" | "EUR",
  "successUrl": "http://localhost:5173/donate?success=true",
  "cancelUrl": "http://localhost:5173/donate?canceled=true"
}
Response: {
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Create Payment Intent (Alternative)
```
POST /api/donations/create-payment-intent
Body: {
  "amount": 50.00,
  "donationType": "GENERAL" | "ZAKAT",
  "frequency": "ONE_TIME" | "MONTHLY" | "YEARLY"
}
Response: {
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Get Donations (Admin)
```
GET /api/donations
Headers: { "Authorization": "Bearer <token>" }
Response: [ array of donations ]
```

---

## Newsletter Endpoints

### Subscribe
```
POST /api/subscribers/subscribe
Body: {
  "email": "user@example.com",
  "language": "EN" | "BG" | "AR"
}
Response: {
  "id": 1,
  "email": "user@example.com",
  "language": "EN",
  "active": true
}
```

### Get Subscribers (Admin)
```
GET /api/subscribers
Headers: { "Authorization": "Bearer <token>" }
Response: [ array of subscribers ]
```

---

## Admin Statistics Endpoint

### Get Dashboard Stats
```
GET /api/admin/stats
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "donations": 150,
  "orders": 45,
  "subscribers": 320,
  "products": 28
}
```

---

## Error Response Format

All endpoints should return errors in this format:

```json
{
  "timestamp": "2026-01-10T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/orders"
}
```

---

## Authentication

- Public endpoints: No authentication required
- Admin endpoints: Require `Authorization: Bearer <jwt_token>` header
- JWT token obtained from `/api/auth/login`
- Token should be validated on each admin request
- 401 response if token is invalid/expired
- 403 response if user doesn't have required role

---

## CORS Configuration

Backend should allow:
- Origin: `http://localhost:5173` (development)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type
- Credentials: true

---

## Notes

1. All dates should be in ISO 8601 format
2. All amounts should be decimal with 2 decimal places
3. Email validation should be done on backend
4. Stock should be validated before order creation
5. Order numbers should be unique and sequential
6. Tracking numbers are optional until status is SHIPPED
7. All admin endpoints require authentication
8. Stripe webhooks should be configured for payment confirmation

---

## Testing

Test the endpoints using:
- Postman
- cURL
- Browser DevTools

Example cURL test:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

Your backend implementation should already have most of these endpoints based on the Java Spring Boot code. Just verify they're working correctly!
