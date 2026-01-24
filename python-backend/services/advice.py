import json
import re

from langchain_core.messages import HumanMessage

from classes import AppState
from services.clients import llm


def advice(state: AppState) -> AppState:
    print('\n', "Generating the Advice the user is looking for.\n")

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
    """

    responce = llm.invoke([HumanMessage(prompt)])
    state['advice']  = re.sub(r'\*\*', '', responce.content)
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
