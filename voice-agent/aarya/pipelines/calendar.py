"""English receptionist with calendar tools — tool-capable LLM stack."""

from livekit.agents import AgentSession

from aarya.pipelines.bundle import PipelineBundle
from aarya.pipelines.common import (
    deepgram_tts,
    deepgram_tts_fallbacks,
    english_stt,
    low_latency_vad,
    tool_llm,
)
from aarya.turn_handling import default_turn_handling


def build_calendar_pipeline() -> PipelineBundle:
    primary_tts = deepgram_tts()

    session = AgentSession(
        stt=english_stt(),
        llm=tool_llm(max_completion_tokens=160),
        tts=deepgram_tts_fallbacks(primary_tts),
        vad=low_latency_vad(),
        # slightly looser so "book tomorrow at 10pm" isn't split mid-sentence
        turn_handling=default_turn_handling(max_delay=0.70),
    )

    return PipelineBundle(session=session, pooled_tts=primary_tts)
