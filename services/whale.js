const axios = require('axios');

class WhaleAlertService {
  constructor() {
    this.baseUrl = 'https://api.whale-alert.io/v1';
    this.apiKey = process.env.WHALE_ALERT_API_KEY;
  }

  /**
   * Son işlemleri çek
   */
  async getTransactions(params = {}) {
    try {
      const defaultParams = {
        api_key: this.apiKey,
        min_value: 500000, // Minimum 500k USD
        limit: 100,
        ...params
      };

      const response = await axios.get(`${this.baseUrl}/transactions`, {
        params: defaultParams
      });

      return response.data.transactions.map(tx => ({
        blockchain: tx.blockchain,
        symbol: tx.symbol,
        amount: parseFloat(tx.amount),
        amount_usd: parseFloat(tx.amount_usd),
        transaction_hash: tx.hash,
        from: {
          address: tx.from?.address,
          owner: tx.from?.owner,
          owner_type: tx.from?.owner_type
        },
        to: {
          address: tx.to?.address,
          owner: tx.to?.owner,
          owner_type: tx.to?.owner_type
        },
        timestamp: tx.timestamp,
        transaction_type: this.getTransactionType(tx.from, tx.to)
      }));
    } catch (error) {
      console.error('Whale Alert Transactions hatası:', error.message);
      throw error;
    }
  }

  /**
   * İşlem tipini belirle
   */
  getTransactionType(from, to) {
    if (!from || !to) return 'unknown';

    const fromType = from.owner_type;
    const toType = to.owner_type;

    if (fromType === 'exchange' && toType === 'exchange') {
      return 'exchange_to_exchange';
    } else if (fromType === 'exchange' && toType === 'wallet') {
      return 'withdrawal'; // Borsadan çekim
    } else if (fromType === 'wallet' && toType === 'exchange') {
      return 'deposit'; // Borsaya yatırım
    } else if (fromType === 'wallet' && toType === 'wallet') {
      return 'wallet_transfer';
    } else {
      return 'other';
    }
  }

  /**
   * Belirli bir zaman aralığındaki işlemleri çek
   */
  async getTransactionsByTimeRange(start, end, minValue = 500000) {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions`, {
        params: {
          api_key: this.apiKey,
          start,
          end,
          min_value: minValue,
          limit: 100
        }
      });

      return response.data.transactions.map(tx => ({
        blockchain: tx.blockchain,
        symbol: tx.symbol,
        amount: parseFloat(tx.amount),
        amount_usd: parseFloat(tx.amount_usd),
        transaction_hash: tx.hash,
        from: {
          address: tx.from?.address,
          owner: tx.from?.owner,
          owner_type: tx.from?.owner_type
        },
        to: {
          address: tx.to?.address,
          owner: tx.to?.owner,
          owner_type: tx.to?.owner_type
        },
        timestamp: tx.timestamp,
        transaction_type: this.getTransactionType(tx.from, tx.to)
      }));
    } catch (error) {
      console.error('Whale Alert Transactions by Time Range hatası:', error.message);
      throw error;
    }
  }

  /**
   * Desteklenen blockchain listesi
   */
  async getSupportedBlockchains() {
    try {
      const response = await axios.get(`${this.baseUrl}/blockchains`, {
        params: {
          api_key: this.apiKey
        }
      });

      return response.data.blockchains;
    } catch (error) {
      console.error('Whale Alert Blockchains hatası:', error.message);
      throw error;
    }
  }

  /**
   * API durumu kontrolü
   */
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/status`, {
        params: {
          api_key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Whale Alert Status hatası:', error.message);
      throw error;
    }
  }

  /**
   * Son 30 dakikanın büyük işlemlerini çek
   */
  async getRecentLargeTransactions() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const thirtyMinutesAgo = now - (30 * 60);

      const transactions = await this.getTransactionsByTimeRange(
        thirtyMinutesAgo,
        now,
        500000 // Min 500k USD
      );

      return {
        transactions,
        total_count: transactions.length,
        total_value_usd: transactions.reduce((sum, tx) => sum + tx.amount_usd, 0),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Whale Alert Recent Large Transactions hatası:', error.message);
      throw error;
    }
  }

  /**
   * İşlemleri kategorilere ayır
   */
  categorizeTransactions(transactions) {
    const categories = {
      deposits: [], // Borsaya yatırımlar
      withdrawals: [], // Borsadan çekimler
      exchange_transfers: [], // Borsa arası transferler
      wallet_transfers: [], // Cüzdan arası transferler
      other: []
    };

    transactions.forEach(tx => {
      switch (tx.transaction_type) {
        case 'deposit':
          categories.deposits.push(tx);
          break;
        case 'withdrawal':
          categories.withdrawals.push(tx);
          break;
        case 'exchange_to_exchange':
          categories.exchange_transfers.push(tx);
          break;
        case 'wallet_transfer':
          categories.wallet_transfers.push(tx);
          break;
        default:
          categories.other.push(tx);
      }
    });

    return categories;
  }
}

module.exports = new WhaleAlertService();
