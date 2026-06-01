from flask import Flask, jsonify, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config.settings import Config
from models.database import init_db
from routes.auth import auth_bp
from routes.tasks import tasks_bp
from datetime import timedelta

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path="/frontend"
)

# Config
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)

# Extensions
CORS(app, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)

# Init DB
init_db()

# Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)


@app.route("/")
def home():
    return send_from_directory("../frontend/pages", "index.html")

@app.route("/register")
def register_page():
    return send_from_directory("../frontend/pages", "register.html")


@app.route("/dashboard")
def dashboard_page():
    return send_from_directory("../frontend/pages", "dashboard.html")

@app.route("/components/<path:filename>")
def components(filename):
    return send_from_directory("../frontend/components", filename)


@app.route("/services/<path:filename>")
def services(filename):
    return send_from_directory("../frontend/services", filename)
    
@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({"error": "Authorization token is missing or invalid"}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({"error": "Invalid token"}), 422


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired, please log in again"}), 401


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
