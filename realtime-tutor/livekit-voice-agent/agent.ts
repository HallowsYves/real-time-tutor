import dotenv from 'dotenv';
import { defineAgent, livekit, voice } from '@livekit/agents';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import * as livekitPipeline from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import * as openai from '@livekit/agents-plugin-openai';

dotenv.config({ path: '.env.local' });

const mustGet = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const LIVEKIT_URL = mustGet('LIVEKIT_URL');
const LIVEKIT_API_KEY = mustGet('LIVEKIT_API_KEY');
const LIVEKIT_API_SECRET = mustGet('LIVEKIT_API_SECRET');

const turnDetector = new (livekit as any).turnDetector.MultilingualModel();
const noiseCancellation = new BackgroundVoiceCancellation();

export default defineAgent({
  name: 'livekit-voice-agent',
  prewarm: async () => {
    const maybePrewarm =
      (silero as any).prewarm ??
      (silero as any).prewarmSileroVAD ??
      (silero as any).SileroVAD?.prewarm;

    if (typeof maybePrewarm === 'function') {
      await maybePrewarm();
      console.log('[prewarm] Silero VAD prewarmed');
    } else if (typeof (silero as any).SileroVAD?.create === 'function') {
      await (silero as any).SileroVAD.create();
      console.log('[prewarm] Silero VAD create() invoked');
    } else {
      console.warn('[prewarm] Unable to locate Silero VAD prewarm helper; continuing');
    }
  },
  entry: async (ctx) => {
    const sessionFactory: any = (voice as any).AgentSession ?? (voice as any).VoiceAgentSession;
    if (!sessionFactory) {
      throw new Error('Unable to locate voice.AgentSession from @livekit/agents');
    }

    const session: any = new sessionFactory(ctx, {
      logLevel: 'info',
    });

    session.on?.('modelEvent', (ev: any) => {
      if (ev?.type?.includes?.('transcription') || ev?.type === 'error') {
        console.error('[modelEvent]', JSON.stringify(ev));
      }
    });

    session.on?.('speechStarted', () => {
      console.log('[session] Speech started');
    });
    session.on?.('speechEnded', () => {
      console.log('[session] Speech ended');
    });

    const pipelineFactory: any =
      (livekitPipeline as any).sttLlmTtsPipeline ?? (livekitPipeline as any).voicePipeline;

    const pipelineOptions =
      typeof pipelineFactory === 'function'
        ? pipelineFactory({
            stt: 'assemblyai/universal-streaming:en',
            llm: 'openai/gpt-4.1-mini',
            tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
            turnDetection,
            noiseCancellation,
          })
        : {
            stt: 'assemblyai/universal-streaming:en',
            llm: 'openai/gpt-4.1-mini',
            tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
            turnDetection,
            noiseCancellation,
          };

    console.log('[worker] registering with LiveKit Cloud...');
    const connection = await (ctx as any).connect?.({
      url: LIVEKIT_URL,
      apiKey: LIVEKIT_API_KEY,
      apiSecret: LIVEKIT_API_SECRET,
    });
    console.log('[worker] registered', connection?.workerSid ?? 'without worker SID');

    await session.start?.({
      pipeline: pipelineOptions,
      stt: 'assemblyai/universal-streaming:en',
      llm: 'openai/gpt-4.1-mini',
      tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      turnDetection,
      noiseCancellation,
    });
    console.log('[session] Voice session started, joining room...');

    await (ctx as any).connect?.();
    console.log('[session] Connected to LiveKit room');

    await session.generateReply?.('Greet the user and let them know you are ready to help with tutoring.');

    // TODO: Swap to Claude for tutoring-specific reasoning (e.g., import Anthropic plugin or call external tutoring service).

    // TODO: POST transcripts and agent decisions to a future /api/learning-plan endpoint powered by Letta to build adaptive lesson plans.

    /*
    // Uncomment below to try OpenAI Realtime; ensure OPENAI_API_KEY is set and STT model configured appropriately.
    const realtimeModel = new (openai as any).realtime.RealtimeModel({
      voice: 'coral',
      inputAudioTranscription: { model: 'gpt-4o-transcribe' },
    });
    await session.start?.({
      model: realtimeModel,
      turnDetection,
      noiseCancellation,
    });
    */

    session.on?.('roomJoined', (room: any) => {
      console.log('[session] Joined room', room?.name ?? room?.sid ?? '<unknown>');
    });
  },
});

