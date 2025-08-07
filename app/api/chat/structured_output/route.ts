import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { PromptTemplate } from "@langchain/core/prompts";
import { createClient, getProvider, getModel } from "@/utils/ai-providers";

export const runtime = "edge";

const TEMPLATE = `Extract the requested fields from the input.

The field "entity" refers to the first mentioned entity in the input.

Input:

{input}`;

/**
 * This handler initializes and calls an OpenAI Functions powered
 * structured output chain. See the docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/structured_output
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const currentMessageContent = messages[messages.length - 1].content;
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

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    /**
     * Function calling is now supported across all major AI providers:
     * - OpenAI (GPT-4, GPT-3.5)
     * - Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku)
     * - Google Gemini (Gemini 1.5 Pro, Gemini 2.0 Flash)
     * - Groq (Llama 3, Mixtral)
     * - DeepSeek (DeepSeek Chat, Coder, Reasoner)
     * - Fireworks (Llama v2 models)
     */
    const aiModel = createClient(provider, model, apiKey);

    /**
     * We use Zod (https://zod.dev) to define our schema for convenience,
     * but you can pass JSON schema if desired.
     * 
     * Zod provides:
     * - Type safety and validation
     * - Automatic documentation via .describe()
     * - Optional fields with z.optional()
     * - Enum constraints with z.enum()
     * - Schema composition with z.object()
     */
    const schema = z
      .object({
        tone: z
          .enum(["positive", "negative", "neutral"])
          .describe("The overall tone of the input"),
        entity: z.string().describe("The entity mentioned in the input"),
        word_count: z.number().describe("The number of words in the input"),
        chat_response: z.string().describe("A response to the human's input"),
        final_punctuation: z
          .optional(z.string())
          .describe("The final punctuation mark in the input, if any."),
      })
      .describe("Should always be used to properly format output");

    /**
     * Bind schema to the AI model.
     * Future invocations of the returned model will always match the schema.
     *
     * This works with all supported AI providers and automatically
     * uses the appropriate function calling method for each provider.
     */
    const functionCallingModel = aiModel.withStructuredOutput(schema, {
      name: "output_formatter",
    });

    /**
     * Returns a chain with the function calling model.
     */
    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      input: currentMessageContent,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
