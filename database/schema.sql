-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    subscription_start TIMESTAMP,
    subscription_end TIMESTAMP,
    daily_openai_usage INTEGER DEFAULT 0,
    last_usage_reset TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ödeme Talepleri Tablosu
CREATE TABLE IF NOT EXISTS payment_requests (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    payment_screenshot_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by BIGINT
);

-- Teknik Analiz Geçmişi
CREATE TABLE IF NOT EXISTS technical_analysis_history (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    analysis_result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Coin Analiz Geçmişi
CREATE TABLE IF NOT EXISTS coin_ai_history (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trading Sinyalleri
CREATE TABLE IF NOT EXISTS trading_signals (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    signal_type VARCHAR(50) NOT NULL, -- strong_buy, buy, hold, sell, strong_sell
    price DECIMAL(20, 8),
    indicators JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Market Screener Verileri
CREATE TABLE IF NOT EXISTS market_screener (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- top_gainers, top_losers, high_volume, trending, new_listings, low_mcap
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ekonomik Göstergeler (FRED)
CREATE TABLE IF NOT EXISTS economic_indicators (
    id BIGSERIAL PRIMARY KEY,
    indicator_name VARCHAR(100) NOT NULL,
    indicator_code VARCHAR(50) NOT NULL,
    value DECIMAL(20, 4),
    date DATE,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fear & Greed Index
CREATE TABLE IF NOT EXISTS fear_greed_index (
    id BIGSERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    value_classification VARCHAR(50),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Whale Alert Verileri
CREATE TABLE IF NOT EXISTS whale_alerts (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255),
    blockchain VARCHAR(50),
    symbol VARCHAR(50),
    amount DECIMAL(30, 8),
    amount_usd DECIMAL(20, 2),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    transaction_type VARCHAR(50),
    timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Haberler
CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    pub_date TIMESTAMP,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_telegram_id ON payment_requests(telegram_id);
CREATE INDEX idx_technical_analysis_telegram_id ON technical_analysis_history(telegram_id);
CREATE INDEX idx_technical_analysis_created_at ON technical_analysis_history(created_at DESC);
CREATE INDEX idx_coin_ai_telegram_id ON coin_ai_history(telegram_id);
CREATE INDEX idx_coin_ai_created_at ON coin_ai_history(created_at DESC);
CREATE INDEX idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX idx_trading_signals_created_at ON trading_signals(created_at DESC);
CREATE INDEX idx_market_screener_category ON market_screener(category);
CREATE INDEX idx_market_screener_created_at ON market_screener(created_at DESC);
CREATE INDEX idx_whale_alerts_created_at ON whale_alerts(created_at DESC);
CREATE INDEX idx_news_created_at ON news(created_at DESC);

-- Otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
