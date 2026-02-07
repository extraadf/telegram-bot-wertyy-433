// ✅ Импорт Telegraf и запуск бота с LocalSession
const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');

const bot = new Telegraf('bot.use(new LocalSession({ database: 'session_db.json' }).middleware());

// 🏁 Стартовое меню
bot.start((ctx) => {
  if (!ctx.session.startedAt) {
    ctx.session.startedAt = Date.now();
  }
  ctx.session.page = 0;
  ctx.reply('Выберите действие:',
    Markup.keyboard([
      ['🛒 Купить', '👤 Профиль', 'ℹ️ Информация', '📞 Куратор']
    ]).resize()
  );
});

// 🔙 Назад в главное меню
bot.hears('⬅️ Назад', (ctx) => {
  ctx.session.page = 0;
  ctx.reply('Выберите действие:',
    Markup.keyboard([
      ['🛒 Купить', '👤 Профиль', 'ℹ️ Информация', '📞 Куратор']
    ]).resize()
  );
});

// ℹ️ Информация
bot.hears('ℹ️ Информация', (ctx) => {
  ctx.reply('🔔 Здесь вы можете купить виртуальные номера для регистрации в Telegram, WhatsApp и других сервисах. Оплата осуществляется через CryptoBot. После оплаты отправьте скриншот менеджеру: @scbzrobotat');
});

// 👤 Профиль
bot.hears('👤 Профиль', (ctx) => {
  const now = Date.now();
  const diff = ctx.session.startedAt ? now - ctx.session.startedAt : 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  ctx.reply(`👤 Ваш профиль

Имя: ${ctx.from.first_name}
Ник: @${ctx.from.username || 'нет'}
ID: ${ctx.from.id}
В боте: ${days} дн. ${hours} ч.`);
});

// 📞 Куратор
bot.hears('📞 Куратор', (ctx) => {
  ctx.reply('Если у вас возникли трудности с оплатой или вы не хотите оплачивать через CryptoBot — напишите напрямую куратору:',
    Markup.inlineKeyboard([
      [Markup.button.url('✉️ Написать куратору', 'https://t.me/scbzrobotat')]
    ])
  );
});

// Список стран с обновлёнными ценами и ссылками на оплату
const countryPayments = [
  { label: '🇺🇦 Украина — 180 грн ($4.28)', link: 'https://t.me/send?start=IVCWgHbxUJdB' },
  { label: '🇷🇺 Россия — 160 грн ($3.80)', link: 'https://t.me/send?start=IVHAoRKPgrVP' },
  { label: '🇰🇿 Казахстан — 140 грн ($3.30)', link: 'https://t.me/send?start=IV4CN7CVgtJ6' },
  { label: '🇧🇾 Беларусь — 120 грн ($2.85)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇦🇿 Азербайджан — 110 грн ($2.62)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇮🇷 Иран — 100 грн ($2.38)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇮🇶 Ирак — 100 грн ($2.38)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇺🇿 Узбекистан — 90 грн ($2.15)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇹🇯 Таджикистан — 90 грн ($2.15)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇲🇩 Молдова — 90 грн ($2.15)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇦🇲 Армения — 90 грн ($2.15)', link: 'https://t.me/send?start=IV2L17w772KQ' },
  { label: '🇬🇪 Грузия — 90 грн ($2.15)', link: 'https://t.me/send?start=IV2L17w772KQ' }
];

const pageSize = 4;

// 🛒 Обработчик кнопки «Купить» с пагинацией
bot.hears('🛒 Купить', (ctx) => {
  ctx.session.page = 0;
  showCountries(ctx);
});

bot.hears('➡️ Далее', (ctx) => {
  ctx.session.page++;
  showCountries(ctx);
});

function showCountries(ctx) {
  const start = ctx.session.page * pageSize;
  const paged = countryPayments.slice(start, start + pageSize);
  if (paged.length === 0) {
    ctx.reply('Больше стран нет.', Markup.keyboard([['⬅️ Назад']]).resize());
    return;
  }
  const buttons = paged.map(c => [c.label]);
  ctx.reply('Выбери страну:', Markup.keyboard([...buttons, ['➡️ Далее', '⬅️ Назад']]).resize());
}

// 💸 Обработчики стран и оплата
countryPayments.forEach(({ label, link }) => {
  bot.hears(label, (ctx) => {
    ctx.reply(
      `${label}

💳 Для оплаты нажмите кнопку ниже. После оплаты отправьте скриншот менеджеру @scbzrobotat, чтобы получить номер.`,
      Markup.inlineKeyboard([
        [Markup.button.url('✅ Оплатить', link)],
        [Markup.button.url('🧑‍💻 Менеджер', 'https://t.me/scbzrobotat')]
      ])
    );
  });
});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
