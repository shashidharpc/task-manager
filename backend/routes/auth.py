from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.database import get_db
import re

auth_bp = Blueprint("auth", __name__)


def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email address"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
    }

    result = db.users.insert_one(new_user)
    user_id = str(result.inserted_id)

    access_token = create_access_token(identity=user_id)

    return jsonify({
        "message": "Account created successfully",
        "token": access_token,
        "user": {"id": user_id, "name": name, "email": email}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    user = db.users.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {"id": user_id, "name": user["name"], "email": user["email"]}
    }), 200
