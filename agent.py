import logging
import time
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, llm, stt, tts, inference
from livekit.plugins import silero
from livekit.agents import AgentStateChangedEvent, MetricsCollectedEvent, metrics 
from livekit.plugins import noise_cancellation, silero

logger = logging.getLogger(__name__)
load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are a helpful voice assistant. Keep responses concise, ideally under 2 sentences. Be conversational and friendly."
            )
        )

server = AgentServer()

@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        stt = stt.FallbackAdapter(
            [
                inference.STT.from_model_string("deepgram/nova-3:multi"), 
                inference.STT.from_model_string("assemblyai/universal-streaming:en")
            ]
        ), 
        llm = llm.FallbackAdapter(
            [
            inference.LLM(model="google/gemini-2.5-flash"), 
            inference.LLM(model="openai/gpt-4.1-mini"), 
            ]
        ), 
        tts = tts.FallbackAdapter(
            [
            inference.TTS.from_model_string("deepgram/aura-2:theia"), 
            inference.TTS.from_model_string("cartesia/sonic-3:f31cc6a7-c1e8-4764-980c-60a361443dd1")
            ]
        ), 
        vad=silero.VAD.load(),
        preemptive_generation=True
    )

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
                # Calculate time since user finished speaking
                elapsed = time.time() - last_eou_metrics.timestamp
                logger.info(f"Time to first audio: {elapsed:.3f}s")

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