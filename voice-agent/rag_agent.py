"""RAG receptionist entrypoint - knowledge-base tool scaffolded, retrieval TBD."""

import logging
import random
import time

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, RunContext, function_tool

from aarya.assistant import Assistant
from aarya.companies.ozi_hygiene import COMPANY_PROFILE, GREETING
from aarya.pipelines.rag import build_rag_pipeline
from aarya.session import start_pipeline_session

logger = logging.getLogger(__name__)
load_dotenv(".env.local")


class RagAssistant(Assistant):
    @function_tool
    async def search_knowledge_base(self, ctx: RunContext, query: str) -> str:
        """Look up something about the company that isn't already in context -
        policies, product details, anything from the client's own documents."""

        async def pick_filler(step: int) -> str:
            return random.choice(
                [
                    "Let me check on that for you.",
                    "One sec, looking that up.",
                ]
            )

        async with ctx.with_filler(pick_filler, delay=0.8):
            # TODO: real retrieval goes here - embed `query`, search the
            # client's vector store, return the relevant chunk(s) as text
            raise NotImplementedError("RAG retrieval not implemented yet")


server = AgentServer()


@server.rtc_session(agent_name="aarya-rag")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"

    bundle = build_rag_pipeline()
    await start_pipeline_session(
        ctx=ctx,
        session=bundle.session,
        agent=RagAssistant(agent_name=agent_name, company_profile=COMPANY_PROFILE),
        pooled_tts=bundle.pooled_tts,
        job_start_time=job_start_time,
        greeting=GREETING,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
