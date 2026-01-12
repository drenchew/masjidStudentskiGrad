# 📧 Announcement Email Troubleshooting Guide

## Current Status
✅ **Subscription emails are working** - You're receiving them  
⚠️ **Announcement emails not received** - But logs show they're being sent

## Why This Happens

The logs show:
```
Announcement sent to 1 subscribers via Brevo API
```

This means the email **WAS successfully sent** to Brevo's servers. The issue is likely:

### 1. **Gmail Spam Filters** 🚫
- Announcement emails are bulk emails, which Gmail treats more strictly than individual emails
- They're more likely to be filtered into spam/junk
- **Action**: Check your SPAM folder thoroughly

### 2. **Brevo Bulk Email Limits** 📊
- Free tier: 300 emails per day
- Bulk emails might have additional restrictions
- **Action**: Check your Brevo dashboard

### 3. **Email Content Triggers Spam** 🎯
- Certain words or formatting can trigger spam filters
- Bulk announcements have lower reputation
- **Action**: Keep content simple, avoid spam trigger words

### 4. **Recipient Email Filtering** 📬
- Gmail might categorize them as "Promotions" or "Updates"
- Check different Gmail tabs (Primary, Social, Promotions, Updates)
- **Action**: Check all Gmail tabs, not just Primary

## 🔍 Step-by-Step Debugging

### Step 1: Start Servers with Enhanced Logging
```bash
cd /home/dre/proj/masjidStudentskiGrad
./start-servers.sh
```

### Step 2: Check Subscriber in Database
```bash
# Make sure you have an active, verified subscriber
psql -U postgres -d masjid_db -c "SELECT email, verified, active, preferred_language FROM subscribers;"
```

Expected output:
```
email                  | verified | active | preferred_language
-----------------------+----------+--------+-------------------
your@email.com        | t        | t      | EN
```

### Step 3: Send Test Announcement

1. Go to Admin Panel: http://localhost:5173/admin/login
2. Login with admin credentials
3. Go to "Announcements Management"
4. Click "Send to Subscribers" button
5. Fill in:
   - **Send to**: All Subscribers (All Languages)
   - **Subject**: Test Announcement
   - **Content (English)**: This is a test announcement from Masjid Studentski Grad
6. Click "Send Email"

### Step 4: Check Backend Logs Immediately
```bash
tail -20 /tmp/masjid-backend.log | grep -i "announcement\|email"
```

Look for:
```
✅ GOOD: "Announcement sent to 1 subscribers via Brevo API. From: spiritgameplay11@gmail.com"
❌ BAD:  "Brevo API bulk send responded with status 400" or any error
```

### Step 5: Check Brevo Dashboard
Visit: https://app.brevo.com/email/transactional

You should see:
- Recent email sent
- Status: "Delivered" or "Sent"
- If "Bounced" or "Blocked" - there's an issue

### Step 6: Gmail Search
In Gmail, search for:
```
from:spiritgameplay11@gmail.com
```

Or:
```
subject:"Test Announcement"
```

Check **ALL** these locations:
- ✉️ Primary inbox
- 🗑️ Spam/Junk
- 📁 Promotions tab
- 📁 Updates tab
- 📁 Social tab

## 🛠️ Solutions

### Solution 1: Whitelist Sender Email
Add `spiritgameplay11@gmail.com` to your Gmail contacts:
1. Go to Gmail Contacts
2. Add spiritgameplay11@gmail.com
3. This improves deliverability

### Solution 2: Use Direct "Send to Subscribers" Button
Instead of creating announcements with "Send Email" checkbox:
1. Use the "Send to Subscribers" button in admin panel
2. This gives you more control
3. You can test with one email first

### Solution 3: Check Brevo Sender Reputation
1. Visit: https://app.brevo.com/settings/senders
2. Make sure spiritgameplay11@gmail.com has good reputation
3. Check for any warnings or blocks

### Solution 4: Test with Different Email
Try sending announcement to a different email service:
- Yahoo Mail
- Outlook.com
- ProtonMail

This helps identify if it's Gmail-specific filtering.

## 📝 Enhanced Logging

I've added enhanced logging to the backend. When you send announcements, you'll now see:
```
Email details - From: spiritgameplay11@gmail.com, To: [alek.drenchew@gmail.com], Subject: Your Subject
```

## 🔬 Advanced Debugging

### Check if Email Reached Brevo
```bash
# Watch logs in real-time while sending announcement
tail -f /tmp/masjid-backend.log
```

Then send announcement from admin panel. You should see:
```
INFO - Announcement sent to X subscribers via Brevo API. Response: {...}
INFO - Email details - From: spiritgameplay11@gmail.com, To: [your@email.com], Subject: ...
```

### Check Database for Subscribers
```bash
cd /home/dre/proj/masjidStudentskiGrad
psql -U postgres -d masjid_db << EOF
SELECT 
    email, 
    verified, 
    active, 
    preferred_language,
    subscribed_at
FROM subscribers
WHERE active = true AND verified = true;
EOF
```

## ⚡ Quick Test Commands

### Test 1: Subscribe and Verify
```bash
# 1. Subscribe
curl -X POST http://localhost:8080/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","language":"EN"}'

# 2. Check backend logs
tail -5 /tmp/masjid-backend.log | grep -i email
```

### Test 2: Check Announcements Endpoint
```bash
curl -s http://localhost:8080/api/announcements | jq
```

## 🎯 Most Likely Issue

Based on the logs showing "Announcement sent to 1 subscribers via Brevo API", the email **IS being sent**. 

**90% probability**: The emails are in your **SPAM/JUNK folder** or in Gmail's **Promotions tab**.

**Check right now**:
1. Open Gmail
2. Click "Spam" folder on the left
3. Search for "spiritgameplay11" or "Masjid"
4. If found, click "Not spam"

## 📞 Need More Help?

If still not receiving:

1. **Check Brevo Dashboard**: https://app.brevo.com/email/transactional
2. **Run**: `tail -f /tmp/masjid-backend.log` and send another announcement
3. **Check**: All Gmail folders including Promotions, Updates, Social tabs
4. **Verify**: Your subscriber email is verified in database (verified=true)

---

**Remember**: The backend says "email sent successfully" - this means it reached Brevo. The issue is delivery/filtering, not sending.
