"""Shared Agent subclass used by pipeline-based entrypoints."""

from livekit.agents import Agent

from aarya.prompts import build_instructions


class Assistant(Agent):
    def __init__(
        self,
        agent_name: str = "Aarya",
        company_profile: str = "",
        output_language: str = "",
    ):
        super().__init__(
            instructions=build_instructions(
                agent_name=agent_name,
                company_profile=company_profile,
                output_language=output_language,
            )
        )
