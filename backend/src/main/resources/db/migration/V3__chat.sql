CREATE TABLE projects (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects (user_id);

CREATE TABLE threads (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  project_id        BIGINT REFERENCES projects (id) ON DELETE CASCADE,
  parent_thread_id  BIGINT REFERENCES threads (id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL DEFAULT 'New chat',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threads_user_id ON threads (user_id);
CREATE INDEX idx_threads_project_id ON threads (project_id);
CREATE INDEX idx_threads_parent_thread_id ON threads (parent_thread_id);

CREATE TABLE messages (
  id                    BIGSERIAL PRIMARY KEY,
  thread_id             BIGINT NOT NULL REFERENCES threads (id) ON DELETE CASCADE,
  role                  VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  active_variant_index  INT NOT NULL DEFAULT 0,
  thinking              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id_created_at ON messages (thread_id, created_at);

CREATE TABLE message_variants (
  id         BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_variants_message_id_sort_order ON message_variants (message_id, sort_order);
