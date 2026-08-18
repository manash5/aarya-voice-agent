"""Shared STT / LLM / VAD / Deepgram TTS pieces for English-family pipelines."""

from livekit.agents import inference, llm, stt, tts
from livekit.plugins import deepgram, groq, silero

from aarya.pipelines.deepgram_tts import SpeedyDeepgramTTS

# Feminine Aura 2 voice. Theia is the Australian-accented one ("expressive, polite,
# sincere"), which suits Australian callers. Other feminine options if you want a
# different read: asteria (US, crisp/confident), luna (US, friendly), harmonia
# (US, calm), cordelia (US, warm). Masculine: apollo (US), hyperion (AU).
DEEPGRAM_TTS_MODEL = "aura-2-theia-en"
DEEPGRAM_TTS_INFERENCE = "deepgram/aura-2:theia"
# Mild bump over Deepgram's default pace; valid range is 0.7-1.5.
DEEPGRAM_TTS_SPEED = 1.15


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


GROQ_MODEL = "openai/gpt-oss-120b"

# gpt-oss is a reasoning model: its thinking tokens are billed as completion
# tokens and count against max_completion_tokens. Capping at the spoken length we
# actually want would truncate the reply mid-sentence, so give the thinking its
# own budget on top. reasoning_effort stays "low" (the plugin's default for
# gpt-oss) - anything higher is seconds of silence on a phone call.
GROQ_REASONING_HEADROOM = 256


def groq_llm(max_completion_tokens: int) -> groq.LLM:
    """Shared Groq client - one place to swap the model for every pipeline."""
    return groq.LLM(
        model=GROQ_MODEL,
        reasoning_effort="low",
        max_completion_tokens=max_completion_tokens + GROQ_REASONING_HEADROOM,
    )


def english_llm(*, max_completion_tokens: int = 60) -> llm.FallbackAdapter:
    """Fast chat LLM (no tools required)."""
    return llm.FallbackAdapter(
        [
            groq_llm(max_completion_tokens),
            inference.LLM(model="google/gemini-2.5-flash-lite"),
            inference.LLM(model="openai/gpt-4.1-mini"),
        ]
    )


def tool_llm(*, max_completion_tokens: int = 160) -> llm.FallbackAdapter:
    """LLM stack for function tools (calendar, RAG).

    Groq sits last here because llama-3.1-8b used to invent fake `<function=...>`
    text instead of real tool calls. gpt-oss-120b does proper tool calls, so this
    ordering is worth re-testing - promoting Groq to first would cut a hop.
    """
    return llm.FallbackAdapter(
        [
            inference.LLM(model="google/gemini-2.5-flash-lite"),
            inference.LLM(model="openai/gpt-4.1-mini"),
            groq_llm(max_completion_tokens),
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
