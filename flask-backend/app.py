# ============================================================
# AI JOB PORTAL — Flask Backend (For BCA Viva Reference)
# ============================================================
# This file is a REFERENCE for your viva/exam.
# Run it locally with: python app.py
# Requires: pip install flask flask-cors flask-bcrypt mysql-connector-python
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import mysql.connector
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing
bcrypt = Bcrypt(app)

# ---- MySQL Database Connection ----
def get_db():
    """Create and return a MySQL database connection"""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # Change to your MySQL password
        database="jobconnect"
    )

# ============================================================
# USER ROUTES
# ============================================================

# ---- POST /signup — Register a new user/recruiter ----
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')
    location = data.get('location', '')
    role = data.get('role', 'user')  # 'user' or 'recruiter'

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password, phone, location, role) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, email, hashed_password, phone, location, role)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- POST /login — Authenticate user ----
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if user and bcrypt.check_password_hash(user['password'], password):
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email'],
                    "role": user['role'],
                    "phone": user.get('phone', ''),
                    "location": user.get('location', '')
                }
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- PUT /profile — Update user profile ----
@app.route('/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    user_id = data.get('user_id')
    name = data.get('name')
    phone = data.get('phone')
    location = data.get('location')

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE users SET name=%s, phone=%s, location=%s WHERE id=%s",
            (name, phone, location, user_id)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Profile updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# JOB ROUTES
# ============================================================

# ---- GET /jobs — Get all active jobs ----
@app.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT j.*, c.name as company_name, c.logo as company_logo,
                   cat.name as category_name
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN categories cat ON j.category_id = cat.id
            WHERE j.is_active = 1
            ORDER BY j.created_at DESC
        """)
        jobs = cursor.fetchall()
        cursor.close()
        db.close()
        for job in jobs:
            job['created_at'] = job['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify({"jobs": jobs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- POST /jobs — Post a new job (Recruiter) ----
@app.route('/jobs', methods=['POST'])
def post_job():
    data = request.get_json()
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO jobs (title, description, requirements, salary_min, salary_max,
               location, job_type, category_id, company_id, posted_by, skills)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (data['title'], data.get('description', ''), data.get('requirements', ''),
             data.get('salary_min', 0), data.get('salary_max', 0),
             data.get('location', ''), data.get('job_type', 'Full Time'),
             data.get('category_id'), data.get('company_id'),
             data['posted_by'], data.get('skills', ''))
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Job posted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- DELETE /jobs/<id> — Delete a job ----
@app.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM jobs WHERE id = %s", (job_id,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Job deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# APPLICATION ROUTES
# ============================================================

# ---- POST /apply — Apply to a job ----
@app.route('/apply', methods=['POST'])
def apply_job():
    data = request.get_json()
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO applications (job_id, user_id, status) VALUES (%s, %s, 'pending')",
            (data['job_id'], data['user_id'])
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Applied successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Already applied"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- PUT /application/<id>/status — Update application status ----
@app.route('/application/<int:app_id>/status', methods=['PUT'])
def update_application_status(app_id):
    data = request.get_json()
    status = data.get('status')  # 'pending', 'selected', 'rejected'
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("UPDATE applications SET status=%s WHERE id=%s", (status, app_id))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": f"Status updated to {status}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# ADMIN ROUTES
# ============================================================

# ---- GET /admin/users — Get all users ----
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, role, phone, location, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        cursor.close()
        db.close()
        for user in users:
            user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- DELETE /admin/user/<id> — Delete a user ----
@app.route('/admin/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- GET /admin/stats — Dashboard statistics ----
@app.route('/admin/stats', methods=['GET'])
def get_stats():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role='user'")
        users = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role='recruiter'")
        recruiters = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM jobs")
        jobs = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM applications")
        applications = cursor.fetchone()['count']
        cursor.close()
        db.close()
        return jsonify({
            "users": users, "recruiters": recruiters,
            "jobs": jobs, "applications": applications
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- Run the Flask server ----
if __name__ == '__main__':
    print("🚀 JobTatkal AI Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
