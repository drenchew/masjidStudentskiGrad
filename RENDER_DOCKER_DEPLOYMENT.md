# 🐳 Render Docker Deployment Guide

This guide will help you deploy the Masjid Studentski Grad application to Render using Docker containers.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Option 1: Single Container (Monolith)](#option-1-single-container-monolith)
- [Option 2: Separate Containers (Microservices)](#option-2-separate-containers-microservices)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Stripe Account** - For payment processing
4. **Brevo Account** - For email service (optional but recommended)

---

## Deployment Options

### Option 1: Single Container (Monolith) ⭐ Recommended for Free Tier

Deploy frontend and backend together in one container. Best for:
- Free tier deployment
- Simpler setup
- Lower resource usage

### Option 2: Separate Containers (Microservices)

Deploy frontend and backend as separate services. Best for:
- Production environments
- Scalability needs
- Independent service updates

---

## Option 1: Single Container (Monolith)

### Step 1: Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Add Docker configuration for Render"
git push origin master
```

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `masjid-db`
   - **Database**: `masjid_db`
   - **User**: `masjid_user` (or default)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for better performance)
4. Click **"Create Database"**
5. **Save the Internal Database URL** (format: `postgresql://user:pass@host:5432/dbname`)

### Step 3: Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `masjid-app`
   - **Region**: Same as database
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (the root Dockerfile)
   - **Plan**: Free (or paid)

### Step 4: Configure Environment Variables

In the **Environment** tab, add these variables:

#### Required Variables:
```
DATABASE_URL              = [Internal Database URL from Step 2]
DATABASE_USERNAME         = [Database user from Step 2]
DATABASE_PASSWORD         = [Database password from Step 2]
JWT_SECRET                = [Generate: openssl rand -base64 32]
STRIPE_API_KEY            = sk_live_xxxxx (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET     = whsec_xxxxx (create webhook in Stripe)
MAIL_HOST                 = smtp-relay.brevo.com
MAIL_PORT                 = 587
MAIL_USERNAME             = [Your Brevo email]
MAIL_PASSWORD             = [Your Brevo SMTP password]
EMAIL_FROM                = masjid@yourdomain.com
BREVO_API_KEY             = [Your Brevo API key]
FRONTEND_URL              = https://[your-render-url].onrender.com
VITE_API_URL              = https://[your-render-url].onrender.com
VITE_STRIPE_PK            = pk_live_xxxxx (Stripe publishable key)
UPLOAD_DIR                = /app/uploads
```

#### Optional Variables:
```
PORT                      = 8080 (Render auto-sets this)
```

### Step 5: Initialize Database

After first deployment, connect to your database and run:

1. Go to your PostgreSQL service on Render
2. Click **"Connect"** → **"External Connection"**
3. Use a PostgreSQL client (like DBeaver or psql) to connect
4. Run the initialization scripts:

```sql
-- From backend/setup-database.sql
-- Create tables, indexes, etc.

-- Create admin user
-- From backend/create-admin.sql
```

Or use the Render shell:
```bash
# In Render Web Service shell
psql $DATABASE_URL -f /app/backend/setup-database.sql
```

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your application
3. Wait for build to complete (5-10 minutes for first deploy)
4. Access your app at `https://your-app-name.onrender.com`

---

## Option 2: Separate Containers (Microservices)

### Using docker-compose.yml with Render Blueprint

You can use the existing `render.yaml` file with separate services:

```bash
# Push your render.yaml
git add render.yaml
git commit -m "Add Render blueprint"
git push
```

Then on Render:
1. Click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Select `render.yaml`
4. Review and create all services

This will create:
- PostgreSQL database
- Backend web service (using `backend/Dockerfile`)
- Frontend static site

---

## Database Setup

### Manual Database Initialization

1. **Connect to Database**:
   ```bash
   # Get connection string from Render Dashboard
   psql [your-database-url]
   ```

2. **Run Setup Scripts**:
   ```sql
   -- Run setup-database.sql
   \i backend/setup-database.sql
   
   -- Create admin user
   \i backend/create-admin.sql
   
   -- Create campaigns table
   \i backend/create-campaigns-table.sql
   
   -- Create questions table
   \i backend/create-questions-table.sql
   ```

### Automatic Initialization (Recommended)

Add to your `backend/Dockerfile`:
```dockerfile
# Copy SQL initialization scripts
COPY setup-database.sql /app/
COPY create-admin.sql /app/
COPY create-campaigns-table.sql /app/
COPY create-questions-table.sql /app/
```

Then run via application startup or manually after first deploy.

---

## Environment Variables

### Generate Secure Secrets

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Or use a password generator
```

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get **API Keys**:
   - Publishable key: `pk_live_xxxxx` → `VITE_STRIPE_PK`
   - Secret key: `sk_live_xxxxx` → `STRIPE_API_KEY`
3. Create **Webhook**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-app.onrender.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Get webhook secret: `whsec_xxxxx` → `STRIPE_WEBHOOK_SECRET`

### Brevo (Email) Setup

1. Sign up at [brevo.com](https://brevo.com)
2. Go to **SMTP & API** → **SMTP**
3. Get credentials:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: Your Brevo email
   - Password: Generated SMTP password
4. Get **API Key** from API Keys section

---

## Post-Deployment

### 1. Test Your Application

```bash
# Health check
curl https://your-app.onrender.com/actuator/health

# Test API
curl https://your-app.onrender.com/api/prayer-times/today
```

### 2. Create Admin User

```bash
# Using Render shell
psql $DATABASE_URL

# Then run:
INSERT INTO users (username, email, password, role, created_at)
VALUES ('admin', 'admin@masjid.com', '$2a$10$...', 'ADMIN', NOW());
```

Or use the admin creation endpoint if available.

### 3. Configure Domain (Optional)

1. Go to your web service settings
2. Click **"Custom Domain"**
3. Add your domain (e.g., `masjid.yourdomain.com`)
4. Update DNS records as instructed

### 4. Enable Persistent Storage (Paid Plans)

For file uploads:
1. Go to web service → **"Disks"**
2. Add disk: `/app/uploads` (500GB free on paid plans)
3. Redeploy

---

## Troubleshooting

### Build Fails

**Issue**: Docker build timeout or fails
**Solution**: 
- Check Dockerfile syntax
- Ensure all files are committed to Git
- Check build logs in Render dashboard

### Database Connection Issues

**Issue**: `Connection refused` or `Connection timeout`
**Solution**:
- Use **Internal Database URL** (not external)
- Format: `postgresql://user:pass@hostname:5432/dbname`
- Ensure DATABASE_USERNAME and DATABASE_PASSWORD match

### Port Binding Issues

**Issue**: Application won't start - wrong port
**Solution**:
- Render sets `$PORT` automatically
- Ensure `server.port=${PORT:8080}` in application.yml
- Dockerfile should use: `java -Dserver.port=${PORT:-8080} -jar app.jar`

### Frontend Can't Connect to Backend

**Issue**: API calls fail with CORS errors
**Solution**:
- Set `FRONTEND_URL` to your Render URL
- Update `VITE_API_URL` to backend URL
- Check CORS configuration in SecurityConfig.java

### File Uploads Not Persisting

**Issue**: Uploaded files disappear after redeploy
**Solution**:
- Use external storage (AWS S3, Cloudinary)
- Or enable Render Disk (paid plans only)

---

## Monitoring & Maintenance

### View Logs
```bash
# In Render Dashboard
# Go to Web Service → Logs tab
```

### Auto-Deploy on Push
- Enabled by default
- Push to `master` branch triggers auto-deploy
- Can disable in service settings

### Health Checks
- Endpoint: `/actuator/health`
- Render monitors this automatically
- Restarts service if unhealthy

### Database Backups
- Free tier: No automatic backups
- Paid plans: Daily backups with point-in-time recovery

---

## Cost Optimization

### Free Tier Limits
- Web Services: 750 hours/month (one always-on service)
- PostgreSQL: 90 days free, then $7/month
- Services sleep after 15 min inactivity (free tier)

### Recommendations
- Use **single container** for free tier (Option 1)
- Use **separate containers** for production (Option 2)
- Consider **Render's Starter plan** ($7/month) for production:
  - No sleep on inactivity
  - 512MB RAM
  - Better performance

---

## Additional Resources

- [Render Docker Documentation](https://render.com/docs/docker)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Disks](https://render.com/docs/disks)
- [Render Blueprints](https://render.com/docs/infrastructure-as-code)

---

## Support

For issues specific to this application:
- Open an issue on GitHub
- Check existing documentation in `/docs`

For Render-specific issues:
- [Render Support](https://render.com/docs)
- [Render Community](https://community.render.com)

---

**🎉 Congratulations!** Your Masjid application is now deployed on Render!
