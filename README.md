# AI Job Portal — BCA Final Year Project

## 📌 Project Overview
AI Job Portal is a full-stack web application where users can sign up, search for jobs, and manage their profiles. Admins have full control to view and manage all registered users in real-time.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| UI Library | Tailwind CSS + shadcn/ui |
| Backend (Live) | Lovable Cloud (Supabase) |
| Backend (Viva) | Python Flask + MySQL |
| Authentication | Email/Password with JWT |

## 🚀 How to Run

### Frontend (React)
```bash
npm install
npm run dev
# Opens at http://localhost:8080
```

### Backend — Flask (For Local/Viva Demo)
```bash
cd flask-backend
pip install -r requirements.txt
mysql -u root -p < schema.sql
python app.py
# Runs at http://localhost:5000
```

## 👤 User Features
- **Sign Up** — Name, email, password stored in database
- **Login** — Secure authentication with password hashing
- **Dashboard** — View profile info and browse jobs
- **Job Search** — Filter jobs by keyword, type, location
- **Logout** — Secure session termination

## 🛡 Admin Features
- **Separate Admin Panel** — Professional dashboard UI
- **View All Users** — Name, email, join date in a table
- **Delete Users** — Remove users from the database
- **Real-time Data** — Users appear instantly after signup
- **Search Users** — Filter by name or email

## 📂 Project Structure
```
ai-job-portal/
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Auth context (state management)
│   ├── data/               # Mock job data
│   ├── pages/              # All page components
│   │   ├── Index.tsx       # Home page
│   │   ├── Login.tsx       # User login
│   │   ├── Register.tsx    # User signup
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Admin.tsx       # Admin panel
│   │   ├── Jobs.tsx        # Job listings
│   │   └── JobDetail.tsx   # Job details
│   └── integrations/       # Backend client
├── flask-backend/          # Flask Backend (Viva Reference)
│   ├── app.py              # Flask REST APIs
│   ├── schema.sql          # MySQL database schema
│   └── requirements.txt    # Python dependencies
```

## 🗄 Database Schema (MySQL)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 Flask API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | User authentication |
| GET | `/admin/users` | Get all users (admin) |
| DELETE | `/admin/user/<id>` | Delete user (admin) |

## 🎤 Viva Explanation Points

1. **What is the project about?**
   — AI Job Portal helps job seekers find opportunities. Admins manage users.

2. **What tech stack did you use?**
   — React for frontend, Flask for backend, MySQL for database.

3. **How does authentication work?**
   — Passwords are hashed with bcrypt. Login checks hash. Sessions managed with JWT.

4. **How does admin see users?**
   — Admin panel calls GET /admin/users API which queries MySQL users table.

5. **What is CORS and why is it needed?**
   — Cross-Origin Resource Sharing allows frontend (port 8080) to call backend (port 5000).

6. **What is bcrypt?**
   — A password hashing library that securely encrypts passwords before storing.

7. **What is REST API?**
   — Representational State Transfer — uses HTTP methods (GET, POST, DELETE) for communication.

8. **Why React + Vite?**
   — Vite provides fast development server. React enables component-based UI development.

9. **How is admin different from user?**
   — Separate login, separate dashboard. Admin has role-based access to manage all users.

10. **What is the AI part?**
    — AI-powered job matching analyzes user skills to recommend relevant job opportunities.
