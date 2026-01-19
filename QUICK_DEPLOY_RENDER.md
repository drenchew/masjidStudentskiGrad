# 🚀 Quick Deploy to Render - Cheat Sheet

## Prerequisites Checklist
- [ ] GitHub account with repository pushed
- [ ] Render account created at render.com
- [ ] Stripe account (for payments)
- [ ] Brevo account (for emails) - optional

## 🎯 Fast Track Deployment (5 minutes)

### Step 1: Push to GitHub (if not done)
```bash
git add .
git commit -m "Docker configuration for Render"
git push origin master
```

### Step 2: Create Services on Render

#### A. Create Database
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Name: `masjid-db`
4. Plan: **Free**
5. Click **Create Database**
6. **Copy Internal Database URL** (starts with `postgresql://`)

#### B. Create Backend
1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - Name: `masjid-backend`
   - Environment: **Docker**
   - Dockerfile Path: `backend/Dockerfile`
   - Docker Context: `backend`
   - Plan: **Free**
4. Click **Advanced** → Add Environment Variables:
   ```
   DATABASE_URL = [paste Internal Database URL from step A.6]
   DATABASE_USERNAME = postgres
   DATABASE_PASSWORD = [from database credentials]
   JWT_SECRET = [run: openssl rand -base64 32]
   STRIPE_API_KEY = sk_live_xxxx
   STRIPE_WEBHOOK_SECRET = whsec_xxxx
   MAIL_HOST = smtp-relay.brevo.com
   MAIL_PORT = 587
   MAIL_USERNAME = your_email
   MAIL_PASSWORD = your_smtp_pass
   EMAIL_FROM = masjid@yourdomain.com
   BREVO_API_KEY = your_api_key
   FRONTEND_URL = https://[will-add-after-frontend]
   UPLOAD_DIR = /app/uploads
   ```
5. Click **Create Web Service**

#### C. Create Frontend
1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - Name: `masjid-frontend`
   - Environment: **Docker**
   - Dockerfile Path: `frontend/Dockerfile`
   - Docker Context: `frontend`
   - Plan: **Free**
4. Add Environment Variables:
   ```
   VITE_API_URL = https://masjid-backend.onrender.com
   VITE_STRIPE_PK = pk_live_xxxx
   ```
5. Click **Create Web Service**

#### D. Update Backend FRONTEND_URL
1. Go back to backend service
2. Environment → Edit `FRONTEND_URL`
3. Set to: `https://masjid-frontend.onrender.com`
4. Save (triggers redeploy)

### Step 3: Initialize Database

1. Go to PostgreSQL service
2. Click **Connect** → **External Connection**
3. Copy connection command
4. Run on your local machine:
```bash
psql [connection-string] -f backend/setup-database.sql
psql [connection-string] -f backend/create-admin.sql
```

### Step 4: Setup Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://masjid-backend.onrender.com/api/stripe/webhook`
4. Events: `checkout.session.completed`, `customer.subscription.deleted`
5. Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET` in Render

## ✅ Verification

```bash
# Check backend health
curl https://masjid-backend.onrender.com/actuator/health

# Check frontend
open https://masjid-frontend.onrender.com
```

## 🆘 Common Issues

### Backend won't start
- Check DATABASE_URL format: `postgresql://user:pass@host:5432/dbname` (NOT jdbc:postgresql)
- Verify all required env vars are set
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify VITE_API_URL points to backend URL
- Check CORS settings in backend SecurityConfig
- Ensure FRONTEND_URL is set in backend

### Database connection fails
- Use **Internal Database URL**, not external
- Ensure backend and database are in same region
- Check database credentials match

## 💰 Cost
- **Free tier**: $0/month (all services free for 90 days)
- After 90 days: Database $7/month (other services still free)
- Services sleep after 15min inactivity (free tier)

## 📝 URLs You'll Get
- Frontend: `https://masjid-frontend.onrender.com`
- Backend: `https://masjid-backend.onrender.com`
- Database: Internal only (not public)

## 🔄 Updates
```bash
# Any git push to master auto-deploys
git add .
git commit -m "Update"
git push origin master
# Wait 2-5 minutes for deploy
```

## 📚 Full Documentation
- Detailed guide: [RENDER_DOCKER_DEPLOYMENT.md](./RENDER_DOCKER_DEPLOYMENT.md)
- Docker info: [DOCKER_README.md](./DOCKER_README.md)
- General deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**That's it!** Your mosque website is live! 🕌
