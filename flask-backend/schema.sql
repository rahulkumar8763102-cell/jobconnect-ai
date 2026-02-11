-- ============================================================
-- AI JOB PORTAL — MySQL Database Schema
-- ============================================================
-- Run this in MySQL Workbench or terminal:
--   mysql -u root -p < schema.sql
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS jobconnect;
USE jobconnect;

-- Step 2: Create the users table
-- Stores all registered job seekers
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- Stores bcrypt hashed password
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create the admin table
-- Stores admin credentials (pre-seeded)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL           -- Stores bcrypt hashed password
);

-- Step 4: Insert default admin account
-- Password: admin123 (bcrypt hashed)
-- You can generate a new hash using Python:
--   from flask_bcrypt import Bcrypt; b = Bcrypt(); print(b.generate_password_hash('admin123').decode())
INSERT INTO admin (email, password) VALUES (
    'admin@jobportal.com',
    '$2b$12$LJ3m4ys3Hz.VGR5Jg8RfOeKzPHQ3FDb6VqQdXnNwAZvnF3BfPMq7S'
);

-- ============================================================
-- SAMPLE DATA (Optional — for testing)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
('Rahul Sharma', 'rahul@example.com', '$2b$12$dummyhash1234567890abcdefghijklmnopqrstuvwx', 'user'),
('Priya Patel', 'priya@example.com', '$2b$12$dummyhash1234567890abcdefghijklmnopqrstuvwx', 'user');
