"""Provider stacks (STT / LLM / TTS) for each agent variant."""

from aarya.pipelines.bundle import PipelineBundle
from aarya.pipelines.calendar import build_calendar_pipeline
from aarya.pipelines.english import build_english_pipeline
from aarya.pipelines.nepali import build_nepali_pipeline
from aarya.pipelines.rag import build_rag_pipeline

__all__ = [
    "PipelineBundle",
    "build_calendar_pipeline",
    "build_english_pipeline",
    "build_nepali_pipeline",
    "build_rag_pipeline",
]
