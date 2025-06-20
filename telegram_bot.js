// telegram_bot.js
require('dotenv').config({ path: './.env' }); // Adjust path if your .env.local is elsewhere relative to this script
const { Telegraf } = require('telegraf');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL; // Your ngrok/public URL

if (!botToken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not defined in your .env.local file.');
  process.exit(1);
}
if (!webAppUrl) {
  console.error('Error: NEXT_PUBLIC_WEB_APP_URL is not defined in your .env.local file.');
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Middleware to log incoming updates
bot.use((ctx, next) => {
  console.log(`[Bot] Received update: ${ctx.updateType}`, ctx.update);
  return next();
});

// Handler for the /start command
bot.start((ctx) => {
  const telegramUserId = ctx.from.id;
  // The URL for the Web App. Telegram will append its own parameters.
  const taskPlayWebAppUrl = `${webAppUrl}/app-in-telegram`; // Your main app page for Telegram Web App
  const startMessage = `Hello ${ctx.from.first_name || 'there'}!\nWelcome to TaskPlay.\n\nTap the button below to open the app!`;

  console.log(`[Bot] User ${telegramUserId} started. Sending Web App URL: ${taskPlayWebAppUrl}`);

  ctx.reply(startMessage, {
    reply_markup: {
      // This is how you create a button that launches a Web App
      inline_keyboard: [[{ text: '🚀 Open TaskPlay App', web_app: { url: taskPlayWebAppUrl } }]],
    },
  });
});

// Handler for the /link command (can also launch the Web App, which handles linking)
bot.command('link', (ctx) => {
  const telegramUserId = ctx.from.id;
  const taskPlayWebAppUrl = `${webAppUrl}/app-in-telegram`; // Same Web App URL
  const linkMessage = `Click the button below to open the TaskPlay app. If your account isn't linked, you'll be guided through it there.`;

  console.log(`[Bot] User ${telegramUserId} requested /link. Sending Web App URL: ${taskPlayWebAppUrl}`);

  ctx.reply(linkMessage, {
    reply_markup: {
      inline_keyboard: [[{ text: '🚀 Open TaskPlay App', web_app: { url: taskPlayWebAppUrl } }]],
    },
  });
});


// Error handling
bot.catch((err, ctx) => {
  console.error(`[Bot] Error for ${ctx.updateType}`, err);
  // Send a generic error message to the user
  ctx.reply('Oops! Something went wrong. Please try again later.').catch(e => console.error('[Bot] Failed to send error reply:', e));
});

// Start the bot
bot.launch().then(() => {
  console.log(`[Bot] TaskPlay Bot started successfully on ${new Date().toISOString()}`);
  console.log(`[Bot] Web App URL configured: ${webAppUrl}`);
}).catch(err => {
  console.error('[Bot] Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
