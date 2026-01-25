# Quick Reference - Deployment Checklists

## Pre-Deployment Checklist

### 1. Environment Setup ✓
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env

# Validate
./validate-env.sh
```

### 2. Required Values
- [ ] JWT_SECRET (generate: `openssl rand -hex 32`)
- [ ] DATABASE_URL (or let Docker create it)
- [ ] DATABASE_USERNAME & PASSWORD
- [ ] STRIPE_API_KEY & STRIPE_WEBHOOK_SECRET
- [ ] CORS_ALLOWED_ORIGINS (your frontend domain)
- [ ] VITE_API_URL (backend URL)
- [ ] VITE_STRIPE_PK (Stripe publishable key)
- [ ] FRONTEND_URL (for email links)
- [ ] MAIL_* variables (SMTP credentials)

### 3. Security Review ✓
- [ ] JWT_SECRET is 32+ characters
- [ ] CORS_ALLOWED_ORIGINS doesn't include "*"
- [ ] Database password is strong
- [ ] Stripe keys are live (not test) in production
- [ ] HTTPS is enforced (in production)

---

## Local Development

### Start
```bash
cp .env.example.local .env
docker-compose up -d
```

### Access
- Frontend: http://localhost
- Backend API: http://localhost:8080
- Database: localhost:5432

### Stop
```bash
docker-compose down
```

### Logs
```bash
docker-compose logs -f backend
```

---

## Docker Compose Commands

```bash
# Build images
docker-compose build

# Start (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data!)
docker-compose down -v

# Restart service
docker-compose restart backend

# Execute command
docker-compose exec backend bash

# Scale service
docker-compose up -d --scale backend=3

# Show status
docker-compose ps
```

---

## Production Deployment Steps

### 1. Validate Environment
```bash
./validate-env.sh
# Should show all ✓ checks passing
```

### 2. Start Services
```bash
docker-compose up -d
# Wait 30-60 seconds
```

### 3. Verify Health
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost/
```

### 4. Check Logs
```bash
docker-compose logs -f
```

### 5. Scale Up (Optional)
```bash
docker-compose up -d --scale backend=3
```

---

## Troubleshooting

### Backend Won't Start
```bash
docker-compose logs backend

# Check:
# - JWT_SECRET is set and 32+ chars
# - DATABASE_URL is correct
# - Database container is healthy
# - Wait 30-60 seconds for DB initialization
```

### Database Connection Error
```bash
docker-compose logs postgres

# Solutions:
# 1. Wait 60 seconds for DB to initialize
# 2. Check DATABASE_URL format
# 3. Check DATABASE_USERNAME and PASSWORD
# 4. Verify postgres container is running
```

### Frontend Blank Page
```bash
docker-compose logs frontend

# Check:
# - VITE_API_URL points to backend
# - Backend is accessible
# - Check browser console (F12)
# - Clear browser cache
```

### Port Already in Use
```bash
# Linux/Mac
lsof -i :8080
kill -9 <PID>

# Docker - Verify running containers
docker ps

# Change ports in docker-compose.yml
# ports:
#   - "8081:8080"
```

---

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres masjid_db > backup_$(date +%Y%m%d).sql

# View backups
ls -lh backup_*.sql
```

### Database Restore
```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres -d masjid_db < backup_20260125.sql
```

### File Uploads Backup
```bash
# Copy uploads directory
docker cp masjid-backend:/app/uploads ./backups/uploads_$(date +%Y%m%d)
```

---

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service (last 100 lines)
docker-compose logs -f --tail=100 backend

# Follow new logs only
docker-compose logs -f backend
```

### Container Status
```bash
# List running containers
docker-compose ps

# Show resource usage
docker stats

# Check specific container
docker stats masjid-backend
```

### Health Endpoints
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Detailed health (authorized only)
curl http://localhost:8080/actuator/health/details

# Metrics
curl http://localhost:8080/actuator/metrics
```

---

## Updating Application

### Update Code & Restart
```bash
# Pull latest
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Rolling Update (Zero Downtime)
```bash
# Scale up to 2 instances
docker-compose up -d --scale backend=2

# Deploy new version
docker-compose up -d --build --no-deps backend

# Scale back to 1
docker-compose up -d --scale backend=1
```

---

## Performance Tuning

### Database
```bash
# Monitor connections
docker-compose exec postgres psql -U postgres -d masjid_db -c "SELECT count(*) FROM pg_stat_activity;"

# Increase max connections (in docker-compose.yml)
# environment:
#   - POSTGRES_INIT_ARGS=-c max_connections=200
```

### Memory
```bash
# View memory usage
docker stats

# Adjust in docker-compose.yml:
# environment:
#   - JAVA_OPTS=-Xmx1024m -Xms512m
```

### CPU
```bash
# Check CPU usage
docker stats

# Limit CPU in docker-compose.yml:
# cpus: '1.0'
# mem_limit: '1024m'
```

---

## Security Updates

### Pull Latest Images
```bash
# Update PostgreSQL version
docker-compose down
# Edit docker-compose.yml, change postgres:15-alpine
docker-compose up -d

# Rebuild backend (updates dependencies)
docker-compose up -d --build backend
```

### Rotate Secrets
```bash
# Generate new JWT secret
openssl rand -hex 32

# Update in .env and restart
docker-compose restart backend
```

---

## Error Codes

### HTTP Status Codes
- 200: OK - Success
- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication failed
- 403: Forbidden - No permission
- 404: Not Found - Resource doesn't exist
- 500: Internal Error - Server error
- 503: Service Unavailable - Server down

### Docker Exit Codes
- 0: Success
- 1: General error
- 126: Command cannot execute
- 127: Command not found
- 137: Killed (OOM killer)
- 139: Segmentation fault

---

## Getting Help

### View Documentation
```bash
cat DEPLOYMENT.md              # Quick start
cat DOCKER_DEPLOYMENT.md       # Detailed guide
cat .env.example              # Configuration
cat PRODUCTION_FIXES.md        # What's fixed
```

### Common Tasks
```bash
# Access database shell
docker-compose exec postgres psql -U postgres -d masjid_db

# View application logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Clear old logs
docker-compose logs --no-color > /dev/null
```

---

## Emergency Procedures

### Service Down
```bash
# Quick restart
docker-compose restart <service>

# Full restart
docker-compose down
docker-compose up -d

# Check status
docker-compose ps
```

### Database Corrupted
```bash
# Create fresh database
docker-compose down -v
docker-compose up -d postgres

# Wait for initialization
sleep 60

# Start backend
docker-compose up -d backend
```

### Clear Everything
```bash
# WARNING: This deletes all data!
docker-compose down -v
rm -rf backend/uploads/*
```

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Status**: Production Ready ✅
