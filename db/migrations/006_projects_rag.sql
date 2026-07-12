CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id);

ALTER TABLE chat_threads
  ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS chat_threads_project_id_idx ON chat_threads (project_id);

ALTER TABLE ai_user_settings
  ADD COLUMN IF NOT EXISTS preferred_embedding_provider_id TEXT,
  ADD COLUMN IF NOT EXISTS preferred_embedding_model_id TEXT;

CREATE TABLE IF NOT EXISTS project_embeddings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS project_embeddings_project_id_idx ON project_embeddings (project_id);

CREATE INDEX IF NOT EXISTS project_embeddings_hnsw_idx
  ON project_embeddings USING hnsw (embedding vector_cosine_ops);
