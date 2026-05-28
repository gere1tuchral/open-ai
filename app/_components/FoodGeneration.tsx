"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export const FoodGeneration = () => {
  const [prompt, setPrompt] = useState<string>(
    "I just made a delicious plate of Spaghetti Carbonara using spaghetti, eggs, Parmesan cheese, pancetta, black pepper, garlic, and a pinch of salt.",
  );
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateImageAndExtract = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first");
      return;
    }

    setError(null);
    setResultImage(null);
    setExtractedInfo([]);
    setIsLoading(true);

    try {
      // 1. Зураг үүсгэх
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!imageRes.ok) {
        const errData = await imageRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate image");
      }

      const imageData = await imageRes.json();
      setResultImage(imageData.image);

      // 2. Мэдээлэл задлах
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!extractRes.ok) {
        const errData = await extractRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to extract info");
      }

      const extractData = await extractRes.json();

      console.log("Extract response:", extractData); // ← ЭНЭ юу хэвлэх вэ?
      // result string-ийг массив болгох
      const infoArray = extractData.result
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      setExtractedInfo(infoArray);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container max-w-3xl p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">AI Food Creator</h1>

      <div className="space-y-4">
        <Textarea
          placeholder="Enter a food description (e.g., 'Try our new spicy chicken ramen...')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-30"
        />

        <Button
          onClick={generateImageAndExtract}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
          variant={isLoading ? "secondary" : "outline"}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Image & Extract Info"
          )}
        </Button>

        {error && (
          <div className="p-2 text-red-500 rounded bg-red-50">{error}</div>
        )}

        <div className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              <p className="mt-4 text-gray-500">Working on it...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {extractedInfo.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h2 className="mb-3 text-lg font-semibold">Extracted Info</h2>
                  <div className="flex flex-wrap gap-2">
                    {extractedInfo.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {resultImage && (
                <div className="mb-6 overflow-hidden border rounded-lg">
                  <img
                    src={resultImage || "/placeholder.svg"}
                    alt="Generated food"
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
