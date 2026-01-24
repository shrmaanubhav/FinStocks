from datetime import datetime, timedelta

import pandas as pd
from langchain_core.messages import HumanMessage

from classes import AppState
from services.clients import FIN_CLIENT, llm


# Node News Extractor for every stock present in the users query
def news_extractor(state: AppState, limit = 10) -> AppState:
    print('\n', "Extracting News on User's stocks\n")

    stocks = state['stocks']
    news_dict = {}
    DF = pd.DataFrame(columns=["stock", "summary"])
    today = datetime.today().strftime('%Y-%m-%d')
    one_week_ago = (datetime.today() - timedelta(days=7)).strftime('%Y-%m-%d')

    for stock in stocks:
        data = FIN_CLIENT.company_news(stock, _from=one_week_ago, to= today)
        final = []
        for i in data[:limit]:
            final.append({'stock': stock, 'summary': i['summary']})

        temp = pd.DataFrame(final)
    
        DF = pd.concat([DF, temp], ignore_index=True)

    news_text = ""
    for stock, row in list(DF.iterrows()):
        if row['stock'] not in news_dict:
            news_dict[row['stock']] = [row['summary']]
        else:
            news_dict[row['stock']].append(row['summary'])

        news_text += f"{row['stock']}\n{row['summary']}\n---\n"

    # print(news_dict)
    state['news'] = news_text
    state['news_dict'] = news_dict
    return state


def news_report(state: AppState) -> AppState:
    print('\n', "Generating News Report with sentiments based on the extracted News.\n")

    prompt = f"""

Choose a combined sentiment that best represents these news articles:

    ```
    {state['news']}
    ```

    Each article is separated by `---`.

    Go through each news summary for that particular stock and give a sentiment vlaue between -1 to 1 where sentiment_score_definition: 
    x <= -0.35: Bearish; 
    -0.35 < x <= -0.15: Somewhat-Bearish; 
    -0.15 < x < 0.15: Neutral; 
    0.15 <= x < 0.35: Somewhat_Bullish; 
    x >= 0.35: Bullish

    Reply only with the sentiment and a short explanation (1-2 sentences) of why. 
    Format your answer for each stock in {state['stocks']} like this:
    
    ------
    STOCK (Companies Full Name) : SENTIMENT (with value x)

    `your responce from next line`
    ------

    When creating your answer, focus on answering the user query:
    {state["user_query"]}
    """

    response = llm.invoke([HumanMessage(prompt)])
    state["market_news"] = response.content

    # print(response.content)

    return state
