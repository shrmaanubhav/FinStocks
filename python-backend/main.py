from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict, Literal
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os

import warnings
import random
import streamlit as st

from stocks import *
from classes import *
from utils import *

warnings.filterwarnings("ignore")

load_dotenv()
MODEL = "llama-3.1-8b-instant"

llm = ChatGroq(
    temperature=0,
    model_name=MODEL,
    api_key=os.environ.get("GROQ_API_KEY"),
)



graph = StateGraph(UsageClassfier)
graph.support_multiple_edges = True


graph.add_node("User Usage", usage_extractor)
graph.add_node("News Analysis", news_extractor)
graph.add_node("Economy Analysis", macro_economic)
graph.add_node("Market Trends", market_trends)
graph.add_node("Advice Generation", advice)
graph.add_node("Strategy Generation", strategy)

graph.add_conditional_edges("Market Trends", usage_check, {
    "advice": "Advice Generation",
    "strategy": "Strategy Generation"
})

graph.add_edge("User Usage", "News Analysis")
graph.add_edge("User Usage", "Economy Analysis")
graph.add_edge("News Analysis", "Market Trends")
graph.add_edge("Economy Analysis", "Market Trends")

graph.set_entry_point("User Usage")
graph.set_finish_point("Advice Generation")  

app = graph.compile()


# png_graph = app.get_graph().draw_mermaid_png()

# with open("Pipeline.png", "wb") as f:
#     f.write(png_graph)


#App Title
st.markdown("<h1 style='text-align: center; color: #4CAF50;'>📈 Stock Advice & Strategy Assistant</h1>", unsafe_allow_html=True)

st.markdown("---")

from style import *
st.markdown(styling,
    unsafe_allow_html=True
)

# Enhanced Action Buttons UI
st.markdown("""
    <style>
    .centered-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    .stButton > button {
        font-size: 1.5rem !important;
        padding: 1.2em 2.5em !important;
        border-radius: 10px !important;
        font-weight: 700 !important;
        background: linear-gradient(90deg, #4CAF50 0%, #2196F3 100%) !important;
        color: white !important;
        box-shadow: 0 4px 16px rgba(76,175,80,0.15);
        margin: 0 1rem;
    }
    </style>
    <div class="centered-buttons">
        <div id="advice-btn"></div>
        <div id="strategy-btn"></div>
    </div>
""", unsafe_allow_html=True)

col1, col2 = st.columns([1,1], gap="large")
with col1:
    advice_btn = st.button("💡 Advice", key="advice-btn")
with col2:
    strategy_btn = st.button("🧭 Strategy", key="strategy-btn")

if advice_btn:
    st.session_state.usage = "advice"
    st.session_state.state = UsageClassfier(usage="advice", user_query= "")
elif strategy_btn:
    st.session_state.usage = "strategy"
    st.session_state.state = UsageClassfier(usage="strategy", user_query= "")


if "usage" in st.session_state and st.session_state.usage == "strategy":
    st.markdown("---")
    st.markdown("### 📊 Provide Your Portfolio Details")
    portfolio_query = st.text_area("🗂️ Your Portfolio Information", height=200)

    if st.button("🧠 Strategize"):
        if portfolio_query:
            state = UsageClassfier(user_query=portfolio_query)
            state = portfolio_summariser(portfolio_builder(state))
            st.success("📄 Portfolio Summary")
            st.markdown(f"<div class='highlight-box'>{state['portfolio']}</div>", unsafe_allow_html=True)
            stocks = random.choices(list(NASDAQ), k = 4)

            if (len(state['stocks']) != 0):
                state['stocks'] = state['stocks'] + stocks
                print(type(state['stocks']), state['stocks'])
            else:
                state['stocks'] = stocks
                print(type(state['stocks']), state['stocks'])

            st.info(f"📌 Selected Stocks: `{state['stocks']}`")
            state = run_parallel_news_and_macro(state)

            state = market_trends(state)
            st.markdown("### 🗞️ Market News Sentiment")
            st.code(state['market_news'])

           
            st.markdown("### 📈 Market Trends")
            st.code(state['market_trends'])

            state = strategy(state)
            st.markdown("### 🧭 Personalized Strategy")
            st.code(state['strategy'])

elif "usage" in st.session_state and st.session_state.usage == "advice":
    st.markdown("---")
    st.markdown("### 🧾 Enter Your Query")
    user_query = st.text_input("💬 Example: 'Advice related to NVIDIA Stocks' or 'Give me trading strategy based on my portfolio'")
    st.markdown('<div class="get-solution-center">', unsafe_allow_html=True)
    get_solution = st.button("🚀 Get Solution")
    st.markdown('</div>', unsafe_allow_html=True)

    if get_solution:
            state = UsageClassfier(user_query=user_query)
            state = usage_extractor(state)
            state = AppState(user_query= state.user_query, stocks= state.stocks)
            st.markdown(f"<div class='stock-detected'>📌 Stocks Detected: {state['stocks']}</div>", unsafe_allow_html=True)
            
            state = run_parallel_news_and_macro(state)

            
            
            st.markdown("### 📰 News Sentiment")
            st.code(state['market_news'])

            try:
                state = market_trends(state)

                st.markdown("### 🔍 Market Trends")
                st.code(state['market_trends'])

                state = advice(state)
                st.markdown("### 💡 Expert Advice")
                st.code(state['advice'])

            except:
                st.markdown("### ! Error in Fetching This Stock or This Stock is not listed on NASDAQ")
                


elif "usage" in st.session_state and st.session_state.usage == "invalid":
    st.error("❗ Your query seems unrelated to financial advice or strategy.")