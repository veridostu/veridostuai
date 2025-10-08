const axios = require('axios');

class FREDService {
  constructor() {
    this.baseUrl = 'https://api.stlouisfed.org/fred';
    this.apiKey = process.env.FRED_API_KEY;
  }

  /**
   * Ekonomik seri verisi çek
   */
  async getSeries(seriesId, params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/series/observations`, {
        params: {
          series_id: seriesId,
          api_key: this.apiKey,
          file_type: 'json',
          ...params
        }
      });

      return response.data.observations;
    } catch (error) {
      console.error(`FRED ${seriesId} hatası:`, error.message);
      throw error;
    }
  }

  /**
   * Seri bilgisi çek
   */
  async getSeriesInfo(seriesId) {
    try {
      const response = await axios.get(`${this.baseUrl}/series`, {
        params: {
          series_id: seriesId,
          api_key: this.apiKey,
          file_type: 'json'
        }
      });

      return response.data.seriess[0];
    } catch (error) {
      console.error(`FRED Series Info ${seriesId} hatası:`, error.message);
      throw error;
    }
  }

  /**
   * Önemli ekonomik göstergeleri toplu çek
   */
  async getEconomicIndicators() {
    try {
      const indicators = [
        { id: 'DFF', name: 'Fed Faiz Oranı', description: 'Federal Funds Rate' },
        { id: 'UNRATE', name: 'İşsizlik Oranı', description: 'Unemployment Rate' },
        { id: 'CPIAUCSL', name: 'Tüketici Fiyat Endeksi', description: 'Consumer Price Index' },
        { id: 'GDP', name: 'GSYİH', description: 'Gross Domestic Product' },
        { id: 'FEDFUNDS', name: 'Efektif Fed Faiz Oranı', description: 'Effective Federal Funds Rate' },
        { id: 'DGS10', name: '10 Yıllık Hazine Bonosu', description: '10-Year Treasury Rate' },
        { id: 'DGS2', name: '2 Yıllık Hazine Bonosu', description: '2-Year Treasury Rate' },
        { id: 'T10Y2Y', name: '10Y-2Y Getiri Farkı', description: '10-Year minus 2-Year Treasury' },
        { id: 'VIXCLS', name: 'Volatilite Endeksi (VIX)', description: 'VIX Index' },
        { id: 'DEXUSEU', name: 'USD/EUR Döviz Kuru', description: 'USD/EUR Exchange Rate' },
        { id: 'DTWEXBGS', name: 'Dolar Endeksi', description: 'Dollar Index' },
        { id: 'M2SL', name: 'M2 Para Arzı', description: 'M2 Money Supply' }
      ];

      const results = [];

      for (const indicator of indicators) {
        try {
          const [info, data] = await Promise.all([
            this.getSeriesInfo(indicator.id),
            this.getSeries(indicator.id, { limit: 1, sort_order: 'desc' })
          ]);

          const latestData = data[0];

          results.push({
            code: indicator.id,
            name: indicator.name,
            description: indicator.description,
            value: parseFloat(latestData.value),
            date: latestData.date,
            units: info.units,
            title: info.title,
            frequency: info.frequency
          });

          // Rate limit için küçük bir gecikme
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          console.error(`${indicator.id} çekilemedi:`, err.message);
        }
      }

      return results;
    } catch (error) {
      console.error('FRED Economic Indicators hatası:', error.message);
      throw error;
    }
  }

  /**
   * Özel bir seri için son N veriyi çek
   */
  async getRecentData(seriesId, limit = 10) {
    try {
      const data = await this.getSeries(seriesId, {
        limit,
        sort_order: 'desc'
      });

      return data.map(item => ({
        date: item.date,
        value: parseFloat(item.value)
      })).reverse();
    } catch (error) {
      console.error(`FRED Recent Data ${seriesId} hatası:`, error.message);
      throw error;
    }
  }
}

module.exports = new FREDService();
