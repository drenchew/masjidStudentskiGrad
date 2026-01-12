-- Database setup script for Masjid Studentski Grad

-- Create database
CREATE DATABASE masjid_db;

-- Connect to the database
\c masjid_db;

-- Database will be automatically initialized by Spring Boot JPA (hibernate ddl-auto: update)
-- Tables will be created automatically from entities

-- Create default admin user (password: admin123 - remember to change this!)
-- Password hash is BCrypt encoded 'admin123'
INSERT INTO admins (username, password, email, created_at, updated_at)
VALUES ('admin', '$2a$10$8P8KhKzYgVN5Y2F5BxQvZe6h8j3V3nh7cK8XvR8F5S9P6Q7W8X9YZ', 'admin@masjid.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
