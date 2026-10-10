// Приём заявок с формы → сообщение в Telegram.
// Переменные окружения на Vercel: TG_BOT_TOKEN (токен бота от @BotFather), TG_CHAT_ID (id чата/группы менеджеров).
module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  var b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  var name = String(b.name || '').trim().slice(0, 100), phone = String(b.phone || '').trim().slice(0, 60);
  var message = String(b.message || '').trim().slice(0, 500), page = String(b.page || '').slice(0, 200);
  if (b.website) return res.status(200).json({ ok: true });            // honeypot: боты заполняют скрытое поле
  if (!name || !phone) return res.status(400).json({ ok: false, error: 'name and phone required' });
  var token = process.env.TG_BOT_TOKEN, chat = process.env.TG_CHAT_ID;
  if (!token || !chat) return res.status(200).json({ ok: true, note: 'telegram not configured' });
  var text = '🏠 Заявка с сайта\n' + 'Имя: ' + name + '\n' + 'Телефон: ' + phone + '\n' + 'Проект: ' + (message || '—') + (page ? '\n' + page : '');
  try {
    var r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: text }) });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) { return res.status(502).json({ ok: false }); }
};
