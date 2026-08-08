"""English receptionist pipeline: Deepgram STT, Groq LLM, Cartesia/Deepgram TTS."""

from dataclasses import dataclass

from livekit.agents import AgentSession, inference, llm, stt, tts
from livekit.plugins import cartesia, deepgram, groq, silero

from aarya.turn_handling import default_turn_handling


@dataclass(frozen=True)
class PipelineBundle:
    session: AgentSession
    # TTS instance whose connection pool is pre-warmed / monitored for reuse
    pooled_tts: object


def build_english_pipeline() -> PipelineBundle:
    # Primary voice - warm THIS pool (was warming Deepgram while Cartesia spoke)
    cartesia_tts = cartesia.TTS(
        model="sonic-3",
        voice="49743b08-0f5d-4741-839c-b12933853780",
        # skip word-alignment overhead; we don't use timestamps
        word_timestamps=False,
    )
    deepgram_tts = deepgram.TTS(model="aura-2-theia-en")

    # Default Silero min_silence is 0.55s and stacks into EOU wait - tighten it
    # since the turn detector already judges whether the caller is done.
    vad = silero.VAD.load(min_silence_duration=0.35, prefix_padding_duration=0.3)

    session = AgentSession(
        stt=stt.FallbackAdapter(
            [
                # en is faster than multi (no language-ID pass) for this agent
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
                # Cap tokens so a long draft can't delay TTS / keep the line busy
                groq.LLM(model="llama-3.1-8b-instant", max_completion_tokens=80),
                groq.LLM(model="llama-3.3-70b-versatile", max_completion_tokens=80),
                inference.LLM(model="google/gemini-2.5-flash-lite"),
                inference.LLM(model="openai/gpt-4.1-mini"),
            ]
        ),
        tts=tts.FallbackAdapter(
            [
                cartesia_tts,
                deepgram_tts,
                inference.TTS.from_model_string("deepgram/aura-2:theia"),
            ]
        ),
        vad=vad,
        turn_handling=default_turn_handling(max_delay=0.75),
    )

    return PipelineBundle(session=session, pooled_tts=cartesia_tts)
