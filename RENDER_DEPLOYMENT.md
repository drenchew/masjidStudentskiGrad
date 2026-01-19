# Render Deployment Guide

## Quick Deploy Options

### Option 1: One-Click Deploy (Recommended)

1. **Push to GitHub** (if you haven't already):
   ```bash
   git add .
   git commit -m "Add Render configuration"
   git push origin master
   ```

2. **Connect to Render**:
   - Go to https://render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select `masjidStudentskiGrad` repository
   - Render will read `render.yaml` and create all services automatically!

3. **Set Required Secrets** (in Render Dashboard):
   After services are created, add these environment variables:
   
   **Backend (`masjid-backend`):**
   - `JWT_SECRET` - Generate a strong 32+ char string
   - `STRIPE_API_KEY` - Your Stripe secret key (sk_live_... or sk_test_...)
   - `STRIPE_WEBHOOK_SECRET` - From Stripe webhook setup
   - `MAIL_USERNAME` - Your Brevo email
   - `MAIL_PASSWORD` - Your Brevo SMTP password
   - `EMAIL_FROM` - Your sender email
   - `BREVO_API_KEY` - Your Brevo API key
   
   **Frontend (`masjid-frontend`):**
   - `VITE_STRIPE_PK` - Your Stripe publishable key (pk_live_... or pk_test_...)

4. **Done!** 🎉
   - Backend will be at: `https://masjid-backend.onrender.com`
   - Frontend will be at: `https://masjid-frontend.onrender.com`

---

### Option 2: Manual Setup (No render.yaml)

If you prefer to set up services manually:

#### A. Create PostgreSQL Database

1. Go to https://render.com/dashboard
2. Click "New" → "PostgreSQL"
3. Name: `masjid-db`
4. Database: `masjid_db`
5. User: `masjid_user`
6. Plan: Free
7. Click "Create Database"
8. **Copy the Internal Database URL** (starts with `postgresql://`)

#### B. Create Backend Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `masjid-backend`
   - **Region**: Frankfurt (or closest to you)
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Runtime**: Java
   - **Build Command**: 
     ```bash
     cd backend && mvn clean package -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -jar backend/target/studentski-grad-*.jar
     ```
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   DATABASE_URL=<paste-internal-database-url>
   DATABASE_USERNAME=masjid_user
   DATABASE_PASSWORD=<from-database>
   JWT_SECRET=<generate-long-random-string>
   STRIPE_API_KEY=sk_test_or_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=587
   MAIL_USERNAME=<your-brevo-email>
   MAIL_PASSWORD=<your-brevo-smtp-password>
   EMAIL_FROM=<your-sender-email>
   BREVO_API_KEY=<your-brevo-api-key>
   FRONTEND_URL=https://masjid-frontend.onrender.com
   UPLOAD_DIR=/var/data/uploads
   PORT=8080
   ```

5. Click "Create Web Service"

#### C. Create Frontend Service

1. Click "New" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `masjid-frontend`
   - **Region**: Frankfurt
   - **Branch**: `master`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://masjid-backend.onrender.com
   VITE_STRIPE_PK=pk_test_or_live_...
   ```

5. Click "Create Static Site"

---

### Option 3: Using Docker (Alternative)

If you prefer Docker:

#### Backend with Docker

1. Create Web Service
2. Choose "Docker"
3. **Dockerfile Path**: `backend/Dockerfile`
4. Add same environment variables as above

#### Frontend with Docker

1. Create Web Service (not Static Site)
2. Choose "Docker"
3. **Dockerfile Path**: `frontend/Dockerfile`
4. Expose port: 80
5. Add environment variables

---

## Post-Deployment Setup

### 1. Initialize Database

After backend is deployed, run migrations:

```bash
# Get shell access to backend
# Render Dashboard → masjid-backend → Shell

# Or use database connection directly
psql $DATABASE_URL -f backend/setup-database.sql
```

### 2. Create Admin User

```bash
psql $DATABASE_URL -f backend/create-admin.sql
```

### 3. Configure Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://masjid-backend.onrender.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing Secret** (whsec_...)
6. Add to Render backend environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
7. Redeploy backend

### 4. Update Frontend URL in Backend

After frontend is deployed, update backend:
```
FRONTEND_URL=https://masjid-frontend.onrender.com
```

---

## Free Tier Limits

**Render Free Plan:**
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Auto-sleep after 15min inactivity (first request wakes it ~30s)
- ✅ PostgreSQL: 1GB storage, 97 connection limit
- ✅ HTTPS included
- ✅ Custom domain support

**Tips:**
- Backend sleeps after inactivity → first request slow
- Use a ping service (e.g., UptimeRobot) to keep it awake
- Free tier resets monthly

---

## Custom Domain (Optional)

### Backend
1. Render Dashboard → masjid-backend → Settings → Custom Domain
2. Add: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   CNAME api.yourdomain.com → masjid-backend.onrender.com
   ```

### Frontend
1. Render Dashboard → masjid-frontend → Settings → Custom Domain
2. Add: `yourdomain.com` or `www.yourdomain.com`
3. Add A/CNAME records as instructed

---

## Monitoring & Logs

**View Logs:**
- Render Dashboard → Service → Logs tab
- Real-time streaming logs

**Metrics:**
- Dashboard shows CPU, Memory, Request volume

**Health Checks:**
- Backend health: `https://masjid-backend.onrender.com/api/prayer-times`
- Frontend: `https://masjid-frontend.onrender.com`

---

## Troubleshooting

### Backend won't start
- Check logs in Render Dashboard
- Verify all environment variables are set
- Check DATABASE_URL format
- Ensure Java 17 is specified (should auto-detect from pom.xml)

### Frontend shows API errors
- Verify VITE_API_URL points to backend
- Check CORS settings in backend
- Ensure backend is running

### Database connection fails
- Use Internal Database URL (not External)
- Format: `postgresql://user:pass@host/dbname`
- Check database is running in Render

### Free tier sleeping
- Add UptimeRobot monitor (free)
- Pings every 5 minutes to keep service awake
- Or upgrade to paid plan ($7/month)

---

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Web Service (Backend) | FREE (with sleep) | $7/month (always on) |
| Static Site (Frontend) | FREE | FREE |
| PostgreSQL | FREE (1GB) | $7/month (10GB+) |
| **Total** | **FREE** | **~$14/month** |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect to Render
3. ✅ Deploy via Blueprint or Manual
4. ✅ Set environment variables
5. ✅ Initialize database
6. ✅ Configure Stripe webhooks
7. ✅ Test the application
8. ✅ (Optional) Add custom domain
9. ✅ Share with the community! 🕌

---

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Your Deployment Guide: This file!

Good luck with your deployment! May Allah accept this project. 🤲
