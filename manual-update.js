require('dotenv').config();
const supabase = require('./utils/supabase');
const binanceService = require('./services/binance');
const cmcService = require('./services/coinmarketcap');
const fredService = require('./services/fred');
const whaleService = require('./services/whale');
const newsService = require('./services/news');

async function updateAll() {
  console.log('🚀 Manuel veri güncelleme başlatılıyor...\n');

  // 1. Trading Sinyalleri
  console.log('📊 Trading Sinyalleri güncelleniyor...');
  try {
    const topCoins = await binanceService.getTopCoins();
    const symbols = topCoins.slice(0, 30).map(c => c.symbol);
    const signals = await binanceService.generateSignalsForMultipleCoins(symbols, '1h');

    await supabase.from('trading_signals').delete().neq('id', 0);

    const signalsToInsert = signals.map(s => ({
      symbol: s.symbol,
      signal_type: s.signal.toLowerCase(),
      price: s.indicators.currentPrice,
      indicators: s.indicators
    }));

    await supabase.from('trading_signals').insert(signalsToInsert);
    console.log(`✅ ${signalsToInsert.length} trading sinyali güncellendi.\n`);
  } catch (error) {
    console.error('❌ Trading Signals hatası:', error.message, '\n');
  }

  // 2. Market Screener
  console.log('📈 Market Screener güncelleniyor...');
  try {
    const data = await cmcService.getAllMarketScreenerData();

    await supabase.from('market_screener').delete().neq('id', 0);

    const categories = [
      { category: 'top_gainers', data: data.topGainers },
      { category: 'top_losers', data: data.topLosers },
      { category: 'high_volume', data: data.highestVolume },
      { category: 'trending', data: data.trending },
      { category: 'new_listings', data: data.newListings },
      { category: 'low_mcap', data: data.lowMarketCap }
    ];

    await supabase.from('market_screener').insert(categories);
    console.log('✅ Market Screener güncellendi.\n');
  } catch (error) {
    console.error('❌ Market Screener hatası:', error.message, '\n');
  }

  // 3. Ekonomik Göstergeler
  console.log('💵 Ekonomik Göstergeler güncelleniyor...');
  try {
    const indicators = await fredService.getEconomicIndicators();

    await supabase.from('economic_indicators').delete().neq('id', 0);

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

    await supabase.from('economic_indicators').insert(indicatorsToInsert);
    console.log(`✅ ${indicatorsToInsert.length} ekonomik gösterge güncellendi.\n`);
  } catch (error) {
    console.error('❌ Economic Indicators hatası:', error.message, '\n');
  }

  // 4. Fear & Greed Index
  console.log('😱 Fear & Greed Index güncelleniyor...');
  try {
    const data = await cmcService.getFearGreedIndex();

    await supabase.from('fear_greed_index').delete().neq('id', 0);

    await supabase.from('fear_greed_index').insert([{
      value: data.value,
      value_classification: data.value_classification,
      timestamp: new Date(data.update_time || data.timestamp || Date.now())
    }]);

    console.log('✅ Fear & Greed Index güncellendi.\n');
  } catch (error) {
    console.error('❌ Fear & Greed hatası:', error.message, '\n');
  }

  // 5. Whale Alert
  console.log('🐋 Whale Alert güncelleniyor...');
  try {
    const data = await whaleService.getRecentLargeTransactions();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await supabase.from('whale_alerts').delete().lt('created_at', oneHourAgo.toISOString());

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
      await supabase.from('whale_alerts').insert(whaleData);
      console.log(`✅ ${whaleData.length} whale alert güncellendi.\n`);
    } else {
      console.log('⚠️ Yeni whale alert yok.\n');
    }
  } catch (error) {
    console.error('❌ Whale Alert hatası:', error.message, '\n');
  }

  // 6. Haberler
  console.log('📰 Haberler güncelleniyor...');
  try {
    const news = await newsService.getLatestNews(50);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await supabase.from('news').delete().lt('created_at', oneDayAgo.toISOString());

    let newsCount = 0;
    for (const item of news) {
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('link', item.link)
        .single();

      if (!existing) {
        await supabase.from('news').insert([{
          title: item.title,
          link: item.link,
          pub_date: item.pub_date,
          content: item.content
        }]);
        newsCount++;
      }
    }

    console.log(`✅ ${newsCount} haber güncellendi.\n`);
  } catch (error) {
    console.error('❌ News hatası:', error.message, '\n');
  }

  console.log('🎉 Tüm veriler güncellendi!');
  process.exit(0);
}

updateAll();
