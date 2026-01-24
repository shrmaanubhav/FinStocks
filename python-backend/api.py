"""
FinStocks FastAPI Backend
Handles all business logic, PDF parsing, LLM integrations, and data processing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import yfinance as yf
import pandas as pd
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
from services.portfolio import portfolio_summary_from_form, portfolio_summariser
from services.news import news_extractor
from classes import UsageClassfier

load_dotenv()

app = FastAPI(
    title="FinStocks API",
    description="AI-powered financial intelligence for Indian retail investors",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.environ.get("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic Models ==============

class PersonalInfo(BaseModel):
    name: str
    age: str
    pan: str
    phone: str


class FinancialInfo(BaseModel):
    address: str
    income: str
    expenditure: str
    maritalStatus: str
    children: str


class StockHolding(BaseModel):
    symbol: str
    quantity: str


class OnboardingRequest(BaseModel):
    userId: str
    personalInfo: PersonalInfo
    financialInfo: FinancialInfo
    lifestyle: str
    stocks: Optional[List[StockHolding]] = None


class HealthFactor(BaseModel):
    name: str
    score: int
    max_score: int
    status: str  # excellent, good, warning, critical
    description: str


class PortfolioHealthResponse(BaseModel):
    overall_score: int
    factors: List[HealthFactor]
    last_updated: str


class NewsItem(BaseModel):
    id: str
    title: str
    hinglish_summary: str
    related_stock: str
    sentiment: str  # positive, negative, neutral
    source: str
    time_ago: str
    impact: str  # high, medium, low


class HinglishNewsResponse(BaseModel):
    news: List[NewsItem]


class RiskSignal(BaseModel):
    id: str
    type: str  # concentration, overlap, volatility, sector, liquidity
    severity: str  # high, medium, low
    title: str
    description: str
    affected_stocks: List[str]
    recommendation: str


class RiskSignalsResponse(BaseModel):
    signals: List[RiskSignal]


class PDFParseResponse(BaseModel):
    success: bool
    holdings: List[Dict[str, Any]]
    source_type: str  # demat, bank, broker
    parsed_date: str


class StocksRequest(BaseModel):
    stocks: List[str]


class PortfolioAnalyzeRequest(BaseModel):
    name: Optional[str] = ""
    age: Optional[int] = None
    phone: Optional[str] = ""
    address: Optional[str] = ""
    incomeRange: Optional[str] = ""
    expenditureRange: Optional[str] = ""
    maritalStatus: Optional[str] = ""
    children: Optional[int] = None
    holdings: List[Dict[str, Any]] = Field(default_factory=list)
    lifestyle: Optional[str] = ""
    onboardingCompleted: Optional[bool] = None
    createdAt: Optional[Dict[str, Any]] = None
    updatedAt: Optional[Dict[str, Any]] = None
    job_type: Optional[str] = ""
    job: Optional[str] = ""
    monthly_income: Optional[float] = None
    side_income: Optional[float] = None
    investment_goal: Optional[str] = ""
    investment_duration: Optional[str] = ""
    risk_preference: Optional[float] = None
    investing_years: Optional[int] = None
    retirement_age: Optional[int] = None
    martial_status: Optional[str] = ""
    stocks: List[str] = Field(default_factory=list)


class NewsStocksRequest(BaseModel):
    stocks: List[str]
    limit: Optional[int] = 10


# ============== In-Memory Storage (Replace with Supabase in production) ==============

users_db: Dict[str, Dict] = {}
holdings_db: Dict[str, List[Dict]] = {}


# ============== API Endpoints ==============

@app.get("/")
async def root():
    return {
        "message": "FinStocks API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ---------- Onboarding Endpoints ----------

@app.post("/api/onboarding")
async def submit_onboarding(data: OnboardingRequest):
    """Submit user onboarding data"""
    try:
        # Store user data
        
        users_db[data.userId] = {
            "personal_info": data.personalInfo.dict(),
            "financial_info": data.financialInfo.dict(),
            "lifestyle": data.lifestyle,
            "onboarded_at": datetime.now().isoformat()
        }
        
        # Store holdings if provided
        if data.stocks:
            holdings_db[data.userId] = [
                {"symbol": s.symbol.upper(), "quantity": int(s.quantity), "source": "manual"}
                for s in data.stocks if s.symbol and s.quantity
            ]
        
        return {"success": True, "userId": data.userId}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/onboarding/upload-pdf")
async def upload_pdf(
    userId: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload and parse a PDF statement (bank/demat)"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        # Read file content
        content = await file.read()
        
        # TODO: Implement actual PDF parsing using PyPDF2 or pdfplumber
        # For now, return mock data
        mock_holdings = [
            {"symbol": "RELIANCE", "quantity": 50, "name": "Reliance Industries Ltd"},
            {"symbol": "TCS", "quantity": 30, "name": "Tata Consultancy Services"},
            {"symbol": "HDFCBANK", "quantity": 80, "name": "HDFC Bank Ltd"},
            {"symbol": "INFY", "quantity": 60, "name": "Infosys Ltd"},
        ]
        
        # Store holdings
        holdings_db[userId] = [
            {"symbol": h["symbol"], "quantity": h["quantity"], "source": "pdf_upload"}
            for h in mock_holdings
        ]
        
        return PDFParseResponse(
            success=True,
            holdings=mock_holdings,
            source_type="demat",
            parsed_date=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Stocks Data Endpoints ----

@app.post("/api/myStocks")
async def stock_data(payload: StocksRequest):
    print('\n', "Gathering the stock data of stocks.\n")

    stocks = [s.strip().upper() for s in payload.stocks if s and s.strip()]
    if not stocks:
        raise HTTPException(status_code=400, detail="stocks must be a non-empty array of symbols")

    stock_data_map: Dict[str, Any] = {}

    for stock in stocks:
        try:
            df = yf.download(stock, period="1y", interval="1wk", progress=False)
            if df.empty:
                stock_data_map[stock] = {"error": {"message": "No data returned"}}
                continue

            df.dropna(inplace=True)

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            df.reset_index(inplace=True)
            if "Date" in df.columns:
                df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")

            stock_data_map[stock] = df.to_dict(orient="records")
        except Exception as e:
            stock_data_map[stock] = {"error": {"message": str(e)}}

    return {"stocks": stock_data_map}


# ---------- Portfolio Endpoints ----------

@app.get("/api/portfolio/health", response_model=PortfolioHealthResponse)
async def get_portfolio_health(userId: str):
    """Get portfolio health score and analysis"""
    
    # TODO: Implement actual analysis using LangGraph pipeline
    # For now, return mock data
    
    factors = [
        HealthFactor(
            name="Diversification",
            score=18,
            max_score=25,
            status="good",
            description="Your portfolio spans 6 sectors. Consider adding more exposure to healthcare and consumer goods."
        ),
        HealthFactor(
            name="Volatility",
            score=15,
            max_score=25,
            status="warning",
            description="High exposure to volatile mid-caps. 35% of holdings show beta > 1.5"
        ),
        HealthFactor(
            name="Overlap",
            score=22,
            max_score=25,
            status="excellent",
            description="Minimal duplicate holdings across your mutual funds and direct equity."
        ),
        HealthFactor(
            name="Cash Exposure",
            score=17,
            max_score=25,
            status="good",
            description="12% cash allocation. Slightly high for current market conditions."
        ),
    ]
    
    overall = sum(f.score for f in factors)
    
    return PortfolioHealthResponse(
        overall_score=overall,
        factors=factors,
        last_updated="2 hours ago"
    )


@app.get("/api/portfolio/risks", response_model=RiskSignalsResponse)
async def get_risk_signals(userId: str):
    """Get risk signals and warnings"""
    
    signals = [
        RiskSignal(
            id="1",
            type="concentration",
            severity="high",
            title="High Single-Stock Concentration",
            description="HDFCBANK represents 10.4% of your portfolio, which is above the recommended 8% threshold for individual stocks.",
            affected_stocks=["HDFCBANK"],
            recommendation="Consider reducing position size or adding more diversified holdings."
        ),
        RiskSignal(
            id="2",
            type="overlap",
            severity="medium",
            title="Duplicate Holdings Detected",
            description="RELIANCE appears in both your direct equity and 2 of your mutual funds, creating 15% effective exposure.",
            affected_stocks=["RELIANCE"],
            recommendation="Review your mutual fund holdings to avoid unintended concentration."
        ),
        RiskSignal(
            id="3",
            type="sector",
            severity="medium",
            title="Sector Overweight: Banking",
            description="18% allocation to Banking sector. Market cap exposure is skewed towards large-cap financials.",
            affected_stocks=["HDFCBANK", "ICICIBANK"],
            recommendation="Consider adding exposure to other sectors like healthcare or consumer goods."
        ),
        RiskSignal(
            id="4",
            type="volatility",
            severity="low",
            title="High Beta Holdings",
            description="TATAMOTORS has a beta of 1.8, contributing to overall portfolio volatility.",
            affected_stocks=["TATAMOTORS"],
            recommendation="If risk-averse, consider balancing with low-beta dividend stocks."
        ),
    ]
    
    return RiskSignalsResponse(signals=signals)


@app.post("/api/portfolio/analyze")
async def analyze_portfolio(payload: PortfolioAnalyzeRequest):
    """Trigger a new portfolio analysis based on onboarding form data"""
    try:
        payload_data = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        state = UsageClassfier(
            user_query="",
            usage="invalid",
            age=payload_data.get("age"),
            job_type=payload_data.get("job_type") or "",
            job=payload_data.get("job") or "",
            monthly_income=payload_data.get("monthly_income"),
            side_income=payload_data.get("side_income"),
            investment_goal=payload_data.get("investment_goal") or "",
            investment_duration=payload_data.get("investment_duration") or "",
            risk_preference=payload_data.get("risk_preference"),
            investing_years=payload_data.get("investing_years"),
            retirement_age=payload_data.get("retirement_age"),
            martial_status=payload_data.get("martial_status") or payload_data.get("maritalStatus") or "",
            children=payload_data.get("children"),
            stocks=payload_data.get("stocks") or [],
        )
        summary_state = portfolio_summariser(state)
        return {
            "profile": payload_data,
            "portfolio": summary_state.get("portfolio"),
            "stocks": summary_state.get("stocks"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- News Endpoints ----------

@app.post("/api/news")
async def get_hinglish_news(payload: NewsStocksRequest):
    """Get news summaries per stock symbol"""
    stocks = [s.strip().upper() for s in payload.stocks if s and s.strip()]
    if not stocks:
        raise HTTPException(status_code=400, detail="stocks must be a non-empty array of symbols")

    state: AppState = {
        "usage": "invalid",
        "user_query": "",
        "stocks": stocks,
        "portfolio": "",
        "news": "",
        "news_dict": {},
        "market_news": "",
        "macro_economics": "",
        "macro_economics_dict": {},
        "market_trends": "",
        "advice": "",
        "strategy": "",
        "final_proposal": "",
    }

    state = news_extractor(state, limit=payload.limit or 10)
    return {"stocks": state.get("news_dict", {})}


@app.get("/api/news/stock/{symbol}", response_model=HinglishNewsResponse)
async def get_stock_news(symbol: str):
    """Get news for a specific stock"""
    # Filter news for specific stock
    all_news = await get_hinglish_news("", 20)
    filtered = [n for n in all_news.news if n.related_stock.upper() == symbol.upper()]
    return HinglishNewsResponse(news=filtered)


# ---------- Advice & Strategy Endpoints ----------

@app.get("/api/advice")
async def get_advice(userId: str):
    """Get AI-generated advice using LangGraph pipeline"""
    
    # TODO: Integrate with the existing LangGraph pipeline
    # This would call the advice generation workflow
    
    return {
        "advice": "Based on your portfolio analysis, consider rebalancing your IT sector exposure. The current allocation of 15% is slightly high given the sector headwinds. You might want to diversify into defensive sectors like FMCG or Pharma.",
        "type": "advice"
    }


@app.get("/api/strategy")
async def get_strategy(userId: str):
    """Get strategy recommendations"""
    
    return {
        "strategy": "Your portfolio shows a growth-oriented bias with high beta stocks. For your risk profile and investment horizon, consider a barbell strategy.",
        "recommendations": [
            "Reduce TATAMOTORS position by 30% to manage volatility",
            "Add 5% allocation to a large-cap pharma stock like Sun Pharma",
            "Consider SIP in a balanced advantage fund for automatic rebalancing",
            "Maintain 10% cash for opportunistic buying during corrections"
        ]
    }


# ---------- Market Data Endpoints ----------

@app.get("/api/market/macro")
async def get_macro_data():
    """Get macro economic indicators"""
    return {
        "gdp_growth": "6.5%",
        "inflation": "5.2%",
        "repo_rate": "6.5%",
        "fii_net": "+₹2,500 Cr",
        "dii_net": "+₹3,200 Cr",
        "vix": 13.5,
        "nifty_pe": 22.8,
        "market_sentiment": "Bullish"
    }


@app.get("/api/market/trends")
async def get_trends():
    """Get market trends"""
    return {
        "top_gainers": ["TATAMOTORS", "ADANIPORTS", "BAJFINANCE"],
        "top_losers": ["INFY", "TCS", "WIPRO"],
        "sector_performance": {
            "IT": -1.2,
            "Banking": 0.8,
            "Auto": 2.5,
            "Pharma": 0.3,
            "FMCG": 0.1
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
