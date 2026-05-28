import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const { prompt } = await req.json();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input: `Extract the dish name and ingredients from: "${prompt}",`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("HF API error:", response.status, errorText);
    return NextResponse.json(
      { error: errorText },
      {
        status: response.status,
      },
    );
  }
  const data = await response.json();
  const text = data.output[0].content[0].text;
  const formattedText = text.replace(/\\n/g, "");

  return NextResponse.json({
    result: formattedText,
  });
};
