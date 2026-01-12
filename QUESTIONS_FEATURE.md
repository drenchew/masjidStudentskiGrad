# Anonymous Questions Feature

## Overview
The Anonymous Questions feature allows users to submit questions anonymously and receive answers from mosque administrators. This promotes open communication while protecting user privacy.

## Features

### For Users (Public)
- Submit questions anonymously without requiring login or personal information
- View previously answered questions and their responses
- See when questions were asked and answered
- Multi-language support (English, Bulgarian, Arabic)

### For Admins
- View all questions (answered, unanswered, and hidden)
- Answer questions with a rich text editor
- Control visibility of answered questions (public/private)
- Hide inappropriate questions
- Delete questions permanently
- Edit existing answers
- Toggle visibility of answered questions

## Database Schema

### Questions Table
```sql
- id: BIGSERIAL PRIMARY KEY
- question_text: TEXT (required) - The question submitted by user
- answer_text: TEXT (optional) - The admin's response
- is_answered: BOOLEAN (default: false) - Whether question has been answered
- is_visible: BOOLEAN (default: true) - Whether answer is visible to public
- is_hidden: BOOLEAN (default: false) - Whether admin has hidden the question
- created_at: TIMESTAMP - When question was submitted
- updated_at: TIMESTAMP - Last modification time
- answered_at: TIMESTAMP - When question was answered
```

## API Endpoints

### Public Endpoints

#### Submit Question
```
POST /api/questions
Body: { "questionText": "Your question here" }
Response: { "message": "Question submitted successfully", "id": 1 }
```

#### Get Public Questions
```
GET /api/questions
Response: Array of answered and visible questions
```

#### Get Unanswered Count
```
GET /api/questions/count
Response: { "unanswered": 5 }
```

### Admin Endpoints (Requires Authentication)

#### Get All Questions
```
GET /api/admin/questions
GET /api/admin/questions/unanswered
GET /api/admin/questions/answered
GET /api/admin/questions/hidden
```

#### Get Single Question
```
GET /api/admin/questions/{id}
```

#### Answer Question
```
POST /api/admin/questions/{id}/answer
Body: { "answerText": "Answer here", "isVisible": true }
```

#### Update Answer
```
PUT /api/admin/questions/{id}/answer
Body: { "answerText": "Updated answer", "isVisible": true }
```

#### Hide/Unhide Question
```
PATCH /api/admin/questions/{id}/hide
PATCH /api/admin/questions/{id}/unhide
```

#### Toggle Visibility
```
PATCH /api/admin/questions/{id}/toggle-visibility
```

#### Delete Question
```
DELETE /api/admin/questions/{id}
```

## Setup Instructions

### 1. Database Setup
Run the SQL script to create the questions table:

```bash
cd backend
psql -U masjid_user -d masjid_db -f create-questions-table.sql
```

Or manually connect to your database and run:
```bash
psql -U masjid_user -d masjid_db < create-questions-table.sql
```

### 2. Backend
The backend components are already created:
- Model: `Question.java`
- Repository: `QuestionRepository.java`
- Service: `QuestionService.java`
- Controllers: `QuestionController.java`, `AdminQuestionController.java`
- DTOs: `QuestionRequest.java`, `AnswerRequest.java`

Restart the backend server to load the new components:
```bash
cd backend
mvn clean package
java -jar target/studentski-grad-0.0.1-SNAPSHOT.jar
```

### 3. Frontend
The frontend components are ready:
- Public page: `frontend/src/pages/Questions.jsx`
- Admin page: `frontend/src/pages/admin/ManageQuestions.jsx`
- Routes added to `App.jsx`
- Navigation link added to `Navbar.jsx`
- Translations added to all language files

No additional setup needed for frontend.

## Usage Guide

### For Users
1. Navigate to the "Questions" page from the main navigation
2. Type your question in the text area
3. Click "Submit Question"
4. Your question will be submitted anonymously
5. Check back later to see if it has been answered
6. View previously answered questions on the same page

### For Admins
1. Log in to the admin dashboard
2. Click on "Manage Questions" from the dashboard
3. Use the filter tabs to view:
   - All Questions
   - Unanswered Questions
   - Answered Questions
   - Hidden Questions
4. To answer a question:
   - Click "Answer" button
   - Type your response
   - Choose whether to make it visible to the public
   - Click "Submit Answer"
5. To manage questions:
   - **Hide**: Remove from view without deleting
   - **Make Public/Private**: Control visibility of answered questions
   - **Delete**: Permanently remove the question
   - **Edit Answer**: Modify an existing response

## Features in Detail

### Anonymous Submission
- No login required
- No personal information collected
- IP addresses not stored
- Completely anonymous

### Admin Controls
- **Answer**: Provide a response to unanswered questions
- **Edit Answer**: Modify existing responses
- **Hide/Unhide**: Temporarily hide inappropriate content
- **Delete**: Permanently remove questions
- **Visibility Toggle**: Control whether answered questions appear publicly
- **Filtering**: View questions by status (all, unanswered, answered, hidden)

### Status Indicators
- **Pending** (Yellow): Question awaiting answer
- **Answered** (Green): Question has been answered
- **Visible** (Blue): Answer is public
- **Hidden** (Red): Question hidden by admin

## Translations

The feature supports three languages:
- **English**: Full support
- **Bulgarian**: Full support
- **Arabic**: Full support with RTL text direction

Translation keys in locale files:
- `nav.questions`
- `questions.title`
- `questions.description`
- `questions.askQuestion`
- `questions.placeholder`
- `questions.anonymous`
- `questions.submit`
- `questions.submitting`
- `questions.submitSuccess`
- `questions.submitError`
- `questions.emptyQuestion`
- `questions.previousQuestions`
- `questions.noQuestions`
- `questions.answeredOn`

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting to prevent spam
2. **Content Moderation**: Admins should review questions before making answers public
3. **Input Validation**: Both frontend and backend validate input
4. **Admin Authentication**: Only authenticated admins can manage questions
5. **SQL Injection**: Using JPA/Hibernate prevents SQL injection
6. **XSS Protection**: React automatically escapes content

## Future Enhancements

Possible improvements:
1. Rich text editor for answers
2. Question categories/tags
3. Search functionality
4. Email notifications when questions are answered
5. Rate limiting per IP address
6. Question approval workflow
7. Statistics dashboard for admins
8. Export questions/answers to PDF or CSV
9. Upvoting/downvoting questions
10. Related questions suggestions

## Troubleshooting

### Question not appearing
- Check if it's marked as hidden
- Verify question is answered (only answered questions appear publicly)
- Check visibility setting

### Cannot submit question
- Check network connection
- Verify backend server is running
- Check browser console for errors

### Admin cannot answer
- Verify admin is logged in
- Check admin token is valid
- Ensure database connection is working

## Technical Stack

- **Backend**: Java Spring Boot, JPA/Hibernate, PostgreSQL
- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Authentication**: JWT tokens for admin access
- **Database**: PostgreSQL with indexed columns for performance
