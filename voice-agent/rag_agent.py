import asyncio
import logging
import random
import time
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    AgentServer, AgentSession, Agent, RunContext, room_io, llm, stt, tts,
    inference, TurnHandlingOptions, function_tool,
)
from livekit.plugins import silero, deepgram, groq, noise_cancellation
from prompt import build_instructions
from config.tts_pool import warm_tts_pool
from evaluation.call_metrics import attach_latency_logging

logger = logging.getLogger(__name__)
load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, agent_name: str = "Aarya", company_profile: str = ""):
        super().__init__(
            instructions=build_instructions(
                agent_name=agent_name, company_profile=company_profile
            )
        )

    @function_tool
    async def search_knowledge_base(self, ctx: RunContext, query: str) -> str:
        """Look up something about the company that isn't already in context -
        policies, product details, anything from the client's own documents."""

        async def pick_filler(step: int) -> str:
            return random.choice([
                "Let me check on that for you.",
                "One sec, looking that up.",
            ])

        async with ctx.with_filler(pick_filler, delay=0.8):
            # TODO: real retrieval goes here - embed `query`, search the
            # client's vector store, return the relevant chunk(s) as text
            raise NotImplementedError("RAG retrieval not implemented yet")


server = AgentServer()


@server.rtc_session(agent_name="aarya-rag")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"
    company_name = ""

    deepgram_tts = deepgram.TTS(model="aura-2-theia-en")

    session = AgentSession(
        stt = stt.FallbackAdapter(
            [
                deepgram.STT(model="nova-3", language="multi"),
                inference.STT.from_model_string("deepgram/nova-3:multi"),
                inference.STT.from_model_string("assemblyai/universal-streaming:en")
            ]
        ),
        llm = llm.FallbackAdapter(
            [
            groq.LLM(model="llama-3.3-70b-versatile"),
            inference.LLM(model="google/gemini-2.5-flash-lite"),
            inference.LLM(model="openai/gpt-4.1-mini"),
            ]
        ),
        tts = tts.FallbackAdapter(
            [
            deepgram_tts,
            inference.TTS.from_model_string("deepgram/aura-2:theia"),
            inference.TTS.from_model_string("cartesia/sonic-3:f31cc6a7-c1e8-4764-980c-60a361443dd1")
            ]
        ),
        vad=silero.VAD.load(),
        turn_handling=TurnHandlingOptions(
            turn_detection=inference.TurnDetector(),
            endpointing={
                "mode": "fixed",
                "min_delay": 0.45,
                "max_delay": 0.80,
            },
            interruption={
                "mode": "adaptive",
                "min_duration": 0.50,
                "resume_false_interruption": True,
                "false_interruption_timeout": 0.60,
            },
            preemptive_generation={
                "preemptive_tts": True,
            },
        ),
    )

    # overlaps its ~0.9s handshake with session.start() below instead of stacking after it
    first_conn_task = asyncio.create_task(warm_tts_pool(deepgram_tts._pool, count=1))

    attach_latency_logging(session, ctx, deepgram_tts, job_start_time)

    await session.start(
        room=ctx.room,
        agent=Assistant(agent_name=agent_name),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    await first_conn_task

    # say() skips the LLM - name and wording stay fixed every call
    greeting = (
        f"Hello, this is {agent_name} speaking from {company_name}."
        if company_name
        else f"Hello, this is {agent_name} speaking."
    )
    # claim the ready connection before the pool top-up queues behind it
    await session.say(f"{greeting} How may I help you?")
    asyncio.create_task(warm_tts_pool(deepgram_tts._pool, count=2))


if __name__ == "__main__":
    agents.cli.run_app(server)
