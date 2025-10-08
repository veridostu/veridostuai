# Vercel'e Deploy Etme Rehberi

## 🚀 Hazırlık

Projeniz deploy için hazır! Aşağıdaki adımları takip edin:

### 1. Vercel CLI ile Giriş Yapın

```bash
vercel login
```

### 2. Projeyi Deploy Edin

```bash
cd /Users/mac/Desktop/yeni/telegram-crypto-bot
vercel
```

İlk deploy sırasında şu soruları soracak:
- Set up and deploy? → **Y**
- Which scope? → Hesabınızı seçin
- Link to existing project? → **N**
- Project name? → **telegram-crypto-bot** (veya istediğiniz isim)
- In which directory is your code? → **./** (Enter)
- Want to override settings? → **N**

### 3. Environment Variables Ekleyin

Vercel dashboard'da (https://vercel.com/dashboard):

1. Projenizi seçin
2. **Settings** → **Environment Variables** git
3. Aşağıdaki değişkenleri ekleyin:

```
MAIN_BOT_TOKEN=your_token
ADMIN_BOT_TOKEN=your_token
ADMIN_TELEGRAM_ID=your_id
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_KEY=your_key
OPENAI_API_KEY=your_key
CMC_API_KEY=your_key
FRED_API_KEY=your_key
WHALE_ALERT_API_KEY=your_key
PAYMENT_WALLET_ADDRESS=your_address
PAYMENT_AMOUNT_BTCBAM=400
PAYMENT_AMOUNT_USDT=19
PORT=3001
NODE_ENV=production
```

### 4. Production Deploy

```bash
vercel --prod
```

## 📝 Notlar

- **Cron Jobs**: Vercel'de cron jobs çalışmaz. Cron jobs için ayrı bir servis gerekir:
  - Vercel Cron (ücretli plan)
  - Railway
  - Render
  - DigitalOcean App Platform

- **Telegram Bot Webhook**: Deploy sonrası botlarınızın webhook'larını güncellemeyi unutmayın:
  ```
  https://your-vercel-url.vercel.app/webhook
  ```

- **Database**: Supabase zaten cloud'da olduğu için ek bir şey yapmanıza gerek yok.

## 🔄 Güncelleme

Kod değişikliği yaptıktan sonra:

```bash
git add .
git commit -m "update"
vercel --prod
```

## 🌐 Domain Ayarları

Vercel dashboard'dan custom domain ekleyebilirsiniz:
- Settings → Domains → Add Domain

## 📊 Monitoring

Vercel dashboard'dan:
- Analytics
- Logs
- Performance metrics

Hepsine erişebilirsiniz.
