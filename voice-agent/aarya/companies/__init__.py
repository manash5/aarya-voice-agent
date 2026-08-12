"""Per-company profiles injected into agent instructions.

Add one module per client (e.g. `scalina_media.py`) exporting COMPANY_NAME
and COMPANY_PROFILE, then import those in the agent entrypoint that should
answer for that client.
"""
