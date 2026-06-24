import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function isChatHistoryMessage(message: unknown): message is ChatHistoryMessage {
  if (!message || typeof message !== "object") return false;

  const maybeMessage = message as Record<string, unknown>;

  return (
    (maybeMessage.role === "user" || maybeMessage.role === "assistant") &&
    typeof maybeMessage.content === "string" &&
    maybeMessage.content.trim().length > 0
  );
}

export async function POST(req: Request) {
  try {
    const { message, history, context } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const recentHistory = Array.isArray(history)
      ? history.filter(isChatHistoryMessage).slice(-10)
      : [];
    const firstUserIndex = recentHistory.findIndex(
      (chatMessage) => chatMessage.role === "user"
    );
    const chatHistory =
      firstUserIndex === -1 ? [] : recentHistory.slice(firstUserIndex);

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction:
        `You are RecipeVerse AI, a concise and practical cooking assistant. Help with recipes, substitutions, meal planning, grocery ideas, dietary adjustments, cooking troubleshooting, and food safety basics. Keep answers clear, actionable, and friendly. When relevant, include quantities, steps, timing, and safety notes. ${context ? `The user is currently viewing this recipe: ${context}. When answering questions about this recipe, use the recipe information above as the primary source of truth.` : ''}`,
    });

    const contents = chatHistory.map((chatMessage) => ({
      role: chatMessage.role === "assistant" ? "model" : "user",
      parts: [{ text: chatMessage.content.trim() }],
    }));

    if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
      contents.push({
        role: "user",
        parts: [{ text: message.trim() }],
      });
    }

    const result = await model.generateContent({ contents });
    const reply = result.response.text();

    return Response.json({ reply });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assistant could not respond.",
      },
      { status: 500 }
    );
  }
}
