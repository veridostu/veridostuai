# Telegram Kripto Para Mini App

Telegram üzerinde çalışan profesyonel bir kripto para analiz ve bilgilendirme botu.

## 🚀 Özellikler

### 📊 Teknik Analiz
- Binance API ile gerçek zamanlı piyasa verileri
- RSI, MACD, EMA, SMA, Bollinger Bands, ADX, ATR, ROC, Momentum, Stochastic göstergeleri
- VWAP, Funding Rate, Open Interest, Long/Short Ratio analizleri
- OpenAI GPT-4 ile profesyonel analiz raporları

### 🤖 Coin AI Asistanı
- CoinMarketCap verilerine dayalı AI asistanı
- Gerçek zamanlı coin bilgileri ve piyasa verileri
- Türkçe doğal dil desteği

### 📈 Grafik Analizi
- OpenAI Vision ile grafik görsel analizi
- Mum formasyonları, MACD, hacim analizleri
- Destek/direnç seviyeleri tespiti

### 🎯 Trading Sinyalleri
- Otomatik sinyal üretimi (Strong Buy, Buy, Hold, Sell, Strong Sell)
- Top 30 coin için gerçek zamanlı sinyaller
- 20 dakikada bir güncellenen veriler

### 🔍 Market Screener
- En çok yükselenler / düşenler
- En yüksek hacimli coinler
- Trend coinler
- Yeni listelemeler
- Düşük piyasa değerli coinler

### 💹 Ekonomik Göstergeler
- FRED API ile ABD ekonomik verileri
- Fed faiz oranı, işsizlik, enflasyon, GDP
- Hazine bonosu getirileri, VIX, Dolar endeksi

### 😱 Fear & Greed Index
- CoinMarketCap Fear & Greed endeksi
- Piyasa duyarlılığı takibi

### 🐋 Whale Alert
- Büyük kripto transferleri (>500k USD)
- Borsa girişleri/çıkışları
- Gerçek zamanlı whale hareketleri

### 📰 Haberler
- Cointelegraph TR RSS feed
- 30 dakikada bir güncellenen haberler

### 📋 Geçmiş Analizler
- Kullanıcıya özel analiz geçmişi
- Teknik analiz ve AI chat kayıtları

## 📋 Gereksinimler

- Node.js v16 veya üzeri
- Supabase hesabı
- Telegram Bot Token (2 adet: Ana bot ve Admin bot)
- OpenAI API Key
- CoinMarketCap API Key
- FRED API Key
- Whale Alert API Key

## 🔧 Kurulum

### 1. Projeyi İndirin

\`\`\`bash
cd telegram-crypto-bot
\`\`\`

### 2. Bağımlılıkları Yükleyin

\`\`\`bash
npm install
\`\`\`

### 3. Supabase Veritabanını Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'de \`database/schema.sql\` dosyasındaki SQL kodunu çalıştırın
4. \`.env\` dosyasına Supabase URL ve Anon Key'i ekleyin

### 4. Ortam Değişkenlerini Ayarlayın

\`.env.example\` dosyasını \`.env\` olarak kopyalayın ve API anahtarlarınızı girin:

\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` dosyasını düzenleyin:

\`\`\`
MAIN_BOT_TOKEN=your_main_bot_token
ADMIN_BOT_TOKEN=your_admin_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
CMC_API_KEY=your_coinmarketcap_api_key
FRED_API_KEY=your_fred_api_key
WHALE_ALERT_API_KEY=your_whale_alert_api_key
WEB_APP_URL=https://your-domain.com
\`\`\`

### 5. Telegram Bot Oluşturma

1. [@BotFather](https://t.me/BotFather)'a gidin
2. \`/newbot\` komutu ile **Ana Bot** oluşturun
3. Bot token'ı \`.env\` dosyasına \`MAIN_BOT_TOKEN\` olarak ekleyin
4. \`/newbot\` komutu ile **Admin Bot** oluşturun
5. Bot token'ı \`.env\` dosyasına \`ADMIN_BOT_TOKEN\` olarak ekleyin

### 6. Web App URL Ayarları

Ana bot için Web App menü butonu ekleyin:

\`\`\`
BotFather'da:
/mybots → Ana Bot'u seçin → Menu Button → Edit Menu Button URL
URL: https://your-domain.com
Button Text: Uygulamayı Aç
\`\`\`

## 🚀 Çalıştırma

### Development

\`\`\`bash
# Ana server'ı başlat (Web App)
npm start

# Ana bot'u başlat (ayrı terminal)
npm run main-bot

# Admin bot'u başlat (ayrı terminal)
npm run admin-bot

# Cron jobs'u başlat (ayrı terminal)
npm run cron
\`\`\`

### Production

Production ortamı için PM2 kullanmanız önerilir:

\`\`\`bash
npm install -g pm2

# Tüm servisleri başlat
pm2 start index.js --name "web-app"
pm2 start bots/mainBot.js --name "main-bot"
pm2 start bots/adminBot.js --name "admin-bot"
pm2 start services/cronJobs.js --name "cron-jobs"

# Durumu kontrol et
pm2 list

# Logları görüntüle
pm2 logs

# Servisleri durdur
pm2 stop all

# Yeniden başlat
pm2 restart all
\`\`\`

## 📱 Kullanım

### Kullanıcı Kaydı

1. Ana bot'a \`/start\` komutu gönderin
2. Ödeme talimatlarını takip edin
3. Ödeme ekran görüntüsünü gönderin
4. Admin onayını bekleyin

### Admin Komutları

Admin bot'ta kullanılabilir komutlar:

\`\`\`
/bekleyen - Onay bekleyen kullanıcıları listele
/onay [id] - Kullanıcı kaydını onayla
/reddet [id] [sebep] - Kullanıcı kaydını reddet
/hepsi - Tüm kullanıcıları listele
/kullanici [telegram_id] - Kullanıcı detaylarını görüntüle
/sil [telegram_id] - Kullanıcıyı sil
\`\`\`

### Mini App Kullanımı

1. Ana bot'a \`/app\` komutu gönderin
2. "Uygulamayı Aç" butonuna tıklayın
3. Sol üst menüden istediğiniz özelliği seçin

## 📊 API Endpoints

Web App için kullanılabilir API endpoint'leri:

- \`POST /api/technical-analysis\` - Teknik analiz yap
- \`POST /api/coin-ai\` - Coin AI'ya sor
- \`POST /api/chart-analysis\` - Grafik analizi yap
- \`GET /api/trading-signals\` - Trading sinyalleri al
- \`GET /api/market-screener/:category\` - Market screener verileri
- \`GET /api/economic-indicators\` - Ekonomik göstergeler
- \`GET /api/fear-greed\` - Fear & Greed Index
- \`GET /api/whale-alerts\` - Whale alerts
- \`GET /api/news\` - Haberler
- \`GET /api/history/technical\` - Teknik analiz geçmişi
- \`GET /api/history/ai-chat\` - AI chat geçmişi
- \`GET /api/user-info\` - Kullanıcı bilgileri

## 🔒 Güvenlik

- Tüm API endpoint'leri kullanıcı doğrulaması gerektirir
- Abonelik süresi otomatik kontrol edilir
- Günlük OpenAI kullanım limiti vardır (varsayılan: 100)
- Hassas veriler \`.env\` dosyasında saklanır (Git'e eklenmez)

## 📝 Cron Jobs

Otomatik veri güncellemeleri:

- **Trading Sinyalleri**: Her 20 dakika
- **Market Screener**: Her 20 dakika
- **Ekonomik Göstergeler**: Her 1 saat
- **Fear & Greed Index**: Her 1 saat
- **Whale Alert**: Her 30 dakika
- **Haberler**: Her 30 dakika

## 🛠 Teknolojiler

- **Backend**: Node.js, Express
- **Bot Framework**: Telegraf
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **APIs**: Binance, CoinMarketCap, CoinGecko, FRED, Whale Alert
- **Cron**: node-cron
- **Frontend**: Vanilla JavaScript, Telegram Web App API

## 📄 Lisans

Bu proje özel kullanım içindir.

## 🆘 Destek

Sorularınız için:
- GitHub Issues
- Telegram: @your_username

## 🔄 Güncellemeler

### Versiyon 1.0.0 (2025)
- İlk sürüm
- Tüm temel özellikler eklendi

## ⚠️ Önemli Notlar

1. **CoinMarketCap API Key**: \`.env\` dosyasında \`CMC_API_KEY\` değişkenini kendi API anahtarınızla değiştirin. [CoinMarketCap API](https://pro.coinmarketcap.com/signup) üzerinden ücretsiz hesap oluşturabilirsiniz.

2. **Web App URL**: Production ortamında \`WEB_APP_URL\` değişkenini gerçek domain'iniz ile değiştirin.

3. **SSL Sertifikası**: Telegram Web App HTTPS gerektirir. Ücretsiz SSL için [Let's Encrypt](https://letsencrypt.org/) kullanabilirsiniz.

4. **Rate Limits**: API'larda rate limit olduğunu unutmayın. Gerekirse cron job sıklıklarını ayarlayın.

5. **Güvenlik**: Production ortamında \`.env\` dosyasını asla Git'e eklemeyin. \`.gitignore\` dosyasında olduğundan emin olun.

## 🚀 Deploy

### Heroku Deploy

\`\`\`bash
# Heroku CLI yükleyin ve login olun
heroku login

# Yeni app oluşturun
heroku create your-app-name

# Environment variables ekleyin
heroku config:set MAIN_BOT_TOKEN=your_token
heroku config:set ADMIN_BOT_TOKEN=your_token
# ... diğer env variables

# Deploy edin
git push heroku main
\`\`\`

### VPS Deploy

\`\`\`bash
# Sunucuya bağlanın
ssh user@your-server

# Projeyi klonlayın
git clone your-repo
cd telegram-crypto-bot

# Node.js ve npm yükleyin
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 yükleyin
npm install -g pm2

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
nano .env
# (API anahtarlarınızı girin)

# Servisleri başlatın
pm2 start index.js --name web-app
pm2 start bots/mainBot.js --name main-bot
pm2 start bots/adminBot.js --name admin-bot
pm2 start services/cronJobs.js --name cron-jobs

# Otomatik başlatma
pm2 startup
pm2 save
\`\`\`

## 🎉 Başarılı Kurulum

Kurulum başarılı olduyunda:
- Web server http://localhost:3000 adresinde çalışacak
- Ana bot kullanıcılardan ödeme bekleyecek
- Admin bot admin komutlarını dinleyecek
- Cron jobs arka planda veri güncelleyecek

Telegram'da ana bot'a \`/start\` yazarak test edebilirsiniz!
