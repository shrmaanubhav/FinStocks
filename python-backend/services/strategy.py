import json
import re

from langchain_core.messages import HumanMessage

from classes import AppState
from services.clients import llm


def strategy(state: AppState) -> AppState:
    print('\n', "Generating the Strategy the user is looking for.\n")

    prompt = f"""



    You are a leading financial strategist with deep domain expertise in equity markets, valuation modeling, macroeconomic forecasting, and technical analysis. You are tasked with delivering a thorough investment analysis of the stocks {state['stocks']} based on the full set of financial data, technical indicators, and recent performance.
    The investor has asked the following:

    "{state['user_query']}"

    Economic Data for each Stock:
    ```
    {state['macro_economics']}
    ```

    You are also provided with overall Market News for each Stock seprated by "------":
    ```
    {state['market_news']}
    ```

    Now focusing on User's Portfolio:
    ```
    {state['portfolio']}
    ```

    Transform the strategy into structured JSON optimized for UI. Return only valid JSON with this exact schema:
    {{
      "investorProfile": {{
        "name": "",
        "age": 0,
        "familyStatus": "",
        "incomeRange": "",
        "expenseRange": "",
        "profession": "",
        "riskProfile": "",
        "experienceLevel": ""
      }},
      "portfolio": {{
        "totalStocks": 0,
        "holdings": [
          {{
            "symbol": "",
            "quantity": 0,
            "allocationPercent": 0,
            "trend": "bullish|neutral|bearish",
            "sentimentScore": 0.0
          }}
        ]
      }},
      "portfolioCharts": {{
        "allocationPieChart": [
          {{ "symbol": "", "value": 0 }}
        ],
        "sentimentBarChart": [
          {{ "symbol": "", "score": 0.0 }}
        ]
      }},
      "marketSentiment": {{
        "overallMood": "Bullish|Neutral|Bearish",
        "stocks": [
          {{ "symbol": "", "trend": "bullish|neutral|bearish", "confidence": 0.0 }}
        ]
      }},
      "recommendedPortfolio": {{
        "allocations": [
          {{ "symbol": "", "recommendedPercent": 0 }}
        ]
      }},
      "portfolioComparison": [
        {{ "symbol": "", "currentPercent": 0, "recommendedPercent": 0, "change": 0 }}
      ],
      "insights": [
        {{
          "symbol": "",
          "action": "increase|reduce|hold",
          "reasons": ["", "", ""]
        }}
      ],
      "riskAnalysis": {{
        "overallRisk": "Low|Medium|High",
        "stockRisks": [
          {{ "symbol": "", "riskLevel": "Low|Medium|High" }}
        ]
      }},
      "forecast": {{
        "today": [{{ "symbol": "", "action": "Buy|Hold|Sell|Reduce" }}],
        "3days": [{{ "symbol": "", "action": "Buy|Hold|Sell|Reduce" }}],
        "1week": [{{ "symbol": "", "action": "Buy|Hold|Sell|Reduce" }}]
      }},
      "actionPlan": [
        {{ "symbol": "", "action": "" }}
      ],
      "financialAdvice": [
        "", ""
      ]
    }}
    Use the user profile and portfolio details from this context:
    - User Query: {state['user_query']}
    - Portfolio Summary: {state['portfolio']}
    - Stocks: {state['stocks']}
    - Market News: {state['market_news']}
    - Macro Economics: {state['macro_economics']}
    """

    response = llm.invoke([HumanMessage(prompt)])
    raw = response.content

    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if not match:
        raise ValueError("No valid JSON object found in LLM response.")

    json_str = match.group(0)
    state['strategy'] = json.loads(json_str)
    return state


def strategy_data(state: AppState) -> AppState:
    print('\n', "Generating the Strategy the user is looking for.\n")

    prompt = f"""



    You are a leading financial strategist with deep domain expertise in equity markets, valuation modeling, macroeconomic forecasting, and technical analysis. You are tasked with delivering a thorough investment analysis of the stocks {state['stocks']} based on the full set of financial data, technical indicators, and recent performance.
    The investor has asked the following:

    "{state['user_query']}"

    Economic Data for each Stock:
    ```
    {state['macro_economics']}
    ```

    You are also provided with overall Market News for each Stock seprated by "------":
    ```
    {state['market_news']}
    ```

    Now focusing on User's Portfolio:
    ```
    {state['portfolio']}
    ```

    Give strategy specific to user of how to distribute his portfolio into these {state['stocks']} stocks appropriately to gain maximum returns, with minimal risks 
    with proper reasoning.
    """

    responce = llm.invoke([HumanMessage(prompt)])
    state['strategy']  = responce.content
    return state
