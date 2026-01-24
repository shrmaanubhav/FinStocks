from langchain_core.messages import HumanMessage, SystemMessage

from classes import AppState, UsageClassfier
from services.clients import llm


# Node adivce or strategy extracter
def usage_extractor(state: UsageClassfier) -> UsageClassfier:
    print('\n', "Determining whether the user wants advice, strategy, or neither.\n")

    prompt = """
    Classify the user's query into one of the following intents and also retrieve the symbols of any stocks mentioned in the query as a list, else the list is empty:

    1. "advice" if the user is asking:
    - whether to buy/sell/hold a stock
    - about the future of a specific company or sector
    - for stock recommendations
    - about price movements
    - if it is the right time to invest in a company/sector
    - indirect questions like "Should I look into Microsoft?" or "Can I enter the tech sector?"

    2. "strategy" if the user is asking:
    - direct mention of strategy, roadmap, or plan
    - how to start investing
    - about investment duration or long-term goals
    - about portfolio structuring, risk allocation, or retirement planning

    3. "invalid" if the query is unrelated to investing or not understandable

    Return only JSON output with these exact fields:
    - `usage`: One of "advice", "strategy", or "invalid"
    - `stocks`: A list of stock **symbols** (e.g., ["AAPL", "GOOGL"]), extracted from the companies mentioned
    """

    usage_llm = llm.with_structured_output(UsageClassfier)
    extraction = usage_llm.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=state.user_query.strip())
    ])

    new_state = AppState()
    print("Extracted usage:", extraction.usage, '\n')
    print("Stocks:", extraction.stocks, '\n')
    state.usage = extraction.usage
    state.stocks = extraction.stocks
    return state


def usage_check(state: AppState):
    if (state['usage'] == 'advice'):
        return "advice"
    elif (state['usage'] == 'strategy'):
        return "strategy"
    else:
        return "invalid"
