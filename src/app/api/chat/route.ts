import { NextRequest, NextResponse } from "next/server";
import { retrieveDocs } from "../../lib/rag";
import { getChatPrompt } from "../../lib/prompt";
import { getChatModel } from "../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const query = messages[messages.length - 1]?.content;

    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    //  Retrieve relevant docs from Qdrant
    const docs = await retrieveDocs(query);
    const context = docs.map((d) => d.pageContent).join("\n\n");

    //  Build system prompt
    const prompt = await getChatPrompt().format({
      context,
      question: query,
    });

    const model = getChatModel(apiKey);

    //streams
    const stream = await model.stream(prompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content =
            typeof chunk?.content === "string" ? chunk.content : "";

          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("❌ Chat error:", err);
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
