# Octav Transaction Reporting System

A comprehensive automated transaction reporting system built with Node.js that leverages the [Octav API](https://api-docs.octav.fi/) to generate detailed transaction and portfolio reports.

## 🚀 Features

- **Automated Reporting**: Scheduled daily, weekly, and monthly reports
- **Multi-Format Output**: JSON, CSV, and HTML reports
- **Multi-Wallet Support**: Monitor multiple wallet addresses simultaneously
- **Cross-Chain Tracking**: Support for multiple blockchain networks
- **Real-time API Integration**: Direct integration with Octav API
- **Web Dashboard**: REST API for manual control and monitoring
- **Customizable Scheduling**: Flexible cron-based scheduling
- **Notification System**: Slack and email notifications (configurable)

## 📋 Prerequisites

- Node.js 16+ 
- Octav API key (contact [Octav team](https://api-docs.octav.fi/) to request access)
- Wallet addresses to monitor

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Octav-tx-reporting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Octav API Configuration
   OCTAV_API_KEY=your_octav_api_key_here
   OCTAV_BASE_URL=https://api.octav.fi
   
   # Wallet Addresses to Monitor (comma-separated)
   WALLET_ADDRESSES=0x1234567890abcdef,0xabcdef1234567890
   
   # Reporting Configuration
   REPORT_SCHEDULE="0 9 * * *"  # Daily at 9 AM
   REPORT_OUTPUT_DIR=./reports
   
   # Optional: Notification Configuration
   SLACK_WEBHOOK_URL=your_slack_webhook_url
   ```

## 🚀 Usage

### Starting the Automated System

```bash
npm start
```

This starts the full system with:
- Web API server (default: port 3000)
- Automated scheduler
- Real-time monitoring

### Manual Report Generation

Generate reports on-demand using the standalone script:

```bash
# Daily report (yesterday's transactions)
npm run report daily

# Weekly report
npm run report weekly

# Monthly report
npm run report monthly

# Custom date range
npm run report custom 2024-01-01 2024-01-31

# Last 7 days
npm run report last7days

# Last 30 days
npm run report last30days
```

### Type-Filtered CSV Reports

Generate CSV reports filtered by specific transaction types:

```bash
# Generate swap transactions report (yesterday)
npm run report:type swap daily

# Generate transfer transactions report (last week)
npm run report:type transfer weekly

# Generate multiple transaction types (last 7 days)
npm run report:type "swap,transfer,deposit" last7days

# Generate custom date range report
npm run report:type "stake,unstake" custom 2024-01-01 2024-01-31
```

**Supported Transaction Types:**
- `swap` - Token swaps and exchanges
- `transfer` - Token transfers
- `deposit` - Deposits to protocols
- `withdraw` - Withdrawals from protocols
- `stake` - Staking transactions
- `unstake` - Unstaking transactions
- `claim` - Reward claims
- `mint` - NFT/token minting
- `burn` - Token burning
- `approve` - Token approvals

### Status-Filtered CSV Reports

Generate CSV reports filtered by transaction validation status:

```bash
# Generate validated transactions report (yesterday)
npm run report:status validated daily

# Generate pending transactions report (last week)
npm run report:status pending weekly

# Generate failed transactions report (last 7 days)
npm run report:status failed last7days

# Generate all transactions regardless of status
npm run report:status all monthly
```

**Supported Status Filters:**
- `validated` - Only successfully confirmed transactions
- `pending` - Only pending/processing transactions
- `failed` - Only failed/reverted transactions
- `all` - All transactions regardless of status

**Enhanced CSV Output includes:**
- Transaction Status
- Confirmation Status
- Block Number
- Number of Confirmations
- Validation Status

### Web API Endpoints

Once the system is running, you can access these endpoints:

- **Health Check**: `GET /health`
- **System Status**: `GET /api/status`
- **Manual Report Generation**: `POST /api/reports/generate`
- **Wallet Transactions**: `GET /api/wallets/:address/transactions`
- **Wallet Portfolio**: `GET /api/wallets/:address/portfolio`
- **Supported Chains**: `GET /api/chains`
- **Scheduler Control**: `POST /api/scheduler/start|stop`
- **Scheduler Status**: `GET /api/scheduler/status`

## 📊 Report Types

### Daily Reports
- Generated automatically at 9:00 AM UTC
- Covers the previous day's transactions
- Includes portfolio snapshots

### Weekly Reports
- Generated automatically on Mondays at 10:00 AM UTC
- Covers the previous week's transactions
- Trend analysis and summaries

### Monthly Reports
- Generated automatically on the 1st of each month at 11:00 AM UTC
- Comprehensive monthly analysis
- Performance metrics and insights

### Custom Reports
- On-demand generation for any date range
- Flexible filtering and analysis options

## 📁 Output Formats

Reports are generated in multiple formats:

### JSON Reports
- Complete data structure
- Machine-readable format
- Includes metadata and summaries

### CSV Reports
- Spreadsheet-compatible format
- Transaction-level details
- Easy to import into analysis tools

### HTML Reports
- Beautiful, interactive web reports
- Summary statistics and charts
- Professional presentation format

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OCTAV_API_KEY` | Your Octav API key | Yes | - |
| `WALLET_ADDRESSES` | Comma-separated wallet addresses | Yes | - |
| `REPORT_OUTPUT_DIR` | Output directory for reports | No | `./reports` |
| `REPORT_SCHEDULE` | Cron schedule for reports | No | `0 9 * * *` |
| `HIDE_SPAM` | Filter out spam transactions | No | `true` |
| `PORT` | Web server port | No | `3000` |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | No | - |
| `EMAIL_SMTP_HOST` | SMTP host for email notifications | No | - |

### Scheduling Configuration

The system uses cron expressions for scheduling:

```javascript
// Daily at 9 AM UTC
"0 9 * * *"

// Weekly on Monday at 10 AM UTC
"0 10 * * 1"

// Monthly on 1st at 11 AM UTC
"0 11 1 * *"
```

## 📈 API Integration

The system integrates with the following Octav API endpoints:

- **Transactions**: `/transactions` - Get transaction history
- **Portfolio**: `/portfolio/{address}` - Get current portfolio
- **Historical Portfolio**: `/historical-portfolio` - Get historical data
- **Token Overview**: `/token/{chain}/{address}` - Get token details
- **Chains**: `/chains` - Get supported chains
- **Status**: `/status` - Get API status and credits

## 🔍 Monitoring and Logs

### Log Levels
- `info`: General operational information
- `warn`: Warning messages
- `error`: Error messages and exceptions

### Health Monitoring
- API connectivity checks
- Scheduler status monitoring
- Report generation tracking

## 🚨 Notifications

### Slack Notifications
Configure Slack webhook for real-time notifications:
- Report completion alerts
- Error notifications
- Summary statistics

### Email Notifications
Configure SMTP settings for email alerts:
- Detailed report summaries
- Error reports
- System status updates

## 🛡️ Error Handling

The system includes comprehensive error handling:

- API rate limiting
- Network connectivity issues
- Invalid wallet addresses
- Data processing errors
- Graceful degradation

## 🚫 Spam Filtering

The system automatically filters out spam transactions by default:

- **Enabled by default**: `HIDE_SPAM=true`
- **Spam detection**: Uses Octav API's built-in spam detection
- **Configurable**: Set `HIDE_SPAM=false` to include all transactions
- **Clean reports**: Focus on legitimate transaction activity
- **Reduced noise**: Eliminates dust attacks and spam transfers

## 🔄 Development

### Running in Development Mode

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Project Structure

```
src/
├── config/
│   └── config.js          # Configuration management
├── services/
│   ├── octavApi.js        # Octav API integration
│   ├── reportGenerator.js # Report generation logic
│   └── scheduler.js       # Automated scheduling
├── index.js               # Main application entry
└── generateReport.js      # Standalone report script
```

## 📝 API Documentation

### Manual Report Generation

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "daily",
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    }
  }'
```

### Get Wallet Transactions

```bash
curl "http://localhost:3000/api/wallets/0x1234567890abcdef/transactions?limit=100&startDate=2024-01-01&endDate=2024-01-31"
```

### Get System Status

```bash
curl http://localhost:3000/api/status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the [Octav API documentation](https://api-docs.octav.fi/)
2. Review the configuration and environment variables
3. Check the logs for error messages
4. Open an issue in the repository

## 🔮 Future Enhancements

- [ ] Real-time transaction monitoring
- [ ] Advanced analytics and insights
- [ ] Web dashboard UI
- [ ] Multi-tenant support
- [ ] Database integration for historical data
- [ ] Advanced notification rules
- [ ] Export to additional formats (PDF, Excel)
- [ ] Integration with other blockchain APIs
