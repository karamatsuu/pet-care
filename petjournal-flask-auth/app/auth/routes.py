from flask import request
from flask_login import current_user, login_required, login_user, logout_user

from app import bcrypt, db
from app.auth import auth_bp
from app.models import User
from app.responses import error_response, success_response
from app.validation import UserLoginSchema, UserRegisterSchema, load_json


def _normalize_email(email):
    return email.strip().lower() if isinstance(email, str) else ""


register_schema = UserRegisterSchema()
login_schema = UserLoginSchema()


@auth_bp.post("/register")
def register():
    data, error = load_json(register_schema, request.get_json(silent=True))
    if error:
        return error

    email = _normalize_email(data["email"])
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return error_response("Email is already registered", 409)

    user = User(
        email=email,
        password_hash=bcrypt.generate_password_hash(data["password"]).decode("utf-8"),
    )
    db.session.add(user)
    db.session.commit()

    login_user(user)

    return success_response({"user": user.to_dict()}, 201)


@auth_bp.post("/login")
def login():
    data, error = load_json(login_schema, request.get_json(silent=True))
    if error:
        return error

    email = _normalize_email(data["email"])
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return error_response("Invalid credentials", 401)

    login_user(user)

    return success_response({"user": user.to_dict()})


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return success_response({"message": "Logged out"})


@auth_bp.get("/me")
@login_required
def me():
    return success_response({"user": current_user.to_dict()})
