# LiveKit Voice Agent Quickstart

A minimal LiveKit Voice AI worker that uses the STT-LLM-TTS pipeline by default and ships with an optional OpenAI Realtime configuration.

## Prerequisites
- Node.js 20.x LTS (`nvm use 20`)
- [pnpm](https://pnpm.io/)
- LiveKit CLI (`npm i -g @livekit/cli`)

## Setup
1. Clone the repository and open this folder: `realtime-tutor/livekit-voice-agent`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Authenticate with LiveKit Cloud (one-time):
   ```bash
   lk cloud auth
   ```
4. Pull your project credentials into `.env.local`:
   ```bash
   lk app env -w
   ```
   Update the generated `.env.local` with `OPENAI_API_KEY=...` if you plan to test the Realtime path.
5. Download model assets once (prevents missing agent.js errors):
   ```bash
   pnpm download-files
   ```

## Development
Start the voice worker locally:
```bash
pnpm dev
```
The script loads `.env.local` via `dotenv`. It fails fast if `LIVEKIT_URL`, `LIVEKIT_API_KEY`, or `LIVEKIT_API_SECRET` are missing.

Open the [LiveKit Agents Playground](https://agents.livekit.io/), select your LiveKit Cloud project, and choose this worker from the dropdown to start an interactive session. Use a built-in microphone first for the most reliable capture.

## Switching to OpenAI Realtime
The default pipeline uses the robust LiveKit STT → GPT-4.1 mini → Cartesia Sonic voice path. To experiment with OpenAI Realtime:
1. Ensure `OPENAI_API_KEY` is set in `.env.local`.
2. Uncomment the block in `agent.ts` under the "try OpenAI Realtime" comment.
3. Restart the dev server.

## Next steps
- Add Claude as the tutoring LLM (see the TODO in `agent.ts`).
- Integrate Letta via a future `/api/learning-plan` endpoint for personalized lesson plans.
