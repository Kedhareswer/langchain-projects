import os
import gradio as gr
from newspaper import Article
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from urllib.parse import urlparse
import time
import requests

# Global variables to store user-provided API keys
user_groq_api_key = None
user_exa_api_key = None
user_llm = None

# Prompt template for summarization
prompt = PromptTemplate(
    input_variables=["text"],
    template="""You are a professional article summarizer. Please summarize the following article in 5 clear, informative bullet points. Focus on the main points, key insights, and important details:

{text}

Provide a concise summary in bullet points:"""
)

def initialize_llm(api_key):
    """Initialize Groq LLM with the provided API key"""
    global user_llm
    if api_key and api_key.strip() and api_key != "your_groq_api_key_here":
        try:
            user_llm = ChatGroq(
                groq_api_key=api_key.strip(),
                model_name="llama3-8b-8192"
            )
            return "✅ Groq API key configured successfully!"
        except Exception as e:
            user_llm = None
            return f"❌ Failed to initialize Groq LLM: {str(e)}"
    else:
        user_llm = None
        return "⚠️ Please enter a valid Groq API key"

def set_api_keys(groq_key, exa_key):
    """Set API keys and return status messages"""
    global user_groq_api_key, user_exa_api_key
    
    # Set the keys
    user_groq_api_key = groq_key.strip() if groq_key else None
    user_exa_api_key = exa_key.strip() if exa_key else None
    
    # Initialize LLM with new key
    groq_status = initialize_llm(user_groq_api_key)
    
    # Check EXA key
    exa_status = "✅ EXA API key configured successfully!" if user_exa_api_key and user_exa_api_key != "your_exa_api_key_here" else "⚠️ Please enter a valid EXA API key"
    
    return groq_status, exa_status

def is_valid_url(url):
    """Check if URL is valid"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def is_pdf_url(url):
    """Check if URL points to a PDF file"""
    return url.lower().endswith('.pdf')

def search_articles_exa(query, max_results=5):
    """Search for articles using EXA Search API"""
    try:
        if not user_exa_api_key or user_exa_api_key == "your_exa_api_key_here":
            return "❌ EXA API key not configured. Please set your EXA API key in the API Keys tab.\n\nTo get started:\n1. Get a free API key from https://exa.ai/\n2. Enter it in the API Keys tab\n3. Try searching again"
        
        # Check if query looks like a URL
        if query.startswith('http'):
            return "⚠️ Please enter a search term, not a URL. For direct URL processing, use the Direct URL tab."
            
        # EXA Search API endpoint
        url = "https://api.exa.ai/search"
        
        headers = {
            "Authorization": f"Bearer {user_exa_api_key}",
            "Content-Type": "application/json"
        }
        
        # EXA Search parameters
        params = {
            "query": f"{query} news articles",
            "numResults": min(max_results, 10),
            "includeDomains": ["bbc.com", "reuters.com", "cnn.com", "theverge.com", "techcrunch.com"],
            "excludeDomains": [],
            "useAutoprompt": True,
            "type": "keyword"
        }
        
        response = requests.post(url, headers=headers, json=params)
        response.raise_for_status()
        
        data = response.json()
        
        if 'results' in data and data['results']:
            # Format results for display
            output = f"## 🔍 Search Results for: {query}\n\n"
            output += f"Found {len(data['results'])} articles:\n\n"
            
            for i, item in enumerate(data['results'], 1):
                title = item.get('title', 'No title')
                link = item.get('url', '')
                snippet = item.get('text', '')[:200] + '...' if item.get('text') else 'No snippet available'
                source = urlparse(link).netloc if link else 'Unknown source'
                
                output += f"### {i}. {title}\n"
                output += f"**Source:** {source}\n"
                output += f"**URL:** `{link}`\n"
                output += f"**Snippet:** {snippet}\n\n"
                output += "---\n\n"
            
            output += "\n**💡 Tip:** Copy any URL above and paste it in the Direct URL tab to summarize that article."
            return output
        else:
            return "No search results found. Try a different search term."
            
    except requests.exceptions.RequestException as e:
        return f"Search API error: {str(e)}"
    except Exception as e:
        return f"Search failed: {str(e)}"

def extract_article_content(url):
    """Extract article content with error handling"""
    try:
        # Check if it's a PDF
        if is_pdf_url(url):
            return None, "❌ PDF files are not supported. Please use a web article URL."
        
        # Add headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()
        
        if not article.text or len(article.text.strip()) < 50:
            return None, "⚠️ Article text is too short. This might be due to website blocking, JavaScript content, or paywall."
            
        return article, None
    except Exception as e:
        return None, f"❌ Failed to extract article: {str(e)}"

def generate_summary(text):
    """Generate summary using LangChain"""
    if not user_llm:
        return "❌ Groq API key not configured. Please set your Groq API key in the API Keys tab.\n\nTo get started:\n1. Get a free API key from https://console.groq.com/\n2. Enter it in the API Keys tab\n3. Try summarizing again"
    
    try:
        chain = prompt | user_llm
        result = chain.invoke({"text": text})
        return result.content
    except Exception as e:
        return f"Failed to generate summary: {str(e)}"

def summarize_article(url):
    """Main function to summarize an article"""
    if not url or not url.strip():
        return "⚠️ Please enter a URL to summarize."
    
    if not is_valid_url(url):
        return "❌ Please enter a valid URL (e.g., https://example.com/article)"
    
    # Check API keys
    if not user_groq_api_key or user_groq_api_key == "your_groq_api_key_here":
        return """❌ Groq API key not configured. 

**To get started:**
1. Get a free API key from https://console.groq.com/
2. Go to the "🔑 API Keys" tab
3. Enter your API key and click "Save Keys"
4. Try summarizing again

**For testing without API key:**
The interface will still load, but you'll need to configure the API key to use the summarization feature."""
    
    # Extract article
    article, error = extract_article_content(url)
    if error:
        return error
    
    # Generate summary
    summary = generate_summary(article.text)
    
    # Format output
    output = f"""
## 📄 {article.title}

**🔗 Source:** {urlparse(url).netloc}
**📅 Published:** {article.publish_date.strftime('%Y-%m-%d') if article.publish_date else 'Unknown'}
**🕒 Reading Time:** {article.meta_data.get('reading_time', 'Unknown')} mins
**📊 Text Length:** {len(article.text)} characters

---

## 🔍 AI Summary

{summary}

---

## 🏷️ Keywords
{', '.join(article.keywords[:10]) if article.keywords else 'No keywords extracted'}

---

## 📝 Full Article Text
{article.text[:1000]}{'...' if len(article.text) > 1000 else ''}
"""
    
    return output

# Create Gradio interface
def create_interface():
    with gr.Blocks(
        title="📰 Web Article Summarizer",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1200px !important;
        }
        """
    ) as demo:
        gr.Markdown("""
        # 📰 Web Article Summarizer
        
        A powerful AI tool that extracts and summarizes web articles using Groq's LLM models.
        
        **✨ Features:**
        - 🔗 Extract articles from any URL
        - 🔍 Search for articles using EXA Search
        - 🤖 AI-powered summarization
        - 📊 Article metadata and keywords
        - 🎯 Clean, bullet-point summaries
        - 🔑 Easy API key configuration
        
        **💡 Try this example:** [BBC Article about Instagram Fact-Checking](https://www.bbc.com/news/blogs-trending-49449005)
        """)
        
        # Create tabs for different modes
        with gr.Tabs():
            # API Keys Configuration Tab
            with gr.TabItem("🔑 API Keys"):
                with gr.Row():
                    with gr.Column(scale=2):
                        gr.Markdown("""
                        ## 🔑 Configure Your API Keys
                        
                        **Required for full functionality:**
                        """)
                        
                        groq_key_input = gr.Textbox(
                            label="🔑 Groq API Key",
                            placeholder="Enter your Groq API key here...",
                            type="password",
                            lines=2
                        )
                        
                        exa_key_input = gr.Textbox(
                            label="🔍 EXA API Key",
                            placeholder="Enter your EXA API key here...",
                            type="password",
                            lines=2
                        )
                        
                        save_keys_btn = gr.Button(
                            "💾 Save API Keys",
                            variant="primary",
                            size="lg"
                        )
                        
                        gr.Markdown("""
                        **🔗 Get Free API Keys:**
                        - **Groq API:** https://console.groq.com/ (for AI summarization)
                        - **EXA API:** https://exa.ai/ (for article search)
                        
                        **🔒 Security:** Your API keys are stored only in memory and are not saved to disk.
                        """)
                    
                    with gr.Column(scale=1):
                        gr.Markdown("""
                        **📋 Instructions:**
                        1. Get free API keys from the links above
                        2. Enter your keys in the fields
                        3. Click "Save API Keys"
                        4. Check the status messages
                        5. Use other tabs for summarization
                        
                        **✅ What each key does:**
                        - **Groq API:** Powers the AI summarization
                        - **EXA API:** Enables article search functionality
                        
                        **⚠️ Note:** Keys are not saved between sessions
                        """)
                
                with gr.Row():
                    with gr.Column():
                        groq_status = gr.Markdown(
                            label="🔑 Groq Status",
                            value="Enter your Groq API key above and click 'Save API Keys'"
                        )
                    
                    with gr.Column():
                        exa_status = gr.Markdown(
                            label="🔍 EXA Status",
                            value="Enter your EXA API key above and click 'Save API Keys'"
                        )
                
                # Handle API key saving
                save_keys_btn.click(
                    fn=set_api_keys,
                    inputs=[groq_key_input, exa_key_input],
                    outputs=[groq_status, exa_status]
                )
            
            # Direct URL Mode
            with gr.TabItem("📝 Direct URL"):
                with gr.Row():
                    with gr.Column(scale=2):
                        url_input = gr.Textbox(
                            label="📝 Article URL",
                            placeholder="https://www.bbc.com/news/blogs-trending-49449005",
                            lines=2
                        )
                        
                        submit_btn = gr.Button(
                            "🚀 Summarize Article",
                            variant="primary",
                            size="lg"
                        )
                    
                    with gr.Column(scale=1):
                        gr.Markdown("""
                        **📋 Instructions:**
                        1. Configure API keys in the "🔑 API Keys" tab
                        2. Paste any article URL
                        3. Click "Summarize Article"
                        4. Wait for AI processing
                        5. View the summary and metadata
                        
                        **✅ Supported:**
                        - News articles (BBC, CNN, Reuters)
                        - Blog posts and web pages
                        - Most text-based content
                        
                        **❌ Not Supported:**
                        - PDF files
                        - Paywalled content
                        - JavaScript-heavy sites
                        """)
                
                with gr.Row():
                    url_output = gr.Markdown(
                        label="📊 Results",
                        value="Configure your API keys in the '🔑 API Keys' tab, then enter a URL above and click 'Summarize Article' to get started."
                    )
                
                # Handle submission
                submit_btn.click(
                    fn=summarize_article,
                    inputs=url_input,
                    outputs=url_output
                )
                
                # Handle Enter key
                url_input.submit(
                    fn=summarize_article,
                    inputs=url_input,
                    outputs=url_output
                )
            
            # Search Mode
            with gr.TabItem("🔍 Search Articles"):
                with gr.Row():
                    with gr.Column(scale=2):
                        search_query = gr.Textbox(
                            label="🔍 Search Query",
                            placeholder="e.g., Multimedia Misinformation",
                            lines=2
                        )
                        
                        max_results = gr.Slider(
                            label="Max Results",
                            minimum=1,
                            maximum=10,
                            value=5,
                            step=1
                        )
                        
                        search_btn = gr.Button(
                            "🔍 Search Articles",
                            variant="secondary",
                            size="lg"
                        )
                    
                    with gr.Column(scale=1):
                        gr.Markdown("""
                        **📋 Search Instructions:**
                        1. Configure EXA API key in the "🔑 API Keys" tab
                        2. Enter a search term
                        3. Click "Search Articles"
                        4. Browse results and copy URLs
                        5. Use URLs in Direct URL tab
                        
                        **💡 Example searches:**
                        - "Multimedia Misinformation"
                        - "AI technology news"
                        - "Climate change research"
                        
                        **✅ Search Sources:**
                        - BBC, CNN, Reuters
                        - TechCrunch, The Verge
                        - Major news outlets
                        """)
                
                with gr.Row():
                    search_output = gr.Markdown(
                        label="🔍 Search Results",
                        value="Configure your EXA API key in the '🔑 API Keys' tab, then enter a search query above and click 'Search Articles' to get started."
                    )
                
                # Handle search
                search_btn.click(
                    fn=search_articles_exa,
                    inputs=[search_query, max_results],
                    outputs=search_output
                )
                
                # Handle Enter key for search
                search_query.submit(
                    fn=search_articles_exa,
                    inputs=[search_query, max_results],
                    outputs=search_output
                )
        
        gr.Markdown("""
        ---
        **🔧 Built with:** Gradio, LangChain, Groq, newspaper3k, EXA Search  
        **🚀 Deployed on:** Hugging Face Spaces  
        **📚 Powered by:** AI-powered article analysis
        """)
    
    return demo

# Create and launch the interface
if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        server_name="127.0.0.1",
        server_port=7860,
        share=False
    ) 