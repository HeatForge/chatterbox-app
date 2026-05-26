# Chatterbox — Features Specification

This document maps product features to routes, UI components, and APIs. UI follows [flat page composition](./ui-composition.md): each page file lists all top-level feature blocks as siblings.

## Route overview

| Route | Audience | Top-level components (siblings in page file) |
|-------|----------|---------------------------------------------|
| `/chat` | Authenticated users | Layout template only: `ChatTreeSidebar`, `ChatView` (empty), `ChatContextPanel` — no active thread |
| `/chat/[chatId]` | Authenticated users | Same siblings; data loaded for `chatId` |
| `/admin` | Admin only | `AdminProvidersSection`, `AdminModelsSection`, `AdminWhitelistSection` |
| `/settings` | Authenticated users | `SettingsProfileSection`, `SettingsDefaultPromptSection`, `SettingsPreferencesSection`, `SettingsAppearanceSection` |
| `/` | Public / redirect | Landing or redirect |

Optional later: `/projects/[projectId]` with flat sections for documents, summaries, and chat list.

---

## `/chat` — Primary chat experience

### Layout

Three columns defined in `pages/chat/index.module.css`:

| Column | Component | Width (default) |
|--------|-----------|-----------------|
| Left | `ChatTreeSidebar` | ~260px, collapsible |
| Center | `ChatView` | flex 1 |
| Right | `ChatContextPanel` | ~320px, collapsible |

### ChatTreeSidebar

**Purpose:** Navigate chats, projects, and fork tree.

| Feature | Behavior | API |
|---------|----------|-----|
| List chats | Roots and nested forks; hidden chats omitted by default | `chat.list` |
| Project filter | Projects section above chat tree; click project → filter threads | `project.list`, `chat.list({ projectId })` |
| Leave project view | Button clears `projectId` filter → show non-project chats | Client state |
| Select chat | Loads messages in `ChatView` | `message.list`, `chat.get` |
| Hide chat | Context menu → hide | `chat.update({ hiddenAt })` |
| Delete chat | Confirm → remove thread | `chat.delete` |
| New chat | Creates root thread | `chat.create` |
| Fork tree display | Children indented `depth * 12px` | — |
| Collapse sidebar | Toggle width to icon strip | Client state |

**Primitives inside:** `ChatTreeItem`, `ProjectListItem`, `IconButton`, `ScrollArea`, `ContextMenu`.

**Does not contain:** message list, composer, sampler fields, admin forms.

### ChatView

**Purpose:** Display conversation and send messages.

| Feature | Behavior | API |
|---------|----------|-----|
| Message list | Scrollable, ordered by `ordinal` | `message.list` |
| User messages | Text + image parts | — |
| Assistant messages | Active variant content; tool results styled distinctly | — |
| Composer | Textarea, send, attach images | `POST /api/chat/stream`, upload endpoint |
| Model selector | Dropdown of allowed models | `provider.listModels` |
| Tool toggles | Enable/disable tools for session | `chat.updateTools` |
| Status bar | Streaming indicator, token/error state | Stream events |

**Message hover actions (assistant bubbles):**

| Action | Behavior | API |
|--------|----------|-----|
| Redo (arrow) | New variant; keep previous variants | `message.regenerate` |
| Variant prev/next | Switch active variant | `message.setActiveVariant` |
| Retry | Re-run failed variant slot | `message.retry` |
| Copy | Clipboard write | Client |

**Selection mode (bulk ops):**

| Feature | Behavior | API |
|---------|----------|-----|
| Enter selection | Checkbox on messages | Client |
| Delete selected | Remove messages | `message.deleteMany` |
| Fork from selection | New thread up to last selected | `chat.fork` |

**Primitives inside:** `MessageList`, `MessageBubble`, `MessageActions`, `Composer`, `AttachmentPreview`, `ToolToggleList`, `ChatInput`, `ChatStatusBar`.

**Does not contain:** chat tree, system prompt editor, admin UI.

### ChatContextPanel

**Purpose:** Per-chat settings and utilities (right column on `/chat` and `/chat/[chatId]`).

**Tabbed UI** (primitives: `Tabs`, `TabList`, `TabPanel`):

| Tab | Visible when | Content |
|-----|--------------|---------|
| **Chat** | Always | System prompt override, sampler, export actions |
| **Project data** | Active chat belongs to a project (`projectId` set) | Uploads, documents, data connectors |

#### Chat tab

| Feature | Behavior | API |
|---------|----------|-----|
| System prompt | Per-chat override (falls back to user default, then project) | `chat.updateSettings` |
| Sampler settings | temperature, top_p, max_tokens, penalties, stop sequences | `chat.updateSettings` |
| Export chat | Copy or download plaintext/markdown | `chat.export` |
| Save to file | Browser download | Client + `chat.export` |
| Copy whole chat | Clipboard | `chat.export` |

#### Project data tab

| Feature | Behavior | API |
|---------|----------|-----|
| Upload file | Add document to project | `document.upload` |
| List documents | Show sync status | `document.list` |
| Add local path connector | Path under server allowlist | `document.addConnector` |
| Add GitHub repo connector | Repo URL + token (indexing only, not auth) | `document.addConnector` |
| Sync connector | Enqueue index job | `document.syncConnector` |
| Delete document | Remove from project | `document.delete` |

**Primitives inside:** `ContextPanelTabs`, `SystemPromptEditor`, `SamplerFields`, `ExportActions`, `ProjectDataUpload`, `ProjectDocumentList`, `ConnectorForm`.

**Does not contain:** message list, chat tree, provider API key forms.

---

## `/admin` — Administration

Restricted to `User.role === admin`. Non-admins receive 403 or redirect.

### AdminProvidersSection

| Feature | Behavior | API |
|---------|----------|-----|
| List providers | OpenRouter, etc. | `admin.listProviders` |
| Add/edit provider | baseUrl, display name, encrypted API key | `admin.upsertProvider` |
| Enable/disable | Toggle `enabled` | `admin.updateProvider` |
| Test connection | Optional ping | `admin.testProvider` |

### AdminModelsSection

| Feature | Behavior | API |
|---------|----------|-----|
| List models | Per provider | `admin.listModels` |
| Allow/deny | Whitelist mode | `admin.setModelPolicy` |
| Set default model | One `isDefault` per deployment | `admin.setDefaultModel` |

### AdminWhitelistSection

| Feature | Behavior | API |
|---------|----------|-----|
| List emails | Allowed sign-ups | `admin.listAllowedEmails` |
| Add email | Lowercase normalize | `admin.addAllowedEmail` |
| Remove email | Delete row | `admin.removeAllowedEmail` |

**Page composition example:**

```tsx
// pages/admin/index.tsx — all sections visible as siblings
<div className={styles.root}>
  <AdminProvidersSection />
  <AdminModelsSection />
  <AdminWhitelistSection />
</div>
```

---

## `/settings` — User preferences

Not chat-session UI. Global preferences for the signed-in user.

### SettingsProfileSection

| Feature | Behavior | API |
|---------|----------|-----|
| Display name | Edit name | `settings.updateProfile` |
| Email | Read-only or change flow via Better Auth | Auth API |
| Avatar | Optional image URL | `settings.updateProfile` |

### SettingsPreferencesSection

| Feature | Behavior | API |
|---------|----------|-----|
| Default model | Used when creating new chats | `settings.update` |
| Keyboard shortcuts | Future | — |

### SettingsDefaultPromptSection

| Feature | Behavior | API |
|---------|----------|-----|
| Default system prompt | Applied to every **new** chat when no per-chat or project override | `settings.update` (`defaultSystemPrompt`) |

Existing chats are unchanged unless user edits per-chat prompt. Resolution order at stream time: **chat override → project default → user default → app fallback**.

### SettingsAppearanceSection

| Feature | Behavior | API |
|---------|----------|-----|
| Theme | light / dark / system | `settings.update` |

### settings.* tRPC router (proposed)

| Procedure | Type | Description |
|-----------|------|-------------|
| `get` | query | Load `UserSettings` |
| `update` | mutation | Partial update preferences JSON, `defaultSystemPrompt`, `theme` |
| `updateProfile` | mutation | Name, image |

---

## Projects (Phase 4+)

### Project list (in ChatTreeSidebar)

- Section above chat tree
- Click project → filter chats; show **Leave project** control

### Project features (future `/projects/[id]` page)

| Feature | Behavior | API |
|---------|----------|-----|
| Create/edit project | Name, description, defaults | `project.create`, `project.update` |
| Assign chat to project | Move thread | `chat.update({ projectId })` |
| Attach document | Upload file | `document.upload` |
| Local path connector | Admin-approved roots | `document.addConnector` |
| GitHub connector | Repo URL + read token | `document.addConnector` |
| Sync connector | Enqueue index job | `document.syncConnector` |
| Cross-chat memory | Summaries injected in `build-messages` | Background `summarizeChat` |
| RAG query | Top-k chunks in prompt | `rag.retrieve` internal |

---

## Provider connectivity

| Provider | Integration |
|----------|-------------|
| OpenRouter | Primary; OpenAI-compatible `baseUrl` |
| Others | Same adapter; row per `ProviderConfig` |

All traffic uses **admin-configured keys** shared by every authenticated user. Model picker only shows `ModelPolicy.allowed === true`.

---

## Authentication

| Feature | Implementation |
|---------|----------------|
| Sign up | Email/password only (whitelist gated) |
| Sign in | Email/password only |
| Whitelist | `AllowedEmail` + Better Auth hooks |
| Sessions | Better Auth cookies |
| Admin bootstrap | `ADMIN_EMAIL` env seeds first admin |

---

## API summary

### tRPC routers

| Router | Procedures (representative) |
|--------|----------------------------|
| `chat` | `list`, `get`, `create`, `update`, `delete`, `fork`, `export`, `getSettings`, `updateSettings`, `updateTools` |
| `message` | `list`, `deleteMany`, `regenerate`, `setActiveVariant`, `retry` |
| `project` | `list`, `get`, `create`, `update`, `delete` |
| `document` | `upload`, `list`, `delete`, `addConnector`, `syncConnector` |
| `provider` | `listModels` (read-only, allowed only) |
| `admin` | `*` (providers, models, whitelist) |
| `settings` | `get`, `update`, `updateProfile` |

### REST

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat/stream` | SSE completion stream |
| * | `/api/auth/[...all]` | Better Auth handler |

---

## Non-functional requirements

| Area | Target |
|------|--------|
| Streaming latency | First token visible &lt; 2s on warm path |
| Sidebar list | &lt; 200ms for 500 threads (paginate if needed) |
| Export | Up to 10MB chat text without timeout |
| Images | Max 10MB per attachment; reasonable count per message |

---

## Related documents

- [Architecture](./architecture.md)
- [Data model](./data-model.md)
- [UI composition](./ui-composition.md)
- [UI layout mockup](./ui-layout.html)
- [Roadmap](./roadmap.md)
- [Issues](./issues/README.md)
