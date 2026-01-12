# Fundraising Campaigns Feature - Quick Reference

## What's New
✅ Admin panel section to create and manage fundraising campaigns
✅ Campaigns display on the donate page with progress tracking
✅ Multilingual support (English, Bulgarian, Arabic)
✅ Featured campaigns highlighting
✅ Progress bars and visual feedback
✅ Sample campaigns included

## Quick Start

### 1. Setup Database
```bash
./setup-campaigns-feature.sh
```

### 2. Access Admin Panel
1. Login at `/admin/login`
2. Click "Fundraising Campaigns" from dashboard
3. Click "Add Campaign" to create a new campaign

### 3. View Public Page
Visit `/donate` to see active campaigns displayed

## Key Features

### Admin Panel (`/admin/campaigns`)
- ➕ Create new campaigns
- ✏️ Edit existing campaigns
- 🗑️ Delete campaigns
- 📊 Track progress (€ raised / € goal)
- ⭐ Mark campaigns as featured
- 🌍 Multilingual (EN/BG/AR)
- 📅 Set start/end dates
- 🖼️ Add campaign images

### Campaign Fields
**Required:**
- Title (EN, BG, AR)
- Description (EN, BG, AR)
- Goal Amount (€)

**Optional:**
- Current Amount (€)
- Image URL
- Start Date
- End Date
- Active checkbox
- Featured checkbox

### Donate Page Display
- Campaigns shown in grid layout
- Progress bars with percentage
- Featured badge for special campaigns
- Responsive design
- Language-aware display

## Files Overview

### Backend (Java/Spring Boot)
```
backend/src/main/java/com/masjid/
├── model/FundraisingCampaign.java          # Entity
├── repository/FundraisingCampaignRepository.java
├── service/FundraisingCampaignService.java
├── controller/FundraisingCampaignController.java      # Public API
└── controller/admin/AdminFundraisingController.java   # Admin API
```

### Frontend (React)
```
frontend/src/
├── pages/admin/ManageCampaigns.jsx    # Admin management
├── pages/Donate.jsx                    # Updated with campaigns
└── App.jsx                             # Updated routes
```

### Database
```
backend/create-campaigns-table.sql      # Table creation + samples
```

## API Endpoints

### Public
- `GET /api/campaigns/active` - Active campaigns
- `GET /api/campaigns/featured` - Featured campaigns

### Admin (Auth Required)
- `GET /api/admin/campaigns` - All campaigns
- `POST /api/admin/campaigns` - Create
- `PUT /api/admin/campaigns/{id}` - Update
- `DELETE /api/admin/campaigns/{id}` - Delete

## Sample Campaigns Included

1. **Mosque Renovation Project** ⭐ Featured
   - €12,500 / €50,000 (25%)
   
2. **Islamic School Equipment** ⭐ Featured
   - €8,750 / €15,000 (58.3%)
   
3. **Community Food Bank**
   - €4,200 / €10,000 (42%)

## Common Tasks

### Create a Campaign
1. Go to `/admin/campaigns`
2. Click "Add Campaign"
3. Fill in all fields
4. Check "Active" to make visible
5. Check "Featured" for prominence
6. Click "Create Campaign"

### Update Progress
1. Edit the campaign
2. Update "Current Amount"
3. Save changes
4. Progress bar updates automatically

### Hide a Campaign
1. Edit the campaign
2. Uncheck "Active"
3. Save changes

## Styling
Uses Tailwind CSS with Islamic theme:
- `islamic-green` - Primary color
- `islamic-gold` - Accent/featured
- `islamic-cream` - Background
- Gradient effects
- Smooth animations

## Next Steps
After setup:
1. ✅ Backend compiled successfully
2. ⏳ Run setup script for database
3. ⏳ Start servers
4. ⏳ Login to admin panel
5. ⏳ Create your first campaign

## Need Help?
See full documentation: `FUNDRAISING_CAMPAIGNS.md`
