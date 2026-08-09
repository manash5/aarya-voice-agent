"""Shared STT / LLM / VAD / Deepgram TTS pieces for English-family pipelines."""

from livekit.agents import inference, llm, stt, tts
from livekit.plugins import deepgram, groq, silero

from aarya.pipelines.deepgram_tts import SpeedyDeepgramTTS

# Casual masculine Aura 2 voice + faster speaking rate (Apollo defaults slow)
DEEPGRAM_TTS_MODEL = "aura-2-apollo-en"
DEEPGRAM_TTS_INFERENCE = "deepgram/aura-2:apollo"
DEEPGRAM_TTS_SPEED = 1.25


def low_latency_vad():
    """Tighter silence than Silero defaults - turn detector already judges EOU."""
    return silero.VAD.load(min_silence_duration=0.30, prefix_padding_duration=0.25)


def english_stt() -> stt.FallbackAdapter:
    return stt.FallbackAdapter(
        [
            deepgram.STT(
                model="nova-3",
                language="en",
                interim_results=True,
                endpointing_ms=25,
                no_delay=True,
            ),
            inference.STT.from_model_string("deepgram/nova-3:en"),
            inference.STT.from_model_string("assemblyai/universal-streaming:en"),
        ]
    )


def english_llm(*, max_completion_tokens: int = 60) -> llm.FallbackAdapter:
    """Fast chat LLM (no tools required)."""
    return llm.FallbackAdapter(
        [
            groq.LLM(
                model="llama-3.1-8b-instant",
                max_completion_tokens=max_completion_tokens,
            ),
            inference.LLM(model="google/gemini-2.5-flash-lite"),
            inference.LLM(model="openai/gpt-4.1-mini"),
        ]
    )


def tool_llm(*, max_completion_tokens: int = 160) -> llm.FallbackAdapter:
    """LLM stack for function tools (calendar, RAG).

    Groq llama-3.1-8b often invents fake `<function=...>` text instead of real
    tool calls — put tool-reliable models first.
    """
    return llm.FallbackAdapter(
        [
            inference.LLM(model="google/gemini-2.5-flash-lite"),
            inference.LLM(model="openai/gpt-4.1-mini"),
            groq.LLM(
                model="llama-3.1-8b-instant",
                max_completion_tokens=max_completion_tokens,
            ),
        ]
    )


def deepgram_tts():
    """Primary TTS for English agents - warm this instance's pool."""
    return SpeedyDeepgramTTS(model=DEEPGRAM_TTS_MODEL, speed=DEEPGRAM_TTS_SPEED)


def deepgram_tts_fallbacks(primary):
    """Direct Deepgram first, then LiveKit Inference Deepgram as backup."""
    return tts.FallbackAdapter(
        [
            primary,
            inference.TTS.from_model_string(DEEPGRAM_TTS_INFERENCE),
        ]
    )
