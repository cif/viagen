import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  simpleGit,
  type DiffResultTextFile,
  type SimpleGit,
  type StatusResult,
} from "simple-git";
import type { ViteDevServer } from "vite";

interface ChangedFile {
  path: string;
  status: string;
  insertions: number;
  deletions: number;
}

function mapStatus(
  result: StatusResult,
  stats: Map<string, { ins: number; del: number }>,
): ChangedFile[] {
  const files: ChangedFile[] = [];

  const push = (path: string, status: string) => {
    const s = stats.get(path) ?? { ins: 0, del: 0 };
    files.push({ path, status, insertions: s.ins, deletions: s.del });
  };

  for (const f of result.modified) push(f, "M");
  for (const f of result.created) push(f, "A");
  for (const f of result.deleted) push(f, "D");
  for (const f of result.renamed) push(f.to, "R");
  for (const f of result.not_added) push(f, "?");

  // Deduplicate (a file can appear in both staged + unstaged)
  const seen = new Set<string>();
  return files
    .filter((f) => {
      if (seen.has(f.path)) return false;
      seen.add(f.path);
      return true;
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Build per-file insertion/deletion stats from staged + unstaged diff summaries.
 */
async function getDiffStats(
  git: SimpleGit,
  repoRoot: string,
  untrackedFiles: string[],
): Promise<{
  stats: Map<string, { ins: number; del: number }>;
  totalInsertions: number;
  totalDeletions: number;
}> {
  const stats = new Map<string, { ins: number; del: number }>();
  let totalInsertions = 0;
  let totalDeletions = 0;

  try {
    const [staged, unstaged] = await Promise.all([
      git.diffSummary(["--cached"]),
      git.diffSummary(),
    ]);

    for (const summary of [staged, unstaged]) {
      for (const f of summary.files) {
        if (f.binary) continue;
        const tf = f as DiffResultTextFile;
        const existing = stats.get(tf.file) ?? { ins: 0, del: 0 };
        existing.ins += tf.insertions;
        existing.del += tf.deletions;
        stats.set(tf.file, existing);
      }
    }

    // Count lines in untracked files as insertions
    for (const filePath of untrackedFiles) {
      try {
        const content = readFileSync(join(repoRoot, filePath), "utf-8");
        const lines = content.split("\n").length;
        stats.set(filePath, { ins: lines, del: 0 });
      } catch {
        // Skip files we can't read
      }
    }

    for (const { ins, del } of stats.values()) {
      totalInsertions += ins;
      totalDeletions += del;
    }
  } catch {
    // Stats are best-effort
  }

  return { stats, totalInsertions, totalDeletions };
}

async function getFileDiff(
  git: SimpleGit,
  repoRoot: string,
  filePath: string,
): Promise<string> {
  // Security: resolve and verify the path stays within the repo
  const abs = resolve(repoRoot, filePath);
  if (!abs.startsWith(repoRoot + "/") && abs !== repoRoot) {
    return "";
  }

  try {
    // Try staged diff first, then unstaged
    const staged = await git.diff(["--cached", "--", filePath]);
    const unstaged = await git.diff(["--", filePath]);

    if (staged && unstaged) return staged + "\n" + unstaged;
    if (staged) return staged;
    if (unstaged) return unstaged;

    // Untracked file: show entire content as added
    try {
      const content = readFileSync(join(repoRoot, filePath), "utf-8");
      const lines = content.split("\n");
      const added = lines.map((l) => `+${l}`).join("\n");
      return `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n${added}`;
    } catch {
      return "";
    }
  } catch {
    return "";
  }
}

/**
 * Resolve the git repository root from a directory that may be a subdirectory.
 * Returns null if not inside a git repo.
 */
async function findRepoRoot(cwd: string): Promise<string | null> {
  try {
    const root = await simpleGit(cwd).revparse(["--show-toplevel"]);
    return root.trim();
  } catch {
    return null;
  }
}

export function registerGitRoutes(
  server: ViteDevServer,
  opts: { projectRoot: string },
) {
  // Lazily resolved — the repo root may differ from the Vite project root
  // (e.g. `vite site` sets config.root to site/ but the repo root is parent)
  let repoRoot: string | null = null;
  let git: SimpleGit | null = null;

  async function ensureGit(): Promise<{ git: SimpleGit; root: string } | null> {
    if (git && repoRoot) return { git, root: repoRoot };
    repoRoot = await findRepoRoot(opts.projectRoot);
    if (!repoRoot) return null;
    git = simpleGit(repoRoot);
    return { git, root: repoRoot };
  }

  // GET /via/git/status — list changed files
  server.middlewares.use("/via/git/status", (req, res) => {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    res.setHeader("Content-Type", "application/json");

    ensureGit()
      .then(async (ctx) => {
        if (!ctx) {
          res.end(JSON.stringify({ files: [], git: false }));
          return;
        }
        const result = await ctx.git.status();
        const { stats, totalInsertions, totalDeletions } = await getDiffStats(
          ctx.git,
          ctx.root,
          result.not_added,
        );
        const files = mapStatus(result, stats);
        res.end(
          JSON.stringify({
            files,
            git: true,
            insertions: totalInsertions,
            deletions: totalDeletions,
          }),
        );
      })
      .catch(() => {
        res.end(JSON.stringify({ files: [], git: false }));
      });
  });

  // GET /via/git/diff — get diff (all files or single file with ?path=)
  server.middlewares.use("/via/git/diff", (req, res) => {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    res.setHeader("Content-Type", "application/json");

    const url = new URL(req.url ?? "/", "http://localhost");
    const filePath = url.searchParams.get("path");

    ensureGit()
      .then(async (ctx) => {
        if (!ctx) {
          res.end(JSON.stringify({ diff: "", git: false }));
          return;
        }

        if (filePath) {
          if (filePath.startsWith("/")) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Absolute paths not allowed" }));
            return;
          }
          const diff = await getFileDiff(ctx.git, ctx.root, filePath);
          res.end(JSON.stringify({ diff, path: filePath }));
        } else {
          const staged = await ctx.git.diff(["--cached"]);
          const unstaged = await ctx.git.diff();
          const combined =
            staged && unstaged
              ? staged + "\n" + unstaged
              : staged || unstaged || "";
          res.end(JSON.stringify({ diff: combined }));
        }
      })
      .catch(() => {
        res.end(JSON.stringify({ diff: "" }));
      });
  });
}
