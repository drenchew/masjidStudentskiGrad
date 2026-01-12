# Deployment Guide - Step by Step

This guide will help you deploy the Masjid Studentski Grad website to production using free hosting services.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment)
3. [Frontend Deployment (Vercel)](#frontend-deployment)
4. [Alternative Deployment Options](#alternative-options)
5. [Post-Deployment Setup](#post-deployment)

---

## Prerequisites

Before deploying, you need:

1. **GitHub Account** - To store your code
2. **Stripe Account** - For payment processing (stripe.com)
3. **Brevo Account** - For email service (brevo.com - 300 emails/day free)
4. **Railway Account** - For backend hosting (railway.app)
5. **Vercel Account** - For frontend hosting (vercel.com)

---

## Step 1: Prepare Your Repository

### 1.1 Create `.env` Files Locally (DO NOT COMMIT)

**Backend `.env`** (in `backend/` directory):
```bash
cp .env.example .env
```

Edit with your actual values:
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=generate-a-long-random-string-min-32-chars
STRIPE_API_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_email
MAIL_PASSWORD=your_brevo_smtp_password
EMAIL_FROM=masjid@yourdomain.com
BREVO_API_KEY=your_brevo_api_key
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend `.env`** (in `frontend/` directory):
```bash
cp .env.example .env
```

Edit with your values:
```bash
VITE_API_URL=https://your-backend.railway.app
VITE_STRIPE_PK=pk_live_your_stripe_public_key
```

### 1.2 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Masjid Studentski Grad"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/masjid-studentski-grad.git
git branch -M main
git push -u origin main
```

---

## Step 2: Backend Deployment (Railway)

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `masjid-studentski-grad` repository
5. Railway will detect it's a Java Spring Boot project

### 2.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. Copy the connection string (it's automatically set as `DATABASE_URL`)

### 2.3 Configure Environment Variables

In Railway project settings → **Variables**, add:

```bash
DATABASE_URL=<automatically set by Railway>
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<automatically set by Railway>
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
STRIPE_API_KEY=sk_live_your_stripe_api_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_email
MAIL_PASSWORD=your_brevo_smtp_password
EMAIL_FROM=masjid@yourdomain.com
BREVO_API_KEY=your_brevo_api_key
FRONTEND_URL=https://your-frontend.vercel.app
UPLOAD_DIR=/app/uploads
PORT=8080
```

### 2.4 Configure Build Settings

Railway usually auto-detects Spring Boot, but verify:

- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/studentski-grad-*.jar`
- **Root Directory**: `backend`

### 2.5 Deploy

1. Click **"Deploy"** - Railway will build and deploy
2. Once deployed, click **"Settings"** → **"Generate Domain"**
3. Copy your backend URL (e.g., `https://masjid-backend.railway.app`)

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your `masjid-studentski-grad` repository
4. Vercel will detect it's a Vite project

### 3.2 Configure Project Settings

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
VITE_API_URL=https://your-backend.railway.app
VITE_STRIPE_PK=pk_live_your_stripe_public_key
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Copy your frontend URL (e.g., `https://masjid-studentski-grad.vercel.app`)

### 3.5 Update Backend CORS

Go back to Railway and update the `FRONTEND_URL` variable with your Vercel URL:
```bash
FRONTEND_URL=https://masjid-studentski-grad.vercel.app
```

Redeploy the backend.

---

## Step 4: Post-Deployment Setup

### 4.1 Configure Stripe Webhooks

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter webhook URL: `https://your-backend.railway.app/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and update Railway's `STRIPE_WEBHOOK_SECRET`

### 4.2 Initialize Database

SSH into Railway or use Railway CLI to run initialization:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database setup
railway run psql $DATABASE_URL -f setup-database.sql
```

Or use Railway's PostgreSQL client to run the SQL scripts manually.

### 4.3 Create Admin User

Run the `create-admin.sql` script or use the backend API:

```bash
# Generate password hash
echo -n "your_password" | sha256sum

# Then manually insert into database or use your admin creation endpoint
```

### 4.4 Configure Custom Domain (Optional)

**Vercel**:
1. Go to Project Settings → **Domains**
2. Add your custom domain (e.g., `masjid-studentskigrad.com`)
3. Update DNS records as instructed by Vercel

**Railway**:
1. Go to Project Settings → **Domains**
2. Add custom domain for backend (e.g., `api.masjid-studentskigrad.com`)
3. Update DNS records

### 4.5 Test Everything

1. Visit your frontend URL
2. Test prayer times display
3. Test donations with Stripe test mode first
4. Test admin login
5. Test email notifications
6. Test product ordering

---

## Alternative Deployment Options

### Option 1: All-in-One on Railway

Deploy both frontend and backend on Railway:

```yaml
# railway.toml for backend
[build]
builder = "NIXPACKS"
buildCommand = "mvn clean package -DskipTests"

[deploy]
startCommand = "java -jar target/studentski-grad-*.jar"
```

### Option 2: Docker Deployment

Use the included `docker-compose.yml`:

1. Get a VPS (DigitalOcean, Linode, AWS EC2)
2. Install Docker and Docker Compose
3. Clone your repo
4. Create `.env` file
5. Run: `docker-compose up -d`

### Option 3: Render (Alternative to Railway)

1. Go to [render.com](https://render.com)
2. Create **Web Service** from your GitHub repo
3. Similar setup to Railway
4. Free tier includes: 750 hours/month, PostgreSQL database

### Option 4: Fly.io (Alternative to Railway)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly launch`
3. Follow prompts to deploy

---

## Monitoring and Maintenance

### View Logs

**Railway**:
- Click on your service → **Logs**

**Vercel**:
- Project → **Deployments** → Click deployment → **Logs**

### Database Backups

**Railway**:
- PostgreSQL plugin includes automatic daily backups
- Can create manual backups in database settings

### Update Deployment

Just push to GitHub:
```bash
git add .
git commit -m "Update features"
git push
```

Both Railway and Vercel will automatically redeploy!

---

## Troubleshooting

### Backend won't start
- Check Railway logs
- Verify all environment variables are set
- Check database connection string

### Frontend shows API errors
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify backend is running

### Stripe webhooks failing
- Check webhook URL is correct
- Verify webhook secret matches
- Check webhook events are selected

### Emails not sending
- Verify Brevo credentials
- Check email sending quota
- View Brevo dashboard for failed emails

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Railway | $5 credit/month | 512MB RAM, 1GB storage |
| Vercel | Unlimited | 100GB bandwidth/month |
| PostgreSQL (Railway) | Included | 1GB storage |
| Stripe | Free | Standard processing fees |
| Brevo | Free | 300 emails/day |

**Total: FREE** (within limits)

For production with higher traffic, expect ~$20-50/month.

---

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] Stripe webhook secret configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)
- [ ] File upload size limits set
- [ ] Admin endpoints protected

---

## Support

For issues or questions:
1. Check Railway/Vercel documentation
2. Review application logs
3. Check GitHub issues
4. Contact support

Good luck with your deployment! 🚀
