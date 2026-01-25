# Documentation Index

## 📚 Getting Started

### For New Developers
1. Start with: **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Overview of architecture
   - Quick start instructions
   - Common commands

### For DevOps/Deployment
1. Read: **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)**
   - Detailed deployment guide
   - Production setup
   - Troubleshooting
   - Monitoring & backups

### For System Administrators
1. Refer to: **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
   - Checklists
   - Common commands
   - Emergency procedures
   - Performance tuning

---

## 📋 Configuration Files

### Environment Variables
- **[.env.example](./.env.example)** - Complete production template
- **[.env.example.local](./.env.example.local)** - Local development template

### Application Configuration
- **backend/src/main/resources/application.yml** - Development profile
- **backend/src/main/resources/application-prod.yml** - Production profile

### Docker Configuration
- **[docker-compose.yml](./docker-compose.yml)** - Full stack orchestration
- **backend/Dockerfile** - Backend image build
- **backend/.dockerignore** - Docker build exclusions
- **frontend/Dockerfile** - Frontend image build
- **frontend/.dockerignore** - Docker build exclusions
- **frontend/nginx.conf** - Nginx configuration

---

## 🔧 Tools & Scripts

### Environment Validation
- **[validate-env.sh](./validate-env.sh)** - Validate environment before deployment
  ```bash
  ./validate-env.sh
  ```

---

## 📖 Project Documentation

### Bug Fixes & Changes
- **[PRODUCTION_FIXES.md](./PRODUCTION_FIXES.md)** - Complete list of all changes
  - 15 critical bugs fixed
  - 20+ improvements made
  - Security enhancements
  - Docker configuration
  - Documentation

### Architecture & Design
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
- **[docs/API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)** - API reference

### Feature Documentation
- **[docs/STRIPE_INTEGRATION_GUIDE.md](./docs/STRIPE_INTEGRATION_GUIDE.md)** - Stripe setup
- **[docs/FUNDRAISING_CAMPAIGNS.md](./docs/FUNDRAISING_CAMPAIGNS.md)** - Campaign features
- **[docs/ADMIN_DONATIONS_VIEW.md](./docs/ADMIN_DONATIONS_VIEW.md)** - Admin features
- **[docs/QUESTIONS_FEATURE.md](./docs/QUESTIONS_FEATURE.md)** - Questions system

---

## 🚀 Quick Links

### Local Development
```bash
# Setup
cp .env.example.local .env
docker-compose up -d

# Access
http://localhost           # Frontend
http://localhost:8080      # Backend
```

### Production Deployment
```bash
# Validate
./validate-env.sh

# Deploy
docker-compose up -d

# Monitor
docker-compose logs -f
```

### Common Commands
```bash
# View logs
docker-compose logs -f backend

# Database access
docker-compose exec postgres psql -U postgres -d masjid_db

# Backup
docker-compose exec postgres pg_dump -U postgres masjid_db > backup.sql

# Restart
docker-compose restart backend
```

---

## 📊 What's Included

### Backend (Spring Boot)
- REST API for all features
- JWT authentication
- Stripe payment integration
- Email sending (SMTP)
- Prayer times API
- Admin dashboard API

### Frontend (React + Vite)
- Responsive design (Tailwind CSS)
- Multi-language support (i18n)
- Admin dashboard
- Payment processing
- Real-time updates

### Database (PostgreSQL)
- Persistent data storage
- Automatic backups
- Migration scripts included

---

## 🔐 Security Features

✅ Environment-based configuration (no secrets in code)
✅ CORS properly configured
✅ Security headers (CSP, HSTS, X-Frame-Options)
✅ JWT token authentication
✅ BCrypt password hashing
✅ Request logging with correlation IDs
✅ Non-root Docker user
✅ Database connection pooling
✅ Structured error responses
✅ Health check endpoints

---

## 🏗️ Infrastructure

### Docker Services
1. **PostgreSQL** - Database (port 5432)
2. **Backend** - Spring Boot API (port 8080)
3. **Frontend** - Nginx + React (port 80)

### Networks
- Internal Docker network for service-to-service communication
- Exposed ports: 80 (frontend), 8080 (backend), 5432 (database)

### Volumes
- postgres_data - Database persistence
- backend_uploads - User uploaded files
- backend_logs - Application logs

---

## 📞 Troubleshooting

### Service Issues
See **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md#troubleshooting)** for detailed troubleshooting

### Configuration Issues
See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md#troubleshooting)** for quick fixes

### Command Reference
See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for all commands

---

## ✨ Recent Updates

### January 25, 2026
- ✅ Fixed 15 critical security issues
- ✅ Created production Docker setup
- ✅ Added comprehensive documentation
- ✅ Environment variable validation
- ✅ Global exception handling
- ✅ Security headers implementation

---

## 📈 Next Steps

1. **Review**: Read [PRODUCTION_FIXES.md](./PRODUCTION_FIXES.md) for all changes
2. **Configure**: Set up environment variables from [.env.example](./.env.example)
3. **Validate**: Run `./validate-env.sh` to check configuration
4. **Deploy**: Follow instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Verify**: Test all services are running
6. **Monitor**: Check logs and health endpoints

---

## 📝 File Structure

```
masjidStudentskiGrad/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/masjid/
│   │   ├── config/                  # Configuration classes
│   │   ├── controller/              # REST controllers
│   │   ├── exception/               # Exception handlers
│   │   ├── model/                   # JPA entities
│   │   ├── repository/              # Database repositories
│   │   ├── security/                # JWT & security
│   │   └── service/                 # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml          # Development config
│   │   └── application-prod.yml     # Production config
│   ├── Dockerfile                   # Backend image build
│   ├── .dockerignore                # Docker exclusions
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── api/                     # API calls
│   │   └── locales/                 # i18n translations
│   ├── Dockerfile                   # Frontend image build
│   ├── .dockerignore                # Docker exclusions
│   ├── nginx.conf                   # Nginx configuration
│   └── package.json                 # Node dependencies
│
├── docker-compose.yml               # Full stack orchestration
├── DEPLOYMENT.md                    # Quick start guide
├── DOCKER_DEPLOYMENT.md             # Detailed deployment guide
├── QUICK_REFERENCE.md               # Commands & checklists
├── PRODUCTION_FIXES.md              # Changes & bug fixes
├── .env.example                     # Production env template
├── .env.example.local               # Development env template
├── validate-env.sh                  # Environment validation
└── docs/                            # Additional documentation

```

---

## 🎯 Status

**Current Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: January 25, 2026

---

**Need Help?** Check the relevant documentation files above or run commands from QUICK_REFERENCE.md
