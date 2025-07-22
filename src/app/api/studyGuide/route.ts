import OpenAI from "openai";
import * as Types from "@/lib/types/types_new"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

// Accepts: { questions: QuizQuestionResponse[], title: string }
export async function POST(req: Request) {
  try {
    console.log("[Server] 'received study guide request'");
    const body = await req.json();
    const { questions, title } = body;
    
    const jsonifiedQuestions = JSON.parse(questions) as Types.QuestionContentItem[];

    // Build a readable summary of the questions for the prompt
    const stringifiedQuestions = jsonifiedQuestions.map((questionItem, index) => {
      return `Q${index + 1}: ${questionItem.items.question}\nOptions: ${questionItem.items.answers ? questionItem.items.answers.join(", ") : "None"}\nAnswer: ${questionItem.items.correctAnswer || "None"}\n`;
    }).join("\n");

    // const questionsText = questions
    //   .map((q: any, idx: number) => {
    //     let opts = "";
    //     if (q.options && Array.isArray(q.options)) {
    //       opts = q.options
    //         .map((opt: string, i: number) => `    - ${opt}`)
    //         .join("\n");
    //     }
    //     return `Q${idx + 1}: ${q.question}\nOptions:\n${opts}\nAnswer: ${
    //       q.answer
    //     }\n`;
    //   })
    //   .join("\n");

    const prompt = `
        You are an expert educator. Create a clear, concise, and accurate study guide for the following collection titled "${
      title || "Untitled"
    }". 
        -Summarize the key concepts, definitions, and facts that a student should know to master this material. Give detailed explanations and background information to help the user understand the material.
        -Avoid one sentence explanations and overly simplistic summaries.
        -Expand on the topic, if there are related concepts or additional information that would enhance understanding.
        -Include additional definitions, examples, or explanations as needed to clarify complex concepts.
        -Format the study guide in easy-to-read Markdown. Do not include the original questions or answers verbatim, but synthesize the information into a helpful guide.

        Here is the collection:
        ${stringifiedQuestions}
`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
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
