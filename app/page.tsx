"use client";

import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { AI_PROVIDERS } from "@/utils/ai-providers";

export default function Home() {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem("ai-api-keys");
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (error) {
        console.error("Failed to parse saved API keys:", error);
      }
    }

    // Load selected provider and model
    const savedProvider = localStorage.getItem("selected-provider");
    const savedModel = localStorage.getItem("selected-model");
    
    if (savedProvider) {
      setSelectedProvider(savedProvider);
    }
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save API keys to localStorage when they change
  useEffect(() => {
    localStorage.setItem("ai-api-keys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Save selected provider and model to localStorage
  useEffect(() => {
    localStorage.setItem("selected-provider", selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    localStorage.setItem("selected-model", selectedModel);
  }, [selectedModel]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    // Set the first model of the new provider
    const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
    if (providerConfig && providerConfig.models.length > 0) {
      setSelectedModel(providerConfig.models[0].id);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleApiKeyChange = (provider: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

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
      {/* Settings Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Chat Window */}
      <ChatWindow
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        apiKeys={apiKeys}
        emptyStateComponent={InfoCard}
        placeholder="Ask me anything! I'm powered by multiple AI providers."
        emoji="🤖"
      />

      {/* Sidebar */}
      <Sidebar
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        apiKeys={apiKeys}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        onApiKeyChange={handleApiKeyChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
