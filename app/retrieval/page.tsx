"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { AISettingsButton } from "@/components/AISettingsButton";
import { useAISettings } from "@/contexts/AISettingsContext";

export default function Retrieval() {
  const { selectedProvider, selectedModel, apiKeys } = useAISettings();

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">🔗 This template showcases how to perform retrieval with a LangChain.js chain and the Vercel AI SDK in a Next.js project.</li>
        <li className="text-l">🪜 The chain works in two steps:</li>
        <li className="text-l">1️⃣ First, it rephrases the input question into a &quot;standalone&quot; question, dereferencing pronouns based on the chat history.</li>
        <li className="text-l">2️⃣ Then, it queries the retriever for documents similar to the dereferenced question and composes an answer.</li>
        <li className="text-l">💻 You can find the prompt and model logic for this use-case in <code>app/api/chat/retrieval/route.ts</code>.</li>
        <li className="text-l">🐶 By default, the agent is pretending to be a talking puppy, but you can change the prompt to whatever you want!</li>
        <li className="text-l">🎨 The main frontend logic is found in <code>app/retrieval/page.tsx</code>.</li>
        <li className="text-l">🔱 Before running this example on your own, you&apos;ll first need to set up a Supabase vector store. See the README for more details.</li>
        <li className="text-l">👇 Upload some text, then try asking e.g. <code>What is a document loader?</code> below!</li>
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
        placeholder="Upload a doc, then ask a question..."
        emoji="🤖"
        apiPath="/api/chat/retrieval"
      />
    </div>
  );
}
