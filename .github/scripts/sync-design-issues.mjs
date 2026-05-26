#!/usr/bin/env node
/**
 * Sync design/issues/*.md frontmatter → GitHub Issues.
 * One-way: repository markdown is the source of truth.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ISSUES_DIR = join(__dirname, "../../design/issues");
const SYNC_MARKER = "chatterbox-issue";
const TRACKER_LABEL = "chatterbox-design";

/** Must match .github/workflows/sync-design-issues.yml */
const EXPECTED_REPOSITORY = "HeatForge/chatterbox-app";
const EXPECTED_BRANCH = "main";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.CHATTERBOX_REPOSITORY;
const refName = process.env.CHATTERBOX_DEFAULT_BRANCH ?? EXPECTED_BRANCH;
const dryRun = process.env.DRY_RUN === "true";

if (!token || !repository) {
  console.error("GITHUB_TOKEN and CHATTERBOX_REPOSITORY are required");
  process.exit(1);
}

if (repository !== EXPECTED_REPOSITORY) {
  console.error(
    `Refusing to sync: CHATTERBOX_REPOSITORY must be ${EXPECTED_REPOSITORY}, got ${repository}`,
  );
  process.exit(1);
}

if (refName !== EXPECTED_BRANCH) {
  console.error(
    `Refusing to sync: CHATTERBOX_DEFAULT_BRANCH must be ${EXPECTED_BRANCH}, got ${refName}`,
  );
  process.exit(1);
}

const repoParts = repository.split("/");
if (repoParts.length !== 2 || !repoParts[0] || !repoParts[1]) {
  console.error(`Invalid CHATTERBOX_REPOSITORY: ${repository}`);
  process.exit(1);
}
const [owner, repo] = repoParts;
const api = (path, options = {}) =>
  fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

/** @param {Response} res */
async function assertOk(res, context) {
  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(`${context}: ${res.status} ${text}`);
}

/**
 * @param {string} content
 */
function parseIssueFile(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  /** @type {Record<string, string | string[]>} */
  const data = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        : [];
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, "");
    }
  }

  return { data, body: match[2].trim() };
}

/**
 * @param {string} body
 * @param {string} filename
 */
function buildIssueBody(data, body, filename) {
  const fileUrl = `https://github.com/${owner}/${repo}/blob/${refName}/design/issues/${filename}`;
  const status = String(data.status ?? "pending");
  const depends =
    Array.isArray(data.depends_on) && data.depends_on.length > 0
      ? data.depends_on.join(", ")
      : "—";

  const rewritten = body.replace(
    /\]\(\.\.\/([^)]+)\)/g,
    (_, path) =>
      `](https://github.com/${owner}/${repo}/blob/${refName}/design/${path})`,
  );

  return `<!-- ${SYNC_MARKER}: ${data.id} -->

> **Synced from** [\`${filename}\`](${fileUrl}) · Edit that file and push to update this issue.
>
> | Meta | Value |
> |------|-------|
> | **Status** | \`${status}\` |
> | **Type** | ${data.type ?? "—"} |
> | **Layer** | ${data.layer ?? "—"} |
> | **Phase** | ${data.phase ?? "—"} |
> | **Depends on** | ${depends} |

---

${rewritten}

---

<sub>Managed by <a href="https://github.com/${owner}/${repo}/blob/${refName}/.github/workflows/sync-design-issues.yml">sync-design-issues</a> workflow. GitHub-only edits are overwritten on the next sync.</sub>`;
}

/**
 * @param {Record<string, string | string[]>} data
 */
function buildLabels(data) {
  const labels = [TRACKER_LABEL, `phase:${data.phase}`, `layer:${data.layer}`, `type:${data.type}`];
  const status = String(data.status ?? "pending");
  if (status !== "done") {
    labels.push(`status:${status}`);
  }
  return labels;
}

/** @type {Map<string, { number: number, state: string }>} */
const syncIdToIssue = new Map();

async function loadExistingIssues() {
  let page = 1;
  while (true) {
    const res = await api(
      `/issues?state=all&labels=${encodeURIComponent(TRACKER_LABEL)}&per_page=100&page=${page}`,
    );
    const issues = await assertOk(res, "list issues");
    if (issues.length === 0) break;

    for (const issue of issues) {
      if (issue.pull_request) continue;
      const marker = issue.body?.match(
        new RegExp(`<!-- ${SYNC_MARKER}: ([A-Z]+-\\d+) -->`),
      );
      if (marker?.[1]) {
        syncIdToIssue.set(marker[1], {
          number: issue.number,
          state: issue.state,
        });
      }
    }

    if (issues.length < 100) break;
    page += 1;
  }
}

/** @type {Map<string, number>} */
const milestoneCache = new Map();

async function getMilestoneNumber(phase) {
  const title = `Phase ${phase}`;
  if (milestoneCache.has(title)) return milestoneCache.get(title);

  const listRes = await api("/milestones?state=all&per_page=100");
  const milestones = await assertOk(listRes, "list milestones");
  let found = milestones.find((m) => m.title === title);

  if (!found && !dryRun) {
    const createRes = await api("/milestones", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: `Roadmap phase ${phase} — see design/roadmap.md`,
      }),
    });
    found = await assertOk(createRes, `create milestone ${title}`);
  }

  const num = found?.number ?? undefined;
  if (num != null) milestoneCache.set(title, num);
  return num;
}

/** @type {Set<string>} */
const ensuredLabels = new Set();

async function ensureLabels(labelNames) {
  const listRes = await api("/labels?per_page=100");
  const existing = await assertOk(listRes, "list labels");
  const existingNames = new Set(existing.map((l) => l.name));

  const colors = {
    [TRACKER_LABEL]: "0e8a16",
    "status:pending": "fbca04",
    "status:in_progress": "1d76db",
    "status:blocked": "b60205",
    "type:coding": "1d76db",
    "type:design": "c5def5",
    "type:architecture": "5319e7",
    "layer:FE": "ededed",
    "layer:BE": "d4c5f9",
    "layer:fullstack": "006b75",
  };

  for (const name of labelNames) {
    if (existingNames.has(name) || ensuredLabels.has(name)) continue;
    ensuredLabels.add(name);

    if (dryRun) {
      console.log(`[dry-run] would create label: ${name}`);
      continue;
    }

    const phaseMatch = name.match(/^phase:(\d+)$/);
    const color = colors[name] ?? (phaseMatch ? "fef2c0" : "cccccc");

    const createRes = await api("/labels", {
      method: "POST",
      body: JSON.stringify({ name, color }),
    });
    if (createRes.status === 422) {
      // Already exists (race)
      continue;
    }
    await assertOk(createRes, `create label ${name}`);
    console.log(`Created label: ${name}`);
  }
}

/**
 * @param {Record<string, string | string[]>} data
 * @param {string} issueBody
 * @param {string} filename
 */
async function upsertIssue(data, issueBody, filename) {
  const id = String(data.id);
  const title = `[${id}] ${data.title}`;
  const labels = buildLabels(data);
  const state = data.status === "done" ? "closed" : "open";
  const milestone = await getMilestoneNumber(data.phase);

  await ensureLabels(labels);

  const existing = syncIdToIssue.get(id);
  const payload = {
    title,
    body: issueBody,
    labels,
    state,
    ...(milestone != null ? { milestone: String(milestone) } : {}),
  };

  if (dryRun) {
    console.log(
      `[dry-run] ${existing ? "update" : "create"} #${existing?.number ?? "?"} ${id} → ${state}`,
    );
    return;
  }

  if (existing) {
    const res = await api(`/issues/${existing.number}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    await assertOk(res, `update ${id}`);
    console.log(`Updated #${existing.number} ${id} (${state})`);
  } else {
    const res = await api("/issues", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const created = await assertOk(res, `create ${id}`);
    syncIdToIssue.set(id, { number: created.number, state: created.state });
    console.log(`Created #${created.number} ${id}`);
  }

  // Small delay to respect secondary rate limits
  await new Promise((r) => setTimeout(r, 300));
}

async function closeOrphanedIssues(activeIds) {
  for (const [syncId, { number, state }] of syncIdToIssue) {
    if (activeIds.has(syncId) || state === "closed") continue;

    if (dryRun) {
      console.log(`[dry-run] would close orphan #${number} (${syncId})`);
      continue;
    }

    const res = await api(`/issues/${number}`, {
      method: "PATCH",
      body: JSON.stringify({
        state: "closed",
        state_reason: "not_planned",
      }),
    });
    await assertOk(res, `close orphan ${syncId}`);
    console.log(`Closed orphan #${number} (${syncId}) — file removed from design/issues/`);
  }
}

async function main() {
  const files = (await readdir(ISSUES_DIR)).filter(
    (f) => f.startsWith("ISSUE-") && f.endsWith(".md"),
  );

  console.log(`Found ${files.length} issue file(s) in design/issues/`);
  if (dryRun) console.log("DRY RUN — no GitHub writes\n");

  await loadExistingIssues();
  console.log(`Loaded ${syncIdToIssue.size} existing tracked issue(s)\n`);

  /** @type {Set<string>} */
  const activeIds = new Set();

  // Collect all labels we'll need
  const allLabels = new Set([TRACKER_LABEL]);
  const parsed = [];

  for (const filename of files.sort()) {
    const raw = await readFile(join(ISSUES_DIR, filename), "utf8");
    const parsedFile = parseIssueFile(raw);
    if (!parsedFile?.data?.id) {
      console.warn(`Skip ${filename}: missing frontmatter id`);
      continue;
    }
    for (const l of buildLabels(parsedFile.data)) allLabels.add(l);
    parsed.push({ filename, ...parsedFile });
  }

  await ensureLabels([...allLabels]);

  for (const { filename, data, body } of parsed) {
    activeIds.add(String(data.id));
    const issueBody = buildIssueBody(data, body, filename);
    await upsertIssue(data, issueBody, filename);
  }

  await closeOrphanedIssues(activeIds);
  console.log("\nSync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
