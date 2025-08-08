"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { AISettingsButton } from "@/components/AISettingsButton";
import { useAISettings } from "@/contexts/AISettingsContext";

export default function Agents() {
  const { selectedProvider, selectedModel, apiKeys, exaApiKey } = useAISettings();

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">🤝 This template showcases a LangChain.js agent and the Vercel AI SDK in a Next.js project.</li>
        <li className="text-l">🛠️ The agent has memory and access to a search engine and a calculator.</li>
        <li className="text-l">💻 You can find the prompt and model logic for this use-case in <code>app/api/chat/agents/route.ts</code>.</li>
        <li className="text-l">🦜 By default, the agent is pretending to be a talking parrot, but you can change the prompt to whatever you want!</li>
        <li className="text-l">🎨 The main frontend logic is found in <code>app/agents/page.tsx</code>.</li>
        <li className="text-l">👇 Try asking e.g. <code>What is the weather in Honolulu?</code> below!</li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <div className="relative h-full">
      <AISettingsButton />
      <ChatWindow
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        apiKeys={apiKeys}
        emptyStateComponent={InfoCard}
        placeholder="Ask an agent with tools..."
        emoji="🦜"
        showIntermediateStepsToggle={true}
        apiPath="/api/chat/agents"
        systemPrompt={"You are a talking parrot named Polly. All final responses must be how a talking parrot would respond. Squawk often!"}
        exaApiKey={exaApiKey}
      />
    </div>
  );
}
