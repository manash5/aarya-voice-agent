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
frontend/       Admin UI for creating/testing agents (Next.js) - UI only, local state
backend/        Agent config storage, call dispatch, call history - not started
```

### `voice-agent/`

Real-time voice pipeline built on [LiveKit Agents](https://docs.livekit.io/agents/):
speech-to-text → turn detection → LLM → text-to-speech, tuned for low latency
(direct provider connections, pooled TTS handshakes, tuned turn detection).

Shared logic lives in the `aarya/` package; thin entrypoint scripts pick a pipeline
and company profile.

```
voice-agent/
├── agent.py                    # English receptionist (Scalina Media demo)
├── nepali_agent.py             # Nepali STT + Hindi-accented TTS
├── rag_agent.py                # English + knowledge-base tool stub
├── gemini_realtime_agent.py    # Gemini Live speech-to-speech
├── aarya/
│   ├── assistant.py            # Shared Agent subclass + instructions
│   ├── session.py              # Warm TTS → start → greet bootstrap
│   ├── turn_handling.py        # Shared endpointing / interruption defaults
│   ├── prompts/                # Persona (how it talks) vs company (what it knows)
│   ├── pipelines/
│   │   ├── common.py           # Shared Deepgram STT/TTS, Groq LLM, VAD helpers
│   │   ├── english.py          # English receptionist stack
│   │   ├── rag.py              # English + knowledge-base tool
│   │   └── nepali.py           # Nepali STT + Hindi TTS
│   ├── companies/              # One profile module per client
│   ├── config/                 # TTS pool warm-up, AssemblyAI patch
│   └── evaluation/             # Per-call latency / usage logging
├── .env.example
└── pyproject.toml
```

| Entrypoint | LiveKit agent name | Notes |
|---|---|---|
| `agent.py` | `aarya` | Deepgram STT + Aura 2 Apollo (male) TTS, Groq LLM |
| `nepali_agent.py` | `aarya-nepali` | Scribe/AssemblyAI STT, Cartesia Hindi TTS via inference |
| `rag_agent.py` | `aarya-rag` | Same Deepgram English stack + `search_knowledge_base` stub |
| `gemini_realtime_agent.py` | `aarya-gemini-live` | Single RealtimeModel (no cascaded STT/TTS) |

**Run** (from `voice-agent/`):

```bash
uv sync
cp .env.example .env.local   # fill in keys
uv run agent.py console
# or: uv run nepali_agent.py console
# or: uv run rag_agent.py console
# or: uv run gemini_realtime_agent.py console
```

**Swap a company:** add `aarya/companies/<client>.py` exporting `COMPANY_NAME` /
`COMPANY_PROFILE`, then import those in the entrypoint instead of `scalina_media`.

**Add a language / stack:** add a builder under `aarya/pipelines/`, then a thin
entrypoint that calls `start_pipeline_session(...)`.

### `frontend/`

Admin console (Next.js 16, TypeScript, Tailwind v4). Create an assistant, pick
which of the three agents runs it, give it company info and documents, choose a
voice, attach tools.

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

UI only for now - no login and no API. Assistants live in `localStorage`, and
uploaded documents never leave the browser. Voice previews, in-browser calling,
document indexing, phone numbers and call logs are all placeholders waiting on
the backend. See `frontend/README.md`.

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
