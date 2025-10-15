import { NextRequest, NextResponse } from "next/server";
import { retrieveDocs } from "../../lib/rag";
import { getChatPrompt } from "../../lib/prompt";
import { getChatModel } from "../../lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const query = messages[messages.length - 1]?.content;

    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    //  Retrieve relevant docs from Qdrant
    const docs = await retrieveDocs(query);
    console.log("🔍 Retrieved docs:", docs?.length);

    if (!docs || docs.length === 0) {
      return NextResponse.json({ error: "No relevant context found" });
    }

    const context = docs
      .map((d, i) => {
        const meta = d.metadata || {};
        const sourceType = meta.sourceType || "unknown";
        const sourceName = meta.sourceName?.split("/").pop() || "unknown";
        const page = meta.pageNumber ? `Page ${meta.pageNumber}` : "";
        const label = `${sourceName} ${page}`.trim();
        return `Source ${i + 1} [${sourceType} - ${label}]: \n ${
          d.pageContent
        }`;
      })
      .join("\n\n");

    //  Build system prompt
    const prompt = await getChatPrompt().formatMessages({
      context,
      question: query,
    });
    console.log("Final prompt: ", prompt);

    const model = getChatModel();

    //streams
    const stream = await model.stream(prompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content =
              typeof chunk?.content === "string" ? chunk.content : "";

            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          //send source once stream ends
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                sources: docs.map((d) => ({
                  sourceType: d.metadata.sourceType,
                  sourceName: d.metadata.sourceName,
                  pageNumber: d.metadata.pageNumber,
                })),
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Streaming error: ", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
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
