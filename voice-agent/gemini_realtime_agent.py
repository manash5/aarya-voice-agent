"""Gemini Live speech-to-speech entrypoint (no separate STT/LLM/TTS stages)."""

import logging
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    AgentServer,
    AgentSession,
    MetricsCollectedEvent,
    metrics,
    room_io,
)
from livekit.plugins import google, noise_cancellation

from aarya.assistant import Assistant
from aarya.companies.ozi_hygiene import COMPANY_PROFILE
from aarya.evaluation.call_metrics import attach_realtime_latency_logging

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

server = AgentServer()


@server.rtc_session(agent_name="aarya-gemini-live")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    # Gemini Live instead of a cascaded STT/LLM/TTS stack - uses GOOGLE_API_KEY
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",
            # feminine prebuilt voice, to match the Deepgram side (Aura 2 Theia).
            # Other feminine options: Aoede (breezy), Leda (youthful), Zephyr (bright).
            voice="Kore",
        ),
    )

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)

    attach_realtime_latency_logging(session, job_start_time)

    await session.start(
        room=ctx.room,
        agent=Assistant(agent_name=agent_name, company_profile=COMPANY_PROFILE),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    # generate_reply() is not supported by gemini-3.1-flash-live-preview (confirmed
    # via a real run - it logs a warning and silently does nothing) - this model
    # can't greet first yet, you have to speak first to test it. Worth trying
    # gemini-2.5-flash-native-audio-preview-12-2025 later to see if that one supports it.


if __name__ == "__main__":
    agents.cli.run_app(server)
