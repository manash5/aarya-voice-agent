import logging
import time
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, MetricsCollectedEvent, metrics
from livekit.plugins import google, noise_cancellation
from prompt import build_instructions
from companies.scalina_media import COMPANY_NAME, COMPANY_PROFILE
from evaluation.call_metrics import attach_realtime_latency_logging

logger = logging.getLogger(__name__)
load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, agent_name: str = "Aarya", company_profile: str = ""):
        super().__init__(
            instructions=build_instructions(
                agent_name=agent_name, company_profile=company_profile
            )
        )


server = AgentServer()


@server.rtc_session(agent_name="aarya-gemini-live")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    # same idea as fast_agent.py (one speech-to-speech model, no stt=/tts=),
    # but Gemini Live instead of OpenAI Realtime - uses GOOGLE_API_KEY, which
    # is already set, no new account needed
    session = AgentSession(
        llm=google.realtime.RealtimeModel(model="gemini-3.1-flash-live-preview", voice="Puck"),
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
