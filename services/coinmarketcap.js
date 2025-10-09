const axios = require('axios');

class CoinMarketCapService {
  constructor() {
    this.baseUrl = 'https://pro-api.coinmarketcap.com';
    this.apiKey = process.env.CMC_API_KEY;
    this.headers = {
      'X-CMC_PRO_API_KEY': this.apiKey,
      'Accept': 'application/json'
    };
  }

  /**
   * Exchange Map
   */
  async getExchangeMap() {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/exchange/map`, {
        headers: this.headers
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Exchange Map hatası:', error.message);
      throw error;
    }
  }

  /**
   * Exchange Info
   */
  async getExchangeInfo(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/exchange/info`, {
        headers: this.headers,
        params: { id }
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Exchange Info hatası:', error.message);
      throw error;
    }
  }

  /**
   * Exchange Assets
   */
  async getExchangeAssets(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/exchange/assets`, {
        headers: this.headers,
        params: { id }
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Exchange Assets hatası:', error.message);
      throw error;
    }
  }

  /**
   * CMC100 Index
   */
  async getCMC100Latest() {
    try {
      const response = await axios.get(`${this.baseUrl}/v3/index/cmc100-latest`, {
        headers: this.headers
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC CMC100 hatası:', error.message);
      throw error;
    }
  }

  /**
   * Fear & Greed Index
   */
  async getFearGreedIndex() {
    try {
      const response = await axios.get(`${this.baseUrl}/v3/fear-and-greed/latest`, {
        headers: this.headers
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Fear & Greed hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Listings Info
   */
  async getDEXListingsInfo(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/listings/info`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Listings Info hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Networks List
   */
  async getDEXNetworksList() {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/networks/list`, {
        headers: this.headers
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Networks hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Listings Quotes
   */
  async getDEXListingsQuotes(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/listings/quotes`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Listings Quotes hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Pairs Quotes Latest
   */
  async getDEXPairsQuotesLatest(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/pairs/quotes/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Pairs Quotes hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Pairs OHLCV Historical
   */
  async getDEXPairsOHLCVHistorical(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/pairs/ohlcv/historical`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Pairs OHLCV Historical hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Pairs OHLCV Latest
   */
  async getDEXPairsOHLCVLatest(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/pairs/ohlcv/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Pairs OHLCV Latest hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Pairs Trade Latest
   */
  async getDEXPairsTradeLatest(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/pairs/trade/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Pairs Trade Latest hatası:', error.message);
      throw error;
    }
  }

  /**
   * DEX Spot Pairs Latest
   */
  async getDEXSpotPairsLatest(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/dex/spot-pairs/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC DEX Spot Pairs Latest hatası:', error.message);
      throw error;
    }
  }

  /**
   * Cryptocurrency Map
   */
  async getCryptocurrencyMap(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/cryptocurrency/map`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Cryptocurrency Map hatası:', error.message);
      throw error;
    }
  }

  /**
   * Cryptocurrency Info
   */
  async getCryptocurrencyInfo(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/cryptocurrency/info`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Cryptocurrency Info hatası:', error.message);
      throw error;
    }
  }

  /**
   * Cryptocurrency Listings Latest
   */
  async getCryptocurrencyListingsLatest(params = { limit: 100, convert: 'USD' }) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/cryptocurrency/listings/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Cryptocurrency Listings Latest hatası:', error.message);
      throw error;
    }
  }

  /**
   * Cryptocurrency Quotes Latest
   */
  async getCryptocurrencyQuotesLatest(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/cryptocurrency/quotes/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Cryptocurrency Quotes Latest hatası:', error.message);
      throw error;
    }
  }

  /**
   * Global Metrics Quotes Latest
   */
  async getGlobalMetricsQuotesLatest() {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/global-metrics/quotes/latest`, {
        headers: this.headers
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Global Metrics hatası:', error.message);
      throw error;
    }
  }

  /**
   * Price Conversion Tool
   */
  async getPriceConversion(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/tools/price-conversion`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Price Conversion hatası:', error.message);
      throw error;
    }
  }

  /**
   * Cryptocurrency Market Pairs - Coin'in hangi borsalarda işlem gördüğünü gösterir
   */
  async getCryptocurrencyMarketPairs(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/cryptocurrency/market-pairs/latest`, {
        headers: this.headers,
        params
      });
      return response.data.data;
    } catch (error) {
      console.error('CMC Market Pairs hatası:', error.message);
      throw error;
    }
  }

  /**
   * Coin AI için tüm ilgili verileri topla
   */
  async getDataForCoinAI(symbol) {
    try {
      const [listings, globalMetrics, fearGreed] = await Promise.all([
        this.getCryptocurrencyListingsLatest({ limit: 100 }),
        this.getGlobalMetricsQuotesLatest(),
        this.getFearGreedIndex()
      ]);

      // Symbol'e göre coin bilgisini bul
      const coin = listings.find(c => c.symbol === symbol.toUpperCase());

      return {
        coin,
        globalMetrics,
        fearGreed,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('CMC Coin AI Data hatası:', error.message);
      throw error;
    }
  }

  /**
   * Market Screener için tüm verileri topla
   */
  async getAllMarketScreenerData() {
    try {
      // Tüm verileri listings/latest'ten çekip sıralayacağız
      const response = await axios.get(`${this.baseUrl}/v1/cryptocurrency/listings/latest`, {
        headers: this.headers,
        params: {
          limit: 200,
          convert: 'USD',
          sort: 'market_cap'
        }
      });

      const allCoins = response.data.data;

      // Top Gainers - 24h değişime göre sırala
      const topGainers = [...allCoins]
        .filter(coin => coin.quote?.USD?.percent_change_24h > 0)
        .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
        .slice(0, 20);

      // Top Losers - 24h değişime göre sırala
      const topLosers = [...allCoins]
        .filter(coin => coin.quote?.USD?.percent_change_24h < 0)
        .sort((a, b) => a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h)
        .slice(0, 20);

      // High Volume - 24h hacme göre sırala
      const highestVolume = [...allCoins]
        .sort((a, b) => b.quote.USD.volume_24h - a.quote.USD.volume_24h)
        .slice(0, 20);

      // Trending - hacim/market cap oranına göre (en aktif coinler)
      const trending = [...allCoins]
        .map(coin => ({
          ...coin,
          volumeToMarketCapRatio: coin.quote.USD.volume_24h / coin.quote.USD.market_cap
        }))
        .sort((a, b) => b.volumeToMarketCapRatio - a.volumeToMarketCapRatio)
        .slice(0, 20);

      // Recently Added - date_added'a göre sırala
      const recentlyAddedResponse = await axios.get(`${this.baseUrl}/v1/cryptocurrency/listings/latest`, {
        headers: this.headers,
        params: {
          limit: 100,
          sort: 'date_added',
          sort_dir: 'desc'
        }
      });
      const newListings = recentlyAddedResponse.data.data.slice(0, 20);

      // Low Market Cap - düşük market cap'li coinler
      const lowMarketCap = [...allCoins]
        .filter(coin => coin.quote?.USD?.market_cap >= 1000000 && coin.quote?.USD?.market_cap <= 100000000)
        .sort((a, b) => a.quote.USD.market_cap - b.quote.USD.market_cap)
        .slice(0, 20);

      return {
        topGainers,
        topLosers,
        highestVolume,
        trending,
        newListings,
        lowMarketCap,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('CMC Market Screener Data hatası:', error.message);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new CoinMarketCapService();
