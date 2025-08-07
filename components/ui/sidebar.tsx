"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { CheckCircle, XCircle, Loader2, Settings, Key, TestTube } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  apiKeyEnv: string;
  baseUrl?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChange: (provider: string, model: string) => void;
  onApiKeyChange: (provider: string, apiKey: string) => void;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    apiKeyEnv: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for advanced reasoning',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com'
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with open models',
    models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI models',
    models: ['gemini-2.0-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    apiKeyEnv: 'GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Advanced reasoning and coding models',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com'
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    description: 'Open source models and fine-tuned variants',
    models: ['accounts/fireworks/models/llama-v2-7b-chat', 'accounts/fireworks/models/llama-v2-13b-chat'],
    apiKeyEnv: 'FIREWORKS_API_KEY',
    baseUrl: 'https://api.fireworks.ai/inference/v1'
  }
];

export function Sidebar({ isOpen, onClose, onProviderChange, onApiKeyChange }: SidebarProps) {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error', message?: string }>>({});
  const [isTesting, setIsTesting] = useState(false);

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  useEffect(() => {
    // Load API keys from localStorage
    const savedKeys = localStorage.getItem('ai_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.models[0]);
      onProviderChange(providerId, provider.models[0]);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onProviderChange(selectedProvider, model);
  };

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    const newApiKeys = { ...apiKeys, [providerId]: apiKey };
    setApiKeys(newApiKeys);
    localStorage.setItem('ai_api_keys', JSON.stringify(newApiKeys));
    onApiKeyChange(providerId, apiKey);
  };

  const testApiKey = async (providerId: string) => {
    const apiKey = apiKeys[providerId];
    if (!apiKey) return;

    setIsTesting(true);
    setTestResults(prev => ({ ...prev, [providerId]: { status: 'testing' } }));

    try {
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey })
      });

      if (response.ok) {
        setTestResults(prev => ({ 
          ...prev, 
          [providerId]: { status: 'success', message: 'API key is valid!' }
        }));
      } else {
        const error = await response.text();
        setTestResults(prev => ({ 
          ...prev, 
          [providerId]: { status: 'error', message: error }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [providerId]: { status: 'error', message: 'Network error' }
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Provider Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Provider</CardTitle>
            <CardDescription>Select your preferred AI provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <span>{provider.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {provider.models.length} models
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {currentProvider && (
              <p className="text-sm text-gray-600 mt-2">
                {currentProvider.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Model Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Model</CardTitle>
            <CardDescription>Choose the model for your AI provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentProvider?.models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>Configure API keys for each provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {AI_PROVIDERS.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <Label htmlFor={`api-key-${provider.id}`}>
                  {provider.name} API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`api-key-${provider.id}`}
                    type="password"
                    placeholder={`Enter ${provider.name} API key`}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testApiKey(provider.id)}
                    disabled={!apiKeys[provider.id] || isTesting}
                  >
                    {getTestStatusIcon(testResults[provider.id]?.status || 'idle')}
                  </Button>
                </div>
                {testResults[provider.id]?.message && (
                  <p className={`text-xs ${
                    testResults[provider.id]?.status === 'success' 
                      ? 'text-green-600' 
                      : testResults[provider.id]?.status === 'error'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {testResults[provider.id]?.message}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environment Variables Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Add these to your .env.local file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {provider.apiKeyEnv}=your_api_key_here
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
