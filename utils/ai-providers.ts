import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export interface AIProviderConfig {
  id: string;
  name: string;
  description: string;
  models: string[];
  apiKeyEnv: string;
  baseUrl?: string;
  clientClass: any;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    apiKeyEnv: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    clientClass: ChatOpenAI
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for advanced reasoning',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
    clientClass: ChatAnthropic
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with open models',
    models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1',
    clientClass: ChatGroq
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI models',
    models: ['gemini-2.0-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    apiKeyEnv: 'GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com',
    clientClass: ChatGoogleGenerativeAI
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Advanced reasoning and coding models',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com',
    clientClass: null // Will use custom client
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    description: 'Open source models and fine-tuned variants',
    models: ['accounts/fireworks/models/llama-v2-7b-chat', 'accounts/fireworks/models/llama-v2-13b-chat'],
    apiKeyEnv: 'FIREWORKS_API_KEY',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    clientClass: null // Will use custom client
  }
];

export function getProviderConfig(providerId: string): AIProviderConfig | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

export function createAIClient(providerId: string, model: string, apiKey?: string) {
  const provider = getProviderConfig(providerId);
  if (!provider) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  // Use provided API key or fall back to environment variable
  const key = apiKey || process.env[provider.apiKeyEnv];
  if (!key) {
    throw new Error(`API key not found for provider: ${providerId}`);
  }

  // If no LangChain client is available, throw error to trigger custom client fallback
  if (!provider.clientClass) {
    throw new Error(`No LangChain client available for provider: ${providerId}`);
  }

  const ClientClass = provider.clientClass;
  
  return new ClientClass({
    model,
    apiKey: key,
    temperature: 0.7,
    ...(provider.baseUrl && { baseURL: provider.baseUrl })
  });
}

export function validateProviderAndModel(providerId: string, model: string): boolean {
  const provider = getProviderConfig(providerId);
  if (!provider) {
    return false;
  }
  return provider.models.includes(model);
}

// Helper function to create a client for unsupported providers
export async function createCustomAIClient(providerId: string, model: string, apiKey: string) {
  const config = {
    openai: { 
      baseURL: 'https://api.openai.com/v1',
      endpoint: '/chat/completions',
      format: 'openai'
    },
    anthropic: { 
      baseURL: 'https://api.anthropic.com',
      endpoint: '/v1/messages',
      format: 'anthropic'
    },
    groq: { 
      baseURL: 'https://api.groq.com/openai/v1',
      endpoint: '/chat/completions',
      format: 'openai'
    },
    google: { 
      baseURL: 'https://generativelanguage.googleapis.com',
      endpoint: '/v1beta/models/gemini-1.5-flash:generateContent',
      format: 'google'
    },
    deepseek: { 
      baseURL: 'https://api.deepseek.com',
      endpoint: '/v1/chat/completions',
      format: 'openai'
    },
    fireworks: { 
      baseURL: 'https://api.fireworks.ai/inference/v1',
      endpoint: '/chat/completions',
      format: 'openai'
    }
  };

  const providerConfig = config[providerId as keyof typeof config];
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  return {
    async call(messages: any[]) {
      let requestBody;
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (providerConfig.format === 'anthropic') {
        // Anthropic uses a different API format
        headers['anthropic-version'] = '2023-06-01';
        headers['Authorization'] = `Bearer ${apiKey}`;
        
        requestBody = {
          model,
          max_tokens: 1000,
          messages: messages.map(msg => ({
            role: msg._getType() === "human" ? "user" : "assistant",
            content: msg.content,
          })),
        };
      } else if (providerConfig.format === 'google') {
        // Google Gemini uses a different API format
        headers['x-goog-api-key'] = apiKey;
        
        requestBody = {
          contents: [{
            parts: [{
              text: messages[messages.length - 1].content
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        };
      } else {
        // OpenAI-compatible format
        headers['Authorization'] = `Bearer ${apiKey}`;
        
        requestBody = {
          model,
          messages: messages.map(msg => ({
            role: msg._getType() === "human" ? "user" : "assistant",
            content: msg.content,
          })),
          max_tokens: 1000,
          temperature: 0.7,
        };
      }

      const response = await fetch(`${providerConfig.baseURL}${providerConfig.endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${providerId} API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (providerConfig.format === 'anthropic') {
        return { content: data.content[0].text };
      } else if (providerConfig.format === 'google') {
        return { content: data.candidates[0].content.parts[0].text };
      } else {
        return { content: data.choices[0].message.content };
      }
    }
  };
}
