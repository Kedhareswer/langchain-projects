"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { Settings, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AI_PROVIDERS, getProvider, getModel, validateApiKey } from "@/utils/ai-providers";
import { toast } from "sonner";

interface SidebarProps {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (provider: string, key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  selectedProvider,
  selectedModel,
  apiKeys,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [testResults, setTestResults] = useState<Record<string, boolean | "testing">>({});

  const currentProvider = getProvider(selectedProvider);
  const currentModel = getModel(selectedProvider, selectedModel);

  const handleProviderChange = (providerId: string) => {
    onProviderChange(providerId);
    const provider = getProvider(providerId);
    if (provider && provider.models.length > 0) {
      onModelChange(provider.models[0].id);
    }
  };

  const handleModelChange = (modelId: string) => {
    onModelChange(modelId);
  };

  const handleApiKeyChange = (providerId: string, key: string) => {
    onApiKeyChange(providerId, key);
    // Clear test result when key changes
    setTestResults(prev => ({ ...prev, [providerId]: false }));
  };

  const testApiKey = async (providerId: string) => {
    const apiKey = apiKeys[providerId];
    if (!apiKey) {
      toast.error("Please enter an API key first");
      return;
    }

    setTestResults(prev => ({ ...prev, [providerId]: "testing" }));

    try {
      const response = await fetch("/api/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId, apiKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResults(prev => ({ ...prev, [providerId]: true }));
        toast.success(`✅ ${getProvider(providerId)?.name} API key is valid!`);
      } else {
        setTestResults(prev => ({ ...prev, [providerId]: false }));
        toast.error(`❌ ${data.error || "API key test failed"}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [providerId]: false }));
      toast.error(`❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getApiKeyStatus = (providerId: string) => {
    const apiKey = apiKeys[providerId];
    if (!apiKey) return "missing";
    if (!validateApiKey(providerId, apiKey)) return "invalid";
    if (testResults[providerId] === true) return "valid";
    if (testResults[providerId] === false) return "failed";
    return "untested";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "testing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-background border-l border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">AI Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* API Key Section - Only show for selected provider */}
          {currentProvider && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">API Key</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`api-key-${currentProvider.id}`} className="text-sm">
                    {currentProvider.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(getApiKeyStatus(currentProvider.id))}
                    {testResults[currentProvider.id] === "testing" && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    id={`api-key-${currentProvider.id}`}
                    type="password"
                    placeholder={`Enter ${currentProvider.name} API key`}
                    value={apiKeys[currentProvider.id] || ""}
                    onChange={(e) => handleApiKeyChange(currentProvider.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testApiKey(currentProvider.id)}
                    disabled={testResults[currentProvider.id] === "testing" || !apiKeys[currentProvider.id]}
                  >
                    {testResults[currentProvider.id] === "testing" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : testResults[currentProvider.id] === true ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : testResults[currentProvider.id] === false ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Environment Variables Help */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Environment Variables</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Add these to your <code className="bg-muted px-1 rounded">.env.local</code> file:</p>
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="font-mono text-xs">
                  {provider.apiKeyEnv}=your_{provider.id}_api_key
                </div>
              ))}
            </div>
          </div>

          {/* Current Selection Info */}
          {currentProvider && currentModel && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Selection</h3>
              <div className="text-xs space-y-1">
                <div><strong>Provider:</strong> {currentProvider.name}</div>
                <div><strong>Model:</strong> {currentModel.name}</div>
                {currentModel.maxTokens && (
                  <div><strong>Max Tokens:</strong> {currentModel.maxTokens.toLocaleString()}</div>
                )}
                {currentModel.contextWindow && (
                  <div><strong>Context Window:</strong> {currentModel.contextWindow.toLocaleString()}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
