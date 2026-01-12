-- Check and create admin user for Masjid application
-- Connect to masjid_db database first: psql -U postgres -d masjid_db -f create-admin.sql

-- Check if admin user exists
SELECT * FROM admins WHERE username = 'admin';

-- If not exists, insert admin user
-- Password: admin123 (BCrypt hashed)
INSERT INTO admins (username, password, email, role, created_at, updated_at)
VALUES ('admin', '$2b$10$0iIUOPeCwsV1R3x2OHAIzuH/JUzRy0/5hWDEGm5z2USUQaL91LsSy', 'admin@masjid.com', 'ADMIN', NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET 
    password = '$2b$10$0iIUOPeCwsV1R3x2OHAIzuH/JUzRy0/5hWDEGm5z2USUQaL91LsSy',
    updated_at = NOW();

-- Verify admin was created
SELECT id, username, email, role, created_at FROM admins WHERE username = 'admin';
