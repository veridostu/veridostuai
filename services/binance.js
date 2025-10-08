const axios = require('axios');
const TechnicalIndicators = require('../utils/indicators');

class BinanceService {
  constructor() {
    this.baseUrl = 'https://api.binance.com/api/v3';
    this.futuresUrl = 'https://fapi.binance.com';
  }

  /**
   * Mum çubuk verilerini çeker
   */
  async getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 500) {
    try {
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: { symbol, interval, limit }
      });

      return response.data.map(candle => ({
        openTime: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        closeTime: candle[6],
        quoteAssetVolume: parseFloat(candle[7]),
        numberOfTrades: candle[8],
        takerBuyBaseVolume: parseFloat(candle[9]),
        takerBuyQuoteVolume: parseFloat(candle[10])
      }));
    } catch (error) {
      console.error('Binance Klines hatası:', error.message);
      throw error;
    }
  }

  /**
   * Emir defteri verilerini çeker (Alış/Satış duvarları)
   */
  async getOrderBook(symbol = 'BTCUSDT', limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/depth`, {
        params: { symbol, limit }
      });

      return {
        bids: response.data.bids.map(bid => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1])
        })),
        asks: response.data.asks.map(ask => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1])
        }))
      };
    } catch (error) {
      console.error('Binance OrderBook hatası:', error.message);
      throw error;
    }
  }

  /**
   * Funding Rate verilerini çeker
   */
  async getFundingRate(symbol = 'BTCUSDT', limit = 100) {
    try {
      const response = await axios.get(`${this.futuresUrl}/fapi/v1/fundingRate`, {
        params: { symbol, limit }
      });

      return response.data.map(rate => ({
        symbol: rate.symbol,
        fundingRate: parseFloat(rate.fundingRate),
        fundingTime: rate.fundingTime
      }));
    } catch (error) {
      console.error('Binance FundingRate hatası:', error.message);
      throw error;
    }
  }

  /**
   * Open Interest verilerini çeker
   */
  async getOpenInterest(symbol = 'BTCUSDT', period = '4h', limit = 500) {
    try {
      const response = await axios.get(`${this.futuresUrl}/futures/data/openInterestHist`, {
        params: { symbol, period, limit }
      });

      return response.data.map(oi => ({
        sumOpenInterest: parseFloat(oi.sumOpenInterest),
        timestamp: oi.timestamp
      }));
    } catch (error) {
      console.error('Binance OpenInterest hatası:', error.message);
      throw error;
    }
  }

  /**
   * Long/Short Ratio verilerini çeker
   */
  async getLongShortRatio(symbol = 'BTCUSDT', period = '4h', limit = 500) {
    try {
      const response = await axios.get(`${this.futuresUrl}/futures/data/globalLongShortAccountRatio`, {
        params: { symbol, period, limit }
      });

      return response.data.map(ratio => ({
        longAccount: parseFloat(ratio.longAccount),
        shortAccount: parseFloat(ratio.shortAccount),
        longShortRatio: parseFloat(ratio.longShortRatio),
        timestamp: ratio.timestamp
      }));
    } catch (error) {
      console.error('Binance LongShortRatio hatası:', error.message);
      throw error;
    }
  }

  /**
   * Tüm verileri toplu olarak çeker ve teknik analiz yapar
   */
  async getCompleteAnalysis(symbol = 'BTCUSDT', timeframe = '1h') {
    try {
      const [klines, orderBook, fundingRate, openInterest, longShortRatio] = await Promise.all([
        this.getKlines(symbol, timeframe, 500),
        this.getOrderBook(symbol, 100),
        this.getFundingRate(symbol, 100),
        this.getOpenInterest(symbol, timeframe, 500),
        this.getLongShortRatio(symbol, timeframe, 500)
      ]);

      // Teknik göstergeleri hesapla
      const indicators = TechnicalIndicators.calculateAll(klines);

      return {
        symbol,
        timeframe,
        klines: klines.slice(-50), // Son 50 mum
        orderBook,
        fundingRate: fundingRate.slice(-10), // Son 10 funding rate
        openInterest: openInterest.slice(-50), // Son 50 OI
        longShortRatio: longShortRatio.slice(-50), // Son 50 ratio
        indicators,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Binance CompleteAnalysis hatası:', error.message);
      throw error;
    }
  }

  /**
   * Birden fazla coin için sinyal üret
   */
  async generateSignalsForMultipleCoins(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'], timeframe = '1h') {
    const signals = [];

    for (const symbol of symbols) {
      try {
        const klines = await this.getKlines(symbol, timeframe, 500);
        const indicators = TechnicalIndicators.calculateAll(klines);
        const signal = TechnicalIndicators.generateSignal(indicators);

        signals.push({
          symbol,
          ...signal,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`${symbol} için sinyal oluşturulamadı:`, error.message);
      }
    }

    return signals;
  }

  /**
   * Popüler coinlerin listesini al
   */
  async getTopCoins() {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/24hr`);

      // USDT paritelerini filtrele ve hacme göre sırala
      const usdtPairs = response.data
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .map(ticker => ({
          symbol: ticker.symbol,
          price: parseFloat(ticker.lastPrice),
          priceChange: parseFloat(ticker.priceChange),
          priceChangePercent: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.volume),
          quoteVolume: parseFloat(ticker.quoteVolume)
        }))
        .sort((a, b) => b.quoteVolume - a.quoteVolume)
        .slice(0, 50); // Top 50

      return usdtPairs;
    } catch (error) {
      console.error('Binance TopCoins hatası:', error.message);
      throw error;
    }
  }
}

module.exports = new BinanceService();
