import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";

import {
  buildDispatchMetadata,
  readLiveKitEnv,
  toHttpUrl,
  workerFor,
} from "@/lib/livekit-server";
import type { Assistant } from "@/lib/types";

/**
 * Starts a browser test call:
 *   1. explicitly dispatch the worker (agents registered with an agent_name
 *      never join a room on their own)
 *   2. mint a join token for the person clicking the button
 *
 * GET reports whether the LiveKit credentials are present, so the UI can
 * explain itself instead of failing on click.
 */

export async function GET() {
  const { env, missing } = readLiveKitEnv();
  return Response.json({ configured: Boolean(env), missing, url: env?.url ?? null });
}

export async function POST(request: Request) {
  const { env, missing } = readLiveKitEnv();
  if (!env) {
    return Response.json(
      {
        error: "not_configured",
        message: `Missing ${missing.join(", ")} in frontend/.env.local`,
        missing,
      },
      { status: 503 },
    );
  }

  let assistant: Assistant;
  try {
    ({ assistant } = (await request.json()) as { assistant: Assistant });
    if (!assistant?.id) throw new Error("no assistant");
  } catch {
    return Response.json({ error: "bad_request", message: "Expected { assistant }" }, { status: 400 });
  }

  const worker = workerFor(assistant);
  const roomName = `console-${assistant.id}-${Date.now().toString(36)}`;
  const identity = `console-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const dispatchClient = new AgentDispatchClient(toHttpUrl(env.url), env.apiKey, env.apiSecret);
    const dispatch = await dispatchClient.createDispatch(roomName, worker, {
      metadata: buildDispatchMetadata(assistant),
    });

    const at = new AccessToken(env.apiKey, env.apiSecret, {
      identity,
      name: "Console tester",
      ttl: "15m",
    });
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return Response.json({
      serverUrl: env.url,
      token: await at.toJwt(),
      roomName,
      worker,
      dispatchId: dispatch.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        error: "dispatch_failed",
        message,
        hint: `Check that a worker registered as "${worker}" is running in this LiveKit project.`,
      },
      { status: 502 },
    );
  }
}
