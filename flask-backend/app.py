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
# Update these credentials to match your local MySQL setup
def get_db():
    """Create and return a MySQL database connection"""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # Change to your MySQL password
        database="jobconnect"
    )

# ============================================================
# API ROUTES
# ============================================================

# ---- POST /signup — Register a new user ----
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Hash the password using bcrypt
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        db = get_db()
        cursor = db.cursor()
        # Insert user into database
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed_password, "user")
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
                    "role": user['role']
                }
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- GET /admin/users — Get all registered users (Admin only) ----
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        cursor.close()
        db.close()
        # Convert datetime objects to strings
        for user in users:
            user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- DELETE /admin/user/<id> — Delete a user by ID ----
@app.route('/admin/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        affected = cursor.rowcount
        cursor.close()
        db.close()
        if affected > 0:
            return jsonify({"message": "User deleted successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- Run the Flask server ----
if __name__ == '__main__':
    print("🚀 AI Job Portal Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
