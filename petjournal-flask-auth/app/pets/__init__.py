from flask import Blueprint

pets_bp = Blueprint("pets", __name__, url_prefix="/pets")

from app.pets import routes  # noqa: E402,F401
