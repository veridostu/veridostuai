-- Row Level Security politikalarını kaldır (geliştirme için)
-- ÖNEMLİ: Production'da RLS politikaları eklemelisiniz!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE technical_analysis_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE coin_ai_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_screener DISABLE ROW LEVEL SECURITY;
ALTER TABLE economic_indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE fear_greed_index DISABLE ROW LEVEL SECURITY;
ALTER TABLE whale_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- Alternatif olarak, eğer RLS'i aktif tutmak istiyorsanız,
-- tüm işlemler için izin veren politikalar ekleyin:

-- ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Enable all operations for everyone"
-- ON payment_requests
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);
