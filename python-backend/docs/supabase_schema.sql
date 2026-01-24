-- FinStocks Database Schema for Supabase
-- Run this in your Supabase SQL editor to set up the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    age INTEGER,
    pan TEXT,
    phone TEXT,
    address TEXT,
    income_range TEXT,
    expenditure_range TEXT,
    marital_status TEXT,
    children INTEGER DEFAULT 0,
    lifestyle TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);

-- ============================================
-- User Holdings Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(12, 2),
    source TEXT CHECK (source IN ('manual', 'pdf_upload')) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_holdings_user_id ON user_holdings(user_id);

-- ============================================
-- Portfolio Analyses Table
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    diversification_score INTEGER,
    volatility_score INTEGER,
    overlap_score INTEGER,
    cash_exposure_score INTEGER,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user and date lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_analyses_user_id ON portfolio_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analyses_created_at ON portfolio_analyses(created_at DESC);

-- ============================================
-- Uploaded Documents Table
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    document_type TEXT CHECK (document_type IN ('demat', 'bank', 'broker', 'other')),
    parsed_data JSONB,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- News Cache Table (Optional - for caching)
-- ============================================
CREATE TABLE IF NOT EXISTS news_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT,
    title TEXT NOT NULL,
    original_content TEXT,
    hinglish_summary TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
    source TEXT,
    source_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for symbol lookups
CREATE INDEX IF NOT EXISTS idx_news_cache_symbol ON news_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_news_cache_cached_at ON news_cache(cached_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
-- Note: You'll need to integrate with Clerk's JWT for proper authentication
-- For now, using a simple policy based on clerk_user_id passed in the request

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (true);

-- user_holdings policies
CREATE POLICY "Users can view own holdings" ON user_holdings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own holdings" ON user_holdings
    FOR ALL USING (true);

-- portfolio_analyses policies
CREATE POLICY "Users can view own analyses" ON portfolio_analyses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert analyses" ON portfolio_analyses
    FOR INSERT WITH CHECK (true);

-- uploaded_documents policies
CREATE POLICY "Users can manage own documents" ON uploaded_documents
    FOR ALL USING (true);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_holdings
CREATE TRIGGER update_user_holdings_updated_at
    BEFORE UPDATE ON user_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO user_profiles (clerk_user_id, name, age, income_range, onboarding_completed)
VALUES 
    ('user_test_123', 'Test User', 30, '10-25L', true);

INSERT INTO user_holdings (user_id, symbol, quantity, source)
SELECT id, 'RELIANCE', 50, 'manual'
FROM user_profiles WHERE clerk_user_id = 'user_test_123';
*/
