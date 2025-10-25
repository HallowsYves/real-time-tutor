'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiveKitRoom, VideoConference, RoomAudioRenderer, StartAudio, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';
import type { Room } from 'livekit-client';

async function fetchToken(room: string, user: string) {
  const ep = process.env.NEXT_PUBLIC_TOKEN_ENDPOINT!;
  const res = await fetch(`${ep}?room=${encodeURIComponent(room)}&user=${encodeURIComponent(user)}`);
  if (!res.ok) throw new Error('Failed to get token');
  return res.json() as Promise<{ token: string; url: string }>;
}

export default function TutorPage() {
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const searchParams = useSearchParams();
  const roomName = searchParams?.get('room') ?? 'playground';

  useEffect(() => {
    const user = `web-${Math.random().toString(36).slice(2)}`;
    fetchToken(roomName, user).then(setConn).catch(console.error);
  }, [roomName]);

  if (!conn) return <div className="p-6">Preparing room…</div>;

  return (
    <div className="h-screen w-screen">
      <LiveKitRoom
        video
        audio
        token={conn.token}
        serverUrl={conn.url}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <RoomAudioRenderer />
        <StartAudio label="Enable audio" />
        <MainUI />
      </LiveKitRoom>
    </div>
  );
}

function MainUI() {
  return (
    <div className="h-full relative">
      <VideoConference />
      <ChatOverlay />
    </div>
  );
}

function ChatOverlay() {
  const room = useRoomContext() as Room;
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    const payload = new TextEncoder().encode(JSON.stringify({ kind: 'question', text }));
    room.localParticipant.publishData(payload, { reliable: true });
    inputRef.current!.value = '';
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(780px,92vw)] bg-white/85 backdrop-blur rounded-xl border shadow p-3">
      <div className="flex gap-2">
        <input ref={inputRef} placeholder="Ask the tutor…" className="flex-1 border rounded px-3 py-2" />
        <button onClick={send} className="px-4 py-2 rounded bg-black text-white">Send</button>
      </div>
    </div>
  );
}