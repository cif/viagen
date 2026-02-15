# viagen

A Vite plugin and CLI tool that enables you to use Claude Code in a sandbox — instantly.

## Prerequisites

- [Claude](https://claude.ai/signup) — Max, Pro, or API plan. The setup wizard handles auth.
- [Vercel](https://vercel.com/signup) — Free plan works. Sandboxes last 45 min on Hobby, 5 hours on Pro.
- [GitHub CLI](https://cli.github.com) — Enables git clone and push from sandboxes.

## Step 1 — Add viagen to your app

```bash
npm install viagen
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { viagen } from 'viagen'

export default defineConfig({
  plugins: [viagen()],
})
```

## Step 2 — Setup

```bash
npx viagen setup
```

The setup wizard authenticates with Claude then uses GitHub and Vercel to write your local `.env`.

You can now run `npm run dev` to start the local dev server. At this point you can launch viagen and chat with Claude to make changes to your app.

## Step 3 — Sandbox

```bash
npx viagen sandbox
```

Deploys your dev server to a remote Vercel Sandbox — an isolated VM-like environment where Claude can read, write, and push code.

```bash
# Deploy on a specific branch
npx viagen sandbox --branch feature/my-thing

# Set a longer timeout (default: 30 min)
npx viagen sandbox --timeout 60

# Stop a running sandbox
npx viagen sandbox stop <sandboxId>
```

## Vite Plugin Options

```ts
viagen({
  position: 'bottom-right',  // toggle button position
  model: 'sonnet',           // claude model
  panelWidth: 420,           // chat panel width in px
  overlay: true,             // fix button on error overlay
  ui: true,                  // inject chat panel into pages
})
```

## API

Every viagen endpoint is available as an API. Build your own UI, integrate with CI, or script Claude from the command line.

```
POST /via/chat        — send a message, streamed SSE response
POST /via/chat/reset  — clear conversation history
GET  /via/health      — check API key status
GET  /via/error       — latest build error (if any)
GET  /via/ui          — standalone chat interface
```

When `VIAGEN_AUTH_TOKEN` is set (always on in sandboxes), pass the token as a `Bearer` header or `?token=` query param.

```bash
# With curl
curl -X POST http://localhost:5173/via/chat \
  -H "Authorization: Bearer $VIAGEN_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "add a hello world route"}'

# Or pass the token as a query param (sets a session cookie)
open "http://localhost:5173/via/ui?token=$VIAGEN_AUTH_TOKEN"
```

## Development

```bash
npm install
npm run dev        # Dev server (site)
npm run build      # Build with tsup
npm run test       # Run tests
npm run typecheck  # Type check
```

## License

[MIT](LICENSE)
