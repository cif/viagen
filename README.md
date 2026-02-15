# Viagen (Vite Agent)

A Vite plugin that embeds Claude Code into any Vite dev server.

## Install

```bash
npm install viagen
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { viagen } from 'viagen'

export default defineConfig({
  plugins: [viagen()],
})
```

Set `ANTHROPIC_API_KEY` in your `.env`, start the dev server.

## Endpoints

**`POST /via/chat`** — Send a message, get a streamed response.

```bash
curl -N -X POST http://localhost:5173/via/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "add a dark mode toggle"}'
```

Response is SSE with `data:` lines containing JSON:

```
data: {"type":"text","text":"I'll add a dark mode toggle..."}
data: {"type":"tool_use","name":"Edit","input":{"file_path":"src/App.tsx"}}
data: {"type":"text","text":"Done! The toggle is in the header."}
event: done
data: {}
```

**`POST /via/chat/reset`** — Clear conversation history.

**`GET /via/health`** — Check if `ANTHROPIC_API_KEY` is configured.

**`GET /via/error`** — Get the latest Vite build error (if any).

## UI

The plugin injects a `via` toggle button into your page. Click it to open the chat panel. Build errors get a "Fix This Error" button on the Vite error overlay.

You can also open the chat UI directly at `http://localhost:5173/via/ui`.

## Development

```bash
npm install
npm run dev        # Playground dev server
npm run build      # Build with tsup
```
