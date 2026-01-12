# Quick Setup - Anonymous Questions Feature

## What's New?
✅ Users can submit questions anonymously
✅ Admin can answer, hide, or delete questions
✅ Public page shows answered questions
✅ Multi-language support (EN, BG, AR)

## Setup Steps

### 1. Create Database Table
Run this command (replace with your actual DB credentials):
```bash
psql -U masjid_user -d masjid_db -f backend/create-questions-table.sql
```

### 2. Rebuild Backend
```bash
cd backend
mvn clean package -DskipTests
```

### 3. Start Servers
```bash
cd ..
./start-servers.sh
```

## Access the Feature

**Public Page (Users):**
- URL: http://localhost:5173/questions
- No login required
- Submit and view questions anonymously

**Admin Page (Admins):**
- URL: http://localhost:5173/admin/questions
- Requires admin login
- Answer, hide, or delete questions

## New Files Created

### Backend
- `src/main/java/com/masjid/model/Question.java`
- `src/main/java/com/masjid/repository/QuestionRepository.java`
- `src/main/java/com/masjid/service/QuestionService.java`
- `src/main/java/com/masjid/controller/QuestionController.java`
- `src/main/java/com/masjid/controller/admin/AdminQuestionController.java`
- `src/main/java/com/masjid/dto/QuestionRequest.java`
- `src/main/java/com/masjid/dto/AnswerRequest.java`
- `create-questions-table.sql`

### Frontend
- `src/pages/Questions.jsx` - Public Q&A page
- `src/pages/admin/ManageQuestions.jsx` - Admin management page

### Modified Files
- `src/App.jsx` - Added routes
- `src/components/Navbar.jsx` - Added Questions link
- `src/pages/admin/AdminDashboard.jsx` - Added Manage Questions button
- `src/locales/en.json` - Added translations
- `src/locales/bg.json` - Added translations
- `src/locales/ar.json` - Added translations

## API Endpoints

### Public
- `POST /api/questions` - Submit question
- `GET /api/questions` - Get answered questions
- `GET /api/questions/count` - Get unanswered count

### Admin (requires auth)
- `GET /api/admin/questions` - Get all questions
- `GET /api/admin/questions/unanswered` - Get unanswered
- `GET /api/admin/questions/answered` - Get answered
- `GET /api/admin/questions/hidden` - Get hidden
- `POST /api/admin/questions/{id}/answer` - Answer question
- `PUT /api/admin/questions/{id}/answer` - Update answer
- `PATCH /api/admin/questions/{id}/hide` - Hide question
- `PATCH /api/admin/questions/{id}/unhide` - Unhide question
- `PATCH /api/admin/questions/{id}/toggle-visibility` - Toggle visibility
- `DELETE /api/admin/questions/{id}` - Delete question

## Testing

1. **Submit a question:**
   - Go to http://localhost:5173/questions
   - Type a question and submit
   
2. **Answer as admin:**
   - Login at http://localhost:5173/admin/login
   - Go to "Manage Questions"
   - Click "Answer" on a question
   - Type response and submit
   
3. **View public answers:**
   - Go back to http://localhost:5173/questions
   - Your answered question should now appear

## Troubleshooting

**Database connection error:**
- Make sure PostgreSQL is running
- Check database credentials in `application.yml`

**Backend won't start:**
- Run `mvn clean package` again
- Check for compilation errors

**Questions not appearing:**
- Only answered AND visible questions appear on public page
- Check admin panel to verify question status

For detailed documentation, see `QUESTIONS_FEATURE.md`
