# Aarya Voice Agent

A platform for building and deploying real-time AI voice agents - starting with a
receptionist, aiming toward customer service and cold-calling agents too - that
non-technical users will eventually be able to configure through an admin UI rather
than editing code.

The core idea: one shared "core agent" codebase whose personality and behavior rules
stay fixed, with per-company info (and per-language variants) swapped in as
configuration rather than forked code.

## Project layout

```
voice-agent/    LiveKit-based voice agents (Python) - the working part today
frontend/       Admin UI for creating/testing agents (Next.js) - bare scaffold
backend/        Agent config storage, call dispatch, call history - not started
```

### `voice-agent/`

Real-time voice pipeline built on [LiveKit Agents](https://docs.livekit.io/agents/):
speech-to-text -> turn detection -> LLM -> text-to-speech, tuned for low latency
(direct provider connections instead of routing through a gateway, pooled TTS
connections, tuned turn-detection/endpointing).

- `agent.py` - the English/Australian receptionist. Groq for the LLM, Deepgram
  direct for STT/TTS.
- `nepali_agent.py` - understands Nepali (including Nepali/English code-switching),
  replies via a Hindi-accented TTS voice since no Nepali TTS voice was available
  for free.
- `rag_agent.py` - stub agent with a knowledge-base lookup tool scaffolded in;
  the actual retrieval logic isn't implemented yet.
- `prompt.py` - the shared persona: how the agent talks (concise, human-sounding,
  no AI tells), separate from what it knows (`company_profile`, injected per
  deployment).
- `config/`, `evaluation/` - TTS connection pooling and per-call latency/usage
  logging, factored out of `agent.py` so each is independently editable.

Run with `cd voice-agent && uv run agent.py console` (or `nepali_agent.py` /
`rag_agent.py`). Needs a `.env.local` with the relevant API keys - see
`.env.example`.

### `frontend/`

Bare Next.js scaffold (TypeScript, Tailwind, App Router). Will become the admin
panel: pick a language/agent variant, provide company info, test the agent by
voice in-browser, review past call transcripts and metrics. Not built out yet.

### `backend/`

Not started. Will own agent config storage, dispatching calls (creating a LiveKit
room, attaching agent config as room metadata, routing to the right worker in
`voice-agent/`), and persisting call history for the frontend to query. Framework
undecided (leaning Express for consistency with the Next.js frontend).

## Status

Working today: the English and Nepali voice agents, run locally via LiveKit's
console mode. Everything else - the admin UI, call dispatch, persistence, RAG
retrieval - is scaffolding or design, not yet functional.

## Roadmap

- Persist agent configs and call history (SQLite to start)
- Wire the frontend to create/test agents against real LiveKit rooms
- Implement retrieval for `rag_agent.py`
- Decide on and build out the backend
- Add more languages and agent types (customer service, cold-calling)
