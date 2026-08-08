"""Nepali pipeline: Scribe/AssemblyAI STT, Groq LLM, Cartesia Hindi TTS."""

from livekit.agents import AgentSession, inference, llm, stt, tts
from livekit.plugins import assemblyai, groq, silero

import aarya.config.assemblyai_patch  # noqa: F401 - before assemblyai.STT()
from aarya.pipelines.english import PipelineBundle
from aarya.turn_handling import default_turn_handling


def build_nepali_pipeline() -> PipelineBundle:
    # via inference so no separate Cartesia account is needed
    cartesia_tts = inference.TTS(model="cartesia/sonic-3", language="hi")

    session = AgentSession(
        stt=stt.FallbackAdapter(
            [
                # AssemblyAI's real-time models don't have Nepali training - Scribe does
                inference.STT.from_model_string("elevenlabs/scribe_v2_realtime:ne"),
                # weaker Nepali, but better than nothing if Scribe is down
                assemblyai.STT(model="universal-3-5-pro", language_codes=["ne", "en"]),
                # last resort: English only, keeps the call alive
                assemblyai.STT(model="universal-streaming-english"),
            ]
        ),
        llm=llm.FallbackAdapter(
            [
                groq.LLM(model="llama-3.3-70b-versatile"),
                inference.LLM(model="google/gemini-2.5-flash-lite"),
                inference.LLM(model="openai/gpt-4.1-mini"),
            ]
        ),
        tts=tts.FallbackAdapter(
            [
                cartesia_tts,
            ]
        ),
        vad=silero.VAD.load(min_silence_duration=0.35, prefix_padding_duration=0.3),
        # slightly looser max for Nepali/English code-switching pauses
        turn_handling=default_turn_handling(max_delay=0.85),
    )

    return PipelineBundle(session=session, pooled_tts=cartesia_tts)
