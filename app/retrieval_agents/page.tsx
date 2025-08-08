"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { AISettingsButton } from "@/components/AISettingsButton";
import { useAISettings } from "@/contexts/AISettingsContext";

export default function RetrievalAgents() {
  const { selectedProvider, selectedModel, apiKeys } = useAISettings();

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">🤝 This template showcases a LangChain.js retrieval chain and the Vercel AI SDK in a Next.js project.</li>
        <li className="text-l">🛠️ The agent has access to a vector store retriever as a tool as well as a memory. It's particularly well suited to meta-questions about the current conversation.</li>
        <li className="text-l">💻 You can find the prompt and model logic for this use-case in <code>app/api/chat/retrieval_agents/route.ts</code>.</li>
        <li className="text-l">🤖 By default, the agent is pretending to be a robot, but you can change the prompt to whatever you want!</li>
        <li className="text-l">🎨 The main frontend logic is found in <code>app/retrieval_agents/page.tsx</code>.</li>
        <li className="text-l">🔱 Before running this example, you'll first need to set up a Supabase (or other) vector store. See the README for more details.</li>
        <li className="text-l">👇 Upload some text, then try asking e.g. <code>What are some ways of doing retrieval in LangChain?</code> below!</li>
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
        showIngestForm={true}
        showIntermediateStepsToggle={true}
        placeholder="Upload a doc, then ask the robot agent..."
        emoji="🤖"
        apiPath="/api/chat/retrieval_agents"
      />
    </div>
  );
}
