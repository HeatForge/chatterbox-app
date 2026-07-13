ALTER TABLE ai_user_settings
  ADD COLUMN IF NOT EXISTS preferred_image_provider_id TEXT,
  ADD COLUMN IF NOT EXISTS preferred_image_model_id TEXT;
