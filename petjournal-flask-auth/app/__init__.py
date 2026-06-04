import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()


def _env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "sqlite:///petjournal.db",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "localhost")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "25"))
    app.config["MAIL_USE_TLS"] = _env_bool("MAIL_USE_TLS")
    app.config["MAIL_USE_SSL"] = _env_bool("MAIL_USE_SSL")
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv(
        "MAIL_DEFAULT_SENDER",
        "PetJournal <no-reply@petjournal.local>",
    )
    app.config["REMINDER_SCHEDULER_ENABLED"] = _env_bool(
        "REMINDER_SCHEDULER_ENABLED",
        True,
    )
    app.config["REMINDER_TIMEZONE"] = os.getenv("REMINDER_TIMEZONE", "UTC")

    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from app.responses import error_response

    @login_manager.unauthorized_handler
    def unauthorized():
        return error_response("Authentication required", 401)

    def register_error_handlers(app):
        @app.errorhandler(400)
        @app.errorhandler(401)
        @app.errorhandler(403)
        @app.errorhandler(404)
        def handle_http_error(error):
            message = error.description if isinstance(error, HTTPException) else str(error)
            return error_response(message, error.code)

        @app.errorhandler(ValidationError)
        def handle_validation_error(error):
            return error_response(error.messages, 400)

        @app.errorhandler(500)
        def handle_server_error(error):
            db.session.rollback()
            return error_response("Internal server error", 500)

        @app.errorhandler(Exception)
        def handle_unexpected_error(error):
            if isinstance(error, HTTPException):
                return error_response(error.description, error.code)
            db.session.rollback()
            return error_response("Internal server error", 500)

    register_error_handlers(app)

    from app.auth.routes import auth_bp
    from app.pets.routes import pets_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(pets_bp)

    @app.get("/health")
    def health():
        from app.responses import success_response

        return success_response({"status": "ok", "app": "PetJournal"})

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    from app.reminders import start_reminder_scheduler

    start_reminder_scheduler(app)

    return app
