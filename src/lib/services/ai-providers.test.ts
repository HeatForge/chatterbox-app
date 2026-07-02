import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    selectFrom: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { getGenerationModel } from "@/lib/services/ai-providers";

function mockProviderRow(row: {
  id: string;
  user_id: string;
  provider_key: string;
  display_name: string;
  api_key: string;
  base_url: string | null;
  enabled: boolean;
}) {
  vi.mocked(db.selectFrom).mockReturnValue({
    selectAll: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockResolvedValue(row),
  } as never);
}

describe("getGenerationModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses chat completions for OpenAI-compatible providers", async () => {
    mockProviderRow({
      id: "provider-1",
      user_id: "user-1",
      provider_key: "openrouter",
      display_name: "OpenRouter",
      api_key: "test-key",
      base_url: "https://openrouter.ai/api/v1",
      enabled: true,
    });

    const model = await getGenerationModel(
      "user-1",
      "provider-1",
      "openai/gpt-4o-mini",
    );

    expect((model as { provider?: string }).provider).toBe("openrouter.chat");
  });
});
