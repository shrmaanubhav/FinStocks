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

    Give strategy specific to user of how to distribute his portfolio into these {state['stocks']} stocks appropriately to gain maximum returns, with minimal risks 
    with proper reasoning.
    """

    responce = llm.invoke([HumanMessage(prompt)])
    state['strategy']  = responce.content
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
