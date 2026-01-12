# Pre-Push Checklist for GitHub

Complete this checklist before pushing your code to GitHub and deploying to production.

## ✅ Code Preparation

### 1. Environment Variables
- [ ] Created `.env.example` files (backend and frontend)
- [ ] All sensitive data removed from code
- [ ] No hardcoded passwords, API keys, or secrets
- [ ] Database credentials use environment variables
- [ ] JWT secret uses environment variable
- [ ] Stripe keys use environment variables
- [ ] Email credentials use environment variables

### 2. Git Configuration
- [ ] `.gitignore` is complete and tested
- [ ] `.env` files are NOT tracked by git
- [ ] `uploads/` directory is NOT tracked
- [ ] `node_modules/` is NOT tracked
- [ ] `target/` directory is NOT tracked
- [ ] IDE-specific files are ignored

### 3. Code Quality
- [ ] No console.log() statements in production code
- [ ] No commented-out code blocks
- [ ] Code is properly formatted
- [ ] No TODO comments that need addressing
- [ ] Error handling is implemented
- [ ] Input validation is in place

### 4. Security
- [ ] CORS is properly configured
- [ ] JWT secret is strong (min 32 characters)
- [ ] Database passwords are strong
- [ ] File upload restrictions are in place
- [ ] Rate limiting is configured (if needed)
- [ ] SQL injection prevention (using JPA)
- [ ] XSS prevention implemented
- [ ] Admin endpoints are protected

### 5. Documentation
- [ ] README.md is complete and accurate
- [ ] API documentation is updated
- [ ] Deployment guide is clear
- [ ] Environment variables are documented
- [ ] Installation instructions work

---

## 🔧 Backend Checklist

### Database
- [ ] Migration scripts are ready (`setup-database.sql`)
- [ ] Admin user creation script exists (`create-admin.sql`)
- [ ] Database schema is documented
- [ ] Indexes are in place for performance
- [ ] Foreign key constraints are defined

### Configuration
- [ ] `application.yml` uses environment variables
- [ ] CORS allows correct frontend URL
- [ ] File upload limits are reasonable
- [ ] Database connection pool is configured
- [ ] Email service is configured
- [ ] Stripe API is configured

### Dependencies
- [ ] All dependencies in `pom.xml` are necessary
- [ ] No vulnerable dependencies (run `mvn dependency-check`)
- [ ] Version numbers are specified

### Testing
- [ ] Unit tests pass (`mvn test`)
- [ ] Integration tests pass
- [ ] API endpoints are tested
- [ ] Error scenarios are handled

### Build
- [ ] Maven build succeeds (`mvn clean package`)
- [ ] JAR file is generated correctly
- [ ] Application starts without errors
- [ ] Health check endpoint works

---

## 🎨 Frontend Checklist

### Configuration
- [ ] API URL uses environment variable
- [ ] Stripe public key uses environment variable
- [ ] No hardcoded backend URLs
- [ ] Build process works (`npm run build`)

### Dependencies
- [ ] All dependencies in `package.json` are necessary
- [ ] No vulnerable dependencies (run `npm audit`)
- [ ] Version numbers are specified

### Code Quality
- [ ] ESLint passes (`npm run lint`)
- [ ] No console errors in browser
- [ ] No warnings in build process
- [ ] Components are properly structured

### Responsive Design
- [ ] Works on mobile devices
- [ ] Works on tablets
- [ ] Works on desktop
- [ ] RTL works for Arabic language

### Performance
- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] Lazy loading is implemented
- [ ] Code splitting is configured

---

## 🐳 Docker Checklist (Optional)

- [ ] `Dockerfile` for backend exists
- [ ] `Dockerfile` for frontend exists
- [ ] `docker-compose.yml` is configured
- [ ] `.dockerignore` files exist
- [ ] Docker images build successfully
- [ ] Docker containers run successfully
- [ ] Health checks are configured
- [ ] Volume mounts are correct
- [ ] Network configuration works
- [ ] Environment variables pass correctly

---

## 🚀 Deployment Preparation

### Hosting Accounts
- [ ] Railway account created (backend)
- [ ] Vercel account created (frontend)
- [ ] Stripe account configured
- [ ] Brevo/Sendinblue account configured
- [ ] Domain registered (if using custom domain)

### External Services
- [ ] Stripe test mode works
- [ ] Stripe live mode configured
- [ ] Stripe webhook endpoint configured
- [ ] Email sending tested
- [ ] Email templates are correct
- [ ] Prayer times API tested

### Database
- [ ] Backup strategy planned
- [ ] Migration scripts ready
- [ ] Seed data prepared (if needed)
- [ ] Database credentials secured

### CI/CD
- [ ] GitHub Actions workflow exists
- [ ] Build pipeline tested
- [ ] Test pipeline configured
- [ ] Deploy pipeline configured (optional)

---

## 📝 Git & GitHub Checklist

### Repository Setup
- [ ] Repository created on GitHub
- [ ] Repository is public or private as intended
- [ ] Repository description is clear
- [ ] Topics/tags are added
- [ ] LICENSE file exists
- [ ] .gitattributes configured (optional)

### Branches
- [ ] `main` branch is default
- [ ] Branch protection rules set (optional)
- [ ] Develop branch created (optional)

### Commits
- [ ] Commit messages are clear
- [ ] Commits are atomic (one feature per commit)
- [ ] No large files committed
- [ ] Git history is clean

### GitHub Features
- [ ] README renders correctly
- [ ] Issues template created (optional)
- [ ] PR template created (optional)
- [ ] Contributing guidelines added (optional)
- [ ] Code of conduct added (optional)

---

## 🧪 Pre-Deployment Testing

### Local Testing
- [ ] Backend runs on localhost:8080
- [ ] Frontend runs on localhost:3000
- [ ] Can create admin user
- [ ] Can login as admin
- [ ] Can create products
- [ ] Can create campaigns
- [ ] Can process donations
- [ ] Can send emails
- [ ] Prayer times load correctly
- [ ] Multilingual works (BG, EN, AR)

### Integration Testing
- [ ] Frontend connects to backend
- [ ] Authentication works
- [ ] File uploads work
- [ ] Stripe checkout works
- [ ] Email notifications work
- [ ] Newsletter subscription works
- [ ] Order tracking works

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## 🔒 Security Checklist

### Secrets Management
- [ ] All secrets in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] No API keys in code
- [ ] No database credentials in code
- [ ] JWT secret is unique and strong

### API Security
- [ ] HTTPS enforced (in production)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection

### Authentication
- [ ] Password hashing (BCrypt)
- [ ] JWT expiration set
- [ ] Refresh token logic (if implemented)
- [ ] Session management secure

---

## 📊 Post-Push Checklist

After pushing to GitHub:

- [ ] GitHub Actions workflows pass
- [ ] All files uploaded correctly
- [ ] README displays correctly
- [ ] Links in README work
- [ ] Issues can be created
- [ ] Repository is accessible

---

## 🌐 Post-Deployment Checklist

After deploying:

### Backend
- [ ] Railway deployment successful
- [ ] Database connected
- [ ] Environment variables set
- [ ] Health check passes
- [ ] Logs show no errors
- [ ] Custom domain configured (optional)

### Frontend
- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] Site loads correctly
- [ ] API connection works
- [ ] Stripe integration works
- [ ] Custom domain configured (optional)

### Services
- [ ] Stripe webhooks configured
- [ ] Webhook secret updated
- [ ] Test payment works
- [ ] Email sending works
- [ ] Prayer times load

### Monitoring
- [ ] Error tracking setup (optional)
- [ ] Uptime monitoring setup (optional)
- [ ] Performance monitoring setup (optional)

---

## 🎯 Final Verification

Run through complete user flows:

1. **Public User Flow**
   - [ ] Visit homepage
   - [ ] View prayer times
   - [ ] Browse products
   - [ ] Make donation
   - [ ] Subscribe to newsletter
   - [ ] Submit question

2. **Admin User Flow**
   - [ ] Login as admin
   - [ ] Create product
   - [ ] Create campaign
   - [ ] Upload khutbah
   - [ ] Process order
   - [ ] Send announcement
   - [ ] Answer question

3. **Error Handling**
   - [ ] Test 404 pages
   - [ ] Test invalid inputs
   - [ ] Test expired JWT
   - [ ] Test network errors
   - [ ] Test server errors

---

## ✨ You're Ready!

If all checkboxes are checked, you're ready to:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - Ready for production"
   git push -u origin main
   ```

2. Deploy to Railway (Backend)
3. Deploy to Vercel (Frontend)
4. Configure Stripe webhooks
5. Test everything in production
6. Share with the world! 🎉

---

## 📞 Need Help?

- Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Check [README.md](./README.md)
- Search [GitHub Issues](../../issues)
- Contact support

Good luck! 🚀
