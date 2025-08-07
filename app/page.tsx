"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const handleProviderChange = (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  };

  const handleApiKeyChange = (provider: string, apiKey: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: apiKey }));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Multi-Provider AI Chat
        </h2>
        <p className="text-gray-600 mb-6">
          Start a conversation with any of the supported AI providers. 
          Configure your API keys in the settings panel.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Select your preferred AI provider and model</p>
          <p>• Add your API keys in the settings</p>
          <p>• Start chatting with your chosen AI</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Multi-Provider AI Chat
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </header>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            apiKeys={apiKeys}
            emptyStateComponent={<EmptyState />}
            placeholder="Ask me anything..."
          />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onProviderChange={handleProviderChange}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
}
