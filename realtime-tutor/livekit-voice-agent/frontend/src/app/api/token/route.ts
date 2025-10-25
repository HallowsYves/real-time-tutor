import { NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(_req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const roomName = process.env.LIVEKIT_ROOM || "tutor-room";

  if (!apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: "LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const identity = `user-${Math.random().toString(36).slice(2, 10)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return Response.json({ token });
}
