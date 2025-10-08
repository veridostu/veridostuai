const axios = require('axios');

class CoinGeckoService {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  /**
   * En çok yükselenler
   */
  async getTopGainers(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'price_change_percentage_24h_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      return response.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume
      }));
    } catch (error) {
      console.error('CoinGecko Top Gainers hatası:', error.message);
      throw error;
    }
  }

  /**
   * En çok düşenler
   */
  async getTopLosers(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'price_change_percentage_24h_asc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      return response.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume
      }));
    } catch (error) {
      console.error('CoinGecko Top Losers hatası:', error.message);
      throw error;
    }
  }

  /**
   * En yüksek hacim
   */
  async getHighestVolume(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'volume_desc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      });

      return response.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume
      }));
    } catch (error) {
      console.error('CoinGecko Highest Volume hatası:', error.message);
      throw error;
    }
  }

  /**
   * Trend coinler
   */
  async getTrendingCoins() {
    try {
      const response = await axios.get(`${this.baseUrl}/search/trending`);

      return response.data.coins.map(item => ({
        id: item.item.id,
        symbol: item.item.symbol,
        name: item.item.name,
        market_cap_rank: item.item.market_cap_rank,
        thumb: item.item.thumb,
        score: item.item.score
      }));
    } catch (error) {
      console.error('CoinGecko Trending hatası:', error.message);
      throw error;
    }
  }

  /**
   * Yeni listelemeler (son eklenen coinler)
   */
  async getNewListings(limit = 20) {
    try {
      // CoinGecko'da yeni listeleme endpoint'i yok, bu yüzden en son eklenen coinleri çekiyoruz
      const response = await axios.get(`${this.baseUrl}/coins/list`);

      // Son eklenen coinleri al (ID'ye göre sıralama)
      const recentCoins = response.data.slice(-limit);

      // Her coin için detaylı bilgi al
      const coinDetails = await Promise.all(
        recentCoins.slice(0, 10).map(async (coin) => { // Sadece 10 tanesini al (rate limit için)
          try {
            const detailResponse = await axios.get(`${this.baseUrl}/coins/${coin.id}`, {
              params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false
              }
            });

            return {
              id: detailResponse.data.id,
              symbol: detailResponse.data.symbol.toUpperCase(),
              name: detailResponse.data.name,
              image: detailResponse.data.image?.small,
              current_price: detailResponse.data.market_data?.current_price?.usd,
              market_cap: detailResponse.data.market_data?.market_cap?.usd,
              total_volume: detailResponse.data.market_data?.total_volume?.usd
            };
          } catch (err) {
            return null;
          }
        })
      );

      return coinDetails.filter(c => c !== null);
    } catch (error) {
      console.error('CoinGecko New Listings hatası:', error.message);
      throw error;
    }
  }

  /**
   * Düşük piyasa değeri
   */
  async getLowMarketCap(limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_asc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      });

      return response.data
        .filter(coin => coin.market_cap > 0) // 0 market cap olanları filtrele
        .map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume
        }));
    } catch (error) {
      console.error('CoinGecko Low Market Cap hatası:', error.message);
      throw error;
    }
  }

  /**
   * Tüm market screener verilerini toplu al
   */
  async getAllMarketScreenerData() {
    try {
      const [topGainers, topLosers, highestVolume, trending, newListings, lowMarketCap] = await Promise.all([
        this.getTopGainers(20),
        this.getTopLosers(20),
        this.getHighestVolume(20),
        this.getTrendingCoins(),
        this.getNewListings(10), // Rate limit için az sayıda
        this.getLowMarketCap(20)
      ]);

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
      console.error('CoinGecko All Market Screener hatası:', error.message);
      throw error;
    }
  }
}

module.exports = new CoinGeckoService();
