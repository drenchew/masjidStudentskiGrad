# 🚀 How to Run the Project - Quick Start Guide

## Prerequisites

Before you start, make sure you have:
- ✅ Java 17 or higher installed
- ✅ Maven 3.8+ installed
- ✅ Node.js 16+ and npm installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Git (if cloning from repository)

Check your installations:
```bash
java -version
mvn -version
node -version
npm -version
psql --version
```

---

## 🗄️ Step 1: Database Setup

### 1.1 Start PostgreSQL
```bash
# On Linux
sudo systemctl start postgresql
sudo systemctl status postgresql

# On macOS (if using Homebrew)
brew services start postgresql

# On Windows
# Start PostgreSQL from Services or pgAdmin
```

### 1.2 Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database
CREATE DATABASE masjid_db;

# Create user (optional)
CREATE USER masjid_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE masjid_db TO masjid_user;

# Exit psql
\q
```

### 1.3 Run Database Setup Script
```bash
cd /home/dre/proj/masjidStudentskiGrad/backend

# Run the setup script (if it exists)
psql -U postgres -d masjid_db -f setup-database.sql

# Or create admin manually
psql -U postgres -d masjid_db -f create-admin.sql
```

---

## ⚙️ Step 2: Backend Configuration

### 2.1 Configure application.yml

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/masjid_db
    username: postgres
    password: your_postgres_password  # CHANGE THIS
  
  jpa:
    hibernate:
      ddl-auto: update  # Creates tables automatically
    show-sql: true

jwt:
  secret: YourSecureJWTSecretKeyHereAtLeast256BitsLong  # CHANGE THIS

stripe:
  api-key: sk_test_your_stripe_secret_key  # ADD YOUR KEY
  webhook-secret: whsec_your_webhook_secret  # ADD YOUR KEY

mail:
  host: smtp-relay.brevo.com
  port: 587
  username: your_brevo_email  # CHANGE THIS
  password: your_brevo_password  # CHANGE THIS

server:
  port: 8080
```

### 2.2 Alternative: Use Environment Variables

Instead of editing the file, you can set environment variables:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/masjid_db
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=your_password
export JWT_SECRET=YourSecureJWTSecretKey
export STRIPE_API_KEY=sk_test_your_stripe_key
```

---

## 🏃 Step 3: Run the Backend

### Option A: Using Maven (Recommended for Development)

```bash
# Navigate to backend directory
cd /home/dre/proj/masjidStudentskiGrad/backend

# Clean and install dependencies (first time)
mvn clean install

# Run the application
mvn spring-boot:run
```

You should see:
```
Started MasjidApplication in X seconds
```

Backend will be running on: **http://localhost:8080**

### Option B: Using the JAR file

```bash
# Navigate to backend directory
cd /home/dre/proj/masjidStudentskiGrad/backend

# Build the JAR
mvn clean package

# Run the JAR
java -jar target/studentski-grad-0.0.1-SNAPSHOT.jar
```

### Option C: Using the existing JAR (if already built)

```bash
cd /home/dre/proj/masjidStudentskiGrad/backend/target
java -jar studentski-grad-0.0.1-SNAPSHOT.jar
```

### Verify Backend is Running

Open browser or use curl:
```bash
# Check health
curl http://localhost:8080/actuator/health

# Or simply open in browser
# http://localhost:8080
```

---

## 💻 Step 4: Run the Frontend

### 4.1 Install Dependencies (First Time Only)

```bash
# Navigate to frontend directory
cd /home/dre/proj/masjidStudentskiGrad/frontend

# Install dependencies
npm install
```

This will install all required packages including:
- React
- React Router
- Axios
- Tailwind CSS
- i18next
- And all other dependencies

### 4.2 Start Development Server

```bash
# Make sure you're in the frontend directory
cd /home/dre/proj/masjidStudentskiGrad/frontend

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Frontend will be running on: **http://localhost:5173**

---

## 🎯 Step 5: Access the Application

### Public Pages
- **Home**: http://localhost:5173/
- **About**: http://localhost:5173/about
- **Prayer Times**: http://localhost:5173/prayer-times
- **Shop**: http://localhost:5173/shop
- **Donate**: http://localhost:5173/donate
- **Track Order**: http://localhost:5173/track-order

### Admin Pages
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **Manage Products**: http://localhost:5173/admin/products
- **Manage Orders**: http://localhost:5173/admin/orders
- **Manage Khutbahs**: http://localhost:5173/admin/khutbahs

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 🔧 Complete Workflow

### Terminal 1: Backend
```bash
cd /home/dre/proj/masjidStudentskiGrad/backend
mvn spring-boot:run
```
Keep this running...

### Terminal 2: Frontend
```bash
cd /home/dre/proj/masjidStudentskiGrad/frontend
npm run dev
```
Keep this running...

### Browser
Open: http://localhost:5173

---

## 🐛 Troubleshooting

### Backend Issues

#### Problem: "Port 8080 already in use"
```bash
# Find process using port 8080
lsof -i :8080  # On Linux/Mac
netstat -ano | findstr :8080  # On Windows

# Kill the process
kill -9 <PID>  # On Linux/Mac
taskkill /PID <PID> /F  # On Windows
```

#### Problem: "Could not connect to database"
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # Mac

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql  # Mac

# Check connection
psql -U postgres -d masjid_db
```

#### Problem: "Table doesn't exist"
```bash
# Set ddl-auto to create in application.yml
# Or run setup scripts
cd backend
psql -U postgres -d masjid_db -f setup-database.sql
```

#### Problem: Maven build fails
```bash
# Clean and rebuild
mvn clean install -U

# Skip tests if needed
mvn clean install -DskipTests
```

### Frontend Issues

#### Problem: "Cannot find module"
```bash
# Delete node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Problem: "Port 5173 already in use"
```bash
# Kill process on port 5173
lsof -i :5173  # Find PID
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

#### Problem: "Network error / API not responding"
- Check backend is running on http://localhost:8080
- Check `frontend/src/api/axios.js` has correct baseURL
- Check CORS is enabled in backend

#### Problem: Styles not loading
```bash
# Rebuild Tailwind
npm run build

# Or clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📊 Checking Everything Works

### 1. Test Backend API
```bash
# Test prayer times endpoint
curl http://localhost:8080/api/prayer-times/today

# Test products endpoint
curl http://localhost:8080/api/products

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Frontend
1. Open http://localhost:5173
2. Click through each page
3. Try adding product to cart
4. Try changing language
5. Login to admin panel

### 3. Test Full Flow
1. Browse shop → Add to cart → Checkout
2. Login as admin → View orders
3. Update order status
4. Track order from public page

---

## 🔄 Development Workflow

### Making Changes

**Backend Changes:**
1. Edit Java files in `backend/src/main/java/`
2. Spring Boot DevTools will auto-reload (if enabled)
3. Or restart: `Ctrl+C` and `mvn spring-boot:run` again

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Vite will hot-reload automatically
3. See changes instantly in browser

### Stopping the Servers

**Backend:**
```bash
# Press Ctrl+C in the terminal
```

**Frontend:**
```bash
# Press Ctrl+C in the terminal
```

---

## 🚀 Production Build

### Backend
```bash
cd backend
mvn clean package
# JAR file created in target/
```

### Frontend
```bash
cd frontend
npm run build
# Production files created in dist/
```

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│         QUICK START COMMANDS                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  START DATABASE:                                │
│  $ sudo systemctl start postgresql             │
│                                                 │
│  START BACKEND:                                 │
│  $ cd backend && mvn spring-boot:run           │
│                                                 │
│  START FRONTEND:                                │
│  $ cd frontend && npm run dev                  │
│                                                 │
│  ACCESS:                                        │
│  🌐 Frontend: http://localhost:5173            │
│  🔧 Backend:  http://localhost:8080            │
│  👨‍💼 Admin:    http://localhost:5173/admin/login │
│                                                 │
│  DEFAULT LOGIN:                                 │
│  Username: admin                                │
│  Password: admin123                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎓 Next Steps After Running

1. ✅ Verify both servers are running
2. ✅ Test login to admin panel
3. ✅ Add some test products
4. ✅ Test shopping cart flow
5. ✅ Configure Stripe for donations
6. ✅ Customize content in translation files
7. ✅ Add real images and data
8. 🚀 Deploy to production!

---

## 💡 Pro Tips

1. **Use two terminals** - One for backend, one for frontend
2. **Keep both running** - Hot reload works best this way
3. **Check console for errors** - Both terminal and browser console
4. **Use React DevTools** - Install browser extension for debugging
5. **Monitor backend logs** - Watch for API errors
6. **Clear cache** - If something seems stuck, clear browser cache

---

## 🆘 Need More Help?

If you're still stuck:
1. Check the error message carefully
2. Look at backend logs (terminal where backend is running)
3. Check browser console (F12 → Console tab)
4. Check network tab (F12 → Network tab)
5. Verify database is running and accessible
6. Ensure all dependencies are installed

---

**Everything should now be running! Open http://localhost:5173 and enjoy your mosque website! 🕌**
