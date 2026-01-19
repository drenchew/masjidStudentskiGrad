# 🐳 Docker Setup and Deployment

This document explains the Docker containerization setup for the Masjid Studentski Grad application.

## 📁 Docker Files Overview

- **`Dockerfile`** - Root monolith container (frontend + backend in one)
- **`backend/Dockerfile`** - Backend-only container
- **`frontend/Dockerfile`** - Frontend-only container  
- **`docker-compose.yml`** - Local development with all services
- **`.dockerignore`** - Files excluded from Docker builds
- **`render.yaml`** - Render.com deployment configuration

## 🚀 Quick Start

### Local Development with Docker Compose

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Database: localhost:5432

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

### Using the Test Script

```bash
# Make script executable
chmod +x docker-test.sh

# Run interactive menu
./docker-test.sh
```

## 📦 Container Options

### Option 1: Monolith (Single Container)

**Use case**: Render free tier, simple deployment

**Pros**:
- Single container = simpler deployment
- Lower resource usage
- One URL for everything

**Cons**:
- Can't scale frontend/backend independently
- Slightly larger image

**Build**:
```bash
docker build -t masjid-app -f Dockerfile .
```

**Run**:
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="jdbc:postgresql://host:port/db" \
  -e DATABASE_USERNAME="user" \
  -e DATABASE_PASSWORD="pass" \
  -e JWT_SECRET="your-secret" \
  masjid-app
```

### Option 2: Microservices (Separate Containers)

**Use case**: Production, scalability

**Pros**:
- Independent scaling
- Smaller individual images
- Update services independently

**Cons**:
- More complex setup
- Requires service discovery/networking

**Build Backend**:
```bash
docker build -t masjid-backend -f backend/Dockerfile backend/
```

**Build Frontend**:
```bash
docker build -t masjid-frontend \
  --build-arg VITE_API_URL="http://localhost:8080" \
  -f frontend/Dockerfile frontend/
```

**Run with docker-compose**:
```bash
docker-compose up -d
```

## 🌐 Deploying to Render

### Method 1: Using render.yaml (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin master
   ```

2. **Create Blueprint on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Blueprint**
   - Select your repository
   - Choose `render.yaml`
   - Review and create

3. **Configure Environment Variables**:
   After creation, set these in the Render dashboard:
   - `STRIPE_API_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `EMAIL_FROM`
   - `BREVO_API_KEY`
   - `VITE_STRIPE_PK`
   - `DATABASE_URL` (after postgres is created)

### Method 2: Manual Service Creation

See [RENDER_DOCKER_DEPLOYMENT.md](./RENDER_DOCKER_DEPLOYMENT.md) for detailed step-by-step instructions.

## 🔧 Configuration

### Environment Variables

#### Backend (.env or Render dashboard)
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# Security
JWT_SECRET=your-secret-min-32-characters

# Stripe
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
EMAIL_FROM=masjid@yourdomain.com
BREVO_API_KEY=your_api_key

# App
FRONTEND_URL=https://your-frontend-url.com
UPLOAD_DIR=/app/uploads
```

#### Frontend (build args or .env)
```bash
VITE_API_URL=https://your-backend-url.com
VITE_STRIPE_PK=pk_live_xxxxx
```

### Docker Compose Configuration

Edit `docker-compose.yml` to change:
- Port mappings
- Volume mounts
- Network settings
- Environment variables

## 🔍 Testing Docker Builds

### Test Backend Locally
```bash
# Build
docker build -t masjid-backend -f backend/Dockerfile backend/

# Run (requires PostgreSQL)
docker run -p 8080:8080 \
  -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/masjid_db" \
  -e DATABASE_USERNAME="postgres" \
  -e DATABASE_PASSWORD="postgres" \
  -e JWT_SECRET="test-secret" \
  masjid-backend

# Test
curl http://localhost:8080/actuator/health
```

### Test Frontend Locally
```bash
# Build
docker build -t masjid-frontend \
  --build-arg VITE_API_URL="http://localhost:8080" \
  --build-arg VITE_STRIPE_PK="pk_test_xxxxx" \
  -f frontend/Dockerfile frontend/

# Run
docker run -p 3000:80 masjid-frontend

# Test
open http://localhost:3000
```

### Test Full Stack
```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 Image Sizes

Approximate sizes after build:

- **Backend**: ~400MB
  - Build stage: ~800MB (Maven + dependencies)
  - Runtime: ~400MB (JRE + JAR)

- **Frontend**: ~50MB
  - Build stage: ~600MB (Node + dependencies)
  - Runtime: ~50MB (Nginx + static files)

- **Monolith**: ~450MB (both combined)

## 🐛 Troubleshooting

### Build Issues

**Problem**: Maven dependencies fail to download
```bash
# Solution: Clear Docker cache
docker builder prune -a
docker build --no-cache -t masjid-backend -f backend/Dockerfile backend/
```

**Problem**: npm install fails
```bash
# Solution: Use npm ci instead of npm install
# Already configured in Dockerfile
```

### Runtime Issues

**Problem**: Backend can't connect to database
```bash
# Solution 1: Use host.docker.internal for local DB
DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/masjid_db

# Solution 2: Create docker network
docker network create masjid-network
docker run --network masjid-network ...
```

**Problem**: Frontend can't reach backend API
```bash
# Check VITE_API_URL is set correctly
docker inspect masjid-frontend | grep VITE_API_URL

# Rebuild with correct URL
docker build --build-arg VITE_API_URL="http://backend:8080" ...
```

**Problem**: Port already in use
```bash
# Find process using port
sudo lsof -i :8080

# Use different port
docker run -p 8081:8080 masjid-backend
```

### Performance Issues

**Problem**: Container uses too much memory
```bash
# Solution: Limit memory usage
docker run -m 512m masjid-backend

# Or in docker-compose.yml:
services:
  backend:
    mem_limit: 512m
```

**Problem**: Slow startup
```bash
# Solution: Already optimized with:
# - Multi-stage builds (smaller images)
# - Dependency caching (faster rebuilds)
# - Health checks (wait for readiness)
```

## 🔐 Security Best Practices

1. **Never commit secrets**:
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables
   - Use Render's secret management

2. **Use specific versions**:
   ```dockerfile
   # ✅ Good
   FROM postgres:15-alpine
   
   # ❌ Bad
   FROM postgres:latest
   ```

3. **Run as non-root** (optional enhancement):
   ```dockerfile
   RUN addgroup -g 1001 appuser && \
       adduser -D -u 1001 -G appuser appuser
   USER appuser
   ```

4. **Scan images for vulnerabilities**:
   ```bash
   docker scan masjid-backend
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Render Docker Guide](https://render.com/docs/docker)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)

## 🤝 Contributing

When adding new Docker features:
1. Update relevant Dockerfile
2. Update docker-compose.yml if needed
3. Update this documentation
4. Test locally before committing
5. Update render.yaml if affecting deployment

## 📝 Notes

- **Free tier limitations**: Render free tier has 512MB RAM, services sleep after 15min inactivity
- **Persistent storage**: Free tier doesn't support persistent disks - use external storage (S3) for uploads
- **Build time**: First build takes 5-10 minutes, subsequent builds are faster due to caching
- **Database**: PostgreSQL free tier gives 90 days free, then $7/month

---

**Need help?** Check [RENDER_DOCKER_DEPLOYMENT.md](./RENDER_DOCKER_DEPLOYMENT.md) for detailed deployment instructions.
