"""Shared turn-handling defaults tuned for low-latency phone calls.

Balance: snappy replies without committing before Deepgram finals arrive, and
without cutting off hesitant speakers mid-thought.
"""

from livekit.agents import TurnHandlingOptions, inference


def default_turn_handling(*, max_delay: float = 0.75) -> TurnHandlingOptions:
    return TurnHandlingOptions(
        turn_detection=inference.TurnDetector(),
        endpointing={
            "mode": "fixed",
            # give Deepgram time to finish finals on longer booking phrases
            "min_delay": 0.40,
            "max_delay": max_delay,
        },
        interruption={
            "mode": "adaptive",
            "min_duration": 0.55,
            "resume_false_interruption": True,
            "false_interruption_timeout": 0.70,
        },
        preemptive_generation={
            "preemptive_tts": True,
        },
    )
