# Railway Deployment Rehberi

Bu proje Railway'de deploy edilmek için hazırlanmıştır.

## Railway'de Kurulum Adımları

### 1. GitHub Repository'yi Railway'e Bağlayın
1. Railway.app'e giriş yapın
2. "New Project" → "Deploy from GitHub repo" seçin
3. `veridostu/veridostuai` repository'sini seçin

### 2. Environment Variables (Ortam Değişkenleri) Ekleyin

Railway dashboard'da Settings → Variables bölümünden aşağıdaki değişkenleri ekleyin:

```env
# Telegram Bot Tokens
MAIN_BOT_TOKEN=your_main_bot_token_here
ADMIN_BOT_TOKEN=your_admin_bot_token_here
ADMIN_TELEGRAM_ID=your_admin_telegram_id_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# CoinMarketCap
CMC_API_KEY=your_coinmarketcap_api_key

# FRED (Federal Reserve Economic Data)
FRED_API_KEY=your_fred_api_key

# Whale Alert
WHALE_ALERT_API_KEY=your_whale_alert_api_key

# Payment Settings
PAYMENT_WALLET_ADDRESS=your_wallet_address
PAYMENT_AMOUNT_BTCBAM=400
PAYMENT_AMOUNT_USDT=19

# Server
PORT=3001
WEB_APP_URL=https://your-railway-app.railway.app

# Subscription
SUBSCRIPTION_DAYS=30

# Rate Limits
DAILY_OPENAI_LIMIT=100

# Technical Analysis Limits (saniye cinsinden)
TECHNICAL_ANALYSIS_COOLDOWN=120
```

### 3. Supabase Storage Bucket Oluşturun

1. Supabase Dashboard → Storage bölümüne gidin
2. "Create Bucket" butonuna tıklayın
3. Bucket adı: `payment-screenshots`
4. Public bucket olarak işaretleyin
5. Bucket'ı oluşturun

### 4. Railway'de Çoklu Servis Çalıştırma

Railway otomatik olarak `web` servisi çalıştırır. Cron jobs ve admin bot için ayrı servisler oluşturmanız gerekir:

#### Yöntem 1: Tek Servis (Önerilen - Basit)
Railway'de tek bir servis içinde tüm işlemleri çalıştırmak için `package.json`'a bir start script ekleyin:

```json
"scripts": {
  "start": "node index.js & node services/cronJobs.js & node bots/adminBot.js"
}
```

⚠️ Bu yöntem basit ama bir servis çökerse diğerleri de etkilenebilir.

#### Yöntem 2: Railway'de Çoklu Servis (Önerilen - Profesyonel)

1. **Ana Web Servisi** (otomatik oluşturulur)
   - Service name: `web`
   - Start command: `npm start` (index.js çalışır)

2. **Cron Jobs Servisi**
   - Railway'de "New Service" → "Empty Service" oluşturun
   - Service name: `cron-jobs`
   - Settings → Start Command: `npm run cron`
   - Aynı environment variables'ı kopyalayın

3. **Admin Bot Servisi**
   - Railway'de "New Service" → "Empty Service" oluşturun
   - Service name: `admin-bot`
   - Settings → Start Command: `npm run admin-bot`
   - Aynı environment variables'ı kopyalayın

### 5. Public Domain Ayarlayın

1. Railway'de web servisine tıklayın
2. Settings → Domains → "Generate Domain" veya kendi domain'inizi ekleyin
3. Oluşan URL'yi kopyalayın (örn: `https://your-app.railway.app`)
4. Environment Variables'a `WEB_APP_URL` olarak ekleyin

### 6. Telegram Bot Webhook Ayarları (Opsiyonel)

Eğer Telegram webhook kullanıyorsanız:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.railway.app/webhook
```

### 7. Deploy ve Test

1. Railway otomatik olarak deploy edecektir
2. Logs'u kontrol edin: Her servisin kendi logları vardır
3. Telegram botunuzu test edin
4. Web app'i açın: `https://your-app.railway.app`

## Önemli Notlar

### Railway Free Plan Limitleri
- 500 saat/ay execution time
- $5 değerinde kaynak kullanımı
- Eğer limitler aşılırsa, ücretli plana geçmeniz gerekir

### Monitoring
- Railway dashboard'dan her servisin loglarını izleyin
- Metrics bölümünden CPU, RAM kullanımını takip edin

### Veritabanı
- Bu proje Supabase kullanıyor (harici)
- Railway veritabanı kullanmanıza gerek yok
- Tüm veriler Supabase'de saklanıyor

### Debugging
Logları görmek için:
```bash
railway logs --service web
railway logs --service cron-jobs
railway logs --service admin-bot
```

## Güncellemeler

GitHub'a yeni kod push ettiğinizde Railway otomatik olarak deploy eder.

## Sorun Giderme

### Servisler Başlamıyor
- Environment variables'ı kontrol edin
- Logs'u inceleyin
- Supabase bağlantısını test edin

### Bot Yanıt Vermiyor
- Bot token'larını kontrol edin
- Railway servislerin hepsinin çalıştığından emin olun
- Telegram'da botunuza /start gönderin

### Cron Jobs Çalışmıyor
- `cron-jobs` servisinin çalıştığını kontrol edin
- Logs'da hata var mı bakın
- API anahtarlarını kontrol edin (CMC, Whale Alert, etc.)

## Destek

Sorun yaşarsanız:
1. Railway logs'u kontrol edin
2. GitHub Issues'da sorun açın
3. `.env.example` dosyasını kontrol edin

## Güvenlik

⚠️ **Önemli:** `.env` dosyasını asla GitHub'a push etmeyin!
- `.gitignore` dosyasında `.env` olduğundan emin olun
- Tüm API anahtarlarını Railway environment variables'da saklayın
