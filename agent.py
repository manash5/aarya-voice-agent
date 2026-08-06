import asyncio
import logging
import time
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, llm, stt, tts, inference
from livekit.plugins import silero, google, deepgram, groq
from livekit.agents import AgentStateChangedEvent, MetricsCollectedEvent, metrics, TurnHandlingOptions
from livekit.plugins import noise_cancellation, silero

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                """You are Aarya, a friendly AI receptionist.

                    Your goal is to help callers naturally and efficiently.

                    Keep responses under two sentences unless more detail is necessary.

                    Speak conversationally with a warm, cheerful personality.

                    Occasionally use natural fillers such as "well", "hmm", or "let me think" when appropriate, but never overuse them.

                    Very occasionally add a slight stutter or hesitation for realism, but avoid making every sentence sound hesitant.

                    Never sound robotic, repetitive, or overly scripted. """
            )
        )

server = AgentServer()


async def _warm_tts_pool(pool, count: int, timeout: float = 10.0) -> None:
    """Force `count` connections to exist in a TTS ConnectionPool up front.

    TTS.prewarm() only guarantees one ready connection, but preemptive_tts can
    need two (a speculative stream plus the real one) at once. When the pool
    only has one, the second stream opens a fresh websocket instead of reusing
    one - paying a ~0.9s handshake cost live, during the user's first turn or
    two. Opening `count` connections concurrently and returning them all to the
    pool avoids that.
    """
    try:
        conns = await asyncio.gather(*[pool.get(timeout=timeout) for _ in range(count)])
        for conn in conns:
            pool.put(conn)
    except Exception:
        logger.exception("failed to prewarm TTS connection pool")


@server.rtc_session(agent_name="aarya")
async def my_agent(ctx: agents.JobContext):
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
                "mode":"fixed",
                "min_delay":0.45,
                "max_delay":0.80,
            },

            interruption={
                "mode":"adaptive",
                "min_duration":0.50,
                "resume_false_interruption":True,
                "false_interruption_timeout":0.60,
            },

            preemptive_generation={
                "preemptive_tts":True,
            }, 
        ),
    )

    # Fire-and-forget: get connections into the pool before the user's first
    # turn finishes, instead of paying the handshake cost live on that turn
    asyncio.create_task(_warm_tts_pool(deepgram_tts._pool, count=3))

    # Aggregate data across all conversation turns
    usage_collector = metrics.UsageCollector()

    # Track End of Utterance timing (when turn detector decides user finished speaking)
    last_eou_metrics: metrics.EOUMetrics | None = None

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        nonlocal last_eou_metrics
        # Capture EOU metrics for TTFA calculation
        if ev.metrics.type == "eou_metrics":
            last_eou_metrics = ev.metrics

        # Log each metric as it arrives and add to usage collector
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

        # log_metrics() doesn't surface these - they're what tells us whether a
        # TTS stall came from a fresh websocket handshake vs. a reused connection
        if ev.metrics.type == "tts_metrics":
            logger.info(
                f"TTS connection: reused={ev.metrics.connection_reused} "
                f"acquire_time={ev.metrics.acquire_time:.3f}s"
            )
            # A cold-open means a cancelled stream burned a pooled connection
            # (preemptive_tts can cancel speculative attempts on fragmented
            # speech, and fragmented turns can burn through more than 1 at a
            # time). Replenish by 2 to stay ahead instead of trailing by 1
            # forever on choppy conversations.
            if not ev.metrics.connection_reused:
                asyncio.create_task(_warm_tts_pool(deepgram_tts._pool, count=2))


    async def log_usage():
        # Print per-session summary (tokens, audio duration, costs)
        summary = usage_collector.get_summary()
        logger.info("Usage summary: %s", summary)


    # Fire log_usage when worker shuts down
    ctx.add_shutdown_callback(log_usage)

    @session.on("agent_state_changed")
    def _on_agent_state_changed(ev: AgentStateChangedEvent):
        if ev.new_state == "speaking":
            if last_eou_metrics:
                # Time from turn commit to first audio (what we measured before)
                post_commit = time.time() - last_eou_metrics.timestamp
                # Time from the user actually finishing speaking to first audio -
                # includes the EOU/endpointing wait, which preemptive generation
                # can hide from post_commit alone
                true_latency = last_eou_metrics.end_of_utterance_delay + post_commit
                logger.info(
                    f"Time to first audio: {post_commit:.3f}s post-commit | "
                    f"{true_latency:.3f}s true latency "
                    f"(EOU wait: {last_eou_metrics.end_of_utterance_delay:.3f}s)"
                )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(), 
            ),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )

if __name__ == "__main__":
    agents.cli.run_app(server)