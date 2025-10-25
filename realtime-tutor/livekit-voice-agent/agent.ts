import { defineAgent, voice, cli, WorkerOptions, type JobContext, type JobProcess } from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Fail fast on missing envs you actually need right now.
// For this STT-LLM-TTS setup, you need LIVEKIT_* and OPENAI_API_KEY (for gpt-4.1-mini).
const mustGet = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing required env: ${k}`);
  return v;
};
mustGet('LIVEKIT_URL'); mustGet('LIVEKIT_API_KEY'); mustGet('LIVEKIT_API_SECRET'); mustGet('OPENAI_API_KEY');

export default defineAgent({
  // Pre-download & warm Silero VAD
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad as silero.VAD;

    const assistant = new voice.Agent({
      instructions: 'You are a helpful voice AI assistant.',
    });

    // —— STT-LLM-TTS pipeline (robust path) ——
    const session = new voice.AgentSession({
      vad,
      stt: 'assemblyai/universal-streaming:en',
      llm: 'openai/gpt-4.1-mini',
      tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      turnDetection: new livekit.turnDetector.MultilingualModel(),
    });

    // —— If you want to try OpenAI Realtime again later, comment the block above and uncomment below ——
    /*
    import * as openai from '@livekit/agents-plugin-openai';
    const session = new voice.AgentSession({
      llm: new openai.realtime.RealtimeModel({
        voice: 'coral',
        // Be explicit about STT model to avoid default/account quirks:
        inputAudioTranscription: { model: 'gpt-4o-transcribe' }, // or 'gpt-4o-mini-transcribe'
      }),
    });
    */

    await session.start({
      agent: assistant,
      room: ctx.room,
      inputOptions: { noiseCancellation: BackgroundVoiceCancellation() },
    });

    // Optional: surface model/server events for debugging
    session.on('modelEvent', (ev) => {
      if (ev?.type === 'error' || (typeof ev?.type === 'string' && ev.type.includes('transcription'))) {
        console.error('[modelEvent]', JSON.stringify(ev));
      }
    });

    await ctx.connect();

    await session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    }).waitForPlayout();
  },
});

cli.runApp(new WorkerOptions({ agent: new URL(import.meta.url).pathname }));