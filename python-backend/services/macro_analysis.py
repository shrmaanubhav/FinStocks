import re

import pandas as pd
import pandas_ta as ta
import yfinance as yf
from langchain_core.messages import HumanMessage

from classes import AppState
from macro import macro_terms
from services.clients import FIN_CLIENT, llm


def macro_economic(state: AppState) -> AppState:
    print('\n', "Gathering the market data and other economics for stocks.\n")

    stocks = state["stocks"]
    macro_economic_dict = {}
    
    for stock in stocks:
        try:
            df = yf.download(stock, period="12mo", interval="1d")
            # print(df)

            df.dropna(inplace=True)

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)


            # Now apply RSI
            df["RSI"] = ta.rsi(df["Close"], length=14)

            macd = ta.macd(df["Close"])
            df["MACD_Line"] = macd["MACD_12_26_9"]
            df["MACD_Signal"] = macd["MACDs_12_26_9"]
            df["SMA_20"] = ta.sma(df["Close"], length=20)
            df["EMA_20"] = ta.ema(df["Close"], length=20)


            bbands = ta.bbands(df["Close"], length=20)
            df["BB_upper"]  = bbands["BBU_20_2.0"]
            df["BB_middle"] = bbands["BBM_20_2.0"]
            df["BB_lower"]  = bbands["BBL_20_2.0"]
            df["BB_bandwidth"] = bbands["BBB_20_2.0"]
            df["BB_percent"]   = bbands["BBP_20_2.0"]

            today = {}
            for idx, row in df.tail(1).iterrows():
                for col, val in row.items():
                    today[col] = val
            

            info = FIN_CLIENT.company_basic_financials(stock, 'all')
            economic = {
                category: {
                    fields[field]: info["metric"].get(field, None)  
                    for field in fields
                }
                for category, fields in macro_terms.items()
            }

            economic['Today'] = today
            macro_economic_dict[stock] = economic

        except Exception as e:
            macro_economic_dict[stock] = {"error": {"message": str(e)}}
            continue
        
    state['macro_economics_dict'] = macro_economic_dict
    
    return state 

    
def market_trends(state: AppState) -> AppState:
    print('\n', "Generating a detailed report based on Economics and News Sentiment.\n")

    stocks = state['stocks']
    economic_analysis = ""

    # state = macro_economic(state)

    for stock in stocks:
        # print(stock)
        economic = state.get('macro_economics_dict', {}).get(stock)
        economic_analysis += "----------------------\n"
        economic_analysis += (f"{stock}\n\n")

        if not economic:
            economic_analysis += "No macro economic data available.\n"
            economic_analysis += "----------------------\n"
            continue

        for main_key in economic:
            curr = ""
            curr += (f"{main_key} :\n")
            for k, v in economic[main_key].items():
                curr += (f"\t{k} : {v}\n")
            curr += "\n"

            economic_analysis += curr
        
        economic_analysis += "----------------------\n"
    
    # print(economic_analysis)
    state['macro_economics'] = economic_analysis

    prompt = f"""



    You are a leading financial strategist with deep domain expertise in equity markets, valuation modeling, macroeconomic forecasting, and technical analysis. You are tasked with delivering a thorough investment analysis of the stocks {state['stocks']} based on the full set of financial data, technical indicators, and recent performance.
    The investor has asked the following:

    "{state['user_query']}"

    Economic Data for each Stock:
    ```
    {economic_analysis}
    ```

    You are also provided with overall Market News for each Stock seprated by "------":
    ```
    {state['market_news']}
    ```


    Generate a well detailed report for each stock in {state['stocks']} using the provided information to evaluate across multiple dimensions â€” fundamentals, momentum, volatility, and sentiment â€” and provide a data-backed, forward-looking report so that the
    investers gets an idea how the market is Behaving and how the given stocks are performing in the market.

    - Start each stock report with a clear heading with the stock name(underlined) (e.g., APPLE INC (AAPL))
    - Fundamentals: Discuss valuation, profitability, efficiency, financial health, and return ratios
    - Momentum: Analyze technical indicators such as price returns, RSI, MACD, and moving averages
    - Volatility: Mention beta and any indicators of price variability or risk
    - Sentiment: Reflect market news and tone, if it suggests optimism or caution
    - Avoid giving recommendations. Just deliver a rich, data-backed analysis so the investor can understand the stock's behavior and positioning in the market.

    """

    response = llm.invoke([HumanMessage(prompt)])

    state['market_trends'] = re.sub(r'\*\*', '', response.content)

    return state
