"""English receptionist: Deepgram STT + TTS, Groq LLM."""

from livekit.agents import AgentSession

from aarya.pipelines.bundle import PipelineBundle
from aarya.pipelines.common import (
    deepgram_tts,
    deepgram_tts_fallbacks,
    english_llm,
    english_stt,
    low_latency_vad,
)
from aarya.turn_handling import default_turn_handling


def build_english_pipeline() -> PipelineBundle:
    primary_tts = deepgram_tts()

    session = AgentSession(
        stt=english_stt(),
        llm=english_llm(max_completion_tokens=80),
        tts=deepgram_tts_fallbacks(primary_tts),
        vad=low_latency_vad(),
        turn_handling=default_turn_handling(max_delay=0.60),
    )

    return PipelineBundle(session=session, pooled_tts=primary_tts)
