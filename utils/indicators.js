const { RSI, MACD, EMA, SMA, BollingerBands, ADX, ATR, ROC, Stochastic } = require('technicalindicators');

/**
 * Teknik göstergeleri hesaplar
 */
class TechnicalIndicators {

  /**
   * RSI (Relative Strength Index) hesapla
   */
  static calculateRSI(closes, period = 14) {
    return RSI.calculate({
      values: closes,
      period: period
    });
  }

  /**
   * MACD hesapla
   */
  static calculateMACD(closes) {
    return MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
  }

  /**
   * EMA (Exponential Moving Average) hesapla
   */
  static calculateEMA(closes, period) {
    return EMA.calculate({
      values: closes,
      period: period
    });
  }

  /**
   * SMA (Simple Moving Average) hesapla
   */
  static calculateSMA(closes, period) {
    return SMA.calculate({
      values: closes,
      period: period
    });
  }

  /**
   * Bollinger Bands hesapla
   */
  static calculateBollingerBands(closes, period = 20, stdDev = 2) {
    return BollingerBands.calculate({
      values: closes,
      period: period,
      stdDev: stdDev
    });
  }

  /**
   * ADX (Average Directional Index) hesapla
   */
  static calculateADX(highs, lows, closes, period = 14) {
    return ADX.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period
    });
  }

  /**
   * ATR (Average True Range) hesapla
   */
  static calculateATR(highs, lows, closes, period = 14) {
    return ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period
    });
  }

  /**
   * ROC (Rate of Change) hesapla
   */
  static calculateROC(closes, period = 12) {
    return ROC.calculate({
      values: closes,
      period: period
    });
  }

  /**
   * Momentum hesapla
   */
  static calculateMomentum(closes, period = 10) {
    const momentum = [];
    for (let i = period; i < closes.length; i++) {
      momentum.push(closes[i] - closes[i - period]);
    }
    return momentum;
  }

  /**
   * Stochastic Oscillator hesapla
   */
  static calculateStochastic(highs, lows, closes, period = 14, signalPeriod = 3) {
    return Stochastic.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period,
      signalPeriod: signalPeriod
    });
  }

  /**
   * VWAP (Volume Weighted Average Price) hesapla
   */
  static calculateVWAP(candles) {
    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVolume = 0;
    const vwap = [];

    for (let i = 0; i < candles.length; i++) {
      const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
      const tpv = typicalPrice * candles[i].volume;

      cumulativeTPV += tpv;
      cumulativeVolume += candles[i].volume;

      vwap.push(cumulativeTPV / cumulativeVolume);
    }

    return vwap;
  }

  /**
   * Tüm göstergeleri hesapla
   */
  static calculateAll(candles) {
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const opens = candles.map(c => c.open);
    const volumes = candles.map(c => c.volume);

    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, 200);
    const sma = this.calculateSMA(closes, 20);
    const bollinger = this.calculateBollingerBands(closes);
    const adx = this.calculateADX(highs, lows, closes);
    const atr = this.calculateATR(highs, lows, closes);
    const roc = this.calculateROC(closes);
    const momentum = this.calculateMomentum(closes);
    const stochastic = this.calculateStochastic(highs, lows, closes);
    const vwap = this.calculateVWAP(candles.map((c, i) => ({
      high: highs[i],
      low: lows[i],
      close: closes[i],
      volume: volumes[i]
    })));

    return {
      rsi: rsi[rsi.length - 1],
      macd: macd[macd.length - 1],
      ema20: ema20[ema20.length - 1],
      ema50: ema50[ema50.length - 1],
      ema200: ema200[ema200.length - 1],
      sma: sma[sma.length - 1],
      bollinger: bollinger[bollinger.length - 1],
      adx: adx[adx.length - 1],
      atr: atr[atr.length - 1],
      roc: roc[roc.length - 1],
      momentum: momentum[momentum.length - 1],
      stochastic: stochastic[stochastic.length - 1],
      vwap: vwap[vwap.length - 1],
      currentPrice: closes[closes.length - 1],
      volume: volumes[volumes.length - 1]
    };
  }

  /**
   * Sinyal üret (Strong Buy, Buy, Hold, Sell, Strong Sell)
   */
  static generateSignal(indicators) {
    let score = 0;
    const signals = [];

    // RSI
    if (indicators.rsi > 70) {
      score -= 2;
      signals.push('RSI Aşırı Alım');
    } else if (indicators.rsi < 30) {
      score += 2;
      signals.push('RSI Aşırı Satım');
    } else if (indicators.rsi > 50) {
      score += 1;
    } else {
      score -= 1;
    }

    // MACD
    if (indicators.macd && indicators.macd.MACD > indicators.macd.signal) {
      score += 2;
      signals.push('MACD Boğa');
    } else if (indicators.macd && indicators.macd.MACD < indicators.macd.signal) {
      score -= 2;
      signals.push('MACD Ayı');
    }

    // EMA
    if (indicators.currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50) {
      score += 2;
      signals.push('EMA Yükseliş Trendi');
    } else if (indicators.currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50) {
      score -= 2;
      signals.push('EMA Düşüş Trendi');
    }

    // Bollinger Bands
    if (indicators.bollinger) {
      if (indicators.currentPrice < indicators.bollinger.lower) {
        score += 1;
        signals.push('Bollinger Alt Bant');
      } else if (indicators.currentPrice > indicators.bollinger.upper) {
        score -= 1;
        signals.push('Bollinger Üst Bant');
      }
    }

    // ADX (Trend Gücü)
    if (indicators.adx && indicators.adx.adx > 25) {
      signals.push('Güçlü Trend');
    }

    // Stochastic
    if (indicators.stochastic && indicators.stochastic.k > 80) {
      score -= 1;
      signals.push('Stochastic Aşırı Alım');
    } else if (indicators.stochastic && indicators.stochastic.k < 20) {
      score += 1;
      signals.push('Stochastic Aşırı Satım');
    }

    // Skor bazlı sinyal
    let signal;
    if (score >= 5) signal = 'STRONG_BUY';
    else if (score >= 2) signal = 'BUY';
    else if (score <= -5) signal = 'STRONG_SELL';
    else if (score <= -2) signal = 'SELL';
    else signal = 'HOLD';

    return {
      signal,
      score,
      reasons: signals,
      indicators
    };
  }
}

module.exports = TechnicalIndicators;
