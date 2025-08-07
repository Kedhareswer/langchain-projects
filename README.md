# Multi-Provider AI Chat Application

A Next.js application that allows you to chat with multiple AI providers including OpenAI, Anthropic, Groq, Google Gemini, DeepSeek, and Fireworks AI.

## ✨ Features

- **Multi-Provider Support**: Switch between different AI providers seamlessly
- **Dynamic Model Selection**: Each provider has multiple model options
- **Real-time Chat**: Streaming responses from any provider
- **API Key Management**: Secure storage and validation with testing
- **Modern UI**: Clean, responsive interface with settings panel
- **Persistent Settings**: Your selections are saved in localStorage

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd langchain-projects
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Groq
   GROQ_API_KEY=your_groq_api_key
   
   # Google Gemini
   GOOGLE_API_KEY=your_google_api_key
   
   # DeepSeek
   DEEPSEEK_API_KEY=your_deepseek_api_key
   
   # Fireworks AI
   FIREWORKS_API_KEY=your_fireworks_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎛️ How to Use

### 1. **Configure API Keys**
1. Click the **"Settings"** button in the top-right corner
2. Add your API keys for desired providers
3. Test each key using the test button
4. Keys are automatically saved to localStorage

### 2. **Select Provider & Model**
1. Choose your preferred AI provider from the dropdown
2. Select a model for that provider
3. The chat interface will automatically adapt

### 3. **Start Chatting**
- Type your message and press Enter
- Responses will stream in real-time
- Switch providers anytime without losing conversation context

## 📋 Supported Providers & Models

| Provider | Models | API Format | Status |
|----------|--------|------------|--------|
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-3.5-turbo | OpenAI Compatible | ✅ Working |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus | Anthropic API | ✅ Working |
| **Groq** | Llama 3, Mixtral, Gemma | OpenAI Compatible | ✅ Working |
| **Google Gemini** | Gemini 2.0 Flash, Gemini 1.5 Flash, Gemini 1.5 Pro | Google API | ✅ Working |
| **DeepSeek** | DeepSeek Chat, DeepSeek Coder, DeepSeek Reasoner | OpenAI Compatible | ✅ Working |
| **Fireworks AI** | Llama v2 models | OpenAI Compatible | ✅ Working |

## 🔑 API Key Setup

### Where to Get API Keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Groq**: https://console.groq.com/
- **Google**: https://makersuite.google.com/app/apikey
- **DeepSeek**: https://platform.deepseek.com/
- **Fireworks**: https://console.fireworks.ai/

### API Key Formats
- **OpenAI**: `sk-...`
- **Anthropic**: `sk-ant-...`
- **Groq**: `gsk_...`
- **Google**: No specific prefix
- **DeepSeek**: `sk-...`
- **Fireworks**: No specific prefix

## 🏗️ Project Structure

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

## 🔧 Key Components

### 1. **Main Page** (`app/page.tsx`)
- Manages provider/model selection state
- Handles API key storage
- Provides empty state component

### 2. **ChatWindow** (`components/ChatWindow.tsx`)
- Dynamic endpoint generation based on selected provider
- Real-time streaming chat interface
- Error handling and user feedback

### 3. **Settings Sidebar** (`components/ui/sidebar.tsx`)
- Provider and model selection
- API key management with testing
- Environment variable guidance

### 4. **AI Providers** (`utils/ai-providers.ts`)
- Provider configurations and models
- LangChain client creation
- Custom client fallback for unsupported providers

### 5. **Chat API** (`app/api/chat/route.ts`)
- Handles multiple provider formats
- Streaming responses
- Error handling and validation

## 🎯 Advanced Features

### **Custom Client Support**
- Providers without LangChain clients use custom implementations
- Supports different API formats (OpenAI, Anthropic, Google)
- Automatic fallback system

### **Error Handling**
- Comprehensive error messages
- API key validation
- Network error recovery

### **State Management**
- React state for provider/model selection
- localStorage for API key persistence
- Real-time UI updates

## 🧪 Testing

The application includes built-in API key testing functionality:
1. Enter your API key in the settings panel
2. Click the test button next to each provider
3. The system will validate the key format and test the connection

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- Add environment variables for your chosen platform
- Ensure Node.js 18+ support
- Configure API routes properly

## 🔍 Troubleshooting

### Common Issues
1. **API Key Errors**: Check key format and permissions
2. **Provider Not Working**: Verify API endpoint and model names
3. **Streaming Issues**: Check network connectivity
4. **UI Not Updating**: Clear browser cache and localStorage

### Debug Mode
Enable detailed logging by adding to `.env.local`:
```env
DEBUG=true
```

## 🎉 Success!

Your multi-provider AI chat application is now **fully functional** and ready for use! 

**Next Steps:**
1. Add your API keys
2. Test with different providers
3. Customize the UI as needed
4. Deploy to production

**Happy Chatting! 🚀**
