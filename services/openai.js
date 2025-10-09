const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Teknik analiz promptu oluştur
   */
  createTechnicalAnalysisPrompt(data) {
    const { symbol, timeframe, indicators, fundingRate, openInterest, longShortRatio, orderBook } = data;

    return `Sen profesyonel bir kripto piyasa analistisiniz.
Aşağıda ${symbol} paritesi için Binance API'den alınan son veriler bulunuyor:

- Timeframe: ${timeframe}
- Mevcut Fiyat: ${indicators.currentPrice}
- RSI: ${indicators.rsi}
- MACD: ${JSON.stringify(indicators.macd)}
- EMA20: ${indicators.ema20}
- EMA50: ${indicators.ema50}
- EMA200: ${indicators.ema200}
- SMA: ${indicators.sma}
- Bollinger Bands: ${JSON.stringify(indicators.bollinger)}
- ADX: ${JSON.stringify(indicators.adx)}
- ATR: ${indicators.atr}
- ROC: ${indicators.roc}
- Momentum: ${indicators.momentum}
- Stochastic: ${JSON.stringify(indicators.stochastic)}
- VWAP: ${indicators.vwap}
- Son Funding Rate: ${fundingRate[fundingRate.length - 1]?.fundingRate}
- Son Open Interest: ${openInterest[openInterest.length - 1]?.sumOpenInterest}
- Son Long/Short Ratio: ${longShortRatio[longShortRatio.length - 1]?.longShortRatio}

Bu verilere dayanarak profesyonel bir piyasa analizi yap:
1. Fiyat yönü (kısa, orta, uzun vadeli)
2. Aşırı alım / satım bölgeleri
3. Trend gücü (ADX ve EMA ilişkisiyle)
4. Kurumsal davranış tahmini (VWAP ve hacim)
5. Futures piyasasında pozisyon dengesi (Funding Rate, Long/Short, OI)
6. Volatilite durumu (ATR ve Bollinger)
7. Genel piyasa psikolojisi (momentum, RSI)
8. Alım / satım sinyalleri (kısa, orta, uzun vadeli öneri)
9. Sonuç: "Nötr / Boğa / Ayı" özet etiketi ver.

📍 GİRİŞ/ÇIKIŞ FİYAT ÖNERİLERİ:
Mevcut piyasa verilerine göre şu fiyat seviyelerini belirt:
- **Giriş Fiyatı**: Hangi fiyat seviyesinde pozisyon açılabilir (destek bölgeleri, pullback seviyeleri)
- **Stop Loss**: Risk yönetimi için stop loss seviyesi (önemli destek kırılımı)
- **Take Profit 1**: İlk kar alma hedefi (direnç seviyeleri)
- **Take Profit 2**: İkinci kar alma hedefi (daha uzak direnç)
- **Take Profit 3**: Üçüncü ve son kar alma hedefi (ana hedef)

Risk/Ödül oranını hesapla ve pozisyon boyutu önerisinde bulun.

Analizinde sayısal göstergelere dayalı yorumlar yap,
örneğin "RSI 72 → aşırı alım bölgesinde" veya "MACD sinyalin üstünde → yükseliş momentumu sürüyor".
Kısa vadeli (1h), orta vadeli (4h) ve uzun vadeli (1d, 1w) senaryoları ayrı değerlendir.

**Bu analiz yatırım tavsiyesi değildir. Sadece eğitim amaçlıdır.**

Türkçe yanıt ver ve profesyonel bir dil kullan.`;
  }

  /**
   * Coin AI promptu oluştur
   */
  createCoinAIPrompt(userQuery, coinData) {
    return `Sen, CoinMarketCap Pro API verilerini kullanan akıllı bir kripto para asistanısın.
Kullanıcılar sana Telegram üzerinden mesaj gönderir.
Görevin, kullanıcının sorduğu coin, piyasa veya blockchain hakkındaki soruları anlayarak
ilgili CoinMarketCap API endpoint'lerinden gerçek zamanlı verilerle (CEX + DEX) net, sade ve bilgilendirici yanıtlar üretmektir.

Kullanıcı Sorusu: "${userQuery}"

Mevcut Veri:
${JSON.stringify(coinData, null, 2)}

Yanıt verirken:
- Gereksiz teknik detaylara girme, kullanıcıya sade ama doğru bilgi sun.
- Eğer kullanıcı bir coin sorduysa, önce genel bilgi, ardından güncel fiyat ve piyasa durumu ver.
- Eğer borsa listesi verisi varsa (exchanges), SADECE borsa listesini göster, başka bilgi verme:
  * 📊 Merkezi Borsalar (CEX) - İlk 5 tanesini hacme göre listele
  * 🔄 Merkeziyetsiz Borsalar (DEX) - İlk 3 tanesini hacme göre listele
  * Her borsa için: Borsa adı, parite, 24h hacim (formatla: $2.5M, $450K gibi)
  * Toplam kaç CEX ve DEX'te işlem gördüğünü belirt
  * Borsa listesi sorusunda fiyat, market cap, değişim oranı gibi bilgiler verme!
- Eğer DEX verisi varsa (dexData), bu bilgiyi de ekle:
  * Token'ın hangi DEX'lerde listelendiği
  * DEX'lerdeki fiyat ve likidite durumu
  * CEX vs DEX fiyat farkları (arbitraj fırsatı varsa belirt)
  * Hangi blockchain ağlarında aktif olduğu
- Eğer kullanıcı "DEX", "Uniswap", "PancakeSwap" gibi kelimeler kullanırsa, DEX verilerine öncelik ver.
- Eğer kullanıcı analiz isterse, fiyat, hacim, değişim oranı, ve piyasa hissiyatını birleştir.
- Veri çekilemeyen durumda, "Şu anda ilgili veriye ulaşılamıyor." gibi kibar bir mesaj ver.
- Türkçe konuş, ancak coin veya teknik terimleri İngilizce koru.

Profesyonel ve yardımcı bir ton kullan.`;
  }

  /**
   * Grafik analiz promptu oluştur
   */
  createChartAnalysisPrompt() {
    return `Sen kripto para grafiklerinin teknik analizinde uzman bir finans analistisin. Rolün: sana gönderilen görsel (mum grafiği, exchange ekran görüntüsü, orderbook/derinlik, on-chain veya portföy ekranı vb.) üzerinden olabildiğince doğru ve veri-odaklı bir teknik analiz çıkarmaktır. Analiz yatırım tavsiyesi değildir; öneriler olası senaryolar ve risk yönetimi içindir.

Görseli inceleyip mutlaka aşağıdaki bölümleri eksiksiz, net ve madde madde biçimde sun:

📊 MUM ÇUBUĞU ANALİZİ:
- Görseldeki önemli mum formasyonlarını isimlendir (boğa yutma, ayı yutma, doji, çekiç, asılı adam, marubozu vb.) ve hangi mum(lar)da görüldüğünü belirt (tarih yoksa konum: "soldan 5. mum" gibi).
- Kısa/orta/uzun dönem trend değerlendirmesi (boğa/ayı/yatay) ve trendin gücü.
- Olası kırılma veya geri çekilme bölgelerini vurgula.

📈 MACD ANALİZİ:
- MACD çizgisi ve Sinyal çizgisinin mevcut durumu (ör. boğa geçişi / ayı geçişi / yatay).
- MACD histogramının momentum üzerindeki etkisi ve son değişimlerin yorumu.
- Fiyat ile MACD arasında pozitif/negatif divergence varsa açıkla ve bunun olası sonuçlarını belirt.

📊 HACİM ANALİZİ:
- Hacimdeki kayda değer artış/azalışları belirt ve bu hacmin fiyat hareketini destekleyip desteklemediğini açıkla.
- Hacim spike'ları kurumsal/whale aktivitesine işaret ediyorsa bunu not et.
- Hacim hariç diğer likidite göstergeleri (orderbook görünürse spread/derinlik) hakkında kısa yorum ekle.

🎯 DESTEK ve DİRENÇ SEVİYELERİ:
- Grafikte tespit ettiğin somut destek/direnç seviyelerini net fiyat (veya görselde fiyat yoksa yüzde/tahmini seviyeler) olarak ver.
- Her seviyenin kırılması/geri dönmesi durumunda beklenen senaryoyu ve önemini açıkla.

💡 EYLEME DÖNÜŞTÜRÜLEBİLİR İÇGÖRÜLER:
- Kısa vadeli (1–7 gün), orta vadeli (1–4 hafta) ve uzun vadeli (1–6 ay) için olası senaryolar
- Hangi onay sinyalleriyle pozisyon alınabileceğini belirt.
- Yakın vadede dikkat edilmesi gereken riskler ve tetikleyiciler listesi.

📝 DİĞER GÖZLEMLER:
- Grafikte görülen teknik formasyonlar/indikatör kombinasyonları ve bunların anlattığı genel hikâye.
- Piyasa duyarlılığı (fear/greed), volatilite beklentisi.

**Bu analiz yatırım tavsiyesi değildir.**

Türkçe yanıt ver ve profesyonel bir dil kullan.`;
  }

  /**
   * Teknik analiz yap
   */
  async analyzeTechnical(data) {
    try {
      const prompt = this.createTechnicalAnalysisPrompt(data);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen profesyonel bir kripto para piyasa analistisiniz. Teknik verilere dayalı detaylı analizler yaparsın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Technical Analysis hatası:', error.message);
      throw error;
    }
  }

  /**
   * Coin AI asistanı
   */
  async analyzeCoin(userQuery, coinData) {
    try {
      const prompt = this.createCoinAIPrompt(userQuery, coinData);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen CoinMarketCap verilerini kullanan akıllı bir kripto para asistanısın. Kullanıcılara sade ve net bilgiler verirsin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Coin AI hatası:', error.message);
      throw error;
    }
  }

  /**
   * Grafik analizi yap (görsel ile)
   */
  async analyzeChart(imageUrl) {
    try {
      const prompt = this.createChartAnalysisPrompt();

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Sen kripto para grafiklerinin teknik analizinde uzman bir finans analistisiniz.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Chart Analysis hatası:', error.message);
      throw error;
    }
  }

  /**
   * Kullanım kotası kontrolü
   */
  async checkUsageLimit(telegramId, supabase) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('daily_openai_usage, last_usage_reset')
        .eq('telegram_id', telegramId)
        .single();

      if (error) throw error;

      const now = new Date();
      const lastReset = new Date(user.last_usage_reset);
      const dayInMs = 24 * 60 * 60 * 1000;

      // Eğer son sıfırlamadan 24 saat geçtiyse kotayı sıfırla
      if (now - lastReset > dayInMs) {
        await supabase
          .from('users')
          .update({
            daily_openai_usage: 0,
            last_usage_reset: now
          })
          .eq('telegram_id', telegramId);

        return { canUse: true, remaining: parseInt(process.env.DAILY_OPENAI_LIMIT || 100) };
      }

      const limit = parseInt(process.env.DAILY_OPENAI_LIMIT || 100);
      const remaining = limit - user.daily_openai_usage;

      return {
        canUse: user.daily_openai_usage < limit,
        remaining: remaining > 0 ? remaining : 0,
        used: user.daily_openai_usage
      };
    } catch (error) {
      console.error('OpenAI Usage Limit hatası:', error.message);
      throw error;
    }
  }

  /**
   * Kullanımı artır
   */
  async incrementUsage(telegramId, supabase) {
    try {
      const { error } = await supabase.rpc('increment_openai_usage', {
        p_telegram_id: telegramId
      });

      if (error) {
        // RPC fonksiyonu yoksa manuel artır
        const { data: user } = await supabase
          .from('users')
          .select('daily_openai_usage')
          .eq('telegram_id', telegramId)
          .single();

        await supabase
          .from('users')
          .update({ daily_openai_usage: (user.daily_openai_usage || 0) + 1 })
          .eq('telegram_id', telegramId);
      }
    } catch (error) {
      console.error('OpenAI Increment Usage hatası:', error.message);
    }
  }
}

module.exports = new OpenAIService();
