from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict, Literal
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os

import warnings, time
import pandas as pd
import numpy as np
import random
import streamlit as st

from stocks import *
from classes import *
from utils import *

warnings.filterwarnings("ignore")

s = time.perf_counter()
load_dotenv()
MODEL = "llama-3.1-8b-instant"

llm = ChatGroq(
    temperature=0,
    model_name=MODEL,
    api_key=os.environ.get("GROQ_API_KEY"),
)

data = pd.read_csv("DATA3.csv", index_col=False, usecols= ['Query','Stock', 'Day1', 'Day3', 'Day7', 'Date Time', 'Advice'])
e = time.perf_counter()

print(s-e)

start = time.perf_counter()

for q in advice_queries[:10]:
    print(q,'\n')
    try:
        state = UsageClassfier(user_query=q, usage='advice')
        state = usage_extractor(state)
        state = AppState(user_query= state.user_query, stocks= state.stocks, usage='advice')
        #state = market_trends(macro_economic(news_report(news_extractor(state, 3))))
        
        state = run_parallel_news_and_macro(state)

        # Debug: verify fields exist
        print("macro_economics in state:", 'macro_economics' in state)
        print("market_news in state:", 'market_news' in state)

        # Now safe to call
        state = advice_data(state)

        if 'advice' not in state:
            print("Skipping due to missing advice.")
            continue

        info = state['advice']

        stocks = list(info.keys())
        for stock in stocks[:-1]:
            new_row = {"Query" : q, "Stock": stock, 'Day1' : info[stock]['Day1'], 'Day3' : info[stock]['Day3'], 'Day7' : info[stock]['Day7'], 'Date Time' : info[stock]['date_time'], "Advice" : info['advice']}
            data = pd.concat([data, pd.DataFrame([new_row])], ignore_index=True)
            data.to_csv("DATA3.csv")

    except Exception  as e:
        print('ERROR: ', e)
        break
        new_row = {"Query" : q, "Stock": "NULL", 'Day1' : "NULL", 'Day3' : "NULL", 'Day7' : "NULL", 'Date Time' : "NULL", "Advice" : "NULL"}
        data = pd.concat([data, pd.DataFrame([new_row])], ignore_index=True)
        data.to_csv("DATA2.csv")

    
end = time.perf_counter()

print('Time: ', end-start)
