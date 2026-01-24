from typing import List

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from classes import UsageClassfier
from services.clients import llm


class StocksOnly(BaseModel):
    stocks: List[str] = Field(default_factory=list)


def stock_extractor(state: UsageClassfier) -> UsageClassfier:
    print('\n', "Extracting stock symbols from user query.\n")

    prompt = """
    Extract the symbols of any stocks mentioned in the user's query.

    Return only JSON output with these exact fields:
    - `stocks`: A list of stock **symbols** (e.g., ["AAPL", "GOOGL"])

    If no stocks are mentioned, return an empty list.
    """

    extractor_llm = llm.with_structured_output(StocksOnly)
    extraction = extractor_llm.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=state.user_query.strip())
    ])

    print("Stocks:", extraction.stocks, '\n')
    state.stocks = extraction.stocks
    return state
