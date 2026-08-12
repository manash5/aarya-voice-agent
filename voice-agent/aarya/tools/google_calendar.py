"""Google Calendar helpers (service-account auth)."""

from __future__ import annotations

import os
import re
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]

_WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


class CalendarConfigError(RuntimeError):
    pass


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def calendar_id() -> str:
    value = _env("GOOGLE_CALENDAR_ID")
    if not value:
        raise CalendarConfigError("GOOGLE_CALENDAR_ID is not set")
    return value


def calendar_timezone() -> ZoneInfo:
    return ZoneInfo(_env("GOOGLE_CALENDAR_TIMEZONE", "Asia/Kathmandu"))


@lru_cache(maxsize=1)
def _calendar_service():
    path = _env("GOOGLE_SERVICE_ACCOUNT_FILE", "./credentials/service-account.json")
    key_path = Path(path).expanduser()
    if not key_path.is_absolute():
        key_path = Path.cwd() / key_path
    if not key_path.exists():
        raise CalendarConfigError(
            f"Service account file not found: {key_path}. "
            "Set GOOGLE_SERVICE_ACCOUNT_FILE to the JSON key path."
        )

    credentials = service_account.Credentials.from_service_account_file(
        str(key_path),
        scopes=SCOPES,
    )
    return build("calendar", "v3", credentials=credentials, cache_discovery=False)


def _next_weekday(today: datetime, weekday: int, *, allow_today: bool = False) -> datetime:
    delta = (weekday - today.weekday()) % 7
    if delta == 0 and not allow_today:
        delta = 7
    return today + timedelta(days=delta)


def _parse_day(date_str: str) -> datetime:
    """Parse a day into midnight in the calendar timezone."""
    raw = (date_str or "").strip().lower()
    tz = calendar_timezone()
    today = datetime.now(tz).replace(hour=0, minute=0, second=0, microsecond=0)

    if not raw or "yyyy" in raw or "date as" in raw:
        raise ValueError(
            f"Invalid date '{date_str}'. Use YYYY-MM-DD, today, tomorrow, or a weekday."
        )

    if raw in {"today", "todays", "today's"}:
        return today
    if raw in {"tomorrow", "tomorrows", "tomorrow's"}:
        return today + timedelta(days=1)
    if raw in {"yesterday"}:
        return today - timedelta(days=1)

    # "next tuesday", "this monday", "tuesday"
    compact = re.sub(r"[^a-z\s]", " ", raw)
    tokens = compact.split()
    for i, tok in enumerate(tokens):
        if tok in _WEEKDAYS:
            want_next = i > 0 and tokens[i - 1] == "next"
            return _next_weekday(today, _WEEKDAYS[tok], allow_today=not want_next and tok == tokens[0])

    for token in raw.replace(",", " ").split():
        if len(token) >= 10 and token[4] == "-" and token[7] == "-":
            try:
                day = datetime.strptime(token[:10], "%Y-%m-%d")
                return day.replace(tzinfo=tz)
            except ValueError:
                pass

    # "august 11 2026" / "aug 11"
    try:
        day = datetime.strptime(raw[:10], "%Y-%m-%d")
        return day.replace(tzinfo=tz)
    except ValueError:
        pass

    raise ValueError(
        f"Could not parse date '{date_str}'. Try tomorrow, tuesday, or 2026-08-11."
    )


def normalize_date(date_str: str) -> str:
    """Return YYYY-MM-DD for tool args."""
    return _parse_day(date_str).strftime("%Y-%m-%d")


def list_busy_slots(date_str: str) -> list[dict[str, str]]:
    """Return busy blocks for a calendar day as local start/end strings."""
    start = _parse_day(date_str)
    end = start + timedelta(days=1)
    service = _calendar_service()
    body = {
        "timeMin": start.isoformat(),
        "timeMax": end.isoformat(),
        "timeZone": str(calendar_timezone()),
        "items": [{"id": calendar_id()}],
    }
    result = service.freebusy().query(body=body).execute()
    calendars = result.get("calendars", {})
    busy = calendars.get(calendar_id(), {}).get("busy", [])
    tz = calendar_timezone()
    out: list[dict[str, str]] = []
    for block in busy:
        b_start = datetime.fromisoformat(block["start"].replace("Z", "+00:00")).astimezone(tz)
        b_end = datetime.fromisoformat(block["end"].replace("Z", "+00:00")).astimezone(tz)
        out.append(
            {
                "start": b_start.strftime("%H:%M"),
                "end": b_end.strftime("%H:%M"),
            }
        )
    return out


def _busy_datetimes(date_str: str) -> list[tuple[datetime, datetime]]:
    day = _parse_day(date_str)
    tz = calendar_timezone()
    pairs: list[tuple[datetime, datetime]] = []
    for block in list_busy_slots(date_str):
        b_start = datetime.strptime(block["start"], "%H:%M").replace(
            year=day.year, month=day.month, day=day.day, tzinfo=tz
        )
        b_end = datetime.strptime(block["end"], "%H:%M").replace(
            year=day.year, month=day.month, day=day.day, tzinfo=tz
        )
        pairs.append((b_start, b_end))
    return pairs


def is_slot_free(date_str: str, start_time: str, end_time: str = "") -> bool:
    """True if the requested window does not overlap any busy block."""
    day = _parse_day(date_str)
    tz = calendar_timezone()
    start_norm = normalize_time(start_time)
    if end_time.strip():
        end_norm = normalize_time(end_time)
    else:
        sh, sm = map(int, start_norm.split(":"))
        end_norm = (day.replace(hour=sh, minute=sm) + timedelta(minutes=30)).strftime("%H:%M")

    sh, sm = map(int, start_norm.split(":"))
    eh, em = map(int, end_norm.split(":"))
    slot_start = day.replace(hour=sh, minute=sm, tzinfo=tz)
    slot_end = day.replace(hour=eh, minute=em, tzinfo=tz)
    if slot_end <= slot_start:
        slot_end = slot_start + timedelta(minutes=30)

    for b_start, b_end in _busy_datetimes(date_str):
        if slot_start < b_end and slot_end > b_start:
            return False
    return True


def day_availability_summary(date_str: str, preferred_time: str = "") -> str:
    """Human-readable availability for the model — hard to misread."""
    resolved = normalize_date(date_str)
    day = _parse_day(resolved)
    busy = list_busy_slots(resolved)
    label = day.strftime("%A %Y-%m-%d")

    lines = [f"Date: {label}."]
    if not busy:
        lines.append("Busy blocks: NONE — the calendar is empty that day.")
    else:
        lines.append(
            "Busy blocks: " + ", ".join(f"{b['start']}-{b['end']}" for b in busy) + "."
        )

    # Free windows across extended hours (08:00–22:00), up to 10 slots
    free = suggest_free_slots(
        resolved, day_start_hour=8, day_end_hour=22, slot_minutes=60, limit=10
    )
    if free:
        lines.append("Example free hours: " + ", ".join(free) + ".")
    else:
        lines.append("No free hour-long gaps between 08:00 and 22:00.")

    if preferred_time.strip():
        try:
            pref = normalize_time(preferred_time)
            ok = is_slot_free(resolved, pref)
            lines.append(
                f"Requested time {pref}: {'AVAILABLE' if ok else 'CONFLICTS with an existing event'}."
            )
        except ValueError:
            lines.append(f"Could not parse preferred time '{preferred_time}'.")

    lines.append(
        "IMPORTANT: Only times listed under Busy blocks are taken. "
        "Do not invent that the day is packed if Busy blocks is NONE."
    )
    return " ".join(lines)


def suggest_free_slots(
    date_str: str,
    *,
    day_start_hour: int = 8,
    day_end_hour: int = 22,
    slot_minutes: int = 60,
    limit: int = 10,
) -> list[str]:
    """Suggest open HH:MM-HH:MM windows."""
    start_day = _parse_day(date_str)
    busy_pairs = _busy_datetimes(date_str)

    def overlaps(slot_start: datetime, slot_end: datetime) -> bool:
        for b_start, b_end in busy_pairs:
            if slot_start < b_end and slot_end > b_start:
                return True
        return False

    free: list[str] = []
    cursor = start_day.replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
    end_of_day = start_day.replace(hour=day_end_hour, minute=0, second=0, microsecond=0)
    step = timedelta(minutes=slot_minutes)
    while cursor + step <= end_of_day and len(free) < limit:
        slot_end = cursor + step
        if not overlaps(cursor, slot_end):
            free.append(f"{cursor.strftime('%H:%M')}-{slot_end.strftime('%H:%M')}")
        cursor = slot_end
    return free


def normalize_time(time_str: str) -> str:
    """Normalize spoken/typed times to HH:MM (24h)."""
    raw = (time_str or "").strip().lower().replace(".", "")
    if not raw:
        raise ValueError("empty time")

    # "2 pm evening" / "two pm"
    word_hours = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "noon": 12,
        "midnight": 0,
    }
    for word, hour in word_hours.items():
        if re.search(rf"\b{word}\b", raw):
            meridiem = "pm" if ("pm" in raw or "evening" in raw or "afternoon" in raw) else None
            if "am" in raw or "morning" in raw:
                meridiem = "am"
            if word == "noon":
                return "12:00"
            if word == "midnight":
                return "00:00"
            if meridiem == "pm" and hour < 12:
                hour += 12
            if meridiem == "am" and hour == 12:
                hour = 0
            # bare "two" with evening → pm
            if meridiem is None and "evening" in raw and hour < 12:
                hour += 12
            return f"{hour:02d}:00"

    if ":" in raw:
        parts = raw.replace(",", " ").split()
        for part in parts:
            if ":" in part:
                h, m = part.split(":", 1)
                hour, minute = int(re.sub(r"\D", "", h) or 0), int(re.sub(r"\D", "", m) or 0)
                if "pm" in raw and hour < 12:
                    hour += 12
                if "am" in raw and hour == 12:
                    hour = 0
                return f"{hour:02d}:{minute:02d}"

    meridiem = None
    if "pm" in raw or "p m" in raw or "evening" in raw or "afternoon" in raw:
        meridiem = "pm"
    elif "am" in raw or "a m" in raw or "morning" in raw:
        meridiem = "am"

    digits = "".join(ch if ch.isdigit() or ch == ":" else " " for ch in raw).split()
    if not digits:
        raise ValueError(f"invalid time: {time_str}")
    token = digits[0]
    if ":" in token:
        h_s, m_s = token.split(":", 1)
        hour, minute = int(h_s), int(m_s)
    else:
        hour, minute = int(token), 0

    if meridiem == "pm" and hour < 12:
        hour += 12
    if meridiem == "am" and hour == 12:
        hour = 0
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        raise ValueError(f"invalid time: {time_str}")
    return f"{hour:02d}:{minute:02d}"


def create_event(
    *,
    title: str,
    date_str: str,
    start_time: str,
    end_time: str = "",
    attendee_email: str = "",
    description: str = "",
) -> dict[str, Any]:
    """Create a calendar event. Guest emails go in description (no invites)."""
    day = _parse_day(date_str)
    tz = calendar_timezone()
    start_norm = normalize_time(start_time)
    if end_time.strip():
        end_norm = normalize_time(end_time)
    else:
        sh, sm = map(int, start_norm.split(":"))
        start_tmp = day.replace(hour=sh, minute=sm) + timedelta(minutes=30)
        end_norm = start_tmp.strftime("%H:%M")

    start_h, start_m = map(int, start_norm.split(":"))
    end_h, end_m = map(int, end_norm.split(":"))
    start_dt = day.replace(hour=start_h, minute=start_m)
    end_dt = day.replace(hour=end_h, minute=end_m)
    if end_dt <= start_dt:
        end_dt = start_dt + timedelta(minutes=30)

    notes = [description.strip()] if description.strip() else []
    guest = attendee_email.strip()
    if guest and "@" in guest and "example.com" not in guest:
        notes.append(f"Guest contact: {guest}")

    event: dict[str, Any] = {
        "summary": title.strip() or "Appointment",
        "description": "\n".join(notes),
        "start": {"dateTime": start_dt.isoformat(), "timeZone": str(tz)},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": str(tz)},
    }

    service = _calendar_service()
    created = (
        service.events()
        .insert(calendarId=calendar_id(), body=event, sendUpdates="none")
        .execute()
    )
    return {
        "id": created.get("id", ""),
        "html_link": created.get("htmlLink", ""),
        "summary": created.get("summary", title),
        "start": start_dt.strftime("%Y-%m-%d %H:%M"),
        "end": end_dt.strftime("%Y-%m-%d %H:%M"),
        "guest_noted": guest if guest and "@" in guest else "",
    }
