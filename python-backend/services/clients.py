import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
import finnhub

load_dotenv()

MODEL = "llama-3.1-8b-instant"

llm = ChatGroq(
    temperature=0,
    model_name=MODEL,
    api_key=os.environ.get("GROQ_API_KEY"),
)

FIN_CLIENT = finnhub.Client(api_key=os.environ.get("FINNHUB_API"))
