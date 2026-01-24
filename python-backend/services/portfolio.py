from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from classes import AppState, UsageClassfier
from services.clients import llm


class PortfolioSummary(BaseModel):
    financial_outlook: str
    retirement_strategy: str
    risk_assessment: str
    key_takeaways: List[str] = Field(default_factory=list)


def portfolio_summary_from_form(form_data: Dict[str, Any]) -> Dict[str, Any]:
    print('\n', "Summarizing the overall portfolio from form data\n")

    prompt = """Analyze the investor profile and return a JSON summary with:
    - financial_outlook
    - retirement_strategy
    - risk_assessment
    - key_takeaways (list of short bullets)

    Keep the summary concise, practical, and based only on the provided data."""

    usage_llm = llm.with_structured_output(PortfolioSummary)
    analysis = usage_llm.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=str(form_data)),
    ])

    analysis_data = analysis.model_dump() if hasattr(analysis, "model_dump") else analysis.dict()
    return {
        "profile": form_data,
        "analysis": analysis_data,
    }


# Node Portfolio Builder from the user Input
def portfolio_builder(state: UsageClassfier) -> UsageClassfier:
    print('\n', "Building the portfolio from user query\n")

    prompt = f"""
    Extract the following portfolio fields from the user's query.

    If a field is missing:
    - For string fields, set value to "" (empty string)
    - For int/float fields, set value to null / None

    Fields:
    - age (int): User's age, or infer average from phrases like "young", "middle-aged", "retired" or take a guess, from {state.user_query}. Else 30.
    - job_type (str): Classify as "private", "government", "semi private", "non profit", or "business". Else "private".
    - job (str): Job title or "Corporate Job".
    - monthly_income (float): Monthly primary income. If not stated, Find the average monthly salary of a decent corporate working individual.
    - side_income (float): Side income. Else 0
    - investment_goal (str): E.g., "retirement", "wealth building", etc. Else "wealth building".
    - investment_duration (str): E.g., "short term","12 years", "long term", etc. Else 10.
    - risk_preference (float): From 0 to 1. Estimate from phrases like:
        - "risk-averse", "low risk" ~0.2
        - "moderate" ~0.5
        - "aggressive", "high risk" ~0.8+
        Else 0.5.
    - investing_years (int): Years of experience investing, or 0.
    - retirement_age (int): Desired retirement age if mentioned, or Appropriate age for retirement ->55.
    - martial_status (str): "married", "single", "bachelor", etc. Else "single".
    - children (int): Number of children, or 0.
    - stocks (list): Add STOCKS SYMBOLS like 'AXP ' for American Express, if any interested stocks mentioned by user to existing stocks list.
    
    Return only structured output with these exact fields.
    """

    # Change structured model to AppState (not UsageClassfier) to receive all fields
    usage_llm = llm.with_structured_output(UsageClassfier)
    
    extraction = usage_llm.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=state.user_query)
    ])

    # Fill in fields explicitly into state
    state.age = extraction.age
    state.job_type = extraction.job_type or ""
    state.job = extraction.job or ""
    state.monthly_income = extraction.monthly_income
    state.side_income = extraction.side_income
    state.investment_goal = extraction.investment_goal or ""
    state.investment_duration = extraction.investment_duration or ""
    state.risk_preference = extraction.risk_preference
    state.investing_years = extraction.investing_years
    state.retirement_age = extraction.retirement_age
    state.martial_status = extraction.martial_status or ""
    state.children = extraction.children
    state.stocks = extraction.stocks or []

    # print(state)
    return state


# Node Portfolio Builder from the user Input
def portfolio_summariser(state: UsageClassfier) -> AppState:
    print('\n', "Summarizing the overall portfolio from user inputs\n")

    prompt = f"""Analyze the following investor profile and provide a summary including the finalncial outlook, retirement strategy, risk assessment:

    Personal Information:
    - Age: {state.age}
    - Job Type: {state.job_type}
    - Job Role: {state.job}
    - Marital Status: {state.martial_status}
    - Number of Children: {state.children or 0}
    - Years of Investing Experience: {state.investing_years or 0}
    - Planned Retirement Age: {state.retirement_age or 55}

    Financial Situation:
    - Monthly Income: â‚¹{(state.monthly_income or 0.0):.2f}
    - Side Income: â‚¹{(state.side_income or 0.0):.2f}
    - Total Monthly Income: â‚¹{((state.monthly_income or 0.0) + (state.side_income or 0.0)):.2f}
    Investment Objectives:
    - Investment Goal: {state.investment_goal}
    - Investment Duration: {state.investment_duration}
    - Risk Preference (0â€“1 scale): {state.risk_preference}
    """

    response = llm.invoke([HumanMessage(prompt)])

    new_state = AppState()
    new_state["usage"] = state.usage
    new_state["user_query"] = state.user_query
    new_state['portfolio'] = response.content
    new_state['stocks'] = state.stocks

    # print(new_state['portfolio'])
    return new_state
