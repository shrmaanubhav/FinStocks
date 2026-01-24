import json
import re

from langchain_core.messages import HumanMessage

from classes import AppState
from services.clients import llm


def advice(state: AppState) -> AppState:
    print('\n', "Generating the Advice the user is looking for.\n")

    prompt = f"""
    You are a leading financial strategist with deep domain expertise in equity markets, valuation modeling, macroeconomic forecasting, and technical analysis.
    Generate structured, concise, and actionable advice for the stocks {state['stocks']} based on the data provided.

    Economic Data for each Stock:
    ```
    {state['macro_economics']}
    ```

    Market News for each Stock separated by "------":
    ```
    {state['market_news']}
    ```

    Return only valid JSON with this exact schema:
    {{
      "summary": "short English summary (1-2 lines)",
      "global_risk": "low|medium|high",
      "stocks": [
        {{
          "symbol": "AAPL",
          "company_name": "Apple Inc.",
          "overall_recommendation": "BUY|HOLD|SELL",
          "confidence": 0-100,
          "trend": "bullish|neutral|bearish",
          "risk_level": "low|medium|high",
          "reasons": ["short bullet 1", "short bullet 2", "short bullet 3"],
          "full_advice": "well-reasoned, evidence-backed advice with facts and proof points",
          "tips": ["short tip 1", "short tip 2"],
          "time_horizon": {{
            "today": {{
              "recommendation": "BUY|HOLD|SELL",
              "confidence": 0-100,
              "target_range": "e.g. 250-260"
            }},
            "three_days": {{
              "recommendation": "BUY|HOLD|SELL",
              "confidence": 0-100,
              "target_range": "e.g. 255-265"
            }},
            "one_week": {{
              "recommendation": "BUY|HOLD|SELL",
              "confidence": 0-100,
              "target_range": "e.g. 270-280"
            }}
          }},
          "risk_meter": {{
            "label": "low|medium|high",
            "score": 0-100
          }},
          "confidence_meter": {{
            "score": 0-100
          }}
        }}
      ]
    }}

    Keep reasons short and avoid long paragraphs. Do not include markdown or extra text.
    """

    response = llm.invoke([HumanMessage(prompt)])
    raw = response.content

    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if not match:
        raise ValueError("No valid JSON object found in LLM response.")

    json_str = match.group(0)
    state['advice'] = json.loads(json_str)
    return state


def advice_data(state: AppState) -> AppState:
    print('\n', "Generating the Advice the user is looking for.\n")

    adv = ""
    prompt = f"""



    You are a leading financial strategist with deep domain expertise in equity markets, valuation modeling, macroeconomic forecasting, and technical analysis. You are tasked with delivering a thorough investment analysis of the stocks {state['stocks']} based on the full set of financial data, technical indicators, and recent performance.

    Economic Data for each Stock:
    ```
    {state['macro_economics']}
    ```

    You are also provided with overall Market News for each Stock seprated by "------":
    ```
    {state['market_news']}
    ```

    Create appropriate advice for user for the coming Day, coming 3 Days and for the coming Week to {state['user_query']} with proper reasoning.
    and store it in a variable {adv}
    Return the output in this format:

    {{
    <stock> : {{
    <Day1> : <predicted stock price for next Day>,
    <Day3> : <predicted stock price for 3rd Day>,
    <Day7> : <predicted stock price for 7th Day>,
    <date_time> : <current date and time, DD-MM-YYYY HH-MM>
    }}

    <advice> : {adv}
    }}

    Return only the JSON object, no text, code or anything. Plain JSON obeject.
    """

    try:
        response = llm.invoke([HumanMessage(prompt)])
        raw = response.content

        # # Debug: print raw output
        # print("\nRAW LLM OUTPUT:\n", raw[:300], "...\n")

        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if not match:
            raise ValueError("No valid JSON object found in LLM response.")

        json_str = match.group(0)
        a = json.loads(json_str)

        state['advice'] = a
        return state

    except Exception as e:
        print("Error inside advice_data:", e)
        raise e
