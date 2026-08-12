"""English receptionist entrypoint (Scalina Media demo + Google Calendar)."""

import logging
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer

from aarya.assistants.calendar import SHORT_COMPANY, CalendarAssistant
from aarya.companies.scalina_media import COMPANY_NAME
from aarya.pipelines.calendar import build_calendar_pipeline
from aarya.session import english_greeting, start_pipeline_session

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
            company_profile=SHORT_COMPANY,
        ),
        pooled_tts=bundle.pooled_tts,
        job_start_time=job_start_time,
        greeting=english_greeting(agent_name, COMPANY_NAME),
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
