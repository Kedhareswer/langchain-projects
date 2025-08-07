import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { createAIClient, createCustomAIClient, validateProviderAndModel } from "@/utils/ai-providers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful AI assistant. Provide clear, accurate, and helpful responses.

Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const provider = body.provider || 'openai';
    const model = body.model || 'gpt-4o-mini';
    const apiKey = body.apiKey;
    
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    // Validate provider and model
    if (!validateProviderAndModel(provider, model)) {
      return NextResponse.json(
        { error: `Invalid provider or model: ${provider}/${model}` },
        { status: 400 }
      );
    }

    // Check if API key is provided
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key is required for provider: ${provider}` },
        { status: 400 }
      );
    }

    let modelInstance;
    
    // Try to create a LangChain client first
    try {
      modelInstance = createAIClient(provider, model, apiKey);
    } catch (error) {
      // Fall back to custom client for unsupported providers
      try {
        modelInstance = await createCustomAIClient(provider, model, apiKey);
      } catch (customError) {
        return NextResponse.json(
          { error: `Failed to create AI client: ${customError}` },
          { status: 500 }
        );
      }
    }

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(modelInstance).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
