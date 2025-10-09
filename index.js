require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const supabase = require('./utils/supabase');
const binanceService = require('./services/binance');
const cmcService = require('./services/coinmarketcap');
const openaiService = require('./services/openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Görsel için limit artırıldı
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Ödeme Bilgilerini Getir
 */
app.get('/api/payment-info', (req, res) => {
  try {
    res.json({
      success: true,
      walletAddress: process.env.PAYMENT_WALLET_ADDRESS,
      amountBtcbam: parseInt(process.env.PAYMENT_AMOUNT_BTCBAM || 400),
      amountUsdt: parseInt(process.env.PAYMENT_AMOUNT_USDT || 19),
      subscriptionDays: parseInt(process.env.SUBSCRIPTION_DAYS || 30)
    });
  } catch (error) {
    console.error('Payment Info API hatası:', error);
    res.status(500).json({ error: 'Ödeme bilgileri getirilemedi' });
  }
});

/**
 * Kullanıcı kontrolü middleware
 */
async function checkUser(req, res, next) {
  const telegramId = req.query.telegram_id || req.body.telegram_id;

  if (!telegramId) {
    return res.status(400).json({ error: 'Telegram ID gerekli' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !user || !user.is_active) {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  // Abonelik kontrolü
  const now = new Date();
  const subscriptionEnd = new Date(user.subscription_end);

  if (subscriptionEnd < now) {
    return res.status(403).json({ error: 'Aboneliğinizin süresi dolmuş' });
  }

  req.user = user;
  next();
}

// API Endpoints

/**
 * Kayıt İşlemi
 */
app.post('/api/register', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, payment_screenshot } = req.body;

    if (!telegram_id || !payment_screenshot) {
      return res.status(400).json({ error: 'Telegram ID ve ödeme görseli gerekli' });
    }

    // Daha önce kayıt var mı kontrol et
    const { data: existingRequest } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('telegram_id', telegram_id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return res.json({
        success: true,
        requestId: existingRequest.id,
        message: 'Zaten bekleyen bir talebiniz var'
      });
    }

    // Base64'ten buffer'a çevir ve Supabase Storage'a yükle
    let imageUrl = payment_screenshot;
    if (payment_screenshot.startsWith('data:image')) {
      try {
        const base64Data = payment_screenshot.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `payment_${telegram_id}_${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('payment-screenshots')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase upload hatası:', uploadError);
          // Hata olursa base64 kullan
        } else {
          // Public URL oluştur
          const { data: urlData } = supabase
            .storage
            .from('payment-screenshots')
            .getPublicUrl(fileName);

          imageUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.error('Upload işlemi hatası:', uploadErr);
        // Hata olursa base64 kullan
      }
    }

    // Yeni kayıt talebi oluştur
    const { data, error } = await supabase
      .from('payment_requests')
      .insert([{
        telegram_id,
        username: username || '',
        first_name: first_name || '',
        last_name: last_name || '',
        payment_screenshot_url: imageUrl,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Kayıt hatası:', error);
      return res.status(500).json({ error: 'Kayıt oluşturulamadı: ' + error.message });
    }

    // Admin'e bildirim gönder
    try {
      const adminMessage = `🆕 Yeni Kayıt Talebi!

👤 Kullanıcı: ${first_name} ${last_name || ''}
📝 Username: @${username || 'Yok'}
🆔 Telegram ID: ${telegram_id}
🆔 Talep ID: ${data.id}
📸 Ödeme Belgesi: Eklendi

Talebi onaylamak için: /onay ${data.id}`;

      // Telegram Bot API kullanarak mesaj gönder
      const adminBotToken = process.env.ADMIN_BOT_TOKEN;
      const adminChatId = process.env.ADMIN_TELEGRAM_ID || telegram_id; // Yoksa kullanıcının kendisine gönder (test için)

      await axios.post(`https://api.telegram.org/bot${adminBotToken}/sendMessage`, {
        chat_id: adminChatId,
        text: adminMessage,
        parse_mode: 'HTML'
      });

      console.log('Admin bildirimi gönderildi:', data.id);
    } catch (notifyError) {
      console.error('Admin bildirimi gönderilemedi:', notifyError.message);
      // Bildirim hatası kayıt işlemini etkilemesin
    }

    res.json({
      success: true,
      requestId: data.id,
      message: 'Kayıt talebiniz alındı'
    });
  } catch (error) {
    console.error('Register API hatası:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

/**
 * Teknik Analiz
 */
app.post('/api/technical-analysis', checkUser, async (req, res) => {
  try {
    const { symbol, timeframe } = req.body;

    if (!symbol || !timeframe) {
      return res.status(400).json({ error: 'Symbol ve timeframe gerekli' });
    }

    // Cooldown kontrolü - Son analiz zamanını kontrol et
    const cooldownSeconds = parseInt(process.env.TECHNICAL_ANALYSIS_COOLDOWN || 120);
    const { data: lastAnalysis } = await supabase
      .from('technical_analysis_history')
      .select('created_at')
      .eq('telegram_id', req.user.telegram_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastAnalysis) {
      const lastAnalysisTime = new Date(lastAnalysis.created_at).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastAnalysisTime) / 1000);
      const remainingSeconds = cooldownSeconds - elapsedSeconds;

      if (remainingSeconds > 0) {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return res.status(429).json({
          error: `Lütfen ${minutes} dakika ${seconds} saniye bekleyin`,
          remainingSeconds,
          cooldownSeconds
        });
      }
    }

    // OpenAI kullanım kontrolü
    const usageCheck = await openaiService.checkUsageLimit(req.user.telegram_id, supabase);

    if (!usageCheck.canUse) {
      return res.status(429).json({ error: 'Günlük kullanım limitiniz doldu', remaining: 0 });
    }

    // Binance'den veri çek
    const data = await binanceService.getCompleteAnalysis(symbol, timeframe);

    // OpenAI ile analiz yap
    const analysis = await openaiService.analyzeTechnical(data);

    // Kullanımı artır
    await openaiService.incrementUsage(req.user.telegram_id, supabase);

    // Geçmişe kaydet
    await supabase.from('technical_analysis_history').insert([{
      telegram_id: req.user.telegram_id,
      symbol,
      timeframe,
      analysis_result: analysis
    }]);

    res.json({
      success: true,
      analysis,
      data,
      remaining: usageCheck.remaining - 1,
      cooldownSeconds
    });
  } catch (error) {
    console.error('Technical Analysis API hatası:', error);
    res.status(500).json({ error: 'Analiz yapılamadı' });
  }
});

/**
 * Coin AI Asistanı
 */
app.post('/api/coin-ai', checkUser, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query gerekli' });
    }

    // OpenAI kullanım kontrolü
    const usageCheck = await openaiService.checkUsageLimit(req.user.telegram_id, supabase);

    if (!usageCheck.canUse) {
      return res.status(429).json({ error: 'Günlük kullanım limitiniz doldu', remaining: 0 });
    }

    // Kullanıcının sorusundan coin sembolünü veya ismini çıkar ve CoinMarketCap'ten veri çek
    let coinData = {};

    try {
      // DEX ile ilgili anahtar kelimeleri kontrol et
      const queryLower = query.toLowerCase();
      const dexKeywords = ['dex', 'uniswap', 'pancakeswap', 'sushiswap', 'curve', 'merkeziyetsiz', 'swap'];
      const isDexQuery = dexKeywords.some(keyword => queryLower.includes(keyword));

      // Borsa listesi ile ilgili anahtar kelimeleri kontrol et
      const exchangeKeywords = ['hangi borsa', 'hangi borsada', 'nerede işlem', 'nerede alınır', 'nereden alınır', 'hangi exchange'];
      const isExchangeQuery = exchangeKeywords.some(keyword => queryLower.includes(keyword));

      // Query'den coin sembolünü çıkarmaya çalış
      const queryUpper = query.toUpperCase();
      const words = queryUpper.split(' ');

      // Olası coin sembollerini bul (2-10 karakter arası kelimeler)
      const potentialSymbols = words.filter(word =>
        word.length >= 2 && word.length <= 10 && /^[A-Z0-9]+$/.test(word)
      );

      let matchedCoin = null;

      // Önce symbol ile direkt arama yap (en hızlı yöntem)
      if (potentialSymbols.length > 0) {
        for (const symbol of potentialSymbols) {
          try {
            const coinInfo = await cmcService.getCryptocurrencyQuotesLatest({
              symbol: symbol
            });

            if (coinInfo && Object.keys(coinInfo).length > 0) {
              const coinId = Object.keys(coinInfo)[0];
              matchedCoin = coinInfo[coinId];
              break;
            }
          } catch (e) {
            // Bu sembol bulunamadı, devam et
            continue;
          }
        }
      }

      // Symbol ile bulunamadıysa, isim ile arama yap (coin map kullan)
      if (!matchedCoin) {
        try {
          // İlk 5000 coin'in map'ini al (isim ve sembol içerir)
          const coinMap = await cmcService.getCryptocurrencyMap({ limit: 5000 });

          // Query'de geçen coin ismini veya sembolünü bul
          const foundCoin = coinMap.find(coin =>
            queryUpper.includes(coin.symbol.toUpperCase()) ||
            queryUpper.includes(coin.name.toUpperCase())
          );

          if (foundCoin) {
            const coinInfo = await cmcService.getCryptocurrencyQuotesLatest({
              id: foundCoin.id
            });
            matchedCoin = coinInfo[foundCoin.id];
          }
        } catch (e) {
          console.error('Coin map hatası:', e);
        }
      }

      if (matchedCoin) {
        // Belirli coin bulundu
        if (isExchangeQuery) {
          // Borsa listesi sorusu - Market pairs verilerini çek
          const [globalMetrics, marketPairs] = await Promise.all([
            cmcService.getGlobalMetricsQuotesLatest(),
            cmcService.getCryptocurrencyMarketPairs({
              id: matchedCoin.id,
              limit: 100
            }).catch(err => {
              console.log('Market pairs verisi çekilemedi:', err.message);
              return null;
            })
          ]);

          // CEX ve DEX'leri ayır
          const cexList = [];
          const dexList = [];

          if (marketPairs && marketPairs.market_pairs) {
            marketPairs.market_pairs.forEach(pair => {
              const exchangeName = pair.exchange?.name || 'Unknown';
              const isDex = ['Uniswap', 'PancakeSwap', 'SushiSwap', 'Curve', 'Raydium', 'Orca', 'SpookySwap'].some(
                dexName => exchangeName.toLowerCase().includes(dexName.toLowerCase())
              );

              // CMC API farklı versiyonlarda farklı yapılar kullanabiliyor
              const quoteData = pair.quote?.USD || pair.quotes?.[0] || {};

              const pairInfo = {
                exchange: exchangeName,
                pair: pair.market_pair || `${pair.base_symbol}/${pair.quote_symbol}`,
                price: quoteData.price || pair.price || 0,
                volume24h: quoteData.volume_24h || pair.volume_24h || 0,
                url: pair.market_url || ''
              };

              // Sadece valid verileri ekle
              if (pairInfo.exchange !== 'Unknown' && pairInfo.volume24h > 0) {
                if (isDex) {
                  dexList.push(pairInfo);
                } else {
                  cexList.push(pairInfo);
                }
              }
            });
          }

          // Hacme göre sırala ve ilk 5 CEX, 3 DEX
          cexList.sort((a, b) => b.volume24h - a.volume24h);
          dexList.sort((a, b) => b.volume24h - a.volume24h);

          coinData = {
            coin: matchedCoin,
            globalMetrics,
            exchanges: {
              cex: cexList.slice(0, 5),
              dex: dexList.slice(0, 3),
              totalCex: cexList.length,
              totalDex: dexList.length
            }
          };
        } else if (isDexQuery) {
          // DEX sorusu - DEX verilerini de çek
          const [globalMetrics, dexData] = await Promise.all([
            cmcService.getGlobalMetricsQuotesLatest(),
            cmcService.getDEXListingsQuotes({
              symbol: matchedCoin.symbol,
              limit: 10
            }).catch(err => {
              console.log('DEX verisi çekilemedi:', err.message);
              return null;
            })
          ]);

          coinData = {
            coin: matchedCoin,
            globalMetrics,
            dexData: dexData ? {
              listings: dexData,
              hasDexData: true
            } : { hasDexData: false }
          };
        } else {
          // Normal coin sorusu - sadece CEX verileri
          coinData = {
            coin: matchedCoin,
            globalMetrics: await cmcService.getGlobalMetricsQuotesLatest()
          };
        }
      } else {
        // Coin bulunamadı - genel piyasa verisi
        if (isDexQuery) {
          // DEX sorusu - trending DEX tokenleri
          const [globalMetrics, listings, trendingDex] = await Promise.all([
            cmcService.getGlobalMetricsQuotesLatest(),
            cmcService.getCryptocurrencyListingsLatest({ limit: 10 }),
            cmcService.getDEXListingsQuotes({
              limit: 10,
              sort: 'volume_24h',
              sort_dir: 'desc'
            }).catch(err => {
              console.log('Trending DEX verisi çekilemedi:', err.message);
              return null;
            })
          ]);

          coinData = {
            globalMetrics,
            topCoins: listings,
            trendingDex: trendingDex || []
          };
        } else {
          // Normal genel soru - sadece top coins
          const [globalMetrics, listings] = await Promise.all([
            cmcService.getGlobalMetricsQuotesLatest(),
            cmcService.getCryptocurrencyListingsLatest({ limit: 10 })
          ]);

          coinData = {
            globalMetrics,
            topCoins: listings
          };
        }
      }
    } catch (err) {
      console.error('CMC veri çekme hatası:', err);
      coinData = { error: 'Veri çekilemedi' };
    }

    // OpenAI ile yanıt oluştur
    const response = await openaiService.analyzeCoin(query, coinData);

    // Kullanımı artır
    await openaiService.incrementUsage(req.user.telegram_id, supabase);

    // Geçmişe kaydet
    await supabase.from('coin_ai_history').insert([{
      telegram_id: req.user.telegram_id,
      user_query: query,
      ai_response: response
    }]);

    res.json({
      success: true,
      response,
      remaining: usageCheck.remaining - 1
    });
  } catch (error) {
    console.error('Coin AI API hatası:', error);
    res.status(500).json({ error: 'Yanıt oluşturulamadı' });
  }
});

/**
 * Grafik Analizi (görsel ile)
 */
app.post('/api/chart-analysis', checkUser, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL gerekli' });
    }

    // OpenAI kullanım kontrolü
    const usageCheck = await openaiService.checkUsageLimit(req.user.telegram_id, supabase);

    if (!usageCheck.canUse) {
      return res.status(429).json({ error: 'Günlük kullanım limitiniz doldu', remaining: 0 });
    }

    // OpenAI ile görsel analizi
    const analysis = await openaiService.analyzeChart(imageUrl);

    // Kullanımı artır
    await openaiService.incrementUsage(req.user.telegram_id, supabase);

    res.json({
      success: true,
      analysis,
      remaining: usageCheck.remaining - 1
    });
  } catch (error) {
    console.error('Chart Analysis API hatası:', error);
    res.status(500).json({ error: 'Grafik analiz edilemedi' });
  }
});

/**
 * Trading Sinyalleri
 */
app.get('/api/trading-signals', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trading_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, signals: data });
  } catch (error) {
    console.error('Trading Signals API hatası:', error);
    res.status(500).json({ error: 'Sinyaller getirilemedi' });
  }
});

/**
 * Market Screener
 */
app.get('/api/market-screener/:category', checkUser, async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('market_screener')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    res.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Market Screener API hatası:', error);
    res.status(500).json({ error: 'Veriler getirilemedi' });
  }
});

/**
 * Ekonomik Göstergeler
 */
app.get('/api/economic-indicators', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('economic_indicators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, indicators: data });
  } catch (error) {
    console.error('Economic Indicators API hatası:', error);
    res.status(500).json({ error: 'Göstergeler getirilemedi' });
  }
});

/**
 * Fear & Greed Index
 */
app.get('/api/fear-greed', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fear_greed_index')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Fear & Greed API hatası:', error);
    res.status(500).json({ error: 'Index getirilemedi' });
  }
});

/**
 * Whale Alerts
 */
app.get('/api/whale-alerts', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whale_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);

    if (error) throw error;

    // Büyüklüğe göre kategorize et
    const categories = {
      million_1: [],    // 1M - 5M
      million_5: [],    // 5M - 10M
      million_10: [],   // 10M - 50M
      million_50: [],   // 50M - 100M
      million_100: []   // 100M+
    };

    data.forEach(tx => {
      const amount = tx.amount_usd;

      if (amount >= 100000000) {
        categories.million_100.push(tx);
      } else if (amount >= 50000000) {
        categories.million_50.push(tx);
      } else if (amount >= 10000000) {
        categories.million_10.push(tx);
      } else if (amount >= 5000000) {
        categories.million_5.push(tx);
      } else if (amount >= 1000000) {
        categories.million_1.push(tx);
      }
    });

    res.json({
      success: true,
      alerts: data,
      categories: {
        million_1: categories.million_1.slice(0, 50),
        million_5: categories.million_5.slice(0, 50),
        million_10: categories.million_10.slice(0, 50),
        million_50: categories.million_50.slice(0, 50),
        million_100: categories.million_100.slice(0, 50)
      },
      counts: {
        million_1: categories.million_1.length,
        million_5: categories.million_5.length,
        million_10: categories.million_10.length,
        million_50: categories.million_50.length,
        million_100: categories.million_100.length
      }
    });
  } catch (error) {
    console.error('Whale Alerts API hatası:', error);
    res.status(500).json({ error: 'Whale alerts getirilemedi' });
  }
});

/**
 * Haberler
 */
app.get('/api/news', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(30);

    if (error) throw error;

    res.json({ success: true, news: data });
  } catch (error) {
    console.error('News API hatası:', error);
    res.status(500).json({ error: 'Haberler getirilemedi' });
  }
});

/**
 * Geçmiş Analizler - Teknik
 */
app.get('/api/history/technical', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('technical_analysis_history')
      .select('*')
      .eq('telegram_id', req.user.telegram_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, history: data });
  } catch (error) {
    console.error('Technical History API hatası:', error);
    res.status(500).json({ error: 'Geçmiş getirilemedi' });
  }
});

/**
 * Geçmiş Analizler - AI Chat
 */
app.get('/api/history/ai-chat', checkUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coin_ai_history')
      .select('*')
      .eq('telegram_id', req.user.telegram_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, history: data });
  } catch (error) {
    console.error('AI Chat History API hatası:', error);
    res.status(500).json({ error: 'Geçmiş getirilemedi' });
  }
});

/**
 * Kullanıcı Bilgileri
 */
app.get('/api/user-info', checkUser, async (req, res) => {
  try {
    const usageCheck = await openaiService.checkUsageLimit(req.user.telegram_id, supabase);

    res.json({
      success: true,
      user: {
        name: `${req.user.first_name} ${req.user.last_name || ''}`,
        username: req.user.username,
        subscription_start: req.user.subscription_start,
        subscription_end: req.user.subscription_end,
        daily_usage: usageCheck.used,
        daily_limit: parseInt(process.env.DAILY_OPENAI_LIMIT || 100),
        remaining: usageCheck.remaining
      }
    });
  } catch (error) {
    console.error('User Info API hatası:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri getirilemedi' });
  }
});

// Server başlat
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📱 Web App URL: http://localhost:${PORT}`);
});
