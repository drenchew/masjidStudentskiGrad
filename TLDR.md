# 🎯 TLDR - How to Run Everything

## Just Want to Start? Do This:

```bash
# Step 1: Make sure PostgreSQL is running
sudo systemctl start postgresql

# Step 2: Run the startup script
cd /home/dre/proj/masjidStudentskiGrad
./start-servers.sh

# Step 3: Open your browser
# http://localhost:5173
```

## That's It! ✅

---

## Or Use Two Terminals:

### Terminal 1:
```bash
cd ~/proj/masjidStudentskiGrad/backend
mvn spring-boot:run
```

### Terminal 2:
```bash
cd ~/proj/masjidStudentskiGrad/frontend
npm run dev
```

### Browser:
```
http://localhost:5173
```

---

## Stop Everything:

```bash
./stop-servers.sh
```

Or press `Ctrl+C` in both terminals.

---

## First Time? Install This First:

```bash
cd frontend
npm install
```

---

## Admin Access:

**URL:** http://localhost:5173/admin/login

**Login:**
- Username: `admin`
- Password: `admin123`

---

## That's Everything You Need to Know! 🚀

For detailed help, see **QUICK_START.md** or **HOW_TO_RUN.md**
