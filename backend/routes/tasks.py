from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from bson import ObjectId
from datetime import datetime, timezone

tasks_bp = Blueprint("tasks", __name__)

VALID_STATUSES = ["Todo", "In Progress", "Done"]


def task_to_dict(task):
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description", ""),
        "status": task["status"],
        "user_id": str(task["user_id"]),
        "created_at": task["created_at"].isoformat() if isinstance(task["created_at"], datetime) else task["created_at"],
    }


@tasks_bp.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    db = get_db()

    try:
        tasks = list(db.tasks.find({"user_id": ObjectId(user_id)}).sort("created_at", -1))
        return jsonify({"tasks": [task_to_dict(t) for t in tasks]}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch tasks"}), 500


@tasks_bp.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    status = data.get("status", "Todo")

    if not title:
        return jsonify({"error": "Task title is required"}), 400

    if len(title) > 100:
        return jsonify({"error": "Title must be 100 characters or less"}), 400

    if status not in VALID_STATUSES:
        return jsonify({"error": f"Status must be one of: {', '.join(VALID_STATUSES)}"}), 400

    db = get_db()
    new_task = {
        "user_id": ObjectId(user_id),
        "title": title,
        "description": description,
        "status": status,
        "created_at": datetime.now(timezone.utc),
    }

    result = db.tasks.insert_one(new_task)
    new_task["_id"] = result.inserted_id

    return jsonify({"message": "Task created", "task": task_to_dict(new_task)}), 201


@tasks_bp.route("/tasks/<task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        task_obj_id = ObjectId(task_id)
    except Exception:
        return jsonify({"error": "Invalid task ID"}), 400

    db = get_db()
    task = db.tasks.find_one({"_id": task_obj_id, "user_id": ObjectId(user_id)})

    if not task:
        return jsonify({"error": "Task not found"}), 404

    updates = {}

    if "title" in data:
        title = data["title"].strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        if len(title) > 100:
            return jsonify({"error": "Title must be 100 characters or less"}), 400
        updates["title"] = title

    if "description" in data:
        updates["description"] = data["description"].strip()

    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return jsonify({"error": f"Status must be one of: {', '.join(VALID_STATUSES)}"}), 400
        updates["status"] = data["status"]

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    db.tasks.update_one({"_id": task_obj_id}, {"$set": updates})
    updated_task = db.tasks.find_one({"_id": task_obj_id})

    return jsonify({"message": "Task updated", "task": task_to_dict(updated_task)}), 200


@tasks_bp.route("/tasks/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()

    try:
        task_obj_id = ObjectId(task_id)
    except Exception:
        return jsonify({"error": "Invalid task ID"}), 400

    db = get_db()
    result = db.tasks.delete_one({"_id": task_obj_id, "user_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted"}), 200
