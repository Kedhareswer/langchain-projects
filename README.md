# Multi-Provider AI Chat Application

A Next.js application that allows you to chat with multiple AI providers including OpenAI, Anthropic, Groq, Google Gemini, DeepSeek, and Fireworks AI.

## Features

- **Multi-Provider Support**: Switch between different AI providers seamlessly
- **Model Selection**: Choose from various models for each provider
- **API Key Management**: Securely store and test API keys for each provider
- **Real-time Chat**: Stream responses from your chosen AI provider
- **Modern UI**: Clean, responsive interface with dark/light mode support

## Supported Providers

- **OpenAI**: GPT-4, GPT-4o, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **Groq**: Llama 3, Mixtral, Gemma models
- **Google Gemini**: Gemini 2.0 Flash, Gemini 1.5 Flash, Gemini 1.5 Pro
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder, DeepSeek Reasoner
- **Fireworks AI**: Llama v2 models and fine-tuned variants

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd langchain-projects
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env.local` file with your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
FIREWORKS_API_KEY=your_fireworks_api_key
```

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configure API Keys**: Click the "Settings" button in the top-right corner to open the settings panel.

2. **Add API Keys**: Enter your API keys for the providers you want to use. You can test each API key using the test button.

3. **Select Provider and Model**: Choose your preferred AI provider and model from the dropdown menus.

4. **Start Chatting**: Begin a conversation with your selected AI provider!

## API Key Setup

### OpenAI
- Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### Anthropic
- Get your API key from [Anthropic Console](https://console.anthropic.com/)
- Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

### Groq
- Get your API key from [Groq Console](https://console.groq.com/)
- Add to `.env.local`: `GROQ_API_KEY=gsk_...`

### Google Gemini
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `.env.local`: `GOOGLE_API_KEY=...`

### DeepSeek
- Get your API key from [DeepSeek Platform](https://platform.deepseek.com/)
- Add to `.env.local`: `DEEPSEEK_API_KEY=sk-...`

### Fireworks AI
- Get your API key from [Fireworks AI Console](https://console.fireworks.ai/)
- Add to `.env.local`: `FIREWORKS_API_KEY=...`

## Project Structure

```
app/
├── api/
│   ├── chat/route.ts          # Main chat API endpoint
│   └── test-provider/route.ts # API key testing endpoint
├── page.tsx                   # Main application page
components/
├── ChatWindow.tsx             # Chat interface component
├── ui/sidebar.tsx            # Settings sidebar component
└── ...
utils/
└── ai-providers.ts           # AI provider configurations
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **LangChain**: AI/LLM framework for model integration
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible UI components
- **Vercel AI SDK**: Streaming chat functionality
- **TypeScript**: Type-safe JavaScript

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
