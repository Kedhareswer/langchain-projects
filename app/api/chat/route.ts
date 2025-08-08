import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { createClient, getProvider, getModel } from "@/utils/ai-providers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful pirate assistant. Speak like a friendly pirate: use words like "Arrr", "matey", and "aye" sparingly but consistently, while keeping answers clear and accurate. Keep responses concise and useful.

Current conversation:
{chat_history}

User: {input}
AI:`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const provider = body.provider || "openai";
    const model = body.model || "gpt-4o-mini";
    const apiKey = body.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Validate provider and model
    const providerConfig = getProvider(provider);
    const modelConfig = getModel(provider, model);

    if (!providerConfig) {
      return NextResponse.json(
        { error: `Provider ${provider} not found` },
        { status: 400 }
      );
    }

    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model ${model} not found for provider ${provider}` },
        { status: 400 }
      );
    }

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    // Create the AI model client
    const aiModel = createClient(provider, model, apiKey);

    // Create the output parser
    const outputParser = new HttpResponseOutputParser();

    // Create the chain
    const chain = prompt.pipe(aiModel).pipe(outputParser);

    // Stream the response
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
