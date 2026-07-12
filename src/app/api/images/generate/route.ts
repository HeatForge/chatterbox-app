import { NextResponse } from "next/server";
import { z } from "zod";

import { IMAGE_GENERATION_MODEL_IDS } from "@/lib/image-generation-models";
import { generateImage } from "@/lib/services/image-generation";

const generateImageSchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  modelId: z.enum(IMAGE_GENERATION_MODEL_IDS),
});

export async function POST(request: Request) {
  try {
    const body = generateImageSchema.parse(await request.json());
    const result = await generateImage(body);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (
      error instanceof Error &&
      error.message === "FAL_KEY is required to generate images."
    ) {
      return NextResponse.json(
        { error: "Image generation is not configured." },
        { status: 503 },
      );
    }

    console.error("image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
