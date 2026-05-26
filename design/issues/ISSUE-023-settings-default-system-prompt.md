---
id: ISSUE-023
title: Settings default system prompt
status: pending
type: coding
layer: fullstack
phase: 2
depends_on: [ISSUE-011, ISSUE-001]
---

# Settings default system prompt

## Summary

`/settings` section for user-wide default system prompt applied to new chats.

## Requirements

- `SettingsDefaultPromptSection` sibling on settings page
- `UserSettings.defaultSystemPrompt` field
- `settings.update` accepts `defaultSystemPrompt`
- `build-messages` uses resolution order: chat → project → user default → fallback
- Large textarea with save + `toast.success`

## Acceptance criteria

- [ ] New chat inherits default until per-chat override saved
- [ ] Editing default does not retroactively change existing chat overrides

## References

- [data-model.md](../data-model.md) — System prompt resolution
- [features.md](../features.md)
