import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Calculator } from "@langchain/community/tools/calculator";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { ExaSearchTool, ExaSearchAndContentTool, ExaAnswerTool } from "../../../tools/exa-search";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createClient, getProvider, getModel } from "@/utils/ai-providers";
import {
  OpenMeteoWeatherTool,
  WorldTimeTool,
  ExchangeRateTool,
  CryptoPriceTool,
  ArxivSearchTool,
  HackerNewsSearchTool,
} from "@/app/tools/real-tools";

export const runtime = "edge";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

const DEFAULT_AGENT_SYSTEM_TEMPLATE = `You are a talking parrot named Polly. All final responses must be how a talking parrot would respond. Squawk often!

Tool policy to ensure a final answer:
- For factual, current, or location-based questions (e.g., weather/time), first try exa_answer with the original question.
- If exa_answer refuses, returns no value, or is uncertain, then call exa_search_with_content to fetch content and synthesize the answer. Use exa_search to collect and cross-check citations when helpful.
- After tool calls, ALWAYS provide a short, concrete answer to the user's question (not just commentary about results).`;

/**
 * This handler initializes and calls a tool calling ReAct agent.
 * See the docs for more information:
 *
 * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const returnIntermediateSteps = body.show_intermediate_steps;
    const systemPromptOverride = body.system_prompt as string | undefined;
    const threadId = body.thread_id as string | undefined;
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

    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // EXA AI for web search; allow runtime override from client body
    const exaKey = (body.exaApiKey as string | undefined) || process.env.EXA_API_KEY;
    const extraTools = [] as any[];
    // Optional: include Tavily/Serp/Wikipedia if keys are present
    if (process.env.TAVILY_API_KEY) extraTools.push(new TavilySearchResults({ maxResults: 3 }));
    if (process.env.SERPAPI_API_KEY) extraTools.push(new SerpAPI(process.env.SERPAPI_API_KEY));
    extraTools.push(new WikipediaQueryRun());
    // Optionally include additional lightweight search tools here if needed

    const tools = [
      new Calculator(),
      new ExaSearchTool(exaKey),
      new ExaSearchAndContentTool(exaKey),
      new ExaAnswerTool(exaKey),
      ...extraTools,
      // Real public tools
      new OpenMeteoWeatherTool(),
      new WorldTimeTool(),
      new ExchangeRateTool(),
      new CryptoPriceTool(process.env.COINGECKO_DEMO_API_KEY),
      new ArxivSearchTool(),
      new HackerNewsSearchTool(),
    ];
    const chat = createClient(provider, model, apiKey);

    /**
     * Use a prebuilt LangGraph agent.
     */
    const agent = createReactAgent({
      llm: chat,
      tools,
      /**
       * Modify the stock prompt in the prebuilt agent. See docs
       * for how to customize your agent:
       *
       * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
       */
      messageModifier: new SystemMessage(systemPromptOverride || DEFAULT_AGENT_SYSTEM_TEMPLATE),
    });

    if (!returnIntermediateSteps) {
      /**
       * Stream back all generated tokens and steps from their runs.
       *
       * We do some filtering of the generated events and only stream back
       * the final response as a string.
       *
       * For tool calling ReAct agents, we can tell when the agent is ready to stream back
       * final output when it no longer calls a tool and instead streams back content.
       * This works with all supported AI providers (OpenAI, Anthropic, Google, Groq, etc.).
       *
       * See: https://langchain-ai.github.io/langgraphjs/how-tos/stream-tokens/
       */
      const eventStream = await agent.streamEvents(
        { messages },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              // Intermediate chat model generations will contain tool calls and no content
              if (!!data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream);
    } else {
      /**
       * We could also pick intermediate steps out from `streamEvents` chunks, but
       * they are generated as JSON objects, so streaming and displaying them with
       * the AI SDK is more complicated.
       */
      const result = await agent.invoke({ messages });

      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
