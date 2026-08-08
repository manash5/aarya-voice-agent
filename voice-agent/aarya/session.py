"""Session bootstrap helpers shared by STT/LLM/TTS pipeline agents."""

from __future__ import annotations

import asyncio
from typing import Any

from livekit.agents import Agent, AgentSession, room_io
from livekit.plugins import noise_cancellation

from aarya.config.tts_pool import warm_tts_pool
from aarya.evaluation.call_metrics import attach_latency_logging


def english_greeting(agent_name: str, company_name: str = "") -> str:
    """Fixed opening line via session.say() so wording stays stable every call."""
    if company_name:
        base = f"Hello, this is {agent_name} speaking from {company_name}."
    else:
        base = f"Hello, this is {agent_name} speaking."
    return f"{base} How may I help you?"


async def start_pipeline_session(
    *,
    ctx: Any,
    session: AgentSession,
    agent: Agent,
    pooled_tts: Any | None,
    job_start_time: float,
    greeting: str,
    warm_after: int = 2,
) -> None:
    """Warm TTS, attach metrics, start the session, greet, then top up the pool.

    Overlaps the first TTS handshake (~0.9s) with session.start() so greeting
    latency does not stack the full warm cost after the room is ready.
    """
    first_conn_task = None
    if pooled_tts is not None:
        first_conn_task = asyncio.create_task(warm_tts_pool(pooled_tts._pool, count=1))

    attach_latency_logging(session, ctx, pooled_tts, job_start_time)

    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    if first_conn_task is not None:
        await first_conn_task

    # claim the ready connection before the pool top-up queues behind it
    await session.say(greeting)

    if pooled_tts is not None and warm_after > 0:
        asyncio.create_task(warm_tts_pool(pooled_tts._pool, count=warm_after))
