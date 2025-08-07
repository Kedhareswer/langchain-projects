"""Utility functions for the autonomous research agent."""
from __future__ import annotations

import os
import xml.etree.ElementTree as ET
from typing import Callable, List, Dict

import requests
from dotenv import load_dotenv
import dspy

load_dotenv()

# ---------------------------------------------------------------------------
# LLM SETUP
# ---------------------------------------------------------------------------


def _make_openai_like_llm(api_key: str, base_url: str, model: str) -> Callable[[str], str]:
    """Return a simple callable that wraps an OpenAI-compatible endpoint.

    We use this for Groq because their API is OpenAI‐compatible. The callable
    signature matches what DSPy expects: fn(prompt:str)->str.
    """
    import openai

    openai.api_key = api_key
    # Ensure trailing slash for correct path concatenation
    openai.base_url = base_url.rstrip("/") + "/"  # type: ignore[attr-defined]

    def _completion(prompt: str) -> str:  # noqa: D401
        resp = openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return resp.choices[0].message.content.strip()

    return _completion


def get_llm() -> Callable[[str], str]:
    """Return an LLM callable based on provided environment variables.

    Priority:
    1. Groq (requires GROQ_API_KEY)
    2. HuggingFace model via HF_MODEL_ID (no key needed for public models)
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        base_url = "https://api.groq.com/openai/v1/"  # trailing slash ensured in helper
        model_id = os.getenv("GROQ_MODEL_ID", "llama-3.3-70b-versatile")
        return _make_openai_like_llm(api_key=groq_key, base_url=base_url, model=model_id)

    hf_model = os.getenv("HF_MODEL_ID", "google/flan-t5-large")
    # dspy.HFModel does not need an API key for most public models, but respects the env.
    return dspy.HFModel(model=hf_model)



# Convenience alias for backward compatibility
get_groq_llm = get_llm

# ---------------------------------------------------------------------------
# ArXiv SEARCH
# ---------------------------------------------------------------------------


def search_arxiv(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    """Search ArXiv and return a list of papers with title & abstract."""
    query = query.replace(" ", "+")
    url = (
        "http://export.arxiv.org/api/query?search_query=all:" f"{query}&start=0&max_results={max_results}"
    )
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    root = ET.fromstring(response.content)

    papers: List[Dict[str, str]] = []
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        title_el = entry.find("{http://www.w3.org/2005/Atom}title")
        summary_el = entry.find("{http://www.w3.org/2005/Atom}summary")
        if title_el is None or summary_el is None:
            continue
        title = title_el.text.strip().replace("\n", " ")
        summary = summary_el.text.strip().replace("\n", " ")
        papers.append({"title": title, "abstract": summary})
    return papers
