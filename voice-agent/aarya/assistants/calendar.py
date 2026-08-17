"""Receptionist assistant with Google Calendar booking tools."""

from __future__ import annotations

import asyncio
import logging
import random
from datetime import datetime, timedelta

from livekit.agents import Agent, RunContext, function_tool

from aarya.prompts import build_instructions
from aarya.tools import google_calendar as gcal

logger = logging.getLogger(__name__)

SHORT_COMPANY = """
Scalina Media is a digital marketing / social media agency in Sydney.
Services: content, social growth, SEO, lead gen, websites.
For quotes: info@scalinamedia.com.
""".strip()


def _calendar_rules() -> str:
    tz = gcal.calendar_timezone()
    now = datetime.now(tz)
    today = now.strftime("%Y-%m-%d")
    tomorrow = (now.date() + timedelta(days=1)).isoformat()
    # next few weekdays for the model
    days = []
    for i in range(1, 8):
        d = now.date() + timedelta(days=i)
        days.append(f"{d.strftime('%A')}={d.isoformat()}")
    return f"""
## Calendar booking — hard rules

Today is {now.strftime('%A')} {today} ({tz.key}). Tomorrow is {tomorrow}.
Upcoming: {', '.join(days)}.
 
Tools: check_availability, book_appointment.
- If the caller gives a DATE and TIME (e.g. Tuesday at 2 PM), call book_appointment
  immediately. Do not stall asking for email or a "full date".
- Use check_availability only when they ask what's free / if a day is open.
- Trust tool results literally. If it says Busy blocks: NONE, the day is NOT packed.
- Never invent that you're booked solid. Never fake a booking.
- Never say booked unless the tool result starts with SUCCESS.
- date args: tuesday / tomorrow / 2026-08-11 all work.
- start_time: "14:00" or "2 PM". Prefer 24h. "2 PM evening" means 14:00.
- Skip attendee_email unless they clearly spelled an email.
""".strip()


class CalendarAssistant(Agent):
    def __init__(
        self,
        agent_name: str = "Aarya",
        company_profile: str = "",
        output_language: str = "",
    ):
        profile = (company_profile or SHORT_COMPANY).strip()
        instructions = build_instructions(
            agent_name=agent_name,
            company_profile=f"{_calendar_rules()}\n\n{profile}",
            output_language=output_language,
        )
        super().__init__(instructions=instructions)

    @function_tool
    async def check_availability(
        self, ctx: RunContext, date: str, preferred_time: str = ""
    ) -> str:
        """Check real calendar availability for a day. Optionally verify one time.

        Args:
            date: YYYY-MM-DD, today, tomorrow, or weekday like tuesday.
            preferred_time: Optional time to check, e.g. 14:00 or 2 PM.
        """

        def pick_filler(step: int) -> str:
            return random.choice(
                [
                    "One sec, checking the calendar.",
                    "Let me see what's free.",
                ]
            )

        async with ctx.with_filler(pick_filler, delay=0.5):
            try:
                summary = await asyncio.to_thread(
                    gcal.day_availability_summary, date, preferred_time
                )
                return summary
            except Exception:
                logger.exception("check_availability failed")
                return (
                    "Calendar check failed. Ask again with tuesday, tomorrow, "
                    "or a date like 2026-08-11."
                )

    @function_tool
    async def book_appointment(
        self,
        ctx: RunContext,
        date: str,
        start_time: str,
        end_time: str = "",
        title: str = "Appointment",
        attendee_email: str = "",
    ) -> str:
        """Create a real Google Calendar event. Call this to book — do not pretend.

        Args:
            date: YYYY-MM-DD, today, tomorrow, or weekday like tuesday.
            start_time: HH:MM or like 2 PM.
            end_time: Optional; defaults to +30 minutes.
            title: Short meeting title.
            attendee_email: Optional; stored as a note, not an invite.
        """

        def pick_filler(step: int) -> str:
            return random.choice(
                [
                    "Alright, booking that now.",
                    "One moment, putting that on the calendar.",
                ]
            )

        async with ctx.with_filler(pick_filler, delay=0.5):
            try:
                # If that exact slot is busy, say so instead of double-booking silently
                free = await asyncio.to_thread(
                    gcal.is_slot_free, date, start_time, end_time
                )
                if not free:
                    summary = await asyncio.to_thread(
                        gcal.day_availability_summary, date, start_time
                    )
                    return (
                        "That exact time conflicts with an existing event. "
                        + summary
                    )

                event = await asyncio.to_thread(
                    gcal.create_event,
                    title=title or "Appointment",
                    date_str=date,
                    start_time=start_time,
                    end_time=end_time,
                    attendee_email=attendee_email,
                )
            except Exception:
                logger.exception("book_appointment failed")
                return (
                    "Booking failed. Need a clear date (tuesday / tomorrow / YYYY-MM-DD) "
                    "and time (e.g. 14:00)."
                )

            logger.info("calendar event created id=%s start=%s", event["id"], event["start"])
            guest = event.get("guest_noted") or ""
            extra = f" Guest noted: {guest}." if guest else ""
            return (
                f"SUCCESS: booked '{event['summary']}' "
                f"from {event['start']} to {event['end']}.{extra}"
            )
