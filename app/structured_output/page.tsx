"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { AISettingsButton } from "@/components/AISettingsButton";
import { useAISettings } from "@/contexts/AISettingsContext";

export default function StructuredOutput() {
  const { selectedProvider, selectedModel, apiKeys } = useAISettings();

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">🧱 This template showcases how to output structured responses with a LangChain.js chain and the Vercel AI SDK in a Next.js project.</li>
        <li className="text-l">☎️ The chain formats the input schema and passes it into an OpenAI Functions model, then parses the output.</li>
        <li className="text-l">💻 You can find the prompt, model, and schema logic for this use-case in <code>app/api/chat/structured_output/route.ts</code>.</li>
        <li className="text-l">📊 By default, the chain returns an object with <code>tone</code>, <code>word_count</code>, <code>entity</code>, <code>chat_response</code>, and an optional <code>final_punctuation</code>, but you can change it to whatever you'd like!</li>
        <li className="text-l">💎 It uses a lightweight, convenient, and powerful schema validation library called Zod to define schemas, but you can initialize the chain with JSON schema too.</li>
        <li className="text-l">🎨 The main frontend logic is found in <code>app/structured_output/page.tsx</code>.</li>
        <li className="text-l">👇 Try typing e.g. <code>What a beautiful day!</code> below!</li>
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
        placeholder="Type something like: What a beautiful day!"
        emoji="🤖"
        apiPath="/api/chat/structured_output"
        responseType="json"
      />
    </div>
  );
}
