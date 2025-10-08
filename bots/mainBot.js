require('dotenv').config();
const { Telegraf } = require('telegraf');
const supabase = require('../utils/supabase');
const axios = require('axios');

const bot = new Telegraf(process.env.MAIN_BOT_TOKEN);
const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN);

// Kullanıcı durumlarını takip et
const userStates = {};

/**
 * Kullanıcının kayıtlı olup olmadığını kontrol et
 */
async function checkUserRegistration(telegramId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !user) {
    return { registered: false, active: false };
  }

  // Abonelik süresi kontrolü
  const now = new Date();
  const subscriptionEnd = new Date(user.subscription_end);

  if (subscriptionEnd < now) {
    return { registered: true, active: false, expired: true };
  }

  return { registered: true, active: user.is_active, user };
}

/**
 * Ödeme mesajını göster
 */
function showPaymentMessage(ctx) {
  const message = `🔐 Kayıt Olmak İçin Ödeme Gereklidir

💰 Cüzdan Adresi (BSC Ağı):
\`${process.env.PAYMENT_WALLET_ADDRESS}\`

💵 Tutar: ${process.env.PAYMENT_AMOUNT_BTCBAM} BTCBAM veya ${process.env.PAYMENT_AMOUNT_USDT} USDT

⚠️ Ödemeyi yalnızca BSC ağı üzerinden gönderiniz.
⚠️ Farklı ağlardan yapılan gönderimler kaybolur ve geri alınamaz.

📸 Onay Süreci:
Ödemeyi yaptıktan sonra, işlem ekran görüntüsünü mutlaka gönderiniz.
Ekran görüntüsü gönderilmeden kayıt işlemi başlatılamaz. ✅

Ödeme yaptıysanız, lütfen ekran görüntüsünü gönderin.`;

  ctx.replyWithMarkdownV2(message.replace(/\./g, '\\.').replace(/\-/g, '\\-').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
}

/**
 * /start komutu
 */
bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name;

  const check = await checkUserRegistration(telegramId);

  if (check.active) {
    ctx.reply(`Merhaba ${firstName}! 👋\n\nHoş geldiniz! Mini uygulamamızı kullanmak için /app komutunu kullanabilirsiniz.`);
  } else if (check.registered && check.expired) {
    ctx.reply('Aboneliğinizin süresi dolmuş. Lütfen yeniden ödeme yapınız.');
    showPaymentMessage(ctx);
    userStates[telegramId] = 'waiting_payment';
  } else {
    ctx.reply(`Merhaba ${firstName}! 👋\n\nKayıt olmak için lütfen ödeme yapınız.`);
    showPaymentMessage(ctx);
    userStates[telegramId] = 'waiting_payment';
  }
});

/**
 * /app komutu - Web App'i aç
 */
bot.command('app', async (ctx) => {
  const telegramId = ctx.from.id;
  const check = await checkUserRegistration(telegramId);

  if (!check.active) {
    ctx.reply('❌ Bu özelliği kullanmak için önce kayıt olmanız gerekiyor.\n\nKayıt olmak için /start komutunu kullanın.');
    return;
  }

  const webAppUrl = process.env.WEB_APP_URL || 'https://your-domain.com';

  ctx.reply('Mini uygulamamızı açmak için aşağıdaki butona tıklayın:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Uygulamayı Aç', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

/**
 * Fotoğraf/Görsel gönderildiğinde (Ödeme ekran görüntüsü)
 */
bot.on('photo', async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name;

  if (userStates[telegramId] !== 'waiting_payment') {
    ctx.reply('Bu görseli ne için gönderdiniz? Eğer ödeme kanıtı ise önce /start komutunu kullanın.');
    return;
  }

  try {
    // Fotoğrafın en yüksek çözünürlüklü halini al
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileId = photo.file_id;

    // Telegram'dan dosya bilgisini al
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Ödeme talebini veritabanına kaydet
    const { data, error } = await supabase
      .from('payment_requests')
      .insert([
        {
          telegram_id: telegramId,
          username: username || '',
          first_name: firstName || '',
          last_name: lastName || '',
          payment_screenshot_url: fileLink.href,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Ödeme talebi kaydedilemedi:', error);
      ctx.reply('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
      return;
    }

    // Admin'e bildirim gönder
    const adminMessage = `🆕 Yeni Kayıt Talebi!

👤 Kullanıcı: ${firstName} ${lastName || ''}
📝 Username: @${username || 'Yok'}
🆔 Telegram ID: ${telegramId}
🆔 Talep ID: ${data.id}

Talebi onaylamak için: /onay ${data.id}
Talebi reddetmek için: /reddet ${data.id}`;

    try {
      const adminChatId = process.env.ADMIN_TELEGRAM_ID;

      if (!adminChatId) {
        console.error('ADMIN_TELEGRAM_ID .env dosyasında tanımlı değil!');
      } else {
        await adminBot.telegram.sendPhoto(
          adminChatId,
          fileLink.href,
          { caption: adminMessage }
        );
        console.log('Admin bildirimi gönderildi:', data.id);
      }
    } catch (adminError) {
      console.error('Admin bildirimi gönderilemedi:', adminError);
    }

    ctx.reply(`✅ Ödeme belgeniz alındı!

Talebiniz inceleniyor. Onaylandığında size bildirim yapılacaktır.

Talep ID: ${data.id}`);

    userStates[telegramId] = 'payment_sent';
  } catch (error) {
    console.error('Fotoğraf işleme hatası:', error);
    ctx.reply('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
});

/**
 * Diğer mesajlar
 */
bot.on('text', async (ctx) => {
  const telegramId = ctx.from.id;
  const check = await checkUserRegistration(telegramId);

  if (!check.active) {
    ctx.reply('❌ Bu botu kullanmak için önce kayıt olmanız gerekiyor.\n\nKayıt olmak için /start komutunu kullanın.');
  } else {
    ctx.reply('Merhaba! Mini uygulamamızı kullanmak için /app komutunu kullanın.');
  }
});

// Hata yakalama
bot.catch((err, ctx) => {
  console.error('Bot hatası:', err);
  ctx.reply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
});

// Botu başlat
bot.launch()
  .then(() => {
    console.log('Ana bot başlatıldı!');
  })
  .catch((err) => {
    console.error('Bot başlatılamadı:', err);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
