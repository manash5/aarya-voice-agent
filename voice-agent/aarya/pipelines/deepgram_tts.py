"""Deepgram TTS with Aura-2 speaking-rate control.

livekit-plugins-deepgram does not expose Deepgram's `speed` query param yet,
so we subclass and inject it on the websocket (and HTTP) connect URL.
Docs: https://developers.deepgram.com/docs/tts-voice-controls (0.7–1.5).
"""

from __future__ import annotations

import asyncio

import aiohttp
from livekit.plugins import deepgram
from livekit.plugins.deepgram._utils import _to_deepgram_url
from livekit.plugins.deepgram.log import logger


class SpeedyDeepgramTTS(deepgram.TTS):
    def __init__(self, *, speed: float = 1.25, **kwargs):
        if not 0.7 <= speed <= 1.5:
            raise ValueError(f"Deepgram speed must be 0.7–1.5, got {speed}")
        super().__init__(**kwargs)
        self._speed = speed

    async def _connect_ws(self, timeout: float) -> aiohttp.ClientWebSocketResponse:
        session = self._ensure_session()
        config: dict = {
            "encoding": self._opts.encoding,
            "model": self._opts.model,
            "sample_rate": self._opts.sample_rate,
            "mip_opt_out": self._opts.mip_opt_out,
            "speed": self._speed,
        }
        if self._opts.bit_rate is not None:
            config["bit_rate"] = self._opts.bit_rate
        ws = await asyncio.wait_for(
            session.ws_connect(
                _to_deepgram_url(config, self._opts.base_url, websocket=True),
                headers={"Authorization": f"Token {self._opts.api_key}"},
            ),
            timeout,
        )
        ws_headers = {
            k: v
            for k, v in ws._response.headers.items()
            if k.startswith("dg-") or k == "Date"
        }
        logger.debug(
            "Established new Deepgram TTS WebSocket connection:",
            extra={"headers": ws_headers, "speed": self._speed},
        )
        return ws
