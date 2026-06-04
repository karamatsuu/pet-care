from marshmallow import (
    EXCLUDE,
    Schema,
    ValidationError,
    fields,
    validate as ma_validate,
    validates_schema,
)

from app.responses import error_response


def not_blank(value):
    if isinstance(value, str) and not value.strip():
        raise ValidationError("Field cannot be blank.")


def positive_decimal(value):
    if value <= 0:
        raise ValidationError("Field must be greater than 0.")


class BaseSchema(Schema):
    class Meta:
        unknown = EXCLUDE


class UserRegisterSchema(BaseSchema):
    email = fields.Email(required=True)
    password = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(min=8, max=128)],
    )


class UserLoginSchema(BaseSchema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=not_blank)


class PetSchema(BaseSchema):
    name = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    species = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=80)],
    )
    breed = fields.String(
        allow_none=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    birth_date = fields.Date(allow_none=True)
    weight = fields.Decimal(as_string=False, allow_none=True, validate=positive_decimal)
    photo_url = fields.Url(
        allow_none=True,
        require_tld=False,
        validate=ma_validate.Length(max=500),
    )


class VaccinationSchema(BaseSchema):
    name = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    date_given = fields.Date(required=True)
    next_due = fields.Date(allow_none=True)
    notes = fields.String(allow_none=True)


class MedicationSchema(BaseSchema):
    name = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    dosage = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    frequency = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    start_date = fields.Date(required=True)
    end_date = fields.Date(allow_none=True)
    notes = fields.String(allow_none=True)

    @validates_schema
    def validate_dates(self, data, **kwargs):
        end_date = data.get("end_date")
        start_date = data.get("start_date")
        if end_date and start_date and end_date < start_date:
            raise ValidationError(
                {"end_date": ["end_date cannot be before start_date."]}
            )


class AppointmentSchema(BaseSchema):
    vet_name = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=160)],
    )
    date = fields.DateTime(required=True)
    reason = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=255)],
    )
    notes = fields.String(allow_none=True)


class WeightLogSchema(BaseSchema):
    weight = fields.Decimal(required=True, as_string=False, validate=positive_decimal)
    recorded_at = fields.DateTime(allow_none=True)


class FeedingLogSchema(BaseSchema):
    food_type = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    amount = fields.String(
        required=True,
        validate=[not_blank, ma_validate.Length(max=120)],
    )
    fed_at = fields.DateTime(allow_none=True)


def load_json(schema, data, partial=False):
    if not isinstance(data, dict):
        return None, error_response({"json": ["Request body must be a JSON object."]}, 400)

    try:
        return schema.load(data, partial=partial), None
    except ValidationError as exc:
        return None, error_response(exc.messages, 400)
