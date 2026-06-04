import atexit
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from flask import render_template_string
from flask_mail import Message
from sqlalchemy import or_

from app import mail
from app.models import Appointment, Medication, Pet, User


REMINDER_EMAIL_TEMPLATE = """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>PetJournal Reminder</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:#2563eb;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;">PetJournal reminder</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">
                  Hi there,
                </p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">
                  Here are today's care reminders for your pet family.
                </p>

                {% if medications %}
                  <h2 style="margin:24px 0 12px;font-size:18px;color:#111827;">Medications due today</h2>
                  {% for item in medications %}
                    <div style="padding:14px 0;border-top:1px solid #e5e7eb;">
                      <p style="margin:0 0 6px;font-size:16px;"><strong>{{ item.pet_name }}</strong> needs <strong>{{ item.name }}</strong>.</p>
                      <p style="margin:0;font-size:14px;color:#4b5563;">
                        Dosage: {{ item.dosage }}<br>
                        Frequency: {{ item.frequency }}
                        {% if item.notes %}<br>Notes: {{ item.notes }}{% endif %}
                      </p>
                    </div>
                  {% endfor %}
                {% endif %}

                {% if appointments %}
                  <h2 style="margin:24px 0 12px;font-size:18px;color:#111827;">Appointments in the next 24 hours</h2>
                  {% for item in appointments %}
                    <div style="padding:14px 0;border-top:1px solid #e5e7eb;">
                      <p style="margin:0 0 6px;font-size:16px;"><strong>{{ item.pet_name }}</strong> has an appointment with <strong>{{ item.vet_name }}</strong>.</p>
                      <p style="margin:0;font-size:14px;color:#4b5563;">
                        When: {{ item.date }}<br>
                        Reason: {{ item.reason }}
                        {% if item.notes %}<br>Notes: {{ item.notes }}{% endif %}
                      </p>
                    </div>
                  {% endfor %}
                {% endif %}

                <p style="margin:26px 0 0;font-size:16px;line-height:1.5;">
                  You are doing a thoughtful job keeping everyone healthy. PetJournal is here to help you stay on top of the details.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


_scheduler = None


def _scheduler_should_start(app):
    if not app.config.get("REMINDER_SCHEDULER_ENABLED", True):
        return False
    if os.environ.get("FLASK_RUN_FROM_CLI") == "true" and app.debug:
        return os.environ.get("WERKZEUG_RUN_MAIN") == "true"
    return True


def _format_datetime(value, tz):
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(tz).strftime("%b %d, %Y at %I:%M %p").replace(" 0", " ")


def _active_medications_due_today(today):
    return (
        Medication.query.join(Pet)
        .join(User)
        .filter(Medication.start_date <= today)
        .filter(or_(Medication.end_date.is_(None), Medication.end_date >= today))
        .all()
    )


def _appointments_due_next_24_hours(now):
    start = now.astimezone(timezone.utc)
    end = start + timedelta(hours=24)
    return (
        Appointment.query.join(Pet)
        .join(User)
        .filter(Appointment.date >= start)
        .filter(Appointment.date <= end)
        .all()
    )


def _group_reminders_by_owner(medications, appointments, tz):
    reminders = defaultdict(lambda: {"medications": [], "appointments": []})

    for medication in medications:
        owner = medication.pet.user
        reminders[owner.email]["medications"].append(
            {
                "pet_name": medication.pet.name,
                "name": medication.name,
                "dosage": medication.dosage,
                "frequency": medication.frequency,
                "notes": medication.notes,
            }
        )

    for appointment in appointments:
        owner = appointment.pet.user
        reminders[owner.email]["appointments"].append(
            {
                "pet_name": appointment.pet.name,
                "vet_name": appointment.vet_name,
                "date": _format_datetime(appointment.date, tz),
                "reason": appointment.reason,
                "notes": appointment.notes,
            }
        )

    return reminders


def send_daily_reminders(app):
    tz = ZoneInfo(app.config.get("REMINDER_TIMEZONE", "UTC"))
    now = datetime.now(tz)
    today = now.date()

    with app.app_context():
        medications = _active_medications_due_today(today)
        appointments = _appointments_due_next_24_hours(now)
        reminders_by_owner = _group_reminders_by_owner(medications, appointments, tz)

        for email, reminders in reminders_by_owner.items():
            if not reminders["medications"] and not reminders["appointments"]:
                continue

            html = render_template_string(
                REMINDER_EMAIL_TEMPLATE,
                medications=reminders["medications"],
                appointments=reminders["appointments"],
            )
            message = Message(
                subject="PetJournal care reminders",
                recipients=[email],
                html=html,
            )
            mail.send(message)


def start_reminder_scheduler(app):
    global _scheduler

    if _scheduler and _scheduler.running:
        return _scheduler
    if not _scheduler_should_start(app):
        return None

    timezone_name = app.config.get("REMINDER_TIMEZONE", "UTC")
    _scheduler = BackgroundScheduler(timezone=timezone_name)
    _scheduler.add_job(
        func=send_daily_reminders,
        trigger="cron",
        args=[app],
        hour=8,
        minute=0,
        id="daily_petjournal_reminders",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    _scheduler.start()
    atexit.register(lambda: _scheduler.shutdown(wait=False))
    return _scheduler
