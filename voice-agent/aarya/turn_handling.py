"""Shared turn-handling defaults tuned for low-latency phone calls.

Balance: snappy replies without committing before Deepgram finals arrive, and
without cutting off hesitant speakers mid-thought.
"""

from livekit.agents import TurnHandlingOptions, inference


def default_turn_handling(*, max_delay: float = 0.75) -> TurnHandlingOptions:
    return TurnHandlingOptions(
        turn_detection=inference.TurnDetector(),
        endpointing={
            # fixed is more predictable than dynamic for phone-style calls;
            # LiveKit warned that 0.25s was ahead of STT finals
            "mode": "fixed",
            "min_delay": 0.35,
            "max_delay": max_delay,
        },
        interruption={
            "mode": "adaptive",
            # slightly higher so console mic / noise doesn't kill the greeting
            "min_duration": 0.45,
            "resume_false_interruption": True,
            "false_interruption_timeout": 0.60,
        },
        preemptive_generation={
            "preemptive_tts": True,
        },
    )
