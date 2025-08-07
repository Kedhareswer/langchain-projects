import os
import streamlit as st
import tempfile
from dotenv import load_dotenv
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Pinecone as LangPinecone
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from pinecone import Pinecone, ServerlessSpec
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import time

# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_env = os.getenv("PINECONE_ENV")

# App configuration
st.set_page_config(
    page_title="Document Q&A Chatbot",
    page_icon="📄",
    layout="wide"
)

# App title and description
st.title("Document Q&A Chatbot")
st.markdown("Upload a PDF document and ask questions about its content.")

# Initialize Pinecone client
@st.cache_resource
def init_pinecone():
    pc = Pinecone(api_key=pinecone_api_key)
    
    # Define index name
    index_name = "doc-qa-index"
    
    # Check if index exists, if not create
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=384,  # all-MiniLM-L6-v2 has 384 dimensions
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    return pc, index_name

# Load and split PDF
def load_and_split_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    return splitter.create_documents([text])

# Create embedding model
@st.cache_resource
def get_embedding_model():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize LLM without system_prompt
@st.cache_resource
def init_llm():
    return ChatGroq(
        api_key=groq_api_key,
        model_name="llama3-8b-8192",
        temperature=0.2,
        top_p=0.9,
        max_tokens=1024
    )

# Session state initialization
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'vectorstore' not in st.session_state:
    st.session_state.vectorstore = None
if 'pdf_processed' not in st.session_state:
    st.session_state.pdf_processed = False
if 'query' not in st.session_state:
    st.session_state.query = ""
if 'last_response_time' not in st.session_state:
    st.session_state.last_response_time = 0

# Sidebar for PDF upload
with st.sidebar:
    st.header("Upload Document")
    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
    
    if uploaded_file is not None:
        # Create a temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_filepath = tmp_file.name
        
        if st.button("Process Document"):
            with st.spinner("Processing PDF..."):
                try:
                    # Initialize Pinecone
                    pc, index_name = init_pinecone()
                    
                    # Load and split PDF
                    docs = load_and_split_pdf(tmp_filepath)
                    
                    # Get embedding model
                    embedding_model = get_embedding_model()
                    
                    # Create vectorstore
                    st.session_state.vectorstore = LangPinecone.from_documents(
                        documents=docs,
                        embedding=embedding_model,
                        index_name=index_name
                    )
                    
                    st.session_state.pdf_processed = True
                    st.success(f"Document processed: {uploaded_file.name}")
                    
                except Exception as e:
                    st.error(f"Error processing document: {e}")
                finally:
                    # Clean up the temporary file
                    os.unlink(tmp_filepath)

# Define callback for query submission
def submit_query():
    if st.session_state.query_input and st.session_state.query_input != st.session_state.query:
        # Store the current query
        current_query = st.session_state.query_input
        
        # Update session state with current query to prevent duplication
        st.session_state.query = current_query
        st.session_state.last_response_time = time.time()
        
        # Update chat history with user query
        st.session_state.chat_history.append({"role": "user", "content": current_query})
        
        # Initialize LLM and get answer
        with st.spinner("Thinking..."):
            # Initialize LLM
            llm = init_llm()
            
            # Configure retriever with better parameters
            retriever = st.session_state.vectorstore.as_retriever(
                search_type="mmr",  # Use Maximal Marginal Relevance for better diversity
                search_kwargs={"k": 5}  # Get top 5 relevant chunks
            )
            
            # Build the enhanced RAG chain with better prompt
            qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
                chain_type_kwargs={
                    "prompt": PromptTemplate(
                        template=(
                            "You are an expert assistant that helps answer questions based on the provided context.\n\n"
                            "Context:\n{context}\n\n"
                            "Question: {question}\n\n"
                            "Instructions:\n"
                            "1. Answer the question based on the context provided.\n"
                            "2. If the answer is not in the context, say \"I don't have enough information to answer this question.\"\n"
                            "3. Be concise but thorough in your response.\n"
                            "4. If relevant, include the source document name and page number in your answer.\n"
                            "5. Format your answer in clear, easy-to-read paragraphs.\n"
                            "6. Use bullet points or numbered lists when appropriate.\n\n"
                            "Answer:"
                        ),
                        input_variables=["context", "question"],
                    )
                }
            )
            
            # Get answer with source documents
            result = qa_chain.invoke({"query": current_query})
            answer = result['result']
            
            # Add source documents if available
            if 'source_documents' in result and result['source_documents']:
                sources = list(set(
                    f"Page {doc.metadata.get('page', 'N/A')}" 
                    for doc in result['source_documents']
                ))
                if sources:
                    answer += f"\n\nSources: {', '.join(sources)}"
            
            # Update chat history with AI response
            st.session_state.chat_history.append({"role": "assistant", "content": answer})

# Main chat area
if st.session_state.pdf_processed:
    # Display chat history in a container
    chat_container = st.container()
    with chat_container:
        for message in st.session_state.chat_history:
            if message["role"] == "user":
                st.markdown(f"**You:** {message['content']}")
            else:
                # Format AI response with better markdown
                response = message['content']
                # Convert line breaks to markdown paragraphs
                response = response.replace('\n', '  \n\n')
                st.markdown(f"**AI:** {response}", unsafe_allow_html=True)
    
    # Query input with callback
    st.text_input(
        "Ask a question about the document:", 
        key="query_input",
        on_change=submit_query
    )
else:
    st.info("Please upload and process a document to start the conversation.")

# Footer
st.markdown("---")
st.markdown("Built with Streamlit, Langchain, and GROQ LLM")
