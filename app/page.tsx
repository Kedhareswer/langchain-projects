"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { AISettingsButton } from "@/components/AISettingsButton";
import { useAISettings } from "@/contexts/AISettingsContext";

export default function Home() {
  const { selectedProvider, selectedModel, apiKeys } = useAISettings();

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This template showcases a multi-provider AI chat using{" "}
            <a href="https://js.langchain.com/" target="_blank">
              LangChain.js
            </a>{" "}
            and the Vercel{" "}
            <a href="https://sdk.vercel.ai/docs" target="_blank">
              AI SDK
            </a>{" "}
            in a{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{" "}
            project.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{" "}
            <code>app/api/chat/route.ts</code>.
          </span>
        </li>
        <li>
          🎛️
          <span className="ml-2">
            Use the settings panel to switch between different AI providers and models!
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in <code>app/page.tsx</code>.
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try asking e.g. <code>What is artificial intelligence?</code> below!
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <div className="relative h-full">
      <AISettingsButton />

      {/* Chat Window */}
      <ChatWindow
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        apiKeys={apiKeys}
        emptyStateComponent={InfoCard}
        placeholder="Ask me anything! I'm powered by multiple AI providers."
        emoji="🤖"
      />
    </div>
  );
}
