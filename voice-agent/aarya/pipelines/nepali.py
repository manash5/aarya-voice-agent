"""Nepali pipeline: Scribe/AssemblyAI STT, Groq LLM, Cartesia Hindi TTS via inference."""

from livekit.agents import AgentSession, inference, llm, stt, tts
from livekit.plugins import assemblyai, groq

import aarya.config.assemblyai_patch  # noqa: F401 - before assemblyai.STT()
from aarya.pipelines.bundle import PipelineBundle
from aarya.pipelines.common import low_latency_vad
from aarya.turn_handling import default_turn_handling


def build_nepali_pipeline() -> PipelineBundle:
    # No free Nepali TTS voice - Hindi Cartesia via LiveKit Inference (no Cartesia account)
    cartesia_tts = inference.TTS(model="cartesia/sonic-3", language="hi")

    session = AgentSession(
        stt=stt.FallbackAdapter(
            [
                inference.STT.from_model_string("elevenlabs/scribe_v2_realtime:ne"),
                assemblyai.STT(model="universal-3-5-pro", language_codes=["ne", "en"]),
                assemblyai.STT(model="universal-streaming-english"),
            ]
        ),
        llm=llm.FallbackAdapter(
            [
                groq.LLM(model="llama-3.3-70b-versatile", max_completion_tokens=80),
                inference.LLM(model="google/gemini-2.5-flash-lite"),
                inference.LLM(model="openai/gpt-4.1-mini"),
            ]
        ),
        tts=tts.FallbackAdapter([cartesia_tts]),
        vad=low_latency_vad(),
        turn_handling=default_turn_handling(max_delay=0.85),
    )

    return PipelineBundle(session=session, pooled_tts=cartesia_tts)
