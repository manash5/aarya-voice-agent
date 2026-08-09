import asyncio
import logging
import time
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, llm, stt, tts, inference, TurnHandlingOptions
from livekit.plugins import silero, groq, noise_cancellation, assemblyai
from prompt import build_instructions
from config.tts_pool import warm_tts_pool
from evaluation.call_metrics import attach_latency_logging
import config.assemblyai_patch  # noqa: F401 - fixes language_codes before any assemblyai.STT() call
from livekit.plugins import silero, google, deepgram, groq, azure

logger = logging.getLogger(__name__)
load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self, agent_name: str = "Aarya", company_profile: str = ""):
        super().__init__(
            instructions=build_instructions(
                agent_name=agent_name,
                company_profile=company_profile,
                # no Nepali TTS voice available - Cartesia's Hindi voice reads this as-is
                output_language="Nepali",
            )
        )


server = AgentServer()


@server.rtc_session(agent_name="aarya-nepali")
async def my_agent(ctx: agents.JobContext):
    job_start_time = time.time()
    agent_name = "Aarya"
    company_name = ""

    # via inference so no separate Cartesia account is needed
    cartesia_tts = inference.TTS(model="cartesia/sonic-3", language="hi")
    azure_tts = azure.TTS(
        voice="ne-NP-HemkalaNeural",
        language="ne-NP",
    )

    session = AgentSession(
        stt = stt.FallbackAdapter(
            [
                # AssemblyAI's real-time models don't have Nepali training - Scribe does
                inference.STT.from_model_string("elevenlabs/scribe_v2_realtime:ne"),
                # weaker Nepali, but better than nothing if Scribe is down
                assemblyai.STT(model="universal-3-5-pro", language_codes=["ne", "en"]),
                # last resort: English only, keeps the call alive
                assemblyai.STT(model="universal-streaming-english"),
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
            azure_tts, 
            cartesia_tts,
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
    first_conn_task = asyncio.create_task(warm_tts_pool(cartesia_tts._pool, count=1))

    attach_latency_logging(session, ctx, cartesia_tts, job_start_time)

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

    # TODO: verify this Nepali phrasing with a native speaker before real use
    greeting = "नमस्ते, म आर्या बोल्दैछु। तपाईंलाई कसरी सहयोग गर्न सक्छु?"
    # claim the ready connection before the pool top-up queues behind it
    await session.say(greeting)
    asyncio.create_task(warm_tts_pool(cartesia_tts._pool, count=2))


if __name__ == "__main__":
    agents.cli.run_app(server)
