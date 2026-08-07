"""Pre-opens `count` TTS connections so a real request doesn't pay the
~0.9s websocket handshake live. The pool's own lock serializes these, so
`count` connections cost roughly `count` x 0.9s, not one shared cost."""

import asyncio
import logging

logger = logging.getLogger(__name__)


async def warm_tts_pool(pool, count: int, timeout: float = 10.0) -> None:
    try:
        conns = await asyncio.gather(*[pool.get(timeout=timeout) for _ in range(count)])
        for conn in conns:
            pool.put(conn)
    except Exception:
        logger.exception("failed to prewarm TTS connection pool")
