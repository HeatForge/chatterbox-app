---
id: ISSUE-031
title: pgvector and RAG retrieval
status: pending
type: coding
layer: BE
phase: 5
depends_on: [ISSUE-027, ISSUE-001]
---

# pgvector and RAG retrieval

## Summary

Enable pgvector extension and similarity search for `DocumentChunk`.

## Requirements

- Migration: `CREATE EXTENSION vector`
- `server/rag/retrieve.ts`: top-k by cosine similarity scoped to `projectId`
- Inject hits in `build-messages` after summaries

## Acceptance criteria

- [ ] Query returns relevant chunks for test embeddings
- [ ] No cross-project leakage

## References

- [data-model.md](../data-model.md) — DocumentChunk
