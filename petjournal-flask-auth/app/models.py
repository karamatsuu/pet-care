from datetime import datetime, timezone

from flask_login import UserMixin

from app import db


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    pets = db.relationship(
        "Pet",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Pet(db.Model):
    __tablename__ = "pets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(120), nullable=False)
    species = db.Column(db.String(80), nullable=False)
    breed = db.Column(db.String(120))
    birth_date = db.Column(db.Date)
    weight = db.Column(db.Numeric(6, 2))
    photo_url = db.Column(db.String(500))
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="pets")
    vaccinations = db.relationship(
        "Vaccination",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    medications = db.relationship(
        "Medication",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    appointments = db.relationship(
        "Appointment",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    weight_logs = db.relationship(
        "WeightLog",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    feeding_logs = db.relationship(
        "FeedingLog",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )


class Vaccination(db.Model):
    __tablename__ = "vaccinations"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(120), nullable=False)
    date_given = db.Column(db.Date, nullable=False)
    next_due = db.Column(db.Date)
    notes = db.Column(db.Text)

    pet = db.relationship("Pet", back_populates="vaccinations")


class Medication(db.Model):
    __tablename__ = "medications"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(120), nullable=False)
    dosage = db.Column(db.String(120), nullable=False)
    frequency = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    notes = db.Column(db.Text)

    pet = db.relationship("Pet", back_populates="medications")


class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    vet_name = db.Column(db.String(160), nullable=False)
    date = db.Column(db.DateTime(timezone=True), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text)

    pet = db.relationship("Pet", back_populates="appointments")


class WeightLog(db.Model):
    __tablename__ = "weight_logs"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    weight = db.Column(db.Numeric(6, 2), nullable=False)
    recorded_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    pet = db.relationship("Pet", back_populates="weight_logs")


class FeedingLog(db.Model):
    __tablename__ = "feeding_logs"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    food_type = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.String(120), nullable=False)
    fed_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    pet = db.relationship("Pet", back_populates="feeding_logs")
