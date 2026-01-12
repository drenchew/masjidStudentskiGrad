# Deployment Guide

## Free Hosting Setup

### 1. Backend (Railway Free Tier)

1. Sign up at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create a new project from the repo
4. Add PostgreSQL database service
5. Add environment variables in Railway dashboard
6. Deploy automatically on push to main

**Railway provides:**
- 512 MB RAM
- 1 GB Disk
- Free PostgreSQL database

### 2. Frontend (Vercel Free Tier)

1. Sign up at [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
5. Deploy

**Vercel provides:**
- Unlimited bandwidth
- Automatic HTTPS
- Global CDN

### 3. Database (Neon Free Tier)

Alternative to Railway PostgreSQL:

1. Sign up at [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string
4. Add to Railway environment variables

**Neon provides:**
- 10 GB storage
- 100 hours of compute per month
- Automatic backups

### 4. File Storage (Cloudinary Free Tier)

1. Sign up at [Cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Update backend to use Cloudinary SDK
4. Store images/audio/video in cloud

**Cloudinary provides:**
- 10 GB storage
- 25 GB bandwidth/month

### 5. Email (Brevo Free Tier)

1. Sign up at [Brevo.com](https://www.brevo.com)
2. Verify your domain
3. Get SMTP credentials
4. Add to environment variables

**Brevo provides:**
- 300 emails/day
- SMTP access
- Contact management

## Environment Variables for Production

Set these in Railway dashboard:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=generate-strong-random-string-here
STRIPE_API_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_smtp_password
EMAIL_FROM=masjid@studentskigrad.com
BREVO_API_KEY=your_api_key
FRONTEND_URL=https://masjid-studentskigrad.vercel.app
PORT=8080
```

## Custom Domain (Free)

### Option 1: Freenom
- Get free .tk, .ml, .ga, .cf, or .gq domain
- Configure DNS to point to Vercel

### Option 2: Free Subdomain
- Use Railway subdomain: `your-app.railway.app`
- Use Vercel subdomain: `your-app.vercel.app`

## Monitoring

- Railway provides automatic logs
- Vercel provides analytics
- Set up Sentry for error tracking (free tier available)

## Scaling Later

When you raise funds:
- Upgrade Railway to Pro ($5/month)
- Get custom domain (.com, .bg)
- Upgrade Brevo for more emails
- Add Redis for caching
- Implement CDN for media files

## Estimated Monthly Costs

**Free tier (initially):**
- Backend: $0 (Railway free tier)
- Frontend: $0 (Vercel free tier)
- Database: $0 (Neon free tier)
- Email: $0 (Brevo 300 emails/day)
- File Storage: $0 (Cloudinary 10GB)

**Total: $0/month**

**After growth:**
- Railway Pro: $5/month
- Domain (.bg): $10-15/year
- Brevo Starter: $25/month (20k emails)
- Cloudinary Plus: $89/month (if needed)

**Total: ~$35-40/month**
