const Parser = require('rss-parser');

class NewsService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['description', 'description'],
          ['content:encoded', 'content'],
          ['dc:creator', 'creator']
        ]
      }
    });
    this.rssUrl = 'https://tr.cointelegraph.com/rss';
  }

  /**
   * RSS feed'den haberleri çek
   */
  async fetchNews() {
    try {
      const feed = await this.parser.parseURL(this.rssUrl);

      const news = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pub_date: new Date(item.pubDate),
        content: item.contentSnippet || item.description || '',
        creator: item.creator || 'Cointelegraph',
        categories: item.categories || [],
        guid: item.guid
      }));

      return news;
    } catch (error) {
      console.error('RSS News hatası:', error.message);
      throw error;
    }
  }

  /**
   * Son N haberi getir
   */
  async getLatestNews(limit = 20) {
    try {
      const allNews = await this.fetchNews();
      return allNews.slice(0, limit);
    } catch (error) {
      console.error('Latest News hatası:', error.message);
      throw error;
    }
  }

  /**
   * Haberleri tarihe göre filtrele
   */
  async getNewsSince(sinceDate) {
    try {
      const allNews = await this.fetchNews();
      return allNews.filter(news => news.pub_date >= sinceDate);
    } catch (error) {
      console.error('News Since hatası:', error.message);
      throw error;
    }
  }

  /**
   * Anahtar kelimeye göre haber ara
   */
  async searchNews(keyword) {
    try {
      const allNews = await this.fetchNews();
      const lowerKeyword = keyword.toLowerCase();

      return allNews.filter(news =>
        news.title.toLowerCase().includes(lowerKeyword) ||
        news.content.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('Search News hatası:', error.message);
      throw error;
    }
  }

  /**
   * Haberleri formatla (Telegram için)
   */
  formatNewsForTelegram(news, limit = 10) {
    const formatted = news.slice(0, limit).map((item, index) => {
      const date = new Date(item.pub_date).toLocaleString('tr-TR');
      return `${index + 1}. ${item.title}\n📅 ${date}\n🔗 ${item.link}\n`;
    });

    return formatted.join('\n');
  }
}

module.exports = new NewsService();
