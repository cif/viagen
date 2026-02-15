import type { ViteDevServer } from "vite";

export interface ViteError {
  message: string;
  stack: string;
  frame?: string;
  plugin?: string;
  loc?: { file: string; line: number; column: number };
}

export function registerHealthRoutes(
  server: ViteDevServer,
  env: Record<string, string>,
  errorRef: { get(): ViteError | null },
) {
  server.middlewares.use("/via/error", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: errorRef.get() }));
  });

  server.middlewares.use("/via/health", (_req, res) => {
    const configured =
      !!env["ANTHROPIC_API_KEY"] || !!env["CLAUDE_ACCESS_TOKEN"];
    const git = !!env["GITHUB_TOKEN"];

    res.setHeader("Content-Type", "application/json");

    if (configured) {
      res.end(JSON.stringify({ status: "ok", configured: true, git }));
    } else {
      res.end(
        JSON.stringify({ status: "error", configured: false, git }),
      );
    }
  });
}
