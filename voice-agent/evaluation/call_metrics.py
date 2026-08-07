"""Latency and usage logging for a call: EOU/TTFA timing, TTS connection
reuse, and the end-of-session usage summary.
"""

import asyncio
import logging
import time

from livekit.agents import AgentStateChangedEvent, MetricsCollectedEvent, metrics

from config.tts_pool import warm_tts_pool

logger = logging.getLogger(__name__)


def attach_latency_logging(session, ctx, pooled_tts, job_start_time: float) -> None:
    """Wire up metrics/state-change handlers that log EOU wait, TTFA, TTS
    connection reuse, and usage on shutdown. Pass None for pooled_tts if the
    TTS provider doesn't keep a connection pool (e.g. non-streaming Azure)."""
    usage_collector = metrics.UsageCollector()
    last_eou_metrics: metrics.EOUMetrics | None = None

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        nonlocal last_eou_metrics
        if ev.metrics.type == "eou_metrics":
            last_eou_metrics = ev.metrics

        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

        # log_metrics() doesn't surface connection_reused/acquire_time
        if ev.metrics.type == "tts_metrics":
            logger.info(
                f"TTS connection: reused={ev.metrics.connection_reused} "
                f"acquire_time={ev.metrics.acquire_time:.3f}s"
            )
            if pooled_tts is not None and not ev.metrics.connection_reused:
                asyncio.create_task(warm_tts_pool(pooled_tts._pool, count=2))

    async def log_usage():
        logger.info("Usage summary: %s", usage_collector.get_summary())

    ctx.add_shutdown_callback(log_usage)

    @session.on("agent_state_changed")
    def _on_agent_state_changed(ev: AgentStateChangedEvent):
        if ev.new_state != "speaking":
            return

        if last_eou_metrics:
            post_commit = time.time() - last_eou_metrics.timestamp
            true_latency = last_eou_metrics.end_of_utterance_delay + post_commit
            logger.info(
                f"Time to first audio: {post_commit:.3f}s post-commit | "
                f"{true_latency:.3f}s true latency "
                f"(EOU wait: {last_eou_metrics.end_of_utterance_delay:.3f}s)"
            )
        else:
            # No EOU yet means this is the opening greeting, not a reply
            elapsed = time.time() - job_start_time
            logger.info(f"Time to greeting audio: {elapsed:.3f}s (from job start)")
