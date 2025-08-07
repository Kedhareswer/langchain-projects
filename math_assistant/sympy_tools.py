# sympy_tools.py
from sympy import symbols, diff, integrate, sympify, latex
from langchain.tools import Tool

def compute_derivative(expr_str: str) -> dict:
    x = symbols("x")
    expr = sympify(expr_str)
    deriv = diff(expr, x)
    return {
        "derivative": str(deriv),
        "latex": latex(deriv)
    }

def compute_integral(expr_str: str) -> dict:
    x = symbols("x")
    expr = sympify(expr_str)
    integral = integrate(expr, x)
    return {
        "integral": str(integral),
        "latex": latex(integral)
    }

sympy_derivative_tool = Tool(
    name="sympy_derivative",
    func=compute_derivative,
    description="Use to differentiate a SymPy-compatible expression with respect to x"
)

sympy_integral_tool = Tool(
    name="sympy_integral",
    func=compute_integral,
    description="Use to compute the integral of a SymPy-compatible expression with respect to x"
)
