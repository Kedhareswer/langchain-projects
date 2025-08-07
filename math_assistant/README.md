# Math Assistant with LLaMA3 + LaTeX-OCR

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Enabled-ff4b4b?logo=streamlit)](https://streamlit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Overview

**Math Assistant** is an interactive web app that combines:
- **LLaMA3 (Groq) & DeepSeek LLMs** for natural language math reasoning
- **LaTeX-OCR (pix2tex)** for extracting math expressions from images
- **SymPy** for symbolic math (derivatives, integrals)
- **LangChain** for agent orchestration

It allows users to:
- Enter math queries as text or images
- Choose between LLaMA3 (Groq) or DeepSeek (HuggingFace) backends
- Get step-by-step solutions with symbolic computation

---

## 📑 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [File/Module Map](#-filemodule-map)
- [Setup & Installation](#-setup--installation)
- [Usage](#-usage)
- [Notebooks](#-notebooks)
- [Extending & Customization](#-extending--customization)
- [License](#-license)

---

## ✨ Features

| Feature                        | Description                                                      | Location(s)           |
|-------------------------------|------------------------------------------------------------------|-----------------------|
| Text & Image Input            | Enter math as text or upload an image (LaTeX OCR)                 | `app.py`              |
| Model Selection               | Choose LLaMA3 (Groq) or DeepSeek (HuggingFace)                    | `app.py`              |
| Symbolic Derivative Tool      | Compute derivatives using SymPy                                   | `sympy_tools.py`, `sympy_tools1.py` |
| Symbolic Integral Tool        | Compute integrals using SymPy                                     | `sympy_tools.py`, `sympy_tools1.py` |
| LangChain Agent Integration   | Orchestrate tools and LLMs for step-by-step solutions             | `app.py`, `AgentExecutor.ipynb`     |
| Python REPL Agent             | Execute Python code for math queries                              | `math_assistant.ipynb` |
| LaTeX Rendering               | Display extracted and computed math in LaTeX                      | `app.py`              |

---

## 🗺️ Architecture

```mermaid
graph TD
    A[User] -->|Text/Image| B[Streamlit UI]
    B -->|Image| C[LaTeX-OCR (pix2tex)]
    B -->|Text| D[LLM Backend]
    C --> D
    D -->|Query| E[LangChain Agent]
    E -->|Tool Call| F[SymPy Tools]
    F -->|Result| E
    E -->|Response| B
    subgraph LLM Backend
        D1[Groq (LLaMA3)]
        D2[HuggingFace (DeepSeek)]
    end
    D --> D1
    D --> D2
```

---

## 🗂️ File/Module Map

| File/Notebook         | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `app.py`             | Main Streamlit app; UI, model selection, OCR, agent orchestration        |
| `sympy_tools.py`     | Simple SymPy tools for derivatives and integrals (LangChain Tool API)    |
| `sympy_tools1.py`    | Advanced SymPy tools with Pydantic schemas (LangChain BaseTool API)      |
| `AgentExecutor.ipynb`| Notebook: Example of agent with custom tools and explicit prompt usage   |
| `math_assistant.ipynb`| Notebook: Python REPL agent for math queries                            |
| `requirements.txt`   | Python dependencies (add required packages here)                         |

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd math_assistant
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   *(Add required packages to `requirements.txt` if empty: `streamlit`, `langchain`, `langchain-groq`, `sympy`, `transformers`, `pix2tex`, `python-dotenv`, `Pillow`)*

3. **Set up environment variables:**
   - Create a `.env` file with your HuggingFace and Groq API keys:
     ```env
     HF_TOKEN=your_huggingface_token
     GROQ_API_KEY=your_groq_api_key
     ```

4. **Run the app:**
   ```bash
   streamlit run app.py
   ```

---

## 🧑‍💻 Usage

- **Text Input:** Enter a math expression (e.g., `differentiate sin(x)*x^2`)
- **Image Input:** Upload a math image; LaTeX-OCR will extract the expression
- **Model Selection:** Choose between Groq (LLaMA3) or HuggingFace (DeepSeek)
- **Output:** Step-by-step solution, LaTeX rendering, and agent reasoning

---

## 📓 Notebooks

| Notebook                | Description                                                      |
|-------------------------|------------------------------------------------------------------|
| `AgentExecutor.ipynb`   | Shows how to build a LangChain agent with custom SymPy tools      |
| `math_assistant.ipynb`  | Demonstrates a Python REPL agent for direct math computation      |

---

## 🛠️ Extending & Customization

- **Add New Tools:**
  - Create a new tool in the style of `sympy_tools.py` or `sympy_tools1.py`
  - Register it in the agent's `tools` list in `app.py`
- **Add More Models:**
  - Add new model wrappers (see `HFLLM` in `app.py`)
  - Add to the model selection UI
- **Improve UI:**
  - Customize Streamlit components for better UX

---

## 📄 License

This project is licensed under the MIT License.

---

> **Inspired by LangChain, Groq, SymPy, and the open-source math/AI community.** 