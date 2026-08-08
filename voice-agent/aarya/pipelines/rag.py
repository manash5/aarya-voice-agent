"""RAG receptionist pipeline - same stack as English, plus knowledge-base tool."""

from livekit.agents import AgentSession, inference, llm, stt, tts
from livekit.plugins import deepgram, groq, silero

from aarya.pipelines.english import PipelineBundle
from aarya.turn_handling import default_turn_handling


def build_rag_pipeline() -> PipelineBundle:
    deepgram_tts = deepgram.TTS(model="aura-2-theia-en")
    vad = silero.VAD.load(min_silence_duration=0.35, prefix_padding_duration=0.3)

    session = AgentSession(
        stt=stt.FallbackAdapter(
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
        ),
        llm=llm.FallbackAdapter(
            [
                groq.LLM(model="llama-3.3-70b-versatile", max_completion_tokens=120),
                inference.LLM(model="google/gemini-2.5-flash-lite"),
                inference.LLM(model="openai/gpt-4.1-mini"),
            ]
        ),
        tts=tts.FallbackAdapter(
            [
                deepgram_tts,
                inference.TTS.from_model_string("deepgram/aura-2:theia"),
                inference.TTS.from_model_string(
                    "cartesia/sonic-3:f31cc6a7-c1e8-4764-980c-60a361443dd1"
                ),
            ]
        ),
        vad=vad,
        turn_handling=default_turn_handling(max_delay=0.75),
    )

    return PipelineBundle(session=session, pooled_tts=deepgram_tts)
