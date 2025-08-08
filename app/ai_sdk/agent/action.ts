"use server";

import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "@/utils/ai-providers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { createStreamableValue } from "ai/rsc";

export async function runAgent(input: string) {
  "use server";

  const stream = createStreamableValue();
  (async () => {
    const tools = [new TavilySearchResults({ maxResults: 1 })];
    const prompt = await pull<ChatPromptTemplate>(
      "hwchase17/openai-tools-agent",
    );

    const provider = process.env.DEFAULT_PROVIDER || "openai";
    const model = process.env.DEFAULT_MODEL || "gpt-4o-mini";
    const apiKey = process.env.OPENAI_API_KEY || "";
    const llm = createClient(provider, model, apiKey);

    const agent = createToolCallingAgent({
      llm,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({ agent, tools });

    const streamingEvents = agentExecutor.streamEvents(
      { input },
      { version: "v2" },
    );

    for await (const item of streamingEvents) {
      stream.update(JSON.parse(JSON.stringify(item, null, 2)));
    }

    stream.done();
  })();

  return { streamData: stream.value };
}
