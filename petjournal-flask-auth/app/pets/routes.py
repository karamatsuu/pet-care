from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from flask import current_app, request
from flask_login import current_user, login_required
from PIL import Image, UnidentifiedImageError

from app import db
from app.models import (
    Appointment,
    FeedingLog,
    Medication,
    Pet,
    Vaccination,
    WeightLog,
)
from app.pets import pets_bp
from app.responses import error_response, success_response
from app.validation import (
    AppointmentSchema,
    FeedingLogSchema,
    MedicationSchema,
    PetSchema,
    VaccinationSchema,
    WeightLogSchema,
    load_json,
)


pet_schema = PetSchema()
vaccination_schema = VaccinationSchema()
medication_schema = MedicationSchema()
appointment_schema = AppointmentSchema()
weight_log_schema = WeightLogSchema()
feeding_log_schema = FeedingLogSchema()
ALLOWED_PHOTO_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_PHOTO_BYTES = 5 * 1024 * 1024


def _json_body():
    return request.get_json(silent=True)


def _iso(value):
    return value.isoformat() if value else None


def _pet_for_user(pet_id):
    return Pet.query.filter_by(id=pet_id, user_id=current_user.id).first()


def _photo_extension(filename):
    if not filename or "." not in filename:
        return None
    extension = filename.rsplit(".", 1)[1].lower()
    if extension == "jpeg":
        return "jpg"
    return extension


def _center_square_crop(image):
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def _save_pet_photo(file_storage):
    extension = _photo_extension(file_storage.filename)
    if extension not in ALLOWED_PHOTO_EXTENSIONS:
        raise ValueError("Photo must be a JPG or PNG file.")

    file_storage.stream.seek(0, 2)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    if size > MAX_PHOTO_BYTES:
        raise ValueError("Photo must be under 5MB.")

    try:
        with Image.open(file_storage.stream) as image:
            image_format = image.format
            if image_format not in {"JPEG", "PNG"}:
                raise ValueError("Photo must be a valid JPG or PNG image.")

            cropped = _center_square_crop(image)
            if image_format == "JPEG":
                processed = cropped.convert("RGB")
                save_format = "JPEG"
                save_extension = "jpg"
            else:
                processed = cropped.convert("RGBA")
                save_format = "PNG"
                save_extension = "png"

            processed = processed.resize((400, 400), Image.Resampling.LANCZOS)
            filename = f"{uuid4().hex}.{save_extension}"
            upload_path = Path(current_app.config["UPLOAD_FOLDER"])
            upload_path.mkdir(parents=True, exist_ok=True)
            destination = upload_path / filename
            processed.save(destination, format=save_format, optimize=True)
    except UnidentifiedImageError as exc:
        raise ValueError("Photo must be a valid JPG or PNG image.") from exc

    return filename


def _pet_json(pet):
    return {
        "id": pet.id,
        "user_id": pet.user_id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "birth_date": _iso(pet.birth_date),
        "weight": str(pet.weight) if pet.weight is not None else None,
        "photo_url": pet.photo_url,
        "created_at": _iso(pet.created_at),
    }


def _vaccination_json(vaccination):
    return {
        "id": vaccination.id,
        "pet_id": vaccination.pet_id,
        "name": vaccination.name,
        "date_given": _iso(vaccination.date_given),
        "next_due": _iso(vaccination.next_due),
        "notes": vaccination.notes,
    }


def _medication_json(medication):
    return {
        "id": medication.id,
        "pet_id": medication.pet_id,
        "name": medication.name,
        "dosage": medication.dosage,
        "frequency": medication.frequency,
        "start_date": _iso(medication.start_date),
        "end_date": _iso(medication.end_date),
        "notes": medication.notes,
    }


def _appointment_json(appointment):
    return {
        "id": appointment.id,
        "pet_id": appointment.pet_id,
        "vet_name": appointment.vet_name,
        "date": _iso(appointment.date),
        "reason": appointment.reason,
        "notes": appointment.notes,
    }


def _weight_log_json(weight_log):
    return {
        "id": weight_log.id,
        "pet_id": weight_log.pet_id,
        "weight": str(weight_log.weight),
        "recorded_at": _iso(weight_log.recorded_at),
    }


def _feeding_log_json(feeding_log):
    return {
        "id": feeding_log.id,
        "pet_id": feeding_log.pet_id,
        "food_type": feeding_log.food_type,
        "amount": feeding_log.amount,
        "fed_at": _iso(feeding_log.fed_at),
    }


@pets_bp.get("")
@login_required
def list_pets():
    pets = (
        Pet.query.filter_by(user_id=current_user.id)
        .order_by(Pet.created_at.desc())
        .all()
    )
    return success_response({"pets": [_pet_json(pet) for pet in pets]})


@pets_bp.post("")
@login_required
def create_pet():
    data, error = load_json(pet_schema, _json_body())
    if error:
        return error

    pet = Pet(user_id=current_user.id, **data)
    db.session.add(pet)
    db.session.commit()
    return success_response({"pet": _pet_json(pet)}, 201)


@pets_bp.get("/<int:pet_id>")
@login_required
def get_pet(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)
    return success_response({"pet": _pet_json(pet)})


@pets_bp.put("/<int:pet_id>")
@login_required
def update_pet(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(pet_schema, _json_body(), partial=True)
    if error:
        return error
    if not data:
        return error_response({"json": ["At least one valid field is required."]}, 400)

    for field, value in data.items():
        setattr(pet, field, value)

    db.session.commit()
    return success_response({"pet": _pet_json(pet)})


@pets_bp.delete("/<int:pet_id>")
@login_required
def delete_pet(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    db.session.delete(pet)
    db.session.commit()
    return success_response({"message": "Pet deleted"})


@pets_bp.post("/<int:pet_id>/photo")
@login_required
def upload_pet_photo(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    photo = request.files.get("photo")
    if not photo:
        return error_response({"photo": ["Photo file is required."]}, 400)

    try:
        filename = _save_pet_photo(photo)
    except ValueError as exc:
        return error_response({"photo": [str(exc)]}, 400)

    pet.photo_url = f"/uploads/{filename}"
    db.session.commit()
    return success_response({"pet": _pet_json(pet), "photo_url": pet.photo_url})


@pets_bp.post("/<int:pet_id>/vaccinations")
@login_required
def create_vaccination(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(vaccination_schema, _json_body())
    if error:
        return error

    vaccination = Vaccination(pet_id=pet.id, **data)
    db.session.add(vaccination)
    db.session.commit()
    return success_response({"vaccination": _vaccination_json(vaccination)}, 201)


@pets_bp.get("/<int:pet_id>/vaccinations")
@login_required
def list_vaccinations(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    vaccinations = pet.vaccinations.order_by(Vaccination.date_given.desc()).all()
    return success_response(
        {"vaccinations": [_vaccination_json(item) for item in vaccinations]}
    )


@pets_bp.post("/<int:pet_id>/medications")
@login_required
def create_medication(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(medication_schema, _json_body())
    if error:
        return error

    medication = Medication(pet_id=pet.id, **data)
    db.session.add(medication)
    db.session.commit()
    return success_response({"medication": _medication_json(medication)}, 201)


@pets_bp.get("/<int:pet_id>/medications")
@login_required
def list_medications(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    medications = pet.medications.order_by(Medication.start_date.desc()).all()
    return success_response(
        {"medications": [_medication_json(item) for item in medications]}
    )


@pets_bp.post("/<int:pet_id>/appointments")
@login_required
def create_appointment(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(appointment_schema, _json_body())
    if error:
        return error

    appointment = Appointment(pet_id=pet.id, **data)
    db.session.add(appointment)
    db.session.commit()
    return success_response({"appointment": _appointment_json(appointment)}, 201)


@pets_bp.get("/<int:pet_id>/appointments")
@login_required
def list_appointments(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    appointments = pet.appointments.order_by(Appointment.date.desc()).all()
    return success_response(
        {"appointments": [_appointment_json(item) for item in appointments]}
    )


@pets_bp.post("/<int:pet_id>/weight-logs")
@login_required
def create_weight_log(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(weight_log_schema, _json_body())
    if error:
        return error

    data.setdefault("recorded_at", datetime.now(timezone.utc))
    weight_log = WeightLog(pet_id=pet.id, **data)
    db.session.add(weight_log)
    db.session.commit()
    return success_response({"weight_log": _weight_log_json(weight_log)}, 201)


@pets_bp.get("/<int:pet_id>/weight-logs")
@login_required
def list_weight_logs(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    weight_logs = pet.weight_logs.order_by(WeightLog.recorded_at.desc()).all()
    return success_response(
        {"weight_logs": [_weight_log_json(item) for item in weight_logs]}
    )


@pets_bp.post("/<int:pet_id>/feeding-logs")
@login_required
def create_feeding_log(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    data, error = load_json(feeding_log_schema, _json_body())
    if error:
        return error

    data.setdefault("fed_at", datetime.now(timezone.utc))
    feeding_log = FeedingLog(pet_id=pet.id, **data)
    db.session.add(feeding_log)
    db.session.commit()
    return success_response({"feeding_log": _feeding_log_json(feeding_log)}, 201)


@pets_bp.get("/<int:pet_id>/feeding-logs")
@login_required
def list_feeding_logs(pet_id):
    pet = _pet_for_user(pet_id)
    if not pet:
        return error_response("Pet not found", 404)

    feeding_logs = pet.feeding_logs.order_by(FeedingLog.fed_at.desc()).all()
    return success_response(
        {"feeding_logs": [_feeding_log_json(item) for item in feeding_logs]}
    )
