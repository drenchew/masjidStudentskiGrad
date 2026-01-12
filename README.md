# Masjid Studentski Grad Website

A comprehensive full-stack mosque website with trilingual support (Bulgarian, English, Arabic), featuring auto-updating prayer times, e-commerce for Islamic products, Friday khutbah archive, donations, and admin management panel.

## Features

### Public Features
- **Prayer Times**: Auto-updating daily prayer times from Aladhan API
- **Khutbah Archive**: Browse, search, and listen to Friday sermons with audio/video/PDF
- **E-commerce Shop**: Order Islamic products with Bulgaria-wide delivery
- **Donations**: One-time and recurring donations via Stripe
- **Newsletter**: Subscribe to receive announcements and updates
- **Order Tracking**: Track your orders with order number and email
- **Multilingual**: Full support for Bulgarian, English, and Arabic (with RTL)

### Admin Features
- **Product Management**: CRUD operations for products with image uploads
- **Order Management**: Update order status, add tracking numbers
- **Khutbah Management**: Upload audio, video, and PDF transcripts
- **Donation Tracking**: View all donations and active subscriptions
- **Newsletter Management**: Send announcements to subscribers
- **Analytics Dashboard**: View key metrics and statistics

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.1
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Stripe API for payments
- JavaMailSender for emails
- Lombok

### Frontend (To be implemented)
- React 18
- React Router
- React i18next (multilingual)
- Tailwind CSS (Islamic design)
- Axios
- React Player (for khutbah audio/video)

## Prerequisites

- JDK 17 or higher
- PostgreSQL 14 or higher
- Maven 3.8 or higher
- Stripe account (for donations)
- Brevo account (for emails)

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb masjid_db

# Or using psql
psql -U postgres
CREATE DATABASE masjid_db;
```

### 2. Environment Variables

Create a `.env` file or set environment variables:

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword

JWT_SECRET=YourSecureJWTSecretKeyHere

STRIPE_API_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_email
MAIL_PASSWORD=your_brevo_password

EMAIL_FROM=masjid@studentskigrad.com
BREVO_API_KEY=your_brevo_api_key

FRONTEND_URL=http://localhost:3000
```

### 3. Build and Run Backend

```bash
cd backend

# Build
mvn clean install

# Run
mvn spring-boot:run

# Or run jar directly
java -jar target/studentski-grad-0.0.1-SNAPSHOT.jar
```

The backend will start on `http://localhost:8080`

### 4. Create Admin User

On first run, manually insert an admin user:

```sql
INSERT INTO admins (username, password, email, role, created_at, updated_at) 
VALUES ('admin', '$2a$10$xK8WEU.vfPK6L8NeXvJrz.BRBxBZ.hJXQYCqm7VQ7yWQbH.mfY3wm', 
        'admin@masjid.com', 'ADMIN', NOW(), NOW());
```

Default password is: `admin123` (bcrypt hash shown above)
**⚠️ Change this immediately after first login!**

### 5. Initial Prayer Times Fetch

The system automatically fetches prayer times at 3 AM daily. To fetch manually:

```bash
curl -X POST http://localhost:8080/api/admin/prayer-times/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints

### Public Endpoints

#### Prayer Times
- `GET /api/prayer-times/today` - Get today's prayer times
- `GET /api/prayer-times/date/{date}` - Get prayer times for specific date

#### Products
- `GET /api/products` - Get all active products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category

#### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/track?number={orderNumber}&email={email}` - Track order

#### Donations
- `POST /api/donations/create` - Create one-time donation
- `POST /api/donations/recurring` - Create recurring donation
- `POST /api/donations/webhook` - Stripe webhook handler

#### Khutbahs
- `GET /api/khutbahs/public` - Get all active khutbahs
- `GET /api/khutbahs/public/{id}` - Get khutbah by ID
- `GET /api/khutbahs/public/featured` - Get featured khutbahs

#### Newsletter
- `POST /api/subscribers/subscribe` - Subscribe to newsletter
- `GET /api/subscribers/verify?token={token}` - Verify subscription
- `POST /api/subscribers/unsubscribe` - Unsubscribe from newsletter

### Admin Endpoints (Requires JWT)

#### Authentication
- `POST /api/auth/login` - Admin login

#### Product Management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/products/upload-image` - Upload product image

#### Order Management
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}/status` - Update order status

#### Khutbah Management
- `POST /api/admin/khutbahs` - Create khutbah
- `PUT /api/admin/khutbahs/{id}` - Update khutbah
- `DELETE /api/admin/khutbahs/{id}` - Delete khutbah
- `POST /api/admin/khutbahs/upload` - Upload media files

#### Donations
- `GET /api/admin/donations` - Get all donations
- `GET /api/admin/donations/stats` - Get donation statistics

#### Newsletter
- `GET /api/admin/subscribers` - Get all subscribers
- `POST /api/admin/announcements/send` - Send announcement to subscribers

## Free Hosting Options

### Backend (Railway/Render Free Tier)
```bash
# Railway
railway login
railway init
railway up

# Render
# Connect GitHub repo and auto-deploy
```

### Frontend (Vercel/Netlify)
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### Database (Neon/Supabase Free Tier)
- Neon: Free PostgreSQL with 10 GB storage
- Supabase: Free PostgreSQL with 500 MB storage

### File Storage (Cloudinary Free Tier)
- 10 GB storage
- 25 credits/month

### Email (Brevo Free Tier)
- 300 emails/day

## Project Structure

```
backend/
├── src/main/java/com/masjid/
│   ├── config/             # Security, CORS configuration
│   ├── controller/         # REST controllers
│   ├── dto/                # Data Transfer Objects
│   ├── model/              # JPA entities
│   ├── repository/         # Spring Data repositories
│   ├── security/           # JWT, authentication
│   ├── service/            # Business logic
│   └── MasjidApplication.java
├── src/main/resources/
│   └── application.yml     # Configuration
└── pom.xml                 # Maven dependencies

frontend/
├── src/
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── i18n/               # Translation files
│   ├── services/           # API services
│   └── App.jsx
└── package.json
```

## Payment Flow

### One-time Donation
1. User enters amount and email
2. Backend creates Stripe PaymentIntent
3. Frontend uses Stripe.js to collect payment
4. On success, send thank you email

### Recurring Donation
1. User selects amount and interval (monthly/yearly)
2. Backend creates Stripe Checkout Session
3. User redirected to Stripe hosted page
4. On success, create subscription and send confirmation

### Product Orders
1. User adds products to cart
2. Guest checkout with email and delivery details
3. Order created with status PENDING
4. Admin updates status manually (PROCESSING → SHIPPED → DELIVERED)
5. Emails sent at each status change

## Security Notes

1. **Change default admin password** immediately
2. Use strong JWT secret (min 32 characters)
3. Enable HTTPS in production
4. Configure CORS for production frontend URL
5. Keep Stripe webhook secret secure
6. Use environment variables for all secrets

## Development

### Run in development mode with hot reload:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Run tests:
```bash
mvn test
```

## Support

For issues and questions, please contact the mosque administration.

**JazakAllah Khair for using this system to support our mosque community!**
