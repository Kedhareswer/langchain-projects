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
  // Extra integrations
  exaApiKey: string;
  setExaApiKey: (key: string) => void;
  supabaseUrl: string;
  supabaseServiceKey: string;
  setSupabaseUrl: (url: string) => void;
  setSupabaseServiceKey: (key: string) => void;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [exaApiKey, setExaApiKey] = useState<string>("");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState<string>("");

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

    const savedExa = localStorage.getItem("exa-api-key");
    if (savedExa) setExaApiKey(savedExa);

    const savedSupabaseUrl = localStorage.getItem("supabase-url");
    const savedSupabaseKey = localStorage.getItem("supabase-service-key");
    if (savedSupabaseUrl) setSupabaseUrl(savedSupabaseUrl);
    if (savedSupabaseKey) setSupabaseServiceKey(savedSupabaseKey);

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

  useEffect(() => {
    localStorage.setItem("exa-api-key", exaApiKey);
  }, [exaApiKey]);

  useEffect(() => {
    if (supabaseUrl) localStorage.setItem("supabase-url", supabaseUrl);
    if (supabaseServiceKey)
      localStorage.setItem("supabase-service-key", supabaseServiceKey);
  }, [supabaseUrl, supabaseServiceKey]);

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
    exaApiKey,
    setExaApiKey,
    supabaseUrl,
    supabaseServiceKey,
    setSupabaseUrl,
    setSupabaseServiceKey,
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
