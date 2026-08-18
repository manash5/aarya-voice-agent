"""English receptionist entrypoint (Ozi Hygiene and Packaging + Google Calendar)."""

import logging
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer

from aarya.assistants.calendar import CalendarAssistant
from aarya.companies.ozi_hygiene import COMPANY_BRIEF, GREETING
from aarya.pipelines.calendar import build_calendar_pipeline
from aarya.session import start_pipeline_session

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

server = AgentServer()


@server.rtc_session(agent_name="aarya")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    bundle = build_calendar_pipeline()
    await start_pipeline_session(
        ctx=ctx,
        session=bundle.session,
        agent=CalendarAssistant(
            agent_name=agent_name,
            # brief, not the full profile - this rides on every turn
            company_profile=COMPANY_BRIEF,
        ),
        pooled_tts=bundle.pooled_tts,
        job_start_time=job_start_time,
        greeting=GREETING,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
