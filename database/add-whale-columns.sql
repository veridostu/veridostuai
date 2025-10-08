-- Add owner columns to whale_alerts table
ALTER TABLE whale_alerts 
ADD COLUMN IF NOT EXISTS from_owner TEXT,
ADD COLUMN IF NOT EXISTS from_owner_type TEXT,
ADD COLUMN IF NOT EXISTS to_owner TEXT,
ADD COLUMN IF NOT EXISTS to_owner_type TEXT;

-- Add comments
COMMENT ON COLUMN whale_alerts.from_owner IS 'Name of the sender (e.g., Binance, Coinbase)';
COMMENT ON COLUMN whale_alerts.from_owner_type IS 'Type of sender (exchange, wallet, etc.)';
COMMENT ON COLUMN whale_alerts.to_owner IS 'Name of the receiver (e.g., Binance, Coinbase)';
COMMENT ON COLUMN whale_alerts.to_owner_type IS 'Type of receiver (exchange, wallet, etc.)';
