import { openaiTextToImage } from "@/lib/openai-image-generate";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { prompt } = body;

    // Prompt validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const buffer = await openaiTextToImage(prompt);

    if (!buffer) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    const base64Image = buffer.toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64Image}`,
    });
  } catch (err) {
    console.error("Image generation route error:", err);

    const message = err instanceof Error ? err.message : "Something went wrong";

    return NextResponse.json({ error: message }, { status: 500 });
  }
};
