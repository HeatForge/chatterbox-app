---
id: ISSUE-032
title: Document upload and chunking pipeline
status: pending
type: coding
layer: fullstack
phase: 5
depends_on: [ISSUE-029, ISSUE-031]
---

# Document upload and chunking pipeline

## Summary

Ingest uploads: chunk, embed, store in `DocumentChunk`.

## Requirements

- `server/rag/chunk.ts`, `embed.ts`
- Job `indexDocument` on upload
- Admin-configured embedding model
- Progress toast or status in Project data tab

## Acceptance criteria

- [ ] PDF/text file searchable via RAG in project chat

## References

- [ISSUE-029](./ISSUE-029-project-data-tab.md)
