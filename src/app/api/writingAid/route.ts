import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

// Accepts: { chats: [{role, content}], writingText: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Accept both 'text' and 'writingText' for compatibility, but prefer 'writingText'
    const writingText = typeof body.writingText === "string" && body.writingText.trim() !== ""
      ? body.writingText
      : (typeof body.text === "string" ? body.text : "");
    const chats = Array.isArray(body.chats) ? body.chats : [];

    if (!writingText || typeof writingText !== "string" || writingText.trim() === "") {
      return new Response("Missing or invalid writing text", { status: 400 });
    }

    // Compose the system prompt
    const systemPrompt = `
You are an expert writing assistant. The user is workshopping a piece of writing (provided below as "Writing Text"). Your job is to provide constructive, specific, and actionable feedback to help the writer improve their work. Focus on clarity, organization, grammar, style, and overall effectiveness. Suggest improvements and highlight strengths.
- Do NOT rewrite the text, only give feedback.
- If the user asks for a rewrite, politely refuse and explain you only give feedback.
- Your feedback should be concise and focused on the most impactful areas for improvement.
- You may quote or reference specific parts of the writing text to illustrate your feedback.
- Always include a way the user can improve, but do not invent issues if the writing is already strong.
- If the user asks a specific question, address it in your feedback.
- The writing text is:
"""${writingText}"""
    `.trim();

    // Build the messages array for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      // Add the chat history, but filter/clean as needed
      ...chats
        .filter(
          (msg: any) =>
            (msg.role === "user" || msg.role === "assistant") &&
            typeof msg.content === "string" &&
            msg.content.trim() !== ""
        )
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(streamResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Error in AI handler:", err);
    return new Response("Server error", { status: 500 });
  }
}
