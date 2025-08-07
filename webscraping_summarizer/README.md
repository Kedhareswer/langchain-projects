---
title: Web Article Summarizer
emoji: 📰
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# 📰 Web Article Summarizer

A comprehensive web application that scrapes web articles and generates AI-powered summaries using Groq's LLM models. Features include article search, robust extraction, and intelligent summarization. Available as both a Streamlit app and Gradio interface for Hugging Face Spaces.

## ✨ Features

- 🔗 **Web Scraping**: Extract articles from any URL using newspaper3k
- 🔍 **Article Search**: Search for articles using EXA Search integration (Streamlit only)
- 🤖 **AI Summarization**: Generate concise summaries using Groq's LLM models
- 📊 **Article Analysis**: Display reading time, keywords, metadata, and full text
- 🎨 **Beautiful UI**: Clean interface with responsive design
- 🛡️ **Error Handling**: Robust error handling for failed extractions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Multiple Interfaces**: Streamlit (local) and Gradio (Hugging Face Spaces)
- 🔑 **Easy API Key Configuration**: Set your own API keys through the UI

## 🚀 Quick Start

### Option 1: Local Development

#### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2. Set Up API Keys

Create a `.env` file in the project root:

```env
# Required: Get from https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Required: Get from https://exa.ai/
EXA_API_KEY=your_exa_api_key_here

# Optional: Customize AI model
GROQ_MODEL=llama3-8b-8192
```

#### 3. Run the Application

```bash
streamlit run web_scraper_summarizer.py
```

The application will open at `http://localhost:8501`

### Option 2: Hugging Face Spaces Deployment

#### 1. Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose "Gradio" as the SDK
4. Set Space name (e.g., `web-article-summarizer`)
5. Choose "Public" or "Private"

#### 2. Upload Your Code

Upload these files to your Space:
- `app.py` (Gradio interface)
- `requirements.txt`
- `README.md`

#### 3. Set Environment Variables

In your Space settings, add these secrets:
- `GROQ_API_KEY`: Your Groq API key
- `EXA_API_KEY`: Your EXA Search API key

#### 4. Deploy

Your Space will automatically build and deploy. The Gradio interface will be available at:
`https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`

## 📋 Usage Guide

### Streamlit Interface (Local Development)
- **Direct URL Mode**: Paste any article URL and get instant summaries
- **Search Mode**: Search for articles using EXA Search integration
- **Sidebar Options**: Configure search settings and view debug information

### Gradio Interface (Hugging Face Spaces)
- **API Keys Tab**: Configure your Groq and EXA API keys through the UI
- **Direct URL Mode**: Paste article URLs directly for summarization
- **Search Mode**: Search for articles using EXA Search
- **Instant Results**: Get AI-generated summaries with metadata
- **Mobile Friendly**: Responsive design works on all devices
- **One-Click Processing**: Submit URLs and get results immediately

### Example Workflow
1. **Configure API Keys**: Go to the "🔑 API Keys" tab and enter your API keys
2. **Enter URL**: Paste any article URL in the text input
3. **Click Summarize**: The app will extract and summarize the article
4. **View Results**: 
   - Article title, reading time, and publication date
   - AI-generated summary in bullet points
   - Extracted keywords and metadata
   - Full article text (expandable)

## 🔧 Configuration

### Available AI Models
- `llama3-8b-8192` (default) - Fast and efficient
- `mixtral-8x7b-32768` - More powerful, longer context
- `gemma2-9b-it` - Google's Gemma model

### Environment Variables
- `GROQ_API_KEY` (required): Your Groq API key
- `EXA_API_KEY` (required): Your EXA Search API key
- `GROQ_MODEL` (optional): Choose your preferred AI model

## 🛠️ Technical Stack

- **Frontend**: Streamlit (local) / Gradio (Hugging Face Spaces)
- **Web Scraping**: newspaper3k
- **AI/LLM**: LangChain + Groq
- **Search**: EXA Search API
- **Environment**: python-dotenv
- **Deployment**: Hugging Face Spaces

## 📊 Features Breakdown

### Article Extraction
- **Robust Parsing**: Handles various article formats
- **Metadata Extraction**: Title, authors, publish date, reading time
- **Keyword Generation**: Automatic keyword extraction
- **Error Handling**: Graceful handling of extraction failures

### AI Summarization
- **Professional Prompts**: Optimized for clear, informative summaries
- **Multiple Models**: Support for different Groq models
- **Bullet Point Format**: Easy-to-read summary format
- **Context Preservation**: Maintains important details

### Search Integration (Streamlit Only)
- **EXA Search**: AI-powered search engine with semantic understanding
- **Article Discovery**: Find relevant articles by topic
- **URL Extraction**: Easy copying of article URLs
- **Search Results**: Display search results in the interface

## 🔍 Example Use Cases

- **News Analysis**: Summarize breaking news articles
- **Research Papers**: Extract key points from academic papers
- **Blog Posts**: Summarize long-form content
- **Technical Documentation**: Condense technical articles
- **Market Reports**: Extract insights from financial reports

### Example Article
Try summarizing this BBC article about Instagram's fact-checking tools:
**URL**: https://www.bbc.com/news/blogs-trending-49449005
**Topic**: Instagram fact-checking tools and fake news detection

### Example Search Keywords
- **"Multimedia Misinformation"** - Find articles about fake news in images and videos
- "AI technology news" - Latest developments in artificial intelligence
- "Climate change research" - Scientific studies on environmental issues
- "Cryptocurrency market analysis" - Financial insights on digital currencies

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure your `.env` file is in the project root (local)
   - Verify your API keys are set in Hugging Face Space secrets (deployment)
   - Check that the keys have sufficient credits
   - For Gradio interface: Use the "🔑 API Keys" tab to configure keys

2. **Article Extraction Failed**
   - Some websites block scraping
   - Try different articles or sources
   - Check if the URL is accessible

3. **Search Not Working**
   - EXA Search requires an API key
   - Check your internet connection
   - Try different search queries

4. **Dependencies Issues**
   - Run `pip install -r requirements.txt`
   - Update pip: `python -m pip install --upgrade pip`
   - Check Python version (3.8+ required)

5. **Hugging Face Spaces Issues**
   - Check Space logs for build errors
   - Verify environment variables are set correctly
   - Ensure `app.py` is the main entry point
   - Check that all dependencies are in `requirements.txt`

### Supported Article Types
- News articles from major publications
- Blog posts and opinion pieces
- Technical documentation
- Research papers (when publicly accessible)
- Most text-based web content

## 📈 Performance Tips

- **Model Selection**: Use `llama3-8b-8192` for speed, `mixtral-8x7b-32768` for quality
- **URL Validation**: Ensure URLs are complete and accessible
- **Search Queries**: Use specific, descriptive search terms
- **Batch Processing**: Process multiple articles sequentially

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📁 Project Structure

```
webscraping_summarizer/
├── web_scraper_summarizer.py  # Streamlit application (local)
├── app.py                     # Gradio application (Hugging Face Spaces)
├── requirements.txt           # Python dependencies
├── README.md                 # This file
└── config.template           # Configuration template
```

## 🚀 Deployment Options

### Local Development
- Use `web_scraper_summarizer.py` for full-featured Streamlit app
- Includes search functionality and debug information
- Best for development and testing

### Hugging Face Spaces
- Use `app.py` for simplified Gradio interface
- Optimized for web deployment
- Automatic scaling and hosting
- Mobile-friendly responsive design
- Easy API key configuration through UI

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Groq**: For providing fast LLM inference
- **Streamlit**: For the excellent web app framework
- **Gradio**: For the Hugging Face Spaces interface
- **newspaper3k**: For robust article extraction
- **LangChain**: For LLM integration tools
- **EXA**: For AI-powered search capabilities
- **Hugging Face**: For providing Spaces deployment platform 