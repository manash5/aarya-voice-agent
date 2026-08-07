# backend

Framework not decided yet (Express vs. Spring Boot - leaning Express for
JS/TS consistency with the Next.js frontend, not locked in).

Will own: agent config CRUD, call dispatch (create LiveKit room, attach
agent config as room metadata, dispatch the right worker from `voice-agent/`),
and call history/transcript storage.
