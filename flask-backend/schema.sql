-- ============================================================
-- JOBTATKAL AI — MySQL Database Schema (Complete)
-- ============================================================
-- Run this in MySQL: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS jobconnect;
USE jobconnect;

-- 1. Users table (Job Seekers + Recruiters)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT '',
    location VARCHAR(100) DEFAULT '',
    role ENUM('user', 'recruiter', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin table (pre-seeded)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) DEFAULT '💼',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    logo VARCHAR(20) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    description TEXT,
    location VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_min INT DEFAULT 0,
    salary_max INT DEFAULT 0,
    location VARCHAR(200) DEFAULT '',
    job_type VARCHAR(50) DEFAULT 'Full Time',
    category_id INT,
    company_id INT,
    posted_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- 6. Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'selected', 'rejected') DEFAULT 'pending',
    cover_letter TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, user_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    parsed_skills TEXT,
    parsed_education TEXT,
    parsed_experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin account (password: admin123)
INSERT INTO admin (email, password) VALUES (
    'admin@jobportal.com',
    '$2b$12$LJ3m4ys3Hz.VGR5Jg8RfOeKzPHQ3FDb6VqQdXnNwAZvnF3BfPMq7S'
);

INSERT INTO users (name, email, password, role) VALUES (
    'Admin', 'admin@jobportal.com',
    '$2b$12$LJ3m4ys3Hz.VGR5Jg8RfOeKzPHQ3FDb6VqQdXnNwAZvnF3BfPMq7S',
    'admin'
);

-- Categories
INSERT INTO categories (name, slug, icon) VALUES
    ('Work From Home', 'work-from-home', '🏠'),
    ('Full Time', 'full-time', '💼'),
    ('Part Time', 'part-time', '⏰'),
    ('Jobs for Women', 'women-jobs', '👩'),
    ('Jobs for Freshers', 'fresher-jobs', '🎓'),
    ('Engineering', 'engineering', '💻'),
    ('Design', 'design', '🎨'),
    ('Marketing', 'marketing', '📈'),
    ('Data Science', 'data-science', '🧠'),
    ('Sales', 'sales', '📊');

-- Companies
INSERT INTO companies (name, logo, website, description, location) VALUES
    ('Dream11', 'D11', 'https://dream11.com', 'India''s biggest fantasy sports platform', 'Mumbai, India'),
    ('Google', 'G', 'https://google.com', 'Technology giant powering search and cloud', 'Bangalore, India'),
    ('Deloitte', 'DL', 'https://deloitte.com', 'Global consulting and professional services', 'Hyderabad, India'),
    ('Infosys', 'IN', 'https://infosys.com', 'Leading IT services and consulting', 'Bangalore, India'),
    ('TCS', 'TCS', 'https://tcs.com', 'Tata Consultancy Services', 'Mumbai, India');

-- Sample users
INSERT INTO users (name, email, password, phone, location, role) VALUES
    ('Rahul Sharma', 'rahul@example.com', '$2b$12$dummyhash1234567890abcdefghij', '+91-9876543210', 'Mumbai', 'user'),
    ('Priya Patel', 'priya@example.com', '$2b$12$dummyhash1234567890abcdefghij', '+91-9876543211', 'Delhi', 'user'),
    ('Recruiter Demo', 'recruiter@example.com', '$2b$12$dummyhash1234567890abcdefghij', '+91-9876543212', 'Bangalore', 'recruiter');

-- Sample jobs (referencing company and category IDs)
INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Frontend Developer', 'Build fantasy sports UI with React', '2+ years React', 800000, 1500000, 'Mumbai', 'Full Time', 2, 1, 1, 'React,TypeScript,CSS'),
    ('Backend Developer', 'Design scalable APIs', '3+ years Node.js', 1000000, 1800000, 'Mumbai', 'Full Time', 2, 1, 1, 'Node.js,Python,MongoDB'),
    ('Data Analyst', 'Analyze sports data', 'SQL proficiency', 600000, 1000000, 'Remote', 'Work From Home', 1, 1, 1, 'SQL,Python,Excel'),
    ('Software Engineer', 'Work on Cloud products', '3+ years distributed systems', 2000000, 3500000, 'Bangalore', 'Full Time', 6, 2, 1, 'Java,Go,Cloud'),
    ('ML Engineer', 'Build ML models', 'PhD or MS in CS/ML', 2500000, 4000000, 'Bangalore', 'Full Time', 6, 2, 1, 'Python,TensorFlow,ML'),
    ('Business Analyst', 'Analyze client requirements', '1+ years consulting', 700000, 1200000, 'Hyderabad', 'Full Time', 2, 3, 1, 'Excel,SQL,PowerPoint'),
    ('Graduate Trainee', 'Rotational program', '2025/2026 graduate', 500000, 800000, 'Multiple', 'Full Time', 5, 3, 1, 'Communication,Teamwork'),
    ('Java Developer', 'Enterprise development', '2+ years Java', 600000, 1100000, 'Pune', 'Full Time', 2, 4, 1, 'Java,Spring Boot,MySQL'),
    ('Full Stack Developer', 'End-to-end web apps', 'React + Node.js', 700000, 1300000, 'Noida', 'Full Time', 2, 5, 1, 'React,Node.js,PostgreSQL');
