import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function openaiTextToImage(
  prompt: string,
): Promise<Buffer | null> {
  try {
    console.log("Generating image for prompt:", prompt?.slice(0, 100));

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    });

    const imageData = response?.data?.[0]?.b64_json;

    if (!imageData) {
      console.error("No image data found");
      console.log(
        "Full response:",
        JSON.stringify(response.data?.[0], null, 2),
      );
      return null;
    }

    return Buffer.from(imageData, "base64");
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:");
      console.error("  Status:", err.status);
      console.error("  Code:", err.code);
      console.error("  Message:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
    return null;
  }
}
