# app.py
import os
import streamlit as st
from dotenv import load_dotenv
from PIL import Image

# LangChain & SymPy Tools
from langchain.agents import initialize_agent, AgentType
from sympy_tools import sympy_derivative_tool, sympy_integral_tool
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from langchain_groq import ChatGroq

# LaTeX-OCR (pix2tex)
from pix2tex.cli import LatexOCR

# --- Load environment variables ---
load_dotenv()
hf_token = os.getenv("HF_TOKEN")
groq_api_key = os.getenv("GROQ_API_KEY")

# --- Initialize LaTeX-OCR model ---
ocr_model = LatexOCR()

def extract_latex_from_image(image):
    return ocr_model(image)

# --- Hugging Face model wrapper ---
class HFLLM:
    def __init__(self):
        model_id = "deepseek-ai/deepseek-llm-7b-base"
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=hf_token)
        self.model = AutoModelForCausalLM.from_pretrained(model_id, token=hf_token)
        self.pipe = pipeline("text-generation", model=self.model, tokenizer=self.tokenizer, max_new_tokens=200)

    def __call__(self, prompt, stop=None):
        result = self.pipe(prompt)[0]['generated_text']
        return result[len(prompt):]

# --- Streamlit UI ---
st.title("🧠 Math Assistant with LLaMA3 + LaTeX-OCR")

model_option = st.radio("Choose Model Backend", ["Groq (LLaMA3 8B)", "HuggingFace (DeepSeek 7B)"])

# LLM initialization
if model_option == "Groq (LLaMA3 8B)":
    llm = ChatGroq(temperature=0, model_name="llama3-8b-8192")
    st.success("✅ Using LLaMA3 8B via Groq")
else:
    llm = HFLLM()
    st.success("✅ Using DeepSeek 7B via Hugging Face")

# LangChain Agent setup
tools = [sympy_derivative_tool, sympy_integral_tool]
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True
)

# Input method
query_mode = st.radio("Select Input Type", ["Text", "Image"])
query = ""

if query_mode == "Text":
    query = st.text_input("🔢 Enter a math expression (e.g., 'differentiate sin(x)*x^2')")
else:
    uploaded_image = st.file_uploader("📤 Upload a math image", type=["jpg", "jpeg", "png"])
    if uploaded_image:
        image = Image.open(uploaded_image)
        st.image(image, caption="🖼 Uploaded Image", use_column_width=True)
        try:
            with st.spinner("🤖 Running LaTeX-OCR..."):
                query = extract_latex_from_image(image)
            st.info(f"🧾 Extracted LaTeX: `{query.strip()}`")
            st.latex(query.strip())
        except Exception as e:
            st.error(f"❌ OCR failed: {str(e)}")

# Run Agent
if query.strip():
    with st.spinner("🧠 Solving..."):
        try:
            answer = agent.run(query)
            st.success("✅ Answer Ready")
            st.markdown(f"**Response:** {answer}")
        except Exception as e:
            st.error(f"❌ LangChain Error: {str(e)}")
