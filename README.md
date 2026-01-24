# FinStocks - AI-Powered Financial Intelligence Platform

<div align="center">
  <img src="./frontend/public/images/logo/logo-dark.svg" alt="FinStocks Logo" width="200"/>
  
  **Your Portfolio's Medical Report**
  
  AI-driven financial intelligence platform for Indian retail investors
  
  [Live Demo](#) | [Documentation](#architecture) | [Contributing](#contributing)
</div>

---

## 🎯 Vision

FinStocks delivers a "Medical Report for Money" - comprehensive portfolio health scores and real-time Hinglish news updates designed specifically for Indian retail investors.

### Key Features

- **📊 Portfolio Doctor** - AI-powered health score with transparent factors: Diversification, Volatility, Overlap, and Cash Exposure
- **📰 Hinglish News Feed** - Real-time market updates in Hinglish, filtered for your specific holdings
- **⚠️ Risk Signals** - Visual indicators for concentration risks and duplicate holdings across funds
- **📄 Smart PDF Upload** - Upload bank/demat statements for automatic portfolio extraction
- **🤖 AI Advice** - Powered by LangGraph for intelligent investment insights

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Landing   │  │  Onboarding │  │  Dashboard  │              │
│  │    Page     │  │    Modal    │  │   (Main)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  Components: PortfolioDoctor | HinglishNewsFeed | RiskSignals   │
│                                                                  │
│  Auth: Clerk | Storage: Supabase | State: React Context         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ API Calls (fetch)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON BACKEND (FastAPI)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Portfolio │  │    News     │  │   Advice    │              │
│  │   Analysis  │  │  Processor  │  │   Engine    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  LangGraph Pipeline | PDF Parser | LLM Integration (Groq)       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐          │
│  │ Supabase│  │   Groq   │  │ Yahoo   │  │  News    │          │
│  │   (DB)  │  │  (LLM)   │  │ Finance │  │  APIs    │          │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (optional)

### 1. Clone the repository

```bash
git clone https://github.com/Soham-Donode/BitWise.git
cd BitWise
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

### 3. Backend Setup

```bash
cd python-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials:
# - GROQ_API_KEY
# - SUPABASE_URL
# - SUPABASE_KEY

# Start FastAPI server
python api.py
# Or with uvicorn:
uvicorn api:app --reload --port 8000
```

### 4. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `python-backend/docs/supabase_schema.sql`
3. Copy your project URL and anon key to environment variables

### 5. Using Docker (Alternative)

```bash
docker-compose up --build
```

## 📁 Project Structure

```
BitWise/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   └── (auth)/         # Auth pages (Clerk)
│   │   ├── components/
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   │   ├── PortfolioDoctor.tsx
│   │   │   │   ├── HinglishNewsFeed.tsx
│   │   │   │   ├── RiskSignals.tsx
│   │   │   │   ├── PortfolioOverview.tsx
│   │   │   │   └── SafetyDisclaimer.tsx
│   │   │   ├── onboarding/     # Onboarding modal
│   │   │   └── ui/             # Reusable UI components
│   │   ├── lib/
│   │   │   ├── api.ts          # API client
│   │   │   └── supabase.ts     # Supabase client
│   │   └── layout/             # Layout components
│   └── .env.example            # Environment template
│
├── python-backend/              # Python Backend
│   ├── api.py                  # FastAPI endpoints
│   ├── main.py                 # LangGraph pipeline
│   ├── services/               # Service modules
│   │   ├── advice.py
│   │   ├── news.py
│   │   ├── portfolio.py
│   │   └── strategy.py
│   ├── docs/
│   │   └── supabase_schema.sql # Database schema
│   └── requirements.txt
│
└── docker-compose.yml          # Docker configuration
```

## 🔐 Environment Variables

### Frontend (.env.local)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
# LLM
GROQ_API_KEY=gsk_...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# Optional
FINNHUB_API_KEY=...
NEWS_API_KEY=...
```

## 🎨 Design System

FinStocks uses a modern "Grok-style" dark theme with glassmorphism effects:

- **Primary**: Brand Blue (`#465fff`)
- **Accent**: Purple (`#7c3aed`)
- **Success**: Emerald (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Components

All components are built with:

- TailwindCSS v4
- Glassmorphism effects
- Smooth transitions
- Dark mode first

## ⚠️ Important Disclaimer

> **FinStocks provides intelligence and summaries only. We do not offer personalized buy/sell investment advice.**

- Not SEBI Registered: FinStocks is not a registered investment advisor
- AI-Generated: Portfolio scores and news summaries are generated by AI
- Consult a Professional: Always consult a SEBI-registered financial advisor
- Investment Risk: Investments in securities are subject to market risks

## 🛣️ Roadmap

- [x] Landing Page with FinStocks branding
- [x] 3-step onboarding modal
- [x] Portfolio Doctor dashboard
- [x] Hinglish News Feed
- [x] Risk Signals component
- [x] Safety Disclaimer
- [ ] Real PDF parsing implementation
- [ ] Live market data integration
- [ ] Push notifications for news
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TailAdmin](https://tailadmin.com) - Dashboard template foundation
- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database and storage
- [Groq](https://groq.com) - LLM inference
- [LangGraph](https://langchain-ai.github.io/langgraph/) - AI workflow orchestration

---

<div align="center">
  Made with ❤️ for Indian Retail Investors
  
  [⬆ Back to top](#finstocks---ai-powered-financial-intelligence-platform)
</div>
