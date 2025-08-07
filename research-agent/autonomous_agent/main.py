"""Streamlit Autonomous Research Agent UI entrypoint."""
from __future__ import annotations

import os
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

from dspy_modules import SummarizerModule
from utils import get_llm, search_arxiv

# ---------------------------------------------------------------------------
# ENV & CONFIG
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env")  # preload .env if exists

st.set_page_config(page_title="🧠 Autonomous Research Agent", layout="wide")
st.title("🧠 Autonomous Research Assistant")

# --------------------- Sidebar: API Keys ------------------------------

with st.sidebar:
    st.subheader("🔐 API Keys")

    default_groq = os.getenv("GROQ_API_KEY", "")
    groq_key = st.text_input("GROQ API Key", type="password", value=default_groq)

    hf_model_default = os.getenv("HF_MODEL_ID", "google/flan-t5-large")
    hf_model_id = st.text_input(
        "HuggingFace Model ID (optional)",
        value=hf_model_default,
        help="Public model ID, e.g., google/flan-t5-large. Used if no Groq key.",
    )

    if st.button("Save Settings"):
        if groq_key:
            os.environ["GROQ_API_KEY"] = groq_key
            st.success("✅ GROQ key saved in session")
        if hf_model_id:
            os.environ["HF_MODEL_ID"] = hf_model_id
            st.success("✅ HF model ID saved in session")

    # Instantiate LLM when possible
    llm = None
    try:
        llm = get_llm()
        st.info("LLM ready ✅")
    except Exception as exc:  # pragma: no cover
        st.warning(f"LLM not initialized: {exc}")

# ----------------------- Main Interface ------------------------------

query = st.text_input("🔍 Enter your research topic or question:")
num_results = st.slider("Number of papers", 1, 10, 3)

run_btn = st.button("🔎 Search and Summarize", disabled=not (llm and query.strip()))

if run_btn and llm:
    with st.spinner("🔬 Searching ArXiv and generating summaries..."):
        papers = search_arxiv(query, max_results=num_results)

    if not papers:
        st.error("No papers found.")
    else:
        summarizer = SummarizerModule(llm)
        st.subheader("📄 Summarized Papers")
        for idx, paper in enumerate(papers, start=1):
            result = summarizer(title=paper["title"], abstract=paper["abstract"])
            st.markdown(f"### Paper {idx}: {paper['title']}")
            st.markdown(f"**Summary:** {result['summary']}")
            with st.expander("🔍 View Abstract"):
                st.write(paper["abstract"])
