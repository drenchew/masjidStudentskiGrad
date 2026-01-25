# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- PostgreSQL will run in a container (no external setup needed)
- All required environment variables configured

### Step 1: Prepare Environment Variables

```bash
# Copy the example file
cp .env.example.local .env

# Edit with your actual values
nano .env
```

### Step 2: Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Wait for services to start (about 30-60 seconds)
sleep 30

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 3: Verify Deployment

```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Frontend should be accessible at
http://localhost
```

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
```

Common issues:
- Database connection: Check DATABASE_URL and credentials
- JWT_SECRET: Ensure it's at least 32 characters
- Stripe keys: If donation is needed, set them

### Database won't initialize
```bash
# Check database logs
docker-compose logs postgres

# Manually run SQL scripts (if needed)
docker-compose exec postgres psql -U postgres -d masjid_db -f /docker-entrypoint-initdb.d/01-admin.sql
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Verify nginx configuration
docker-compose exec frontend nginx -t
```

## Production Deployment

### Environment Setup
1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, Azure Database)
2. Configure environment variables as secrets in your platform
3. Update CORS_ALLOWED_ORIGINS with actual domain
4. Use HTTPS URLs for VITE_API_URL and FRONTEND_URL

### Docker Build & Push

```bash
# Build images
docker build -t your-registry/masjid-backend:latest ./backend
docker build -t your-registry/masjid-frontend:latest ./frontend

# Push to registry
docker push your-registry/masjid-backend:latest
docker push your-registry/masjid-frontend:latest
```

### Kubernetes Deployment

```bash
# Example: Create ConfigMap for non-sensitive config
kubectl create configmap masjid-config \
  --from-literal=CORS_ALLOWED_ORIGINS=https://yourdomain.com \
  --from-literal=FRONTEND_URL=https://yourdomain.com \
  --from-literal=VITE_API_URL=https://api.yourdomain.com

# Create Secret for sensitive data
kubectl create secret generic masjid-secrets \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=DATABASE_PASSWORD='your-password' \
  --from-literal=STRIPE_API_KEY='sk_live_...' \
  --from-literal=STRIPE_WEBHOOK_SECRET='whsec_...' \
  --from-literal=MAIL_PASSWORD='your-password'
```

## Scaling

### Horizontal Scaling
```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3
```

### Load Balancing
The provided docker-compose setup can be extended with nginx:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx-prod.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

## Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost/
```

## Backup & Recovery

### Database Backup
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres masjid_db > backup.sql

# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d masjid_db
```

### File Uploads Backup
```bash
# Copy uploads directory
docker cp masjid-backend:/app/uploads ./backups/uploads_$(date +%Y%m%d)
```

## Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### View Metrics
```bash
# Check container resource usage
docker stats

# Check specific container
docker stats masjid-backend
```

## Security Hardening

### SSL/TLS Certificate
```bash
# Using Let's Encrypt with Docker
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com
```

### Network Isolation
```bash
# Create isolated network (already in docker-compose)
docker network create masjid-network
```

### Secret Management
Use your platform's secret management:
- Docker Swarm: `docker secret create`
- Kubernetes: `kubectl create secret`
- Docker Compose: Use `.env` file (never commit)

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend ls -la

# Remove volumes (WARNING: data loss!)
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Scale service
docker-compose up -d --scale backend=3
```

## Environment Variable Reference

See `.env.example` for complete list with descriptions.

Key variables:
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: Authentication token secret
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`: Payment processing
- `CORS_ALLOWED_ORIGINS`: Frontend URLs
- `MAIL_*`: Email configuration
- `VITE_*`: Frontend environment variables
