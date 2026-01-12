# 🕌 Masjid Studentski Grad

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

A comprehensive full-stack mosque website with trilingual support (Bulgarian, English, Arabic), featuring auto-updating prayer times, fundraising campaigns, e-commerce, Friday khutbah archive, donations, and admin management panel.

[Live Demo](#) | [Documentation](./DEPLOYMENT_GUIDE.md) | [Report Bug](../../issues) | [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🌟 Public Features
- **Prayer Times**: Auto-updating daily prayer times from Aladhan API with Sofia, Bulgaria timezone
- **Fundraising Campaigns**: Create and manage fundraising campaigns with progress tracking
- **Khutbah Archive**: Browse, search, and listen to Friday sermons with audio/video/PDF support
- **E-commerce Shop**: Order Islamic products with Bulgaria-wide delivery
- **Donations**: One-time and recurring donations via Stripe
- **Newsletter**: Subscribe to receive announcements and updates via email
- **Order Tracking**: Track orders with order number and email verification
- **Questions & Answers**: Community Q&A about Islam
- **Multilingual**: Full support for Bulgarian (Български), English, and Arabic (العربية) with RTL support

### 🛡️ Admin Features
- **Campaign Management**: Create, edit, and monitor fundraising campaigns
- **Product Management**: CRUD operations for products with image uploads
- **Order Management**: Update order status, add tracking numbers, manage deliveries
- **Khutbah Management**: Upload audio, video, and PDF transcripts of Friday sermons
- **Donation Tracking**: View all donations and active subscriptions with Stripe integration
- **Newsletter Management**: Send announcements to all subscribers via Brevo/Sendinblue
- **Questions Moderation**: Approve, answer, and manage community questions
- **Analytics Dashboard**: View key metrics, statistics, and insights (coming soon)
- **User Management**: Manage admin users and permissions (coming soon)

---

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.1** - Application framework
- **Spring Security** - Authentication & authorization with JWT
- **Spring Data JPA** - Database ORM
- **PostgreSQL 15** - Relational database
- **Stripe API** - Payment processing
- **Brevo (Sendinblue)** - Email service
- **Maven** - Dependency management
- **Lombok** - Boilerplate reduction

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **React i18next** - Internationalization
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Stripe.js** - Payment integration
- **React Player** - Media player for khutbah
- **Vite** - Build tool and dev server

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Railway** - Backend hosting (recommended)
- **Vercel** - Frontend hosting (recommended)
- **Nginx** - Reverse proxy (Docker deployment)

---

## 🚀 Getting Started

### Prerequisites

- **JDK 17 or higher**
- **Node.js 20 or higher**
- **PostgreSQL 15 or higher**
- **Maven 3.8 or higher**
- **Stripe Account** (for payments)
- **Brevo Account** (for emails, 300 emails/day free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/masjid-studentski-grad.git
   cd masjid-studentski-grad
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   
   # Setup database
   psql -U postgres -f setup-database.sql
   
   # Build and run
   mvn clean install
   mvn spring-boot:run
   ```
   
   Backend will run on `http://localhost:8080`

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   
   # Install dependencies
   npm install
   
   # Run development server
   npm run dev
   ```
   
   Frontend will run on `http://localhost:3000`

4. **Create Admin User**
   ```bash
   cd backend
   psql -U postgres -d masjid_db -f create-admin.sql
   ```
   
   Default credentials: `admin@masjid.com` / `admin123` (change immediately!)

### Using Docker (Alternative)

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📦 Deployment

See the comprehensive [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to:

- **Railway** (Backend) - Free tier with PostgreSQL
- **Vercel** (Frontend) - Free tier with automatic HTTPS
- **Render** (Alternative)
- **Fly.io** (Alternative)
- **VPS with Docker** (Self-hosted)

### Quick Deploy Links

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/masjid-studentski-grad)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/masjid-studentski-grad)

---

## 📁 Project Structure

```
masjid-studentski-grad/
├── backend/                          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/masjid/
│   │   │   │   ├── config/          # Security, CORS, etc.
│   │   │   │   ├── controller/      # REST API endpoints
│   │   │   │   ├── model/           # JPA entities
│   │   │   │   ├── repository/      # Database repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── security/        # JWT, authentication
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.yml  # Configuration
│   │   └── test/                    # Unit & integration tests
│   ├── Dockerfile
│   ├── pom.xml                      # Maven dependencies
│   └── .env.example
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── api/                     # Axios API client
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── context/                 # React context (auth)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── locales/                 # i18n translations
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── public/                      # Static assets
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── docker-compose.yml               # Docker orchestration
├── .github/workflows/ci-cd.yml     # GitHub Actions
├── DEPLOYMENT_GUIDE.md             # Deployment instructions
└── README.md                        # This file
```

---

## 📚 API Documentation

### Base URL
```
Local: http://localhost:8080
Production: https://your-backend.railway.app
```

### Authentication
```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@masjid.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@masjid.com",
  "role": "ADMIN"
}

# Use token in subsequent requests
Authorization: Bearer <token>
```

### Key Endpoints

#### Public Endpoints
- `GET /api/prayer-times` - Get today's prayer times
- `GET /api/products` - List all products
- `GET /api/khutbahs` - List khutbahs
- `GET /api/campaigns` - List active campaigns
- `POST /api/donations` - Create donation
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/questions` - Submit question

#### Admin Endpoints (Require Authentication)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/{id}` - Update order status
- `POST /api/admin/campaigns` - Create campaign
- `POST /api/admin/khutbahs` - Upload khutbah
- `POST /api/admin/newsletter/send` - Send announcement

For complete API documentation, see [API_ENDPOINTS.md](./API_ENDPOINTS.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Test thoroughly before submitting PR

---

## 📝 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your-long-secret-key-min-32-characters
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_smtp_password
BREVO_API_KEY=your_api_key
EMAIL_FROM=masjid@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PK=pk_test_...
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

---

## 📈 Roadmap

- [x] Prayer times integration
- [x] Fundraising campaigns
- [x] E-commerce system
- [x] Donation system with Stripe
- [x] Newsletter functionality
- [x] Khutbah archive
- [x] Questions & Answers
- [x] Admin panel
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Social media integration
- [ ] Event calendar
- [ ] Volunteer management
- [ ] Quran integration

---

## 🐛 Known Issues

See [Issues](../../issues) for a list of known issues and feature requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Aladhan API](https://aladhan.com/prayer-times-api) for prayer times
- [Stripe](https://stripe.com) for payment processing
- [Brevo](https://brevo.com) for email service
- All contributors and supporters

---

## 📞 Contact

Project Link: [https://github.com/yourusername/masjid-studentski-grad](https://github.com/yourusername/masjid-studentski-grad)

Website: [https://masjid-studentskigrad.com](https://masjid-studentskigrad.com)

---

<div align="center">

Made with ❤️ for the Muslim community

</div>
