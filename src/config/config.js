require('dotenv').config();

const config = {
  octav: {
    apiKey: process.env.OCTAV_API_KEY,
    baseUrl: process.env.OCTAV_BASE_URL || 'https://api.octav.fi',
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  reporting: {
    schedule: process.env.REPORT_SCHEDULE || '0 9 * * *', // Daily at 9 AM
    outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
    logLevel: process.env.LOG_LEVEL || 'info',
    hideSpam: process.env.HIDE_SPAM !== 'false', // Enable spam filtering by default
  },
  wallets: {
    addresses: process.env.WALLET_ADDRESSES 
      ? process.env.WALLET_ADDRESSES.split(',').map(addr => addr.trim())
      : [],
  },
  notifications: {
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    email: {
      smtpHost: process.env.EMAIL_SMTP_HOST,
      smtpPort: process.env.EMAIL_SMTP_PORT,
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
  },
};

// Validation
if (!config.octav.apiKey) {
  console.warn('⚠️  OCTAV_API_KEY not found in environment variables');
}

if (config.wallets.addresses.length === 0) {
  console.warn('⚠️  No wallet addresses configured');
}

module.exports = config;
