"""Per-company profiles injected into agent instructions.

One module per client (e.g. `ozi_hygiene.py`, `scalina_media.py`), exporting:

    COMPANY_NAME     display name
    COMPANY_BRIEF    the tight version - identity, offering, hard rules. Use this
                     for the cascaded voice pipeline, where the profile is part of
                     every turn's context and length costs latency.
    COMPANY_PROFILE  the full version - brief plus policies and sales flow, for
                     realtime / RAG agents that can carry a bigger prompt.
    GREETING         the fixed opening line, spoken via session.say().

Then import those in the entrypoint that answers for that client. Only
COMPANY_NAME / COMPANY_PROFILE are strictly required; the rest is convention.
"""
