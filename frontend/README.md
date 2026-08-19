# frontend

Admin console for the Aarya voice agents. An *assistant* is a company, a set of
tasks, a voice and a knowledge base running on one of three agent types. You can
make as many as you like; the agent type is just a setting on each one.

Next.js 16 (App Router), Tailwind v4, TypeScript.

```bash
npm install
cp .env.example .env.local   # optional, needed for test calls
npm run dev                  # http://localhost:3000
```

## What works

Assistants are kept in `localStorage` - there is no backend and no login yet.
Uploaded documents never leave the browser (only the file name and size are
stored). The one thing that talks to the outside world is the test call, which
dispatches a worker in your LiveKit Cloud project.

| Route | What it is |
|---|---|
| `/` | Overview: counts and your assistants |
| `/assistants` | Assistant list plus the editor - the main screen |
| `/tools` | Catalog of tools an assistant can call |
| `/knowledge-base` | Documents grouped by assistant |
| `/phone-numbers` | Empty state - needs SIP + a backend |
| `/call-logs` | Sample rows - needs call persistence |

### Assistant editor tabs

- **Agent** - agent type, first message, system prompt, LLM provider/model, temperature, max tokens
- **Tasks** - what the assistant may do on a call, and the tools behind those tasks
- **Voice** - provider and voice, speed, background sound
- **Knowledge** - company name and profile, plus PDF/DOCX/TXT upload
- **Advanced** - transcriber, endpointing delay, timeouts, interruptions
- **Playground** - place a real browser call to the deployed worker
- **Logs** - per-assistant call history (empty until calls are persisted)

### Agent types

Each one maps to an entrypoint in `voice-agent/`. Switching type on an assistant
resets its voice, transcriber and endpointing to that pipeline's defaults and
leaves the prompt, company and tasks alone.

| Type | Worker | Entrypoint |
|---|---|---|
| English | `aarya` | `agent.py` |
| Nepali | `aarya-nepali` | `nepali_agent.py` |
| Knowledge base | `aarya-rag` | `rag_agent.py` |

## Test calls

`POST /api/call` creates an explicit agent dispatch and mints a join token, then
the browser connects to the room with `livekit-client`. Workers registered with
an `agent_name` never join a room on their own, so the dispatch is required.

Put the credentials for the LiveKit Cloud project your workers are deployed to
in `.env.local` (see `.env.example`). They are read server-side only. Without
them the Playground says so instead of failing on click.

The console's settings ride along as job metadata. `voice-agent/` doesn't read
`ctx.job.metadata` yet, so a test call currently uses whatever company, prompt
and voice are hardcoded in the entrypoint. Teaching the entrypoints to read that
metadata is what makes each assistant actually distinct on a call.

## Layout

```
src/
├── app/
│   ├── layout.tsx              # fonts + globals
│   ├── api/call/route.ts       # LiveKit dispatch + join token
│   └── (dashboard)/            # sidebar shell, one folder per route
├── components/
│   ├── dashboard/              # sidebar, assistant list/editor, modals
│   │   └── editor/             # one file per editor tab
│   └── ui/                     # buttons, fields, selects, modal, multi-select
└── lib/
    ├── catalog.ts              # agent types, tasks, voices, models, tool catalog
    ├── livekit-server.ts       # env + dispatch metadata (server only)
    ├── store.ts                # localStorage-backed assistant store
    └── types.ts
```

## Wiring up a backend

`src/lib/store.ts` is the only file that touches persistence. Swap its four
mutators (`addAssistant`, `updateAssistant`, `duplicateAssistant`,
`removeAssistant`) for API calls and nothing else has to change.

Still stubbed out: voice previews, document indexing, phone numbers, and call
logs. Call logs need a webhook endpoint that LiveKit can post room and
participant events to.
