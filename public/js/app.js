// Telegram WebApp hazırlık
const tg = window.Telegram?.WebApp;
let telegramId = null;

// Telegram WebApp başlat
if (tg) {
  tg.ready();
  tg.expand();
  telegramId = tg.initDataUnsafe?.user?.id;
}

// Development için test ID (üretimde kaldırılacak)
if (!telegramId) {
  telegramId = 123456789; // Test için
}

// Menu toggle
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

// Modal
function openModal(title, content) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// API çağrıları
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const url = method === 'GET' && telegramId
    ? `${endpoint}?telegram_id=${telegramId}`
    : endpoint;

  const response = await fetch(url, options);
  return response.json();
}

// Sayfa yükleme
async function loadPage(page) {
  toggleMenu();
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">Yükleniyor...</div>';

  switch (page) {
    case 'home':
      await loadHomePage();
      break;
    case 'technical-analysis':
      await loadTechnicalAnalysis();
      break;
    case 'coin-ai':
      await loadCoinAI();
      break;
    case 'chart-analysis':
      await loadChartAnalysis();
      break;
    case 'trading-signals':
      await loadTradingSignals();
      break;
    case 'market-screener':
      await loadMarketScreener();
      break;
    case 'economic-indicators':
      await loadEconomicIndicators();
      break;
    case 'fear-greed':
      await loadFearGreed();
      break;
    case 'whale-alerts':
      await loadWhaleAlerts();
      break;
    case 'news':
      await loadNews();
      break;
    case 'history':
      await loadHistory();
      break;
    case 'user-info':
      await loadUserInfo();
      break;
    default:
      await loadHomePage();
  }
}

// Ana Sayfa
async function loadHomePage() {
  document.getElementById('page-title').textContent = 'Ana Sayfa';
  const content = document.getElementById('content');

  // Kullanıcı durumunu kontrol et
  try {
    const response = await apiCall('/api/user-info');

    if (response.success) {
      // Kayıtlı kullanıcı - ana sayfa göster
      showMainDashboard();
    } else {
      // Kayıtsız kullanıcı - kayıt formu göster
      showRegistrationForm();
    }
  } catch (error) {
    // Hata durumunda kayıt formu göster
    showRegistrationForm();
  }
}

// Ana dashboard (kayıtlı kullanıcılar için)
function showMainDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <h2>Hoş Geldiniz! 👋</h2>
      <p>Kripto para analiz botuna hoş geldiniz. Sol üst köşedeki menüden istediğiniz özelliğe erişebilirsiniz.</p>
    </div>

    <div class="card">
      <div class="card-title">Özellikler</div>
      <div class="grid grid-2">
        <button class="btn btn-block" onclick="loadPage('technical-analysis')">📊 Teknik Analiz</button>
        <button class="btn btn-block" onclick="loadPage('coin-ai')">🤖 Coin AI</button>
        <button class="btn btn-block" onclick="loadPage('trading-signals')">🎯 Trading Sinyalleri</button>
        <button class="btn btn-block" onclick="loadPage('market-screener')">🔍 Piyasa Tarayıcı</button>
        <button class="btn btn-block" onclick="loadPage('whale-alerts')">🐋 Whale Alert</button>
        <button class="btn btn-block" onclick="loadPage('news')">📰 Haberler</button>
      </div>
    </div>
  `;
}

// Kayıt formu (kayıtsız kullanıcılar için)
function showRegistrationForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <h2>🔐 Kayıt Ol</h2>
      <p style="margin: 15px 0; line-height: 1.6;">
        Uygulamayı kullanmak için önce kayıt olmanız gerekiyor.
        Lütfen aşağıdaki bilgileri okuyun ve ödeme yaptıktan sonra ekran görüntüsünü yükleyin.
      </p>
    </div>

    <div class="card">
      <div class="card-title">💰 Ödeme Bilgileri</div>

      <div style="background: var(--tg-theme-secondary-bg-color, #f9f9f9); padding: 15px; border-radius: 8px; margin: 15px 0;">
        <div style="margin-bottom: 10px;">
          <strong>Cüzdan Adresi (BSC Ağı):</strong>
        </div>
        <div style="background: white; padding: 10px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px;">
          0x55cB743E051994F374faAEcD7CD2fFeC3c44464e
        </div>
      </div>

      <div style="background: var(--tg-theme-secondary-bg-color, #f9f9f9); padding: 15px; border-radius: 8px; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong>💵 Tutar:</strong>
          <span>400 BTCBAM veya 19 USDT</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <strong>⏰ Süre:</strong>
          <span>30 Gün</span>
        </div>
      </div>

      <div class="alert alert-info">
        ⚠️ Ödemeyi yalnızca <strong>BSC ağı</strong> üzerinden gönderiniz.<br>
        ⚠️ Farklı ağlardan yapılan gönderimler kaybolur ve geri alınamaz.
      </div>
    </div>

    <div class="card">
      <div class="card-title">📸 Ödeme Ekran Görüntüsü</div>

      <div class="input-group">
        <label>Ödeme ekran görüntünüzü seçin:</label>
        <input type="file" id="payment-screenshot" accept="image/*" style="padding: 10px; border: 2px dashed var(--tg-theme-hint-color, #ccc); border-radius: 8px; cursor: pointer;">
      </div>

      <div id="preview-container" style="margin-top: 15px; display: none;">
        <img id="preview-image" style="width: 100%; border-radius: 8px; max-height: 300px; object-fit: contain;">
      </div>

      <div id="registration-message" style="margin-top: 15px;"></div>

      <button class="btn btn-block" onclick="submitRegistration()" style="margin-top: 15px;">
        ✅ Kaydı Tamamla
      </button>
    </div>

    <div class="card">
      <div style="font-size: 12px; color: var(--tg-theme-hint-color, #999); line-height: 1.6;">
        <strong>📝 Not:</strong> Ödemenizi yaptıktan sonra ekran görüntüsünü yükleyip "Kaydı Tamamla" butonuna tıklayın.
        Kaydınız admin tarafından onaylandıktan sonra tüm özelliklere erişebileceksiniz.
      </div>
    </div>
  `;

  // Dosya seçildiğinde önizleme göster
  setTimeout(() => {
    const fileInput = document.getElementById('payment-screenshot');
    if (fileInput) {
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            previewImage.src = event.target.result;
            previewContainer.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, 100);
}

// Teknik Analiz
async function loadTechnicalAnalysis() {
  document.getElementById('page-title').textContent = 'Teknik Analiz';
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Teknik Analiz</div>
      <div class="input-group">
        <label>Coin Sembolü</label>
        <input type="text" id="ta-symbol" placeholder="BTCUSDT" value="BTCUSDT">
      </div>
      <div class="input-group">
        <label>Zaman Dilimi</label>
        <select id="ta-timeframe">
          <option value="15m">15 Dakika</option>
          <option value="30m">30 Dakika</option>
          <option value="1h" selected>1 Saat</option>
          <option value="4h">4 Saat</option>
          <option value="1d">1 Gün</option>
          <option value="1w">1 Hafta</option>
        </select>
      </div>
      <button class="btn btn-block" onclick="analyzeTechnical()">Analiz Yap</button>
    </div>
    <div id="ta-result"></div>
  `;
}

async function analyzeTechnical() {
  let symbol = document.getElementById('ta-symbol').value.toUpperCase().trim();
  const timeframe = document.getElementById('ta-timeframe').value;
  const resultDiv = document.getElementById('ta-result');

  if (!symbol) {
    resultDiv.innerHTML = '<div class="alert alert-error">Lütfen bir coin sembolü girin</div>';
    return;
  }

  // Otomatik USDT ekleme - eğer parite çifti değilse USDT ekle
  const validPairs = ['USDT', 'BUSD', 'USDC', 'DAI', 'TUSD'];
  const hasValidPair = validPairs.some(pair => symbol.endsWith(pair));

  if (!hasValidPair) {
    symbol = symbol + 'USDT';
  }

  resultDiv.innerHTML = '<div class="loading">Analiz yapılıyor...</div>';

  try {
    const response = await apiCall('/api/technical-analysis', 'POST', {
      telegram_id: telegramId,
      symbol,
      timeframe
    });

    if (response.success) {
      resultDiv.innerHTML = `
        <div class="card">
          <div class="card-title">Analiz Sonucu</div>
          <div class="analysis-result">${response.analysis}</div>
          <div style="margin-top: 15px; color: var(--tg-theme-hint-color, #999); font-size: 12px;">
            Kalan kullanım hakkı: ${response.remaining}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-error">Bir hata oluştu</div>`;
  }
}

// Coin AI
async function loadCoinAI() {
  document.getElementById('page-title').textContent = 'Yapay Zeka Asistanı';
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Coin AI Asistanı</div>
      <div class="input-group">
        <label>Sorunuz</label>
        <textarea id="coin-ai-query" rows="4" placeholder="Örn: BTC hakkında bilgi ver"></textarea>
      </div>
      <button class="btn btn-block" onclick="askCoinAI()">Sor</button>
    </div>
    <div id="coin-ai-result"></div>
  `;
}

async function askCoinAI() {
  const query = document.getElementById('coin-ai-query').value;
  const resultDiv = document.getElementById('coin-ai-result');

  if (!query.trim()) {
    resultDiv.innerHTML = '<div class="alert alert-error">Lütfen bir soru girin</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="loading">Yanıt oluşturuluyor...</div>';

  try {
    const response = await apiCall('/api/coin-ai', 'POST', {
      telegram_id: telegramId,
      query
    });

    if (response.success) {
      resultDiv.innerHTML = `
        <div class="card">
          <div class="card-title">Yanıt</div>
          <div class="analysis-result">${response.response}</div>
          <div style="margin-top: 15px; color: var(--tg-theme-hint-color, #999); font-size: 12px;">
            Kalan kullanım hakkı: ${response.remaining}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-error">Bir hata oluştu</div>`;
  }
}

// Grafik Analizi
async function loadChartAnalysis() {
  document.getElementById('page-title').textContent = 'Grafik Analizi';
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Grafik Analizi</div>
      <p>Grafik görselinizi yükleyin:</p>
      <div class="input-group">
        <label>Grafik Görseli</label>
        <input type="file" id="chart-image" accept="image/*" onchange="previewChartImage(this)">
      </div>
      <div id="chart-preview" style="margin: 10px 0; text-align: center;"></div>
      <button class="btn btn-block" onclick="analyzeChart()">Analiz Yap</button>
    </div>
    <div id="chart-result"></div>
  `;
}

function previewChartImage(input) {
  const preview = document.getElementById('chart-preview');

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    preview.innerHTML = '';
  }
}

async function analyzeChart() {
  const imageInput = document.getElementById('chart-image');
  const resultDiv = document.getElementById('chart-result');

  if (!imageInput.files || !imageInput.files[0]) {
    resultDiv.innerHTML = '<div class="alert alert-error">Lütfen bir görsel seçin</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="loading">Grafik analiz ediliyor...</div>';

  try {
    // Dosyayı base64'e çevir
    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
      const imageUrl = e.target.result; // base64 string

      const response = await apiCall('/api/chart-analysis', 'POST', {
        telegram_id: telegramId,
        imageUrl
      });

      if (response.success) {
        resultDiv.innerHTML = `
          <div class="card">
            <div class="card-title">Grafik Analiz Sonucu</div>
            <div class="analysis-result">${response.analysis}</div>
            <div style="margin-top: 15px; color: var(--tg-theme-hint-color, #999); font-size: 12px;">
              Kalan kullanım hakkı: ${response.remaining}
            </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
      }
    };

    reader.onerror = function() {
      resultDiv.innerHTML = `<div class="alert alert-error">Görsel yüklenirken hata oluştu</div>`;
    };

    reader.readAsDataURL(file);
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-error">Bir hata oluştu</div>`;
  }
}

// Trading Sinyalleri
async function loadTradingSignals() {
  document.getElementById('page-title').textContent = 'İşlem Sinyalleri';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Sinyaller yükleniyor...</div>';

  try {
    const response = await apiCall('/api/trading-signals');

    if (response.success) {
      const signals = response.signals;
      let html = '<div class="card"><div class="card-title">Trading Sinyalleri</div>';

      signals.forEach(signal => {
        const signalClass = `signal-${signal.signal_type.toLowerCase().replace('_', '-')}`;
        html += `
          <div class="history-item" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${signal.symbol}</strong>
                <div style="font-size: 12px; color: var(--tg-theme-hint-color, #999);">
                  Fiyat: $${signal.price?.toFixed(2)}
                </div>
              </div>
              <span class="signal-badge ${signalClass}">${signal.signal_type}</span>
            </div>
          </div>
        `;
      });

      html += '</div>';
      content.innerHTML = html;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Sinyaller yüklenemedi</div>`;
  }
}

// Market Screener
async function loadMarketScreener() {
  document.getElementById('page-title').textContent = 'Piyasa Tarayıcı';
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Piyasa Tarayıcı</div>
      <div class="grid grid-2">
        <button class="btn btn-block" onclick="showMarketCategory('top_gainers')">📈 En Çok Yükselenler</button>
        <button class="btn btn-block" onclick="showMarketCategory('top_losers')">📉 En Çok Düşenler</button>
        <button class="btn btn-block" onclick="showMarketCategory('high_volume')">💰 En Yüksek Hacim</button>
        <button class="btn btn-block" onclick="showMarketCategory('trending')">🔥 Trend Coinler</button>
        <button class="btn btn-block" onclick="showMarketCategory('new_listings')">🆕 Yeni Listelemeler</button>
        <button class="btn btn-block" onclick="showMarketCategory('low_mcap')">💎 Düşük Piyasa Değeri</button>
      </div>
    </div>
    <div id="market-result"></div>
  `;
}

async function showMarketCategory(category) {
  const resultDiv = document.getElementById('market-result');
  resultDiv.innerHTML = '<div class="loading">Yükleniyor...</div>';

  try {
    const response = await apiCall(`/api/market-screener/${category}`);

    if (response.success) {
      const coins = response.data;
      let html = '<div class="card">';

      coins.slice(0, 20).forEach(coin => {
        // CoinMarketCap formatı için veri çıkarma
        const price = coin.quote?.USD?.price || 0;
        const change = coin.quote?.USD?.percent_change_24h || 0;
        const changeClass = change >= 0 ? 'color: #22c55e' : 'color: #ef4444';

        html += `
          <div class="history-item">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>${coin.symbol || coin.name}</strong>
                <div style="font-size: 12px; color: var(--tg-theme-hint-color, #999);">
                  ${coin.name || coin.symbol}
                </div>
              </div>
              <div style="text-align: right;">
                <div>$${price ? price.toFixed(4) : 'N/A'}</div>
                <div style="font-size: 12px; ${changeClass}">
                  ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
      resultDiv.innerHTML = html;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-error">Veriler yüklenemedi</div>`;
  }
}

// Ekonomik Göstergeler
async function loadEconomicIndicators() {
  document.getElementById('page-title').textContent = 'Ekonomik Göstergeler';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Göstergeler yükleniyor...</div>';

  try {
    const response = await apiCall('/api/economic-indicators');

    if (response.success) {
      const indicators = response.indicators;
      let html = '<div class="card"><div class="card-title">Ekonomik Göstergeler</div>';

      indicators.forEach(ind => {
        html += `
          <div class="history-item">
            <div class="history-item-title">${ind.indicator_name}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
              <span style="font-size: 12px; color: var(--tg-theme-hint-color, #999);">${ind.indicator_code}</span>
              <strong>${ind.value}</strong>
            </div>
            <div style="font-size: 11px; color: var(--tg-theme-hint-color, #999); margin-top: 3px;">
              ${ind.date || 'N/A'}
            </div>
          </div>
        `;
      });

      html += '</div>';
      content.innerHTML = html;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Göstergeler yüklenemedi</div>`;
  }
}

// Fear & Greed Index
async function loadFearGreed() {
  document.getElementById('page-title').textContent = 'Korku & Açgözlülük Endeksi';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Endeks yükleniyor...</div>';

  try {
    const response = await apiCall('/api/fear-greed');

    if (response.success) {
      const data = response.data;
      let color = '#fbbf24';
      let turkishClassification = data.value_classification;

      // Türkçe sınıflandırma
      if (data.value_classification === 'Extreme Fear') turkishClassification = 'Aşırı Korku';
      else if (data.value_classification === 'Fear') turkishClassification = 'Korku';
      else if (data.value_classification === 'Neutral') turkishClassification = 'Nötr';
      else if (data.value_classification === 'Greed') turkishClassification = 'Açgözlülük';
      else if (data.value_classification === 'Extreme Greed') turkishClassification = 'Aşırı Açgözlülük';

      if (data.value >= 75) color = '#22c55e';
      else if (data.value >= 50) color = '#86efac';
      else if (data.value <= 25) color = '#ef4444';

      content.innerHTML = `
        <div class="card">
          <div class="card-title">Korku & Açgözlülük Endeksi</div>
          <div style="text-align: center; padding: 30px 0;">
            <div style="font-size: 72px; font-weight: bold; color: ${color};">
              ${data.value}
            </div>
            <div style="font-size: 24px; margin-top: 10px; color: ${color};">
              ${turkishClassification}
            </div>
            <div style="font-size: 12px; color: var(--tg-theme-hint-color, #999); margin-top: 15px;">
              ${new Date(data.timestamp).toLocaleString('tr-TR')}
            </div>
          </div>
          <div style="padding: 15px; background: var(--tg-theme-bg-color, #f9f9f9); border-radius: 8px; margin-top: 15px;">
            <div style="font-size: 12px; color: var(--tg-theme-hint-color, #666);">
              0-25: Aşırı Korku | 25-50: Korku | 50-75: Açgözlülük | 75-100: Aşırı Açgözlülük
            </div>
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Endeks yüklenemedi</div>`;
  }
}

// Whale Alerts
async function loadWhaleAlerts() {
  document.getElementById('page-title').textContent = 'Balina Alarmları';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Balina alarmları yükleniyor...</div>';

  try {
    const response = await apiCall('/api/whale-alerts');

    if (response.success) {
      const alerts = response.alerts;
      let html = '<div class="card"><div class="card-title">Balina Alarmları</div>';

      alerts.forEach(alert => {
        // Transfer tipi ve emoji
        let typeText = '';
        let typeEmoji = '';
        let typeColor = '';

        if (alert.transaction_type === 'deposit') {
          typeText = '📥 Borsa Girişi';
          typeEmoji = '📥';
          typeColor = '#22c55e';
        } else if (alert.transaction_type === 'withdrawal') {
          typeText = '📤 Borsa Çıkışı';
          typeEmoji = '📤';
          typeColor = '#ef4444';
        } else if (alert.transaction_type === 'wallet_transfer') {
          typeText = '💸 Cüzdandan Cüzdana';
          typeEmoji = '💸';
          typeColor = '#3b82f6';
        } else if (alert.transaction_type === 'exchange_to_exchange') {
          typeText = '🔄 Borsalar Arası';
          typeEmoji = '🔄';
          typeColor = '#f59e0b';
        } else {
          typeText = '💰 Transfer';
          typeEmoji = '💰';
          typeColor = '#8b5cf6';
        }

        // Tutar formatı (1M, 5M, 10M, 50M, 100M)
        const amountUsd = alert.amount_usd || 0;
        let amountDisplay = '';
        if (amountUsd >= 1000000000) {
          amountDisplay = `$${(amountUsd / 1000000000).toFixed(1)}B`;
        } else if (amountUsd >= 1000000) {
          amountDisplay = `$${(amountUsd / 1000000).toFixed(1)}M`;
        } else if (amountUsd >= 1000) {
          amountDisplay = `$${(amountUsd / 1000).toFixed(1)}K`;
        } else {
          amountDisplay = `$${amountUsd.toFixed(0)}`;
        }

        // From/To bilgisi - Borsa/Cüzdan isimleri
        const fromOwner = alert.from_owner || null;
        const toOwner = alert.to_owner || null;
        const fromAddr = alert.from_address || 'Unknown';
        const toAddr = alert.to_address || 'Unknown';

        // From display - Borsa adı varsa göster, yoksa adresi kısalt
        let fromDisplay = '';
        if (fromOwner && fromOwner !== 'unknown') {
          fromDisplay = `<strong>${fromOwner}</strong> (${alert.from_owner_type || 'exchange'})`;
        } else {
          const fromShort = fromAddr.length > 10 ? fromAddr.substring(0, 6) + '...' + fromAddr.substring(fromAddr.length - 4) : fromAddr;
          fromDisplay = fromShort;
        }

        // To display - Borsa adı varsa göster, yoksa adresi kısalt
        let toDisplay = '';
        if (toOwner && toOwner !== 'unknown') {
          toDisplay = `<strong>${toOwner}</strong> (${alert.to_owner_type || 'exchange'})`;
        } else {
          const toShort = toAddr.length > 10 ? toAddr.substring(0, 6) + '...' + toAddr.substring(toAddr.length - 4) : toAddr;
          toDisplay = toShort;
        }

        html += `
          <div class="history-item" style="border-left: 3px solid ${typeColor};">
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 16px;">${alert.symbol.toUpperCase()}</strong>
                <strong style="font-size: 16px; color: ${typeColor};">${amountDisplay}</strong>
              </div>
              <div style="font-size: 12px; color: ${typeColor}; margin-top: 3px;">
                ${typeText}
              </div>
            </div>
            <div style="font-size: 11px; color: var(--tg-theme-hint-color, #999); margin-top: 5px;">
              <div style="margin-bottom: 3px;">
                <strong>Miktar:</strong> ${alert.amount?.toLocaleString('tr-TR', {maximumFractionDigits: 2})} ${alert.symbol.toUpperCase()}
              </div>
              <div style="margin-bottom: 3px;">
                <strong>Gönderen:</strong> ${fromDisplay}
              </div>
              <div style="margin-bottom: 3px;">
                <strong>Alan:</strong> ${toDisplay}
              </div>
              <div style="margin-top: 5px; text-align: right;">
                ${new Date(alert.timestamp).toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
      content.innerHTML = html;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Whale alerts yüklenemedi</div>`;
  }
}

// Haberler
async function loadNews() {
  document.getElementById('page-title').textContent = 'Haberler';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Haberler yükleniyor...</div>';

  try {
    const response = await apiCall('/api/news');

    if (response.success) {
      const news = response.news;
      let html = '<div class="card"><div class="card-title">Son Haberler</div>';

      news.forEach(item => {
        html += `
          <div class="history-item" onclick="window.open('${item.link}', '_blank')">
            <div class="history-item-title">${item.title}</div>
            <div class="history-item-preview">${item.content?.substring(0, 100)}...</div>
            <div class="history-item-date">${new Date(item.pub_date).toLocaleString('tr-TR')}</div>
          </div>
        `;
      });

      html += '</div>';
      content.innerHTML = html;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Haberler yüklenemedi</div>`;
  }
}

// Geçmiş Analizler
async function loadHistory() {
  document.getElementById('page-title').textContent = 'Geçmiş Analizler';
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="card">
      <div class="card-title">Geçmiş Analizler</div>
      <div class="grid grid-2">
        <button class="btn btn-block" onclick="showHistory('technical')">📊 Teknik Analiz</button>
        <button class="btn btn-block" onclick="showHistory('ai')">🤖 AI Chat</button>
      </div>
    </div>
    <div id="history-result"></div>
  `;
}

async function showHistory(type) {
  const resultDiv = document.getElementById('history-result');
  resultDiv.innerHTML = '<div class="loading">Geçmiş yükleniyor...</div>';

  try {
    const endpoint = type === 'technical' ? '/api/history/technical' : '/api/history/ai-chat';
    const response = await apiCall(endpoint);

    if (response.success) {
      const history = response.history;
      let html = '<div class="card">';

      history.forEach(item => {
        const preview = type === 'technical'
          ? item.analysis_result.substring(0, 150)
          : item.ai_response.substring(0, 150);

        const title = type === 'technical'
          ? `${item.symbol} - ${item.timeframe}`
          : item.user_query.substring(0, 50);

        html += `
          <div class="history-item" onclick='openModal("${title}", \`${item[type === 'technical' ? 'analysis_result' : 'ai_response']}\`)'>
            <div class="history-item-title">${title}</div>
            <div class="history-item-preview">${preview}...</div>
            <div class="read-more">Devamını Oku</div>
            <div class="history-item-date">${new Date(item.created_at).toLocaleString('tr-TR')}</div>
          </div>
        `;
      });

      html += '</div>';
      resultDiv.innerHTML = html;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-error">Geçmiş yüklenemedi</div>`;
  }
}

// Kullanıcı Bilgileri
async function loadUserInfo() {
  document.getElementById('page-title').textContent = 'Bilgilerim';
  const content = document.getElementById('content');

  content.innerHTML = '<div class="loading">Bilgiler yükleniyor...</div>';

  try {
    const response = await apiCall('/api/user-info');

    if (response.success) {
      const user = response.user;
      const subStart = new Date(user.subscription_start).toLocaleDateString('tr-TR');
      const subEnd = new Date(user.subscription_end).toLocaleDateString('tr-TR');

      content.innerHTML = `
        <div class="card">
          <div class="card-title">Kullanıcı Bilgileri</div>
          <table class="table">
            <tr>
              <td>İsim</td>
              <td><strong>${user.name}</strong></td>
            </tr>
            <tr>
              <td>Username</td>
              <td>@${user.username || 'Yok'}</td>
            </tr>
            <tr>
              <td>Abonelik Başlangıç</td>
              <td>${subStart}</td>
            </tr>
            <tr>
              <td>Abonelik Bitiş</td>
              <td>${subEnd}</td>
            </tr>
          </table>
        </div>
        <div class="card">
          <div class="card-title">Kullanım İstatistikleri</div>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; font-weight: bold; color: var(--tg-theme-button-color, #3390ec);">
              ${user.remaining}
            </div>
            <div style="color: var(--tg-theme-hint-color, #999); margin-top: 5px;">
              Kalan günlük AI kullanım hakkı
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: var(--tg-theme-hint-color, #666);">
              Günlük Limit: ${user.daily_limit} | Kullanılan: ${user.daily_usage}
            </div>
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `<div class="alert alert-error">${response.error}</div>`;
    }
  } catch (error) {
    content.innerHTML = `<div class="alert alert-error">Bilgiler yüklenemedi</div>`;
  }
}

// Kayıt gönderme fonksiyonu
async function submitRegistration() {
  const fileInput = document.getElementById('payment-screenshot');
  const messageDiv = document.getElementById('registration-message');

  if (!fileInput.files || !fileInput.files[0]) {
    messageDiv.innerHTML = '<div class="alert alert-error">Lütfen ödeme ekran görüntüsünü seçin!</div>';
    return;
  }

  const file = fileInput.files[0];

  // Dosya boyutu kontrolü (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    messageDiv.innerHTML = '<div class="alert alert-error">Dosya boyutu 5MB\'dan büyük olamaz!</div>';
    return;
  }

  messageDiv.innerHTML = '<div class="loading">Kayıt gönderiliyor...</div>';

  try {
    // Dosyayı base64'e çevir
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Telegram kullanıcı bilgilerini al
    const user = tg?.initDataUnsafe?.user || {
      id: telegramId,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    };

    // API'ye gönder
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        telegram_id: user.id,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        payment_screenshot: base64
      })
    });

    const result = await response.json();

    if (result.success) {
      messageDiv.innerHTML = `
        <div class="alert alert-success">
          ✅ Kayıt talebiniz başarıyla gönderildi!<br><br>
          Talebiniz admin tarafından inceleniyor. Onaylandığında size bildirim yapılacaktır.<br>
          <strong>Talep ID:</strong> ${result.requestId}
        </div>
      `;

      // 3 saniye sonra sayfayı yenile
      setTimeout(() => {
        location.reload();
      }, 3000);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-error">❌ ${result.error || 'Kayıt gönderilemedi'}</div>`;
    }
  } catch (error) {
    console.error('Registration error:', error);
    messageDiv.innerHTML = '<div class="alert alert-error">❌ Bir hata oluştu. Lütfen tekrar deneyin.</div>';
  }
}

// İlk yükleme
window.addEventListener('DOMContentLoaded', () => {
  loadHomePage();
});
