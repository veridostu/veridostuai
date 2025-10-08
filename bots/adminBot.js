require('dotenv').config();
const { Telegraf } = require('telegraf');
const supabase = require('../utils/supabase');

const bot = new Telegraf(process.env.ADMIN_BOT_TOKEN);
const mainBot = new Telegraf(process.env.MAIN_BOT_TOKEN);

/**
 * /start komutu
 */
bot.start((ctx) => {
  ctx.reply(`🔐 Admin Bot'a Hoş Geldiniz

Kullanılabilir Komutlar:
/bekleyen - Onay bekleyen kullanıcıları listele
/onay [id] - Kullanıcı kaydını onayla
/reddet [id] - Kullanıcı kaydını reddet
/hepsi - Tüm kullanıcıları listele
/kullanici [telegram_id] - Kullanıcı detaylarını görüntüle
/sil [telegram_id] - Kullanıcıyı sil`);
});

/**
 * /bekleyen - Onay bekleyen kullanıcıları listele
 */
bot.command('bekleyen', async (ctx) => {
  try {
    const { data: requests, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      ctx.reply('❌ Hata: ' + error.message);
      return;
    }

    if (!requests || requests.length === 0) {
      ctx.reply('✅ Onay bekleyen kullanıcı yok.');
      return;
    }

    await ctx.reply(`📋 Onay Bekleyen Kullanıcılar: ${requests.length}\n\n`);

    for (const req of requests) {
      const date = new Date(req.created_at).toLocaleString('tr-TR');
      const caption = `🆔 Talep ID: ${req.id}\n👤 ${req.first_name} ${req.last_name || ''}\n📝 @${req.username || 'Yok'}\n🆔 Telegram ID: ${req.telegram_id}\n📅 ${date}\n\n✅ Onay: /onay ${req.id}\n❌ Red: /reddet ${req.id}`;

      try {
        // URL ise direkt gönder (Supabase public URL)
        if (req.payment_screenshot_url && !req.payment_screenshot_url.startsWith('data:image')) {
          await ctx.replyWithPhoto(req.payment_screenshot_url, { caption });
        } else if (req.payment_screenshot_url && req.payment_screenshot_url.startsWith('data:image')) {
          // Base64 varsa (eski kayıtlar için)
          const base64Data = req.payment_screenshot_url.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          await ctx.replyWithPhoto({ source: buffer }, { caption });
        } else {
          await ctx.reply(caption + '\n\n⚠️ Görsel bulunamadı');
        }
      } catch (photoError) {
        console.error('Görsel gönderme hatası:', photoError);
        await ctx.reply(caption + '\n\n⚠️ Görsel gönderilemedi');
      }
    }
  } catch (error) {
    console.error('Bekleyen listesi hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

/**
 * /onay [id] - Kullanıcı kaydını onayla
 */
bot.command('onay', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      ctx.reply('⚠️ Kullanım: /onay [request_id]');
      return;
    }

    const requestId = parseInt(args[1]);

    // İsteği bul
    const { data: request, error: reqError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      ctx.reply('❌ İstek bulunamadı.');
      return;
    }

    if (request.status !== 'pending') {
      ctx.reply('⚠️ Bu istek zaten işlenmiş.');
      return;
    }

    // Kullanıcıyı kontrol et
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', request.telegram_id)
      .single();

    const subscriptionDays = parseInt(process.env.SUBSCRIPTION_DAYS || 30);
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + (subscriptionDays * 24 * 60 * 60 * 1000));

    if (existingUser) {
      // Mevcut kullanıcı - aboneliği uzat
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_active: true,
          subscription_start: now.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('telegram_id', request.telegram_id);

      if (updateError) {
        ctx.reply('❌ Kullanıcı güncellenemedi: ' + updateError.message);
        return;
      }
    } else {
      // Yeni kullanıcı oluştur
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: request.telegram_id,
            username: request.username,
            first_name: request.first_name,
            last_name: request.last_name,
            is_active: true,
            subscription_start: now.toISOString(),
            subscription_end: subscriptionEnd.toISOString()
          }
        ]);

      if (insertError) {
        ctx.reply('❌ Kullanıcı oluşturulamadı: ' + insertError.message);
        return;
      }
    }

    // İsteği sil (onaylandığı için artık gerekmez)
    const { error: deleteReqError } = await supabase
      .from('payment_requests')
      .delete()
      .eq('id', requestId);

    if (deleteReqError) {
      ctx.reply('❌ İstek silinemedi: ' + deleteReqError.message);
      return;
    }

    // Kullanıcıya bildirim gönder
    try {
      await mainBot.telegram.sendMessage(
        request.telegram_id,
        `✅ Kaydınız Onaylandı!

Artık tüm özellikleri kullanabilirsiniz.
Aboneliğiniz ${subscriptionDays} gün geçerlidir.

Uygulamayı açmak için /app komutunu kullanın.`
      );
    } catch (notifError) {
      console.error('Kullanıcıya bildirim gönderilemedi:', notifError);
    }

    ctx.reply(`✅ Kullanıcı Onaylandı!

👤 ${request.first_name} ${request.last_name || ''}
🆔 Telegram ID: ${request.telegram_id}
⏰ ${subscriptionDays} günlük abonelik verildi.`);
  } catch (error) {
    console.error('Onay hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

/**
 * /reddet [id] - Kullanıcı kaydını reddet
 */
bot.command('reddet', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      ctx.reply('⚠️ Kullanım: /reddet [request_id] [sebep]');
      return;
    }

    const requestId = parseInt(args[1]);
    const reason = args.slice(2).join(' ') || 'Belirtilmemiş';

    // İsteği bul
    const { data: request, error: reqError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      ctx.reply('❌ İstek bulunamadı.');
      return;
    }

    if (request.status !== 'pending') {
      ctx.reply('⚠️ Bu istek zaten işlenmiş.');
      return;
    }

    // İsteği sil (reddedildiği için artık gerekmez)
    const { error: deleteError } = await supabase
      .from('payment_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      ctx.reply('❌ İstek silinemedi: ' + deleteError.message);
      return;
    }

    // Kullanıcıya bildirim gönder
    try {
      await mainBot.telegram.sendMessage(
        request.telegram_id,
        `❌ Kayıt Talebiniz Reddedildi

Sebep: ${reason}

Lütfen doğru ödeme bilgisi ile tekrar deneyin.`
      );
    } catch (notifError) {
      console.error('Kullanıcıya bildirim gönderilemedi:', notifError);
    }

    ctx.reply(`❌ Kullanıcı Reddedildi!

👤 ${request.first_name} ${request.last_name || ''}
🆔 Telegram ID: ${request.telegram_id}
📝 Sebep: ${reason}`);
  } catch (error) {
    console.error('Reddetme hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

/**
 * /hepsi - Tüm kullanıcıları listele
 */
bot.command('hepsi', async (ctx) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      ctx.reply('❌ Hata: ' + error.message);
      return;
    }

    if (!users || users.length === 0) {
      ctx.reply('📋 Henüz kayıtlı kullanıcı yok.');
      return;
    }

    const activeUsers = users.filter(u => u.is_active);
    const inactiveUsers = users.filter(u => !u.is_active);

    let message = `📊 Toplam Kullanıcı: ${users.length}\n`;
    message += `✅ Aktif: ${activeUsers.length}\n`;
    message += `❌ Pasif: ${inactiveUsers.length}\n\n`;

    message += `📋 Son 10 Kullanıcı:\n\n`;

    users.slice(0, 10).forEach((user, index) => {
      const status = user.is_active ? '✅' : '❌';
      const subEnd = user.subscription_end ? new Date(user.subscription_end).toLocaleDateString('tr-TR') : 'Yok';
      message += `${index + 1}. ${status} ${user.first_name} ${user.last_name || ''}\n`;
      message += `   🆔 ${user.telegram_id}\n`;
      message += `   ⏰ Bitiş: ${subEnd}\n\n`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

/**
 * /kullanici [telegram_id] - Kullanıcı detaylarını görüntüle
 */
bot.command('kullanici', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      ctx.reply('⚠️ Kullanım: /kullanici [telegram_id]');
      return;
    }

    const telegramId = parseInt(args[1]);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error || !user) {
      ctx.reply('❌ Kullanıcı bulunamadı.');
      return;
    }

    const status = user.is_active ? '✅ Aktif' : '❌ Pasif';
    const subStart = new Date(user.subscription_start).toLocaleString('tr-TR');
    const subEnd = new Date(user.subscription_end).toLocaleString('tr-TR');
    const created = new Date(user.created_at).toLocaleString('tr-TR');

    let message = `👤 Kullanıcı Detayları\n\n`;
    message += `Durum: ${status}\n`;
    message += `İsim: ${user.first_name} ${user.last_name || ''}\n`;
    message += `Username: @${user.username || 'Yok'}\n`;
    message += `Telegram ID: ${user.telegram_id}\n\n`;
    message += `📅 Kayıt: ${created}\n`;
    message += `⏰ Abonelik Başlangıç: ${subStart}\n`;
    message += `⏰ Abonelik Bitiş: ${subEnd}\n\n`;
    message += `🤖 Günlük OpenAI Kullanımı: ${user.daily_openai_usage || 0}/${process.env.DAILY_OPENAI_LIMIT || 100}`;

    ctx.reply(message);
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

/**
 * /sil [telegram_id] - Kullanıcıyı sil
 */
bot.command('sil', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      ctx.reply('⚠️ Kullanım: /sil [telegram_id]');
      return;
    }

    const telegramId = parseInt(args[1]);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('telegram_id', telegramId);

    if (error) {
      ctx.reply('❌ Hata: ' + error.message);
      return;
    }

    ctx.reply('✅ Kullanıcı silindi.');
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    ctx.reply('❌ Bir hata oluştu.');
  }
});

// Hata yakalama
bot.catch((err, ctx) => {
  console.error('Bot hatası:', err);
  ctx.reply('Bir hata oluştu.');
});

// Botu başlat
bot.launch()
  .then(() => {
    console.log('Admin bot başlatıldı!');
  })
  .catch((err) => {
    console.error('Bot başlatılamadı:', err);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
