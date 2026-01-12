-- Create questions table for anonymous Q&A feature
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    is_answered BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_is_answered ON questions(is_answered);
CREATE INDEX IF NOT EXISTS idx_questions_is_visible ON questions(is_visible);
CREATE INDEX IF NOT EXISTS idx_questions_is_hidden ON questions(is_hidden);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_answered_at ON questions(answered_at);

-- Add comments
COMMENT ON TABLE questions IS 'Anonymous questions from users with admin responses';
COMMENT ON COLUMN questions.question_text IS 'The question submitted by the user anonymously';
COMMENT ON COLUMN questions.answer_text IS 'The answer provided by the admin';
COMMENT ON COLUMN questions.is_answered IS 'Whether the question has been answered';
COMMENT ON COLUMN questions.is_visible IS 'Whether the answered question is visible to the public';
COMMENT ON COLUMN questions.is_hidden IS 'Whether the question is hidden by admin';
COMMENT ON COLUMN questions.created_at IS 'When the question was submitted';
COMMENT ON COLUMN questions.updated_at IS 'When the question/answer was last updated';
COMMENT ON COLUMN questions.answered_at IS 'When the question was answered';
