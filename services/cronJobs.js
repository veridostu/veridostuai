require('dotenv').config();
const cron = require('node-cron');
const supabase = require('../utils/supabase');
const binanceService = require('./binance');
const cmcService = require('./coinmarketcap');
const fredService = require('./fred');
const whaleService = require('./whale');
const newsService = require('./news');

console.log('Cron Jobs başlatılıyor...');

/**
 * Trading Sinyalleri - Her 20 dakikada bir
 */
cron.schedule('*/20 * * * *', async () => {
  console.log('Trading Sinyalleri güncelleniyor...');
  try {
    // Popüler coinleri al
    const topCoins = await binanceService.getTopCoins();
    const symbols = topCoins.slice(0, 30).map(c => c.symbol); // Top 30

    // Sinyalleri oluştur
    const signals = await binanceService.generateSignalsForMultipleCoins(symbols, '1h');

    // Eski sinyalleri sil
    await supabase.from('trading_signals').delete().neq('id', 0);

    // Yeni sinyalleri ekle
    const signalsToInsert = signals.map(s => ({
      symbol: s.symbol,
      signal_type: s.signal.toLowerCase(),
      price: s.indicators.currentPrice,
      indicators: s.indicators
    }));

    const { error } = await supabase
      .from('trading_signals')
      .insert(signalsToInsert);

    if (error) {
      console.error('Trading Signals kayıt hatası:', error);
    } else {
      console.log(`✅ ${signalsToInsert.length} trading sinyali güncellendi.`);
    }
  } catch (error) {
    console.error('Trading Signals cron hatası:', error);
  }
});

/**
 * Market Screener - Her 20 dakikada bir
 */
cron.schedule('*/20 * * * *', async () => {
  console.log('Market Screener güncelleniyor...');
  try {
    const data = await cmcService.getAllMarketScreenerData();

    // Eski verileri sil
    await supabase.from('market_screener').delete().neq('id', 0);

    // Yeni verileri ekle
    const categories = [
      { category: 'top_gainers', data: data.topGainers },
      { category: 'top_losers', data: data.topLosers },
      { category: 'high_volume', data: data.highestVolume },
      { category: 'trending', data: data.trending },
      { category: 'new_listings', data: data.newListings },
      { category: 'low_mcap', data: data.lowMarketCap }
    ];

    const { error } = await supabase
      .from('market_screener')
      .insert(categories);

    if (error) {
      console.error('Market Screener kayıt hatası:', error);
    } else {
      console.log('✅ Market Screener güncellendi.');
    }
  } catch (error) {
    console.error('Market Screener cron hatası:', error);
  }
});

/**
 * Ekonomik Göstergeler (FRED) - Her 1 saatte bir
 */
cron.schedule('0 * * * *', async () => {
  console.log('Ekonomik Göstergeler güncelleniyor...');
  try {
    const indicators = await fredService.getEconomicIndicators();

    // Eski verileri sil
    await supabase.from('economic_indicators').delete().neq('id', 0);

    // Yeni verileri ekle
    const indicatorsToInsert = indicators.map(ind => ({
      indicator_name: ind.name,
      indicator_code: ind.code,
      value: ind.value,
      date: ind.date,
      data: {
        description: ind.description,
        units: ind.units,
        title: ind.title,
        frequency: ind.frequency
      }
    }));

    const { error } = await supabase
      .from('economic_indicators')
      .insert(indicatorsToInsert);

    if (error) {
      console.error('Economic Indicators kayıt hatası:', error);
    } else {
      console.log(`✅ ${indicatorsToInsert.length} ekonomik gösterge güncellendi.`);
    }
  } catch (error) {
    console.error('Economic Indicators cron hatası:', error);
  }
});

/**
 * Fear & Greed Index - Her 1 saatte bir
 */
cron.schedule('0 * * * *', async () => {
  console.log('Fear & Greed Index güncelleniyor...');
  try {
    const data = await cmcService.getFearGreedIndex();

    // Eski verileri sil
    await supabase.from('fear_greed_index').delete().neq('id', 0);

    // Yeni veriyi ekle
    const { error } = await supabase
      .from('fear_greed_index')
      .insert([{
        value: data.value,
        value_classification: data.value_classification,
        timestamp: new Date(data.update_time || data.timestamp || Date.now())
      }]);

    if (error) {
      console.error('Fear & Greed kayıt hatası:', error);
    } else {
      console.log('✅ Fear & Greed Index güncellendi.');
    }
  } catch (error) {
    console.error('Fear & Greed cron hatası:', error);
  }
});

/**
 * Whale Alert - Her 30 dakikada bir
 */
cron.schedule('*/30 * * * *', async () => {
  console.log('Whale Alert güncelleniyor...');
  try {
    const data = await whaleService.getRecentLargeTransactions();

    // Eski verileri sil (1 saatten eski)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await supabase
      .from('whale_alerts')
      .delete()
      .lt('created_at', oneHourAgo.toISOString());

    // Yeni verileri ekle
    const whaleData = data.transactions.map(tx => ({
      transaction_hash: tx.transaction_hash,
      blockchain: tx.blockchain,
      symbol: tx.symbol,
      amount: tx.amount,
      amount_usd: tx.amount_usd,
      from_address: tx.from?.address,
      to_address: tx.to?.address,
      from_owner: tx.from?.owner || null,
      from_owner_type: tx.from?.owner_type || null,
      to_owner: tx.to?.owner || null,
      to_owner_type: tx.to?.owner_type || null,
      transaction_type: tx.transaction_type,
      timestamp: new Date(tx.timestamp * 1000)
    }));

    if (whaleData.length > 0) {
      const { error } = await supabase
        .from('whale_alerts')
        .insert(whaleData);

      if (error) {
        console.error('Whale Alert kayıt hatası:', error);
      } else {
        console.log(`✅ ${whaleData.length} whale alert güncellendi.`);
      }
    } else {
      console.log('⚠️ Yeni whale alert yok.');
    }
  } catch (error) {
    console.error('Whale Alert cron hatası:', error);
  }
});

/**
 * Haberler - Her 30 dakikada bir
 */
cron.schedule('*/30 * * * *', async () => {
  console.log('Haberler güncelleniyor...');
  try {
    const news = await newsService.getLatestNews(50);

    // Eski haberleri sil (24 saatten eski)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await supabase
      .from('news')
      .delete()
      .lt('created_at', oneDayAgo.toISOString());

    // Yeni haberleri ekle (duplicate kontrolü link ile)
    for (const item of news) {
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('link', item.link)
        .single();

      if (!existing) {
        await supabase
          .from('news')
          .insert([{
            title: item.title,
            link: item.link,
            pub_date: item.pub_date,
            content: item.content
          }]);
      }
    }

    console.log('✅ Haberler güncellendi.');
  } catch (error) {
    console.error('News cron hatası:', error);
  }
});

console.log('✅ Tüm cron jobs başlatıldı!');
console.log('- Trading Sinyalleri: Her 20 dakika');
console.log('- Market Screener: Her 20 dakika');
console.log('- Ekonomik Göstergeler: Her 1 saat');
console.log('- Fear & Greed Index: Her 1 saat');
console.log('- Whale Alert: Her 30 dakika');
console.log('- Haberler: Her 30 dakika');
