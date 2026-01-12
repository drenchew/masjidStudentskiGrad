# 🚀 Quick Start - Run Your Masjid Website

## 🎯 The Easiest Way (Recommended)

### Option 1: Use the Startup Script
```bash
./start-servers.sh
```
This will:
- ✅ Check if PostgreSQL is running
- ✅ Start the backend server
- ✅ Start the frontend server
- ✅ Show you the URLs to access

To stop:
```bash
./stop-servers.sh
```

---

## 🔧 Manual Start (Two Terminals)

### Terminal 1 - Start Backend:
```bash
cd /home/dre/proj/masjidStudentskiGrad/backend
mvn spring-boot:run
```
Wait until you see: "Started MasjidApplication"

### Terminal 2 - Start Frontend:
```bash
cd /home/dre/proj/masjidStudentskiGrad/frontend
npm run dev
```
Wait until you see: "Local: http://localhost:5173/"

---

## 🌐 Access Your Website

After starting both servers:

**Main Website:** http://localhost:5173

**Admin Panel:** http://localhost:5173/admin/login
- Username: `admin`
- Password: `admin123`

---

## ❓ First Time Setup?

If this is your first time:

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Make sure PostgreSQL is running:**
```bash
sudo systemctl start postgresql
```

3. **Create database:**
```bash
psql -U postgres
CREATE DATABASE masjid_db;
\q
```

4. **Now run the servers** (see above)

---

## 🛑 Stopping the Servers

### If using the script:
```bash
./stop-servers.sh
```

### If started manually:
- Press `Ctrl+C` in each terminal

---

## 💡 Quick Tips

- Backend runs on port **8080**
- Frontend runs on port **5173**
- Keep both terminals open while using the website
- Changes to frontend code will auto-reload
- Backend changes require restart (Ctrl+C then start again)

---

## 🆘 Having Issues?

1. **Port already in use?**
   ```bash
   # Kill processes on port 8080
   lsof -i :8080
   kill -9 <PID>
   
   # Kill processes on port 5173
   lsof -i :5173
   kill -9 <PID>
   ```

2. **Database error?**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

3. **Frontend not loading?**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

For detailed troubleshooting, see **HOW_TO_RUN.md**

---

## 📚 Full Documentation

- **HOW_TO_RUN.md** - Complete setup and troubleshooting guide
- **IMPLEMENTATION_SUMMARY.md** - What features are implemented
- **STRIPE_INTEGRATION_GUIDE.md** - How to enable donations
- **API_ENDPOINTS.md** - Backend API reference
- **CHECKLIST.md** - Deployment checklist

---

**That's it! Your mosque website should now be running! 🕌**

Visit http://localhost:5173 to see it in action!
