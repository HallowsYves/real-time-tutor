import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { mustGet } from '@/lib/env';

export async function GET(req: NextRequest) {
  try {
    const LIVEKIT_API_KEY = mustGet('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = mustGet('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = mustGet('LIVEKIT_URL');

    const room = req.nextUrl.searchParams.get('room') ?? 'playground';
    const user = req.nextUrl.searchParams.get('user') ?? `web-${Math.random().toString(36).slice(2)}`;

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: user,
      ttl: '1h',
    });
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      token: await at.toJwt(),
      url: LIVEKIT_URL,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}