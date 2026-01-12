# Newsletter Subscription and Announcements Email Fix

## Date: January 11, 2026

## Issues Fixed

### 1. Newsletter Subscription Verification Error
**Problem**: The newsletter subscription verification endpoint (`/api/subscribers/verify`) was not accessible because it wasn't in the permitAll list in SecurityConfig, causing authentication errors.

**Solution**: Updated `SecurityConfig.java` to include all subscriber endpoints in permitAll:
```java
.requestMatchers("/api/subscribers/subscribe", "/api/subscribers/verify", "/api/subscribers/unsubscribe").permitAll()
```

Also added announcements endpoint to permitAll:
```java
.requestMatchers("/api/announcements/**").permitAll()
```

### 2. Announcement Emails Not Being Sent
**Problem**: The announcement email functionality had two major issues:
- When creating announcements with "Send Email" checked, emails were only sent in English to all subscribers
- The "Send to Subscribers" button used a separate endpoint that had incorrect logic for handling multiple languages

**Solutions**:

#### A. Fixed AnnouncementService.java
Updated the `createAnnouncement` method to send emails to each subscriber in their preferred language:
- For each subscriber, it now selects the appropriate title and content based on their preferred language (EN, BG, or AR)
- Falls back to English if the translation is not available
- Sends individual emails to ensure each person gets content in their language

#### B. Fixed AdminSubscriberController.java
Updated the `sendAnnouncement` endpoint to properly handle multi-language announcements:
- When "ALL" is selected, it now iterates through all subscribers and sends each one an email in their preferred language
- When a specific language is selected, it sends to only those subscribers with proper content
- Added proper error handling with try-catch blocks
- Returns the count of emails sent in the response

## Technical Details

### Files Modified:
1. `/backend/src/main/java/com/masjid/config/SecurityConfig.java`
   - Added `/api/subscribers/verify` and `/api/subscribers/unsubscribe` to permitAll
   - Added `/api/announcements/**` to permitAll

2. `/backend/src/main/java/com/masjid/service/AnnouncementService.java`
   - Modified `createAnnouncement` to send multi-language emails
   - Each subscriber receives email in their preferred language
   - Removed unused import `java.util.stream.Collectors`

3. `/backend/src/main/java/com/masjid/controller/admin/AdminSubscriberController.java`
   - Completely rewrote `sendAnnouncement` method
   - Added support for sending to all subscribers with language-specific content
   - Improved error handling and response messages

### How It Works Now:

#### Newsletter Subscription Flow:
1. User subscribes via the newsletter form → `/api/subscribers/subscribe` (PUBLIC)
2. System sends verification email with token
3. User clicks verification link → `/api/subscribers/verify?token=XXX` (PUBLIC, now working!)
4. Subscription is verified and activated

#### Announcement Email Flow:

**Option 1: Create Announcement with Email**
1. Admin creates announcement in all 3 languages (EN, BG, AR)
2. Checks "Send email to all subscribers"
3. System creates announcement in database
4. For each subscriber:
   - Determines their preferred language
   - Selects appropriate subject (title) and content
   - Sends individual email
5. Marks announcement as "Email Sent"

**Option 2: Send to Subscribers Button**
1. Admin clicks "Send to Subscribers" button
2. Can choose to send to:
   - All Subscribers (ALL) - sends each person content in their language
   - English Subscribers Only (EN)
   - Bulgarian Subscribers Only (BG)
   - Arabic Subscribers Only (AR)
3. Can use pre-made templates or write custom content
4. System sends emails with proper language content to selected recipients

## Testing Recommendations

### Test Newsletter Subscription:
1. Go to the website footer
2. Enter an email address
3. Check your email for verification link
4. Click the verification link → Should see "Subscription verified successfully"
5. Check database: subscriber should have `verified=true`

### Test Announcement Creation with Email:
1. Login to admin panel → `/admin/login`
2. Go to "Announcements Management"
3. Click "New Announcement"
4. Fill in all 3 languages (EN, BG, AR)
5. Check "Send email to all subscribers"
6. Click "Create Announcement"
7. Verify: Each subscriber receives email in their preferred language

### Test Send to Subscribers:
1. In Announcements Management page
2. Click "Send to Subscribers" button
3. Select "All Subscribers (All Languages)"
4. Fill in content for all 3 languages
5. Click "Send Email"
6. Verify: Each subscriber receives email in their preferred language

## Email Service Configuration

The system uses Brevo (formerly Sendinblue) API for sending emails:
- Primary: Brevo HTTP API (configured via `BREVO_API_KEY`)
- Fallback: SMTP (if Brevo fails and SMTP credentials are configured)

Check `.env` file for email configuration:
```env
BREVO_API_KEY=your_brevo_api_key
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
EMAIL_FROM=masjid@studentskigrad.com
```

## Database Schema

### Subscribers Table:
```sql
- id (BIGINT, PRIMARY KEY)
- email (VARCHAR, UNIQUE, NOT NULL)
- preferred_language (VARCHAR: 'EN', 'BG', 'AR')
- verified (BOOLEAN, DEFAULT false)
- verification_token (VARCHAR)
- active (BOOLEAN, DEFAULT true)
- subscribed_at (TIMESTAMP)
```

### Announcements Table:
```sql
- id (BIGINT, PRIMARY KEY)
- title_en, title_bg, title_ar (VARCHAR)
- content_en, content_bg, content_ar (TEXT)
- send_email (BOOLEAN, DEFAULT false)
- email_sent (BOOLEAN, DEFAULT false)
- active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
```

## Important Notes

1. **Multi-language Support**: The system now properly supports sending emails in the subscriber's preferred language
2. **Fallback to English**: If a translation is not available for a subscriber's language, the system falls back to English
3. **Individual Emails**: When sending to "ALL" subscribers, the system sends individual emails to ensure proper language content
4. **Error Handling**: Both announcement creation and manual email sending have proper error handling
5. **No Authentication Required**: Newsletter subscription and verification are public endpoints

## Future Improvements

1. Add email preview before sending
2. Add email scheduling (send at specific time)
3. Add email templates management in admin panel
4. Add email statistics (open rate, click rate)
5. Add unsubscribe link in every email
6. Add email queue for better performance when sending to many subscribers
7. Add email sending progress indicator in admin panel
