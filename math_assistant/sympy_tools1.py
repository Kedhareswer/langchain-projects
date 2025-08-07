# sympy_tools.py
from sympy import symbols, diff, integrate, sympify, latex
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class DerivativeArgs(BaseModel):
    expression: str = Field(..., description="A valid SymPy expression, e.g. 'sin(x)*x**2'")

class SympyDerivativeTool(BaseTool):
    name: str = "sympy_derivative"
    description: str = (
        "Use this to symbolically differentiate a SymPy expression. "
        "Returns JSON: {derivative: str, latex: str}."
    )
    args_schema: type = DerivativeArgs

    def _run(self, args: DerivativeArgs) -> dict:
        x = symbols('x')
        expr = sympify(args.expression)
        deriv = diff(expr, x)
        return {"derivative": str(deriv), "latex": latex(deriv)}

    async def _arun(self, args: DerivativeArgs) -> dict:
        raise NotImplementedError

class IntegralArgs(BaseModel):
    expression: str = Field(..., description="A valid SymPy expression, e.g. 'x**3'")

class SympyIntegralTool(BaseTool):
    name: str = "sympy_integral"
    description: str = (
        "Use this to symbolically integrate a SymPy expression. "
        "Returns JSON: {integral: str, latex: str}."
    )
    args_schema: type = IntegralArgs

    def _run(self, args: IntegralArgs) -> dict:
        x = symbols('x')
        expr = sympify(args.expression)
        integ = integrate(expr, x)
        return {"integral": str(integ), "latex": latex(integ)}

    async def _arun(self, args: IntegralArgs) -> dict:
        raise NotImplementedError
