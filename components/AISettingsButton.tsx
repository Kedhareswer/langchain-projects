"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { useAISettings } from "@/contexts/AISettingsContext";

export function AISettingsButton() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    selectedProvider,
    selectedModel,
    apiKeys,
    handleProviderChange,
    handleModelChange,
    handleApiKeyChange,
  } = useAISettings();

  return (
    <>
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
    </>
  );
}
