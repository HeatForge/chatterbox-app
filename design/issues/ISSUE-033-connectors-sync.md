---
id: ISSUE-033
title: Local and GitHub connectors sync
status: pending
type: coding
layer: BE
phase: 5
depends_on: [ISSUE-032]
---

# Local and GitHub connectors sync

## Summary

Index content from allowed directories and GitHub repos (indexing token only).

## Requirements

- Path allowlist for `local_path`; reject traversal
- GitHub: shallow clone to temp dir, index, cleanup
- `document.syncConnector` enqueues job
- Not related to user login OAuth

## Acceptance criteria

- [ ] Local connector indexes files under allowed root
- [ ] GitHub connector indexes repo default branch read-only

## References

- [architecture.md](../architecture.md) — Connectors security
