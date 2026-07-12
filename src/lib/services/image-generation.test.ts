import { beforeEach, describe, expect, it, vi } from "vitest";

const subscribe = vi.fn();

vi.mock("@fal-ai/client", () => ({
  createFalClient: vi.fn(() => ({ subscribe })),
}));

vi.mock("@/lib/services/ai-providers", () => ({
  getPreferredImageGenerationModel: vi.fn().mockResolvedValue({
    providerId: "provider-1",
    modelId: "fal-ai/flux-1/schnell",
    systemPrompt: "unused",
    apiKey: "fal-key",
  }),
}));

import { generateImageFromPrompt } from "@/lib/services/image-generation";

describe("generateImageFromPrompt", () => {
  beforeEach(() => {
    subscribe.mockReset();
  });

  it("calls Fal with the selected image model and returns Markdown image content", async () => {
    subscribe.mockResolvedValue({
      data: {
        images: [{ url: "https://example.com/generated.png" }],
      },
    });

    await expect(
      generateImageFromPrompt("user-1", "A tiny robot painting"),
    ).resolves.toBe(
      "![Generated image: A tiny robot painting](https://example.com/generated.png)\n\n**Prompt:** A tiny robot painting",
    );

    expect(subscribe).toHaveBeenCalledWith("fal-ai/flux-1/schnell", {
      input: { prompt: "A tiny robot painting" },
    });
  });

  it("rejects empty prompts before calling Fal", async () => {
    await expect(generateImageFromPrompt("user-1", "   ")).rejects.toThrow(
      "Prompt is required",
    );
    expect(subscribe).not.toHaveBeenCalled();
  });
});
