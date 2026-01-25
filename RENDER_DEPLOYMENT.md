# Render Deployment Guide

This guide explains how to deploy your Masjid Studentski Grad project to Render using their managed services.

## Architecture

- **Frontend**: Deployed to Vercel (React/Vite static site)
- **Backend**: Deployed to Render (Spring Boot Docker container)
- **Database**: Render Managed PostgreSQL
- **Email**: Brevo SMTP

## Step-by-Step Deployment

### 1. Create Render PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `masjid-db` (or your choice)
   - **Database**: `masjid_db`
   - **User**: `postgres` (or custom)
   - **Region**: Select your closest region
4. Click **"Create Database"**
5. Wait for the database to be created
6. Copy the **"Internal Database URL"** (starts with `postgresql://`)
   - This is your `DATABASE_URL`

### 2. Create Render Web Service (Backend)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `masjid-backend`
   - **Region**: Same as your database
   - **Branch**: `master`
   - **Runtime**: `Docker`
   - **Build Command**: (leave blank, Docker handles it)
   - **Start Command**: (leave blank, Docker handles it)
4. Click **"Create Web Service"**

### 3. Set Environment Variables in Render

1. Go to your backend service → **"Environment"**
2. Add all variables from your `.env` file:

```
DATABASE_URL=postgresql://user:password@host:port/masjid_db
JWT_SECRET=your_jwt_secret_here
STRIPE_API_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=(leave empty for now, set after webhook setup)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_FROM=your-email@example.com
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_username
MAIL_PASSWORD=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key
```

3. Click **"Save"**
4. Render will auto-deploy

### 4. Wait for Backend to Deploy

1. Check the **"Logs"** tab to see build progress
2. Once deployed, you'll get a URL like `https://masjid-backend.onrender.com`
3. Test health check:
   ```bash
   curl https://masjid-backend.onrender.com/actuator/health
   ```

### 5. Set Up Stripe Webhook

1. Get your backend URL from Render (e.g., `https://masjid-backend.onrender.com`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click **"Add Endpoint"**
4. Enter: `https://masjid-backend.onrender.com/api/stripe/webhook`
5. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
6. Click **"Add Endpoint"**
7. Copy the **"Signing Secret"** and update in Render:
   - Go back to your Render backend service
   - Environment → Add/Update `STRIPE_WEBHOOK_SECRET`
   - Render will redeploy automatically

### 6. Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables:
   ```
   VITE_API_URL=https://masjid-backend.onrender.com
   VITE_STRIPE_PK=pk_live_your_public_key
   ```
6. Click **"Deploy"**
7. You'll get a Vercel URL (e.g., `https://masjid.vercel.app`)

### 7. Update CORS and Webhook URLs

1. Go back to Render backend → Environment
2. Update:
   ```
   CORS_ALLOWED_ORIGINS=https://masjid.vercel.app
   FRONTEND_URL=https://masjid.vercel.app
   ```
3. Render will redeploy

### 8. Test Your Deployment

1. Visit your frontend: `https://masjid.vercel.app`
2. Test API connection: Backend should respond without CORS errors
3. Test payments: Use Stripe test cards
4. Test emails: Trigger email functionality (newsletter, contact form, etc.)

## Environment Variables Reference

| Variable | Format | Example | Notes |
|----------|--------|---------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | From Render Postgres | Required |
| `JWT_SECRET` | Base64 or hex string, min 32 chars | Use `openssl rand -hex 32` | Required |
| `STRIPE_API_KEY` | `sk_live_...` | From Stripe | Required |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe Webhook | Required after webhook setup |
| `CORS_ALLOWED_ORIGINS` | Comma-separated URLs | `https://masjid.vercel.app` | Required |
| `FRONTEND_URL` | HTTPS URL | `https://masjid.vercel.app` | Required |
| `VITE_API_URL` | HTTPS URL | `https://masjid-backend.onrender.com` | For frontend |
| `VITE_STRIPE_PK` | `pk_live_...` | From Stripe | For frontend |
| `EMAIL_FROM` | Email address | `noreply@masjid.com` | Required |
| `MAIL_*` | SMTP credentials | From Brevo | Required |

## Troubleshooting

### Backend won't start
- Check logs in Render: Logs tab
- Verify `DATABASE_URL` format is correct
- Ensure all required environment variables are set

### CORS errors
- Update `CORS_ALLOWED_ORIGINS` to match your Vercel URL
- Restart/redeploy backend

### Database connection failed
- Check `DATABASE_URL` is accessible from Render
- Verify database credentials
- Ensure Render Postgres is running

### Stripe webhooks not working
- Verify webhook URL is correct and accessible
- Check `STRIPE_WEBHOOK_SECRET` is set
- Test with Stripe CLI locally first

## Cost Estimates (as of Jan 2025)

- **Render PostgreSQL**: $15/month (free tier available with 90-day expiry)
- **Render Web Service**: ~$10-15/month (free tier if kept idle)
- **Vercel Frontend**: Free tier or Pro ($20/month)
- **Total**: ~$25-50/month for production

## Next Steps

1. Monitor logs and metrics in Render dashboard
2. Set up database backups
3. Configure custom domain (optional)
4. Set up auto-deploys for new commits
5. Monitor Stripe webhook events

For support:
- Render Support: https://render.com/support
- Vercel Support: https://vercel.com/support
- Stripe Support: https://stripe.com/support
