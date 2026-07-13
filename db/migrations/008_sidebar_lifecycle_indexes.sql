CREATE INDEX IF NOT EXISTS chat_threads_sidebar_active_idx
  ON chat_threads (user_id, updated_at DESC)
  WHERE deleted_at IS NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS chat_threads_sidebar_archived_idx
  ON chat_threads (user_id, updated_at DESC)
  WHERE deleted_at IS NULL AND archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS projects_sidebar_active_idx
  ON projects (user_id, updated_at DESC)
  WHERE deleted_at IS NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS projects_sidebar_archived_idx
  ON projects (user_id, updated_at DESC)
  WHERE deleted_at IS NULL AND archived_at IS NOT NULL;
