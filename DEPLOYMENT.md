# Masjid Studentski Grad - Production Deployment Guide

## Overview

This is a full-stack application for Masjid Studentski Grad featuring:
- Backend: Spring Boot 3.2.1 with PostgreSQL
- Frontend: React with Vite
- Payment: Stripe integration
- Email: Brevo/Sendinblue
- Deployment: Docker & Docker Compose

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Nginx + React)        │
│              Port 80/443                │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│     Backend (Spring Boot API)           │
│              Port 8080                  │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│     PostgreSQL Database                 │
│              Port 5432                  │
└─────────────────────────────────────────┘
```

## Quick Start - Local Development

### Prerequisites
- Docker & Docker Compose installed
- Git

### Setup

1. **Clone and Navigate**
```bash
git clone <repo-url>
cd masjidStudentskiGrad
```

2. **Create Environment File**
```bash
cp .env.example.local .env
# Edit .env with your local values
```

3. **Start Services**
```bash
docker-compose up -d
```

4. **Verify**
```bash
# Wait 30-60 seconds for services to start
docker-compose ps

# Check backend health
curl http://localhost:8080/actuator/health

# Frontend at http://localhost
```

## Production Deployment

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed production deployment instructions.

### Key Steps

1. **Prepare Secrets**
   - Generate JWT_SECRET: `openssl rand -hex 32`
   - Get Stripe keys from dashboard
   - Set SMTP credentials

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit with production values
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Security Features

✅ Global exception handler for proper error handling
✅ Security headers (CSP, X-Frame-Options, etc.)
✅ CORS configuration via environment variables
✅ JWT token authentication
✅ Bcrypt password hashing
✅ Rate limiting ready
✅ HTTPS support
✅ Non-root Docker user
✅ Secrets management
✅ Request logging with correlation IDs

## Bug Fixes Implemented

### 1. Exception Handling
- ✅ Created `GlobalExceptionHandler` with proper exception classification
- ✅ Added `ResourceNotFoundException` for missing resources
- ✅ Structured error responses with proper HTTP status codes
- ✅ Removed generic `catch (Exception e)` blocks

### 2. Security
- ✅ Fixed overly permissive `@CrossOrigin(origins = "*")`
- ✅ Environment-based CORS configuration
- ✅ Removed debug utilities (PasswordHasher)
- ✅ Added security headers
- ✅ JWT secret validation

### 3. Configuration
- ✅ Created production profile (application-prod.yml)
- ✅ Environment variable validation
- ✅ Database connection pooling
- ✅ Request logging with correlation IDs
- ✅ Proper logging configuration

### 4. Docker
- ✅ Multi-stage build optimization
- ✅ Non-root user in containers
- ✅ Health checks
- ✅ Production-ready Dockerfile
- ✅ Complete docker-compose.yml
- ✅ .dockerignore files

### 5. Frontend
- ✅ Environment configuration for production
- ✅ Proper nginx configuration
- ✅ Health checks
- ✅ Gzip compression
- ✅ Cache headers

## Environment Variables

### Required for Production
- `JWT_SECRET` - Cryptographically secure random string
- `DATABASE_URL` - PostgreSQL JDBC URL
- `DATABASE_USERNAME` - Database user
- `DATABASE_PASSWORD` - Database password
- `STRIPE_API_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `CORS_ALLOWED_ORIGINS` - Allowed frontend domains
- `FRONTEND_URL` - Frontend URL for emails
- `VITE_API_URL` - API URL for frontend
- `VITE_STRIPE_PK` - Stripe publishable key
- `MAIL_HOST` - SMTP server
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - Sender email

See `.env.example` for complete reference.

## Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics
```

## Database Management

### Backup
```bash
docker-compose exec postgres pg_dump -U postgres masjid_db > backup.sql
```

### Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d masjid_db
```

### Access Database
```bash
docker-compose exec postgres psql -U postgres -d masjid_db
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up -d --build

# Restart service
docker-compose restart backend

# Execute command in container
docker-compose exec backend ls -la

# Remove all volumes (WARNING: data loss!)
docker-compose down -v
```

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
```

Check:
- DATABASE_URL and credentials
- JWT_SECRET is at least 32 characters
- Stripe API keys are set

### Database connection error
```bash
docker-compose logs postgres
```

Check:
- PostgreSQL is running
- Correct DATABASE_URL format
- Wait 30-60 seconds for database to initialize

### Frontend blank page
```bash
docker-compose logs frontend
```

Check:
- VITE_API_URL points to backend
- Backend is accessible
- Check browser console for errors

## Production Checklist

- [ ] Generate secure JWT_SECRET
- [ ] Set all required environment variables
- [ ] Configure CORS_ALLOWED_ORIGINS with actual domains
- [ ] Use Stripe live keys (sk_live_*, pk_live_*)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up automated backups
- [ ] Configure logging aggregation
- [ ] Set up monitoring and alerting
- [ ] Configure WAF (Web Application Firewall)
- [ ] Test disaster recovery procedures

## API Documentation

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Admin Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "username": "admin"
}
```

## Support & Issues

For issues and bugs:
1. Check logs: `docker-compose logs -f`
2. Check environment variables: `docker-compose config`
3. Verify database connection
4. Check health endpoint

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
