"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AI_PROVIDERS } from "@/utils/ai-providers";

interface AISettingsContextType {
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  setApiKeys: (keys: Record<string, string>) => void;
  handleProviderChange: (provider: string) => void;
  handleModelChange: (model: string) => void;
  handleApiKeyChange: (provider: string, key: string) => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

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

  const value = {
    selectedProvider,
    selectedModel,
    apiKeys,
    setSelectedProvider,
    setSelectedModel,
    setApiKeys,
    handleProviderChange,
    handleModelChange,
    handleApiKeyChange,
  };

  return (
    <AISettingsContext.Provider value={value}>
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error("useAISettings must be used within an AISettingsProvider");
  }
  return context;
}
