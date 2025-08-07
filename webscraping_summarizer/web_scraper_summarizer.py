import os
from dotenv import load_dotenv
from newspaper import Article
import streamlit as st
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import requests
from urllib.parse import urlparse
import time
import json

# Load environment variables with verbose output
load_dotenv(verbose=True)

# Initialize components
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
EXA_API_KEY = os.getenv("EXA_API_KEY")

# Debug: Check environment variables (only show in sidebar)
def debug_env_vars():
    with st.sidebar.expander("🔧 Debug Info", expanded=True):
        st.write("**Environment Variables:**")
        st.write(f"GROQ_API_KEY: {'✅ Set' if GROQ_API_KEY else '❌ Missing'}")
        st.write(f"EXA_API_KEY: {'✅ Set' if EXA_API_KEY else '❌ Missing'}")
        
        # Show actual values (masked for security)
        st.write("**Raw Values (first 10 chars):**")
        st.write(f"GROQ_API_KEY: {GROQ_API_KEY[:10] + '...' if GROQ_API_KEY else 'None'}")
        st.write(f"EXA_API_KEY: {EXA_API_KEY[:10] + '...' if EXA_API_KEY else 'None'}")
        
        # Check if .env file exists
        import pathlib
        env_path = pathlib.Path('.env')
        st.write(f"**.env file exists:** {'✅ Yes' if env_path.exists() else '❌ No'}")
        if env_path.exists():
            st.write(f"**.env file size:** {env_path.stat().st_size} bytes")

# Initialize Groq LLM
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama3-8b-8192"
)

# Prompt template for summarization
prompt = PromptTemplate(
    input_variables=["text"],
    template="""You are a professional article summarizer. Please summarize the following article in 5 clear, informative bullet points. Focus on the main points, key insights, and important details:

{text}

Provide a concise summary in bullet points:"""
)

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

def extract_article_content(url):
    """Extract article content with better error handling"""
    try:
        st.info(f"🔍 Attempting to extract article from: {url}")
        
        # Check if it's a PDF
        if is_pdf_url(url):
            st.error("❌ PDF files are not supported. Please use a web article URL.")
            st.write("**Supported formats:**")
            st.write("- News articles (BBC, CNN, Reuters, etc.)")
            st.write("- Blog posts and web pages")
            st.write("- HTML-based content")
            return None
        
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
        
        # Debug information
        st.write(f"📊 Article Info:")
        st.write(f"- Title: {article.title}")
        st.write(f"- Text length: {len(article.text) if article.text else 0} characters")
        st.write(f"- Authors: {article.authors}")
        st.write(f"- Publish date: {article.publish_date}")
        
        if not article.text or len(article.text.strip()) < 50:
            st.warning("⚠️ Article text is too short. This might be due to:")
            st.write("- Website blocking automated access")
            st.write("- JavaScript-rendered content")
            st.write("- Paywall or subscription required")
            st.write("- Invalid or broken URL")
            st.write("- **Try these URLs instead:**")
            st.write("  - https://www.bbc.com/news")
            st.write("  - https://www.reuters.com/technology")
            st.write("  - https://www.theverge.com")
            return None
            
        return article
    except Exception as e:
        st.error(f"❌ Failed to extract article: {str(e)}")
        st.write("**Troubleshooting tips:**")
        st.write("- Try a different article URL")
        st.write("- Check if the URL is accessible in your browser")
        st.write("- Some websites block automated access")
        return None

def search_articles_exa(query, max_results=5):
    """Search for articles using EXA Search API"""
    try:
        if not EXA_API_KEY:
            st.warning("⚠️ EXA Search API credentials not configured. Please add EXA_API_KEY to your .env file.")
            return None
        
        # Check if query looks like a URL
        if query.startswith('http'):
            st.warning("⚠️ Please enter a search term, not a URL. For direct URL processing, use the main input field.")
            return None
            
        # EXA Search API endpoint
        url = "https://api.exa.ai/search"
        
        headers = {
            "Authorization": f"Bearer {EXA_API_KEY}",
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
            results = []
            for item in data['results']:
                results.append({
                    'title': item.get('title', ''),
                    'link': item.get('url', ''),
                    'snippet': item.get('text', '')[:200] + '...' if item.get('text') else '',
                    'source': urlparse(item.get('url', '')).netloc
                })
            return results
        else:
            st.warning("No search results found.")
            return None
            
    except requests.exceptions.RequestException as e:
        st.error(f"Search API error: {str(e)}")
        return None
    except Exception as e:
        st.error(f"Search failed: {str(e)}")
        return None

def generate_summary(text):
    """Generate summary using the updated LangChain approach"""
    try:
        # Use the new LangChain pattern instead of deprecated LLMChain
        chain = prompt | llm
        result = chain.invoke({"text": text})
        return result.content
    except Exception as e:
        st.error(f"Failed to generate summary: {str(e)}")
        return None

# Streamlit UI
st.set_page_config(
    page_title="📰 Web Article Summarizer",
    page_icon="📰",
    layout="wide"
)

st.title("📰 Web Article Summarizer")
st.markdown("---")

# Sidebar for options
with st.sidebar:
    st.header("🔧 Options")
    search_mode = st.checkbox("🔍 Search Mode", help="Search for articles using EXA Search")
    
    if search_mode:
        st.info("💡 **Try this example:** Search for 'Multimedia Misinformation' to find articles about fake news in images and videos")
        search_query = st.text_input("Search for articles:", placeholder="e.g., Multimedia Misinformation")
        max_results = st.slider("Max search results:", 1, 10, 5)
        
        # Show API status
        if EXA_API_KEY:
            st.success("✅ EXA Search API configured")
        else:
            st.error("❌ EXA Search API not configured")
    
    # Debug information
    debug_env_vars()

# Main content
if search_mode:
    if search_query:
        st.subheader(f"🔍 Search Results for: {search_query}")
        
        with st.spinner("Searching for articles..."):
            search_results = search_articles_exa(search_query, max_results)
            
        if search_results:
            st.write(f"Found {len(search_results)} articles:")
            
            for i, result in enumerate(search_results, 1):
                with st.expander(f"📄 {result['title']}", expanded=False):
                    st.write(f"**Source:** {result['source']}")
                    st.write(f"**URL:** {result['link']}")
                    st.write(f"**Snippet:** {result['snippet']}")
                    
                    # Add copy button for URL
                    if st.button(f"📋 Copy URL {i}", key=f"copy_{i}"):
                        st.write("URL copied to clipboard!")
                        st.code(result['link'])
        
        st.markdown("---")
        st.subheader("📝 Enter Article URL")
        url = st.text_input("Paste article URL from search results:")
        
    else:
        st.warning("Please enter a search query in the sidebar.")
        url = ""
else:
    # Add example URL
    st.info("💡 **Try this example:** [BBC Article about Instagram Fact-Checking](https://www.bbc.com/news/blogs-trending-49449005)")
    url = st.text_input("Enter article URL:", placeholder="https://www.bbc.com/news/blogs-trending-49449005")

# Process URL
if st.button("🚀 Summarize Article", type="primary"):
    if url and is_valid_url(url):
        with st.spinner("Extracting article content..."):
            article = extract_article_content(url)
            
        if article:
            # Display article info
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.subheader(f"📄 {article.title}")
                st.write(f"🕒 Reading time: {article.meta_data.get('reading_time', 'Unknown')} mins")
                st.write(f"📅 Published: {article.publish_date.strftime('%Y-%m-%d') if article.publish_date else 'Unknown'}")
                
            with col2:
                st.write(f"🔗 Source: {urlparse(url).netloc}")
                
            # Show full text in expander
            with st.expander("📄 Full Article Text", expanded=False):
                st.write(article.text)
                
            # Generate summary
            with st.spinner("🤖 Generating AI summary..."):
                summary = generate_summary(article.text)
                if summary:
                    st.subheader("🔍 AI Summary")
                    st.markdown(summary)
                    
            # Show keywords
            if article.keywords:
                st.subheader("🏷️ Keywords")
                st.write(", ".join(article.keywords[:10]))  # Show first 10 keywords
                
            # Show metadata
            with st.expander("📊 Article Metadata"):
                st.write(f"**Authors:** {', '.join(article.authors) if article.authors else 'Unknown'}")
                st.write(f"**Language:** {article.meta_lang}")
                st.write(f"**Text Length:** {len(article.text)} characters")
                
    elif url:
        st.error("❌ Please enter a valid URL (e.g., https://example.com/article)")
    else:
        st.warning("⚠️ Please enter a URL to summarize")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>Built with ❤️ using Streamlit, LangChain, and Groq</p>
    <p>Powered by newspaper3k for article extraction</p>
    <p>Search powered by EXA Search API</p>
</div>
""", unsafe_allow_html=True) 