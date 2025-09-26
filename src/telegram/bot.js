import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome to the Ecom_v4 bot!'));

bot.on('message', (ctx) => {
  console.log('Received message:', ctx.message);
});

bot.launch();

console.log('Telegram bot started');

export default bot;
