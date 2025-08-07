"""DSPy Signatures and Modules for the autonomous research agent."""
import dspy
from dspy import Signature, ChainOfThought


class SummarizePaper(Signature):
    """Summarizes a research paper given its title and abstract."""

    title: str = dspy.InputField(description="Title of the paper")
    abstract: str = dspy.InputField(description="Abstract of the paper")
    summary: str = dspy.OutputField(description="Concise summary of the paper")


class SummarizerModule(ChainOfThought):
    """A simple Chain‐of‐Thought wrapper around the selected LLM.

    Parameters
    ----------
    llm : Callable[[str], str]
        A function or object with a __call__(str)->str interface that returns the
        model's response given a prompt.
    """

    def __init__(self, llm):
        # Provide the signature to the ChainOfThought base class
        super().__init__(signature=SummarizePaper)
        self.llm = llm

    def forward(self, title: str, abstract: str):  # noqa: D401
        """Generate a concise summary for a paper.

        The summary focuses on the main contributions, methodology, and
        significance of the research.
        """
        prompt = (
            "You are an expert research assistant. Given the following title and "
            "abstract, produce a concise summary (3-5 sentences) highlighting the "
            "main contributions, methodology, and significance.\n\n"
            f"Title: {title}\n\nAbstract: {abstract}\n\nSummary:"
        )
        response = self.llm(prompt)
        return {"summary": response.strip()}
