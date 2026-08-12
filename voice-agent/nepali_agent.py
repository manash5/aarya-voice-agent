"""Nepali receptionist entrypoint (Hindi-accented Cartesia TTS)."""

import logging
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer

from aarya.assistant import Assistant
from aarya.pipelines.nepali import build_nepali_pipeline
from aarya.session import start_pipeline_session

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

# TODO: verify this Nepali phrasing with a native speaker before real use
NEPALI_GREETING = "नमस्ते, म आर्या बोल्दैछु। तपाईंलाई कसरी सहयोग गर्न सक्छु?"

server = AgentServer()


@server.rtc_session(agent_name="aarya-nepali")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    bundle = build_nepali_pipeline()
    await start_pipeline_session(
        ctx=ctx,
        session=bundle.session,
        agent=Assistant(
            agent_name=agent_name,
            # no Nepali TTS voice available - Cartesia's Hindi voice reads this as-is
            output_language="Nepali",
        ),
        pooled_tts=bundle.pooled_tts,
        job_start_time=job_start_time,
        greeting=NEPALI_GREETING,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
