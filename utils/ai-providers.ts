import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyEnv: string;
  baseUrl?: string;
  client: (apiKey: string, model: string) => any;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens?: number;
  contextWindow?: number;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiKeyEnv: "OPENAI_API_KEY",
    models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "openai", maxTokens: 128000, contextWindow: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", maxTokens: 16384, contextWindow: 16384 },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", maxTokens: 4096, contextWindow: 4096 },
    ],
    client: (apiKey: string, model: string) => new ChatOpenAI({
      apiKey,
      model,
      temperature: 0.7,
    }),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", maxTokens: 4096, contextWindow: 200000 },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic", maxTokens: 4096, contextWindow: 200000 },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic", maxTokens: 4096, contextWindow: 200000 },
    ],
    client: (apiKey: string, model: string) => new ChatAnthropic({
      apiKey,
      model,
      temperature: 0.7,
    }),
  },
  {
    id: "groq",
    name: "Groq",
    apiKeyEnv: "GROQ_API_KEY",
    models: [
      { id: "llama3-70b-8192", name: "Llama 3 70B", provider: "groq", maxTokens: 8192, contextWindow: 8192 },
      { id: "llama3-8b-8192", name: "Llama 3 8B", provider: "groq", maxTokens: 8192, contextWindow: 8192 },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq", maxTokens: 32768, contextWindow: 32768 },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", provider: "groq", maxTokens: 8192, contextWindow: 8192 },
    ],
    client: (apiKey: string, model: string) => new ChatGroq({
      apiKey,
      model,
      temperature: 0.7,
    }),
  },
  {
    id: "google",
    name: "Google Gemini",
    apiKeyEnv: "GOOGLE_API_KEY",
    models: [
      { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "google", maxTokens: 1048576, contextWindow: 1048576 },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", maxTokens: 1048576, contextWindow: 1048576 },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google", maxTokens: 1048576, contextWindow: 1048576 },
    ],
    client: (apiKey: string, model: string) => new ChatGoogleGenerativeAI({
      apiKey,
      model,
      temperature: 0.7,
    }),
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    baseUrl: "https://api.deepseek.com/v1",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", provider: "deepseek", maxTokens: 32768, contextWindow: 32768 },
      { id: "deepseek-coder", name: "DeepSeek Coder", provider: "deepseek", maxTokens: 32768, contextWindow: 32768 },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner", provider: "deepseek", maxTokens: 32768, contextWindow: 32768 },
    ],
    client: (apiKey: string, model: string) => new ChatOpenAI({
      apiKey,
      model,
      temperature: 0.7,
      baseURL: "https://api.deepseek.com/v1",
    } as any),
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    apiKeyEnv: "FIREWORKS_API_KEY",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    models: [
      { id: "llama-v2-7b-chat", name: "Llama v2 7B Chat", provider: "fireworks", maxTokens: 4096, contextWindow: 4096 },
      { id: "llama-v2-13b-chat", name: "Llama v2 13B Chat", provider: "fireworks", maxTokens: 4096, contextWindow: 4096 },
      { id: "llama-v2-70b-chat", name: "Llama v2 70B Chat", provider: "fireworks", maxTokens: 4096, contextWindow: 4096 },
    ],
    client: (apiKey: string, model: string) => new ChatOpenAI({
      apiKey,
      model,
      temperature: 0.7,
      baseURL: "https://api.fireworks.ai/inference/v1",
    } as any),
  },
];

export function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

export function getModel(providerId: string, modelId: string): AIModel | undefined {
  const provider = getProvider(providerId);
  return provider?.models.find(m => m.id === modelId);
}

export function createClient(providerId: string, modelId: string, apiKey: string) {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Provider ${providerId} not found`);
  }
  
  return provider.client(apiKey, modelId);
}

export function validateApiKey(providerId: string, apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === "") {
    return false;
  }
  
  const provider = getProvider(providerId);
  if (!provider) {
    return false;
  }
  
  // Basic validation based on provider
  switch (providerId) {
    case "openai":
      return apiKey.startsWith("sk-");
    case "anthropic":
      return apiKey.startsWith("sk-ant-");
    case "groq":
      return apiKey.startsWith("gsk_");
    case "google":
      return apiKey.length > 0; // Google API keys don't have a specific prefix
    case "deepseek":
      return apiKey.startsWith("sk-");
    case "fireworks":
      return apiKey.length > 0; // Fireworks API keys don't have a specific prefix
    default:
      return false;
  }
}
