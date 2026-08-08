"""English receptionist entrypoint (Scalina Media demo profile)."""

import logging
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer

from aarya.assistant import Assistant
from aarya.companies.scalina_media import COMPANY_NAME, COMPANY_PROFILE
from aarya.pipelines.english import build_english_pipeline
from aarya.session import english_greeting, start_pipeline_session

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

server = AgentServer()


@server.rtc_session(agent_name="aarya")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    bundle = build_english_pipeline()
    await start_pipeline_session(
        ctx=ctx,
        session=bundle.session,
        agent=Assistant(agent_name=agent_name, company_profile=COMPANY_PROFILE),
        pooled_tts=bundle.pooled_tts,
        job_start_time=job_start_time,
        greeting=english_greeting(agent_name, COMPANY_NAME),
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
