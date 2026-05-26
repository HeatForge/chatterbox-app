---
id: ISSUE-013
title: Provider config and encryption
status: pending
type: coding
layer: BE
phase: 1
depends_on: [ISSUE-001, ISSUE-004]
---

# Provider config and encryption

## Summary

Server-side provider registry with encrypted API keys in `ProviderConfig`.

## Requirements

- `server/ai/registry.ts`: `getProvider`, `listAllowedModels`, `assertModelAllowed`
- Encrypt `apiKey` on write, decrypt on stream only
- OpenAI-compatible client factory (base URL from config)

## Acceptance criteria

- [ ] Admin can store OpenRouter key via tRPC (after ISSUE-014)
- [ ] Decrypted key never appears in client responses or logs

## References

- [architecture.md](../architecture.md) — AI provider layer
