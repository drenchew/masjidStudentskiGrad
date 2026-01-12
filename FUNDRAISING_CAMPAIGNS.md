# Fundraising Campaigns Feature

## Overview
The Fundraising Campaigns feature allows administrators to create and manage fundraising campaigns that are displayed on the donate page. This feature helps mosques organize specific fundraising efforts for various projects and goals.

## Features

### Admin Panel
- **Create Campaigns**: Add new fundraising campaigns with multilingual support (English, Bulgarian, Arabic)
- **Edit Campaigns**: Update existing campaign details, goals, and progress
- **Delete Campaigns**: Remove campaigns that are no longer needed
- **Track Progress**: Monitor how much has been raised vs the goal
- **Featured Campaigns**: Mark important campaigns to display prominently
- **Active/Inactive Status**: Control campaign visibility
- **Date Range**: Set start and end dates for campaigns
- **Image Support**: Add images to campaigns for better visual appeal

### Public Display
- Campaigns are displayed on the `/donate` page
- Shows progress bars with percentage complete
- Displays campaign details in the user's selected language
- Featured campaigns are highlighted
- Responsive design for all devices

## Database Schema

The `fundraising_campaigns` table includes:
- `id`: Primary key
- `title_en`, `title_bg`, `title_ar`: Campaign titles in three languages
- `description_en`, `description_bg`, `description_ar`: Campaign descriptions
- `goal_amount`: Target fundraising amount (€)
- `current_amount`: Amount raised so far (€)
- `image_url`: Optional image URL
- `start_date`: Campaign start date (optional)
- `end_date`: Campaign end date (optional)
- `active`: Boolean flag to show/hide campaign
- `featured`: Boolean flag to highlight campaign
- `created_at`: Timestamp of creation

## Setup Instructions

### 1. Run the Setup Script

```bash
./setup-campaigns-feature.sh
```

This script will:
- Create the `fundraising_campaigns` table
- Add sample campaigns
- Verify the setup

### 2. Rebuild the Backend

```bash
cd backend
mvn clean package -DskipTests
```

### 3. Start the Servers

```bash
./start-servers.sh
```

## Usage

### For Administrators

1. **Login to Admin Panel**
   - Navigate to `/admin/login`
   - Enter your credentials

2. **Access Campaign Management**
   - From the Admin Dashboard, click "Fundraising Campaigns"
   - Or navigate directly to `/admin/campaigns`

3. **Create a New Campaign**
   - Click "Add Campaign" button
   - Fill in all required fields:
     - Title in English, Bulgarian, and Arabic
     - Description in all three languages
     - Goal amount (€)
     - Current amount raised (€)
     - Optional: Image URL
     - Optional: Start and end dates
   - Select if campaign should be active and/or featured
   - Click "Create Campaign"

4. **Edit a Campaign**
   - Click the edit icon (✏️) on any campaign
   - Update the fields as needed
   - Click "Update Campaign"

5. **Delete a Campaign**
   - Click the delete icon (🗑️) on any campaign
   - Confirm the deletion

6. **Update Progress**
   - Edit the campaign
   - Update the "Current Amount" field
   - Save changes

### For Users

1. **View Campaigns**
   - Visit `/donate` page
   - Scroll to "Fundraising Campaigns" section
   - View active campaigns with their progress

2. **Donate to a Campaign**
   - Click "Donate to this Campaign" button
   - User is scrolled to the donation form
   - Complete the donation process

## API Endpoints

### Public Endpoints
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/active` - Get only active campaigns
- `GET /api/campaigns/featured` - Get featured active campaigns
- `GET /api/campaigns/{id}` - Get a specific campaign

### Admin Endpoints (Require Authentication)
- `GET /api/admin/campaigns` - Get all campaigns (including inactive)
- `POST /api/admin/campaigns` - Create a new campaign
- `PUT /api/admin/campaigns/{id}` - Update a campaign
- `DELETE /api/admin/campaigns/{id}` - Delete a campaign

## Files Created/Modified

### Backend
- `backend/src/main/java/com/masjid/model/FundraisingCampaign.java` - Entity model
- `backend/src/main/java/com/masjid/repository/FundraisingCampaignRepository.java` - Repository
- `backend/src/main/java/com/masjid/service/FundraisingCampaignService.java` - Service layer
- `backend/src/main/java/com/masjid/controller/FundraisingCampaignController.java` - Public API
- `backend/src/main/java/com/masjid/controller/admin/AdminFundraisingController.java` - Admin API
- `backend/create-campaigns-table.sql` - Database setup script

### Frontend
- `frontend/src/pages/admin/ManageCampaigns.jsx` - Admin management page
- `frontend/src/pages/Donate.jsx` - Updated to display campaigns
- `frontend/src/App.jsx` - Updated with new route

### Scripts
- `setup-campaigns-feature.sh` - Setup script

## Customization

### Adding Custom Fields
To add custom fields to campaigns:

1. Update the database schema in `create-campaigns-table.sql`
2. Add the field to `FundraisingCampaign.java` model
3. Update the service and controller as needed
4. Update the admin form in `ManageCampaigns.jsx`
5. Update the display in `Donate.jsx`

### Styling
- Campaigns use Tailwind CSS classes
- Colors can be customized in `tailwind.config.js`
- Islamic-themed colors are used: `islamic-green`, `islamic-gold`, etc.

## Sample Campaigns

The setup script creates three sample campaigns:

1. **Mosque Renovation Project** (Featured)
   - Goal: €50,000
   - Current: €12,500

2. **Islamic School Equipment** (Featured)
   - Goal: €15,000
   - Current: €8,750

3. **Community Food Bank**
   - Goal: €10,000
   - Current: €4,200

## Troubleshooting

### Campaigns not showing on donate page
- Check if campaigns are marked as "active"
- Verify backend is running and API is accessible
- Check browser console for errors

### Cannot create campaigns in admin panel
- Verify you're logged in as admin
- Check if backend authorization is working
- Verify database connection

### Progress not updating
- Edit the campaign and update "Current Amount" field
- Note: Progress is calculated automatically from current/goal amounts

## Future Enhancements

Potential improvements:
- Automatic progress updates when donations are made
- Campaign categories/tags
- Email notifications to subscribers about campaigns
- Campaign analytics and reports
- Multiple currency support
- Recurring donation options linked to campaigns
- Social media sharing for campaigns

## Support

For issues or questions:
1. Check the browser console for errors
2. Check backend logs
3. Verify database connection and table structure
4. Ensure all environment variables are set correctly
