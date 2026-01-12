/**
 * Telegram Notification Service
 * Sends job alerts to Telegram when score exceeds threshold
 */

import TelegramBot from 'node-telegram-bot-api';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramNotification(
  job: {
    title: string;
    url: string;
    budget?: any;
    skills?: string[];
    client_country?: string;
  },
  score: number
) {
  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram not configured, skipping notification');
    return;
  }

  const threshold = parseInt(process.env.NOTIFICATION_SCORE_THRESHOLD || '20');
  if (score < threshold) {
    console.log(`ℹ️ Score ${score}% below threshold ${threshold}%, skipping notification`);
    return;
  }

  try {
    const bot = new TelegramBot(botToken);

    // Format budget
    let budgetText = 'Not specified';
    if (job.budget) {
      if (job.budget.type === 'fixed') {
        budgetText = `$${job.budget.amount} (Fixed)`;
      } else if (job.budget.min && job.budget.max) {
        budgetText = `$${job.budget.min}-$${job.budget.max}/hr`;
      } else if (job.budget.amount) {
        budgetText = `$${job.budget.amount}`;
      }
    }

    // Build message
    const message = `
🎯 *HIGH-SCORE JOB ALERT!*

*Score:* ${score}% Match ⭐

*Title:* ${job.title}

💰 *Budget:* ${budgetText}
🌍 *Location:* ${job.client_country || 'Unknown'}
🛠 *Skills:* ${job.skills?.slice(0, 5).join(', ') || 'None'}

🔗 [View on Upwork](${job.url})
    `.trim();

    // Split multiple chat IDs (comma-separated)
    const chatIds = chatId.split(',').map(id => id.trim());

    // Send to all chat IDs
    for (const id of chatIds) {
      await bot.sendMessage(id, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
    }

    console.log(`✅ Telegram notification sent to ${chatIds.length} user(s)!`);
  } catch (error) {
    console.error('❌ Telegram notification failed:', error);
    // Don't throw - notification failure shouldn't stop pipeline
  }
}










