"""Result of a pipeline builder: session + the TTS instance to pre-warm."""

from dataclasses import dataclass

from livekit.agents import AgentSession


@dataclass(frozen=True)
class PipelineBundle:
    session: AgentSession
    # TTS whose connection pool is pre-warmed / monitored for reuse
    pooled_tts: object
